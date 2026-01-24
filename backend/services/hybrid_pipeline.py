"""混合 RAG Pipeline - Search-Verify-Generate"""

import asyncio
import logging
import aiohttp
import time
from typing import List, Optional, Tuple, Any

from schemas import Dish
from config import settings
from .image_verifier import image_verifier
from .image_generator import image_generator

logger = logging.getLogger(__name__)


class HybridImagePipeline:
    """
    Search-Verify-Generate 混合 Pipeline
    """
    
    def __init__(self, searcher, search_service):
        self.searcher = searcher
        self.search_service = search_service
        self.verifier = image_verifier
        self.generator = image_generator
    
    async def get_best_images(self, dish: Dish) -> Tuple[List[str], List[int]]:
        """
        获取菜品的最佳图片列表和分数列表
        
        Returns:
            (图片 URL 列表, 分数列表)
        """
        if not settings.ENABLE_RAG_PIPELINE:
            logger.info(f"RAG Pipeline disabled, using legacy search for {dish.english_name}")
            return [], []
        
        start_time = time.time()
        logger.info(f"🔍 Pipeline START for {dish.english_name}")
        
        # Step 1: 搜索多个候选图片
        search_start = time.time()
        candidate_urls = await self._search_candidates(dish)
        search_time = time.time() - search_start
        
        if not candidate_urls:
            logger.warning(f"⚠️  No search results for {dish.english_name} ({search_time:.1f}s), skipping to generation")
            gen_img = await self._generate_image(dish)
            return ([gen_img], [99]) if gen_img else ([], [])
        
        logger.info(f"📋 Found {len(candidate_urls)} candidates ({search_time:.1f}s)")
        
        # Step 2: 验证并排序候选图片
        verify_start = time.time()
        sorted_results = await self._verify_and_sort(dish, candidate_urls)
        verify_time = time.time() - verify_start
        
        if sorted_results:
            total_time = time.time() - start_time
            # 提取 URLs 和 分数列表
            sorted_urls = [url for url, _ in sorted_results]
            sorted_scores = [int(score * 100) for _, score in sorted_results]
            
            logger.info(f"✅ Found {len(sorted_urls)} verified images (Top: {sorted_scores[0]}%) ({verify_time:.1f}s verification, {total_time:.1f}s total)")
            return sorted_urls, sorted_scores
        
        # Step 3: 验证失败，降级为生成
        logger.warning(f"⚠️  No valid search result (Score < {settings.IMAGE_VERIFY_SCORE_THRESHOLD}), "
                      f"generating image ({verify_time:.1f}s verification)")
        gen_img = await self._generate_image(dish)
        return ([gen_img], [99]) if gen_img else ([], [])

    async def _verify_and_sort(
        self,
        dish: Dish,
        candidate_urls: List[str]
    ) -> List[Tuple[str, float]]:
        """
        视觉验证并按相关性分数排序图片
        Returns: List[(url, score)]
        """
        if not candidate_urls:
            return []
        
        # 只有 1 个结果时跳过复杂验证（太慢），直接返回 mock score
        if len(candidate_urls) < 2:
            return [(candidate_urls[0], 0.85)]

        logger.info(f"🔎 Verifying {len(candidate_urls)} images...")
        
        # 并发验证所有候选图片
        verification_tasks = [
            self.verifier.verify_image_relevance(
                dish_name=dish.english_name,
                description=dish.description,
                image_url=url,
                original_name=dish.original_name
            )
            for url in candidate_urls
        ]
        
        scores = await asyncio.gather(*verification_tasks, return_exceptions=True)
        
        # 配对 URL 和分数
        valid_scored_urls = []
        for url, score in zip(candidate_urls, scores):
            if isinstance(score, (int, float)):
                # 记录分数日志
                logger.debug(f"  {dish.english_name}: {score:.2f} - {url[:50]}...")
                if score >= 0.4: # 阈值
                    valid_scored_urls.append((url, score))
        
        if not valid_scored_urls:
            return []
        
        # 按分数降序排序
        valid_scored_urls.sort(key=lambda x: x[1], reverse=True)
        
        return valid_scored_urls

    async def _search_candidates(self, dish: Dish) -> List[str]:
        """搜索前 N 个候选图片"""
        try:
            # 使用搜索服务获取多个结果
            urls = await self.search_service.search_images(
                dish.search_term,
                num=settings.SEARCH_CANDIDATE_RESULTS
            )
            
            if not urls:
                return []
            
            # 快速检查 URL 有效性（发送 HEAD 请求）
            valid_urls = await self._check_urls_alive(urls)
            extracted_num = min(len(valid_urls), settings.SEARCH_CANDIDATE_RESULTS)
            valid_urls = valid_urls[:extracted_num]
            logger.info(f"URL validity check: {len(valid_urls)}/{len(urls)} alive for {dish.english_name}")
            
            return valid_urls
            
        except Exception as e:
            logger.error(f"Error searching candidates for {dish.english_name}: {str(e)}")
            return []
    
    async def _check_urls_alive(self, urls: List[str], timeout: int = None) -> List[str]:
        """
        批量检查 URL 是否存活且是真正的图片
        """
        if timeout is None:
            timeout = settings.IMAGE_URL_CHECK_TIMEOUT
        
        VALID_IMAGE_TYPES = {
            'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'
        }
        
        async def check_single_url(url: str) -> Optional[str]:
            try:
                timeout_obj = aiohttp.ClientTimeout(total=timeout)
                async with aiohttp.ClientSession() as session:
                    async with session.head(url, timeout=timeout_obj, allow_redirects=True) as resp:
                        if resp.status >= 400:
                            return None
                        
                        content_type = resp.headers.get('content-type', '').lower()
                        base_type = content_type.split(';')[0].strip()
                        
                        if base_type not in VALID_IMAGE_TYPES:
                            return None
                        
                        return url
                        
            except Exception:
                return None
        
        tasks = [check_single_url(url) for url in urls]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        return [url for url in results if isinstance(url, str)]

    async def _generate_image(self, dish: Dish) -> Optional[str]:
        """降级：生成图片"""
        if not settings.ENABLE_IMAGE_GENERATION:
            return None
        
        logger.info(f"🎨 Generating image for {dish.english_name}...")
        
        try:
            image_url = await self.generator.generate_image(
                english_name=dish.english_name,
                original_name=dish.original_name,
                description=dish.description
            )
            return image_url
        except Exception as e:
            logger.error(f"Error generating image: {str(e)}")
            return None

    async def enrich_dishes_with_images(self, dishes: List[Dish]) -> List[Dish]:
        """
        为菜品列表并发获取最佳图片（使用混合 Pipeline）
        """
        logger.info(f"🚀 Hybrid Pipeline processing {len(dishes)} dishes...")
        
        # 并发处理所有菜品
        tasks = [self.get_best_images(dish) for dish in dishes]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # 更新菜品图片
        success_count = 0
        for dish, result in zip(dishes, results):
            if isinstance(result, tuple) and result[0]:
                image_urls, image_scores = result
                dish.image_urls = image_urls
                dish.image_scores = image_scores # 存储所有分数
                dish.image_url = image_urls[0] 
                dish.match_score = image_scores[0] # 最佳分数 (兼容旧字段)
                success_count += 1
            elif isinstance(result, Exception):
                logger.warning(f"Exception for {dish.english_name}: {result}")
        
        logger.info(f"✅ Pipeline completed: {success_count}/{len(dishes)} dishes got images")
        return dishes


# 全局实例（在 main.py 中初始化）
hybrid_pipeline = None


def initialize_hybrid_pipeline(searcher, search_service):
    """初始化全局 Pipeline 实例"""
    global hybrid_pipeline
    hybrid_pipeline = HybridImagePipeline(searcher, search_service)
    logger.info("✅ Hybrid Pipeline initialized")
    return hybrid_pipeline
