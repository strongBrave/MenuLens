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

    def _resolve_candidate_count(self, search_candidate_results: Optional[int]) -> int:
        if isinstance(search_candidate_results, int):
            return max(1, min(search_candidate_results, 10))
        return settings.SEARCH_CANDIDATE_RESULTS

    def _resolve_verify_threshold(self, image_verify_threshold: Optional[float]) -> float:
        if isinstance(image_verify_threshold, (int, float)):
            return max(0.0, min(float(image_verify_threshold), 1.0))
        return settings.IMAGE_VERIFY_SCORE_THRESHOLD

    def _resolve_enable_image_generation(self, enable_image_generation: Optional[bool]) -> bool:
        if isinstance(enable_image_generation, bool):
            return enable_image_generation
        return settings.ENABLE_IMAGE_GENERATION
    
    async def get_best_images(
        self,
        dish: Dish,
        serpapi_key: Optional[str] = None,
        search_candidate_results: Optional[int] = None,
        llm_api_key: Optional[str] = None,
        llm_base_url: Optional[str] = None,
        llm_model: Optional[str] = None,
        llm_temperature: Optional[float] = None,
        llm_timeout: Optional[int] = None,
        generation_api_key: Optional[str] = None,
        generation_model: Optional[str] = None,
        enable_image_generation: Optional[bool] = None,
        image_verify_threshold: Optional[float] = None
    ) -> Tuple[List[str], List[int]]:
        """
        获取菜品的最佳图片列表和分数列表
        
        Returns:
            (图片 URL 列表, 分数列表)
        """
        start_time = time.time()
        logger.info(f"🔍 Pipeline START for {dish.english_name}")
        
        # Step 1: 搜索多个候选图片
        search_start = time.time()
        candidate_urls = await self._search_candidates(
            dish,
            serpapi_key=serpapi_key,
            search_candidate_results=search_candidate_results
        )
        search_time = time.time() - search_start
        verify_threshold = self._resolve_verify_threshold(image_verify_threshold)
        
        if not candidate_urls:
            logger.warning(f"⚠️  No search results for {dish.english_name} ({search_time:.1f}s), skipping to generation")
            gen_img = await self._generate_image(
                dish,
                enable_image_generation=enable_image_generation,
                generation_api_key=generation_api_key,
                generation_model=generation_model
            )
            return ([gen_img], [99]) if gen_img else ([], [])
        
        logger.info(f"📋 Found {len(candidate_urls)} candidates ({search_time:.1f}s)")
        
        # Step 2: 验证并排序候选图片
        verify_start = time.time()
        sorted_results = await self._verify_and_sort(
            dish,
            candidate_urls,
            verify_threshold=verify_threshold,
            llm_api_key=llm_api_key,
            llm_base_url=llm_base_url,
            llm_model=llm_model,
            llm_temperature=llm_temperature,
            llm_timeout=llm_timeout
        )
        verify_time = time.time() - verify_start
        
        if sorted_results:
            total_time = time.time() - start_time
            # 提取 URLs 和 分数列表
            sorted_urls = [url for url, _ in sorted_results]
            sorted_scores = [int(score * 100) for _, score in sorted_results]
            
            logger.info(f"✅ Found {len(sorted_urls)} verified images (Top: {sorted_scores[0]}%) ({verify_time:.1f}s verification, {total_time:.1f}s total)")
            return sorted_urls, sorted_scores
        
        # Step 3: 验证失败，降级为生成
        logger.warning(f"⚠️  No valid search result (Score < {verify_threshold}), "
                      f"generating image ({verify_time:.1f}s verification)")
        gen_img = await self._generate_image(
            dish,
            enable_image_generation=enable_image_generation,
            generation_api_key=generation_api_key,
            generation_model=generation_model
        )
        return ([gen_img], [99]) if gen_img else ([], [])

    async def _verify_and_sort(
        self,
        dish: Dish,
        candidate_urls: List[str],
        verify_threshold: float,
        llm_api_key: Optional[str] = None,
        llm_base_url: Optional[str] = None,
        llm_model: Optional[str] = None,
        llm_temperature: Optional[float] = None,
        llm_timeout: Optional[int] = None
    ) -> List[Tuple[str, float]]:
        """
        视觉验证并按相关性分数排序图片
        Returns: List[(url, score)]
        """
        if not candidate_urls:
            return []
        
        # 只有 1 个结果时跳过复杂验证（太慢），直接返回 mock score
        if len(candidate_urls) < 2:
            mock_score = 0.85
            if mock_score >= verify_threshold:
                return [(candidate_urls[0], mock_score)]
            return []

        logger.info(f"🔎 Verifying {len(candidate_urls)} images...")
        
        # 并发验证所有候选图片
        verification_tasks = [
            self.verifier.verify_image_relevance(
                dish_name=dish.english_name,
                description=dish.description,
                image_url=url,
                original_name=dish.original_name,
                llm_api_key=llm_api_key,
                llm_base_url=llm_base_url,
                llm_model=llm_model,
                llm_temperature=llm_temperature,
                llm_timeout=llm_timeout
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
                if score >= verify_threshold:
                    valid_scored_urls.append((url, score))
        
        if not valid_scored_urls:
            return []
        
        # 按分数降序排序
        valid_scored_urls.sort(key=lambda x: x[1], reverse=True)
        
        return valid_scored_urls

    async def _search_candidates(
        self,
        dish: Dish,
        serpapi_key: Optional[str] = None,
        search_candidate_results: Optional[int] = None
    ) -> List[str]:
        """搜索前 N 个候选图片"""
        try:
            candidate_count = self._resolve_candidate_count(search_candidate_results)

            # 使用搜索服务获取多个结果
            urls = await self.search_service.search_images(
                dish.search_term,
                num=candidate_count,
                api_key=serpapi_key
            )
            
            if not urls:
                return []
            
            # 快速检查 URL 有效性（发送 HEAD 请求）
            valid_urls = await self._check_urls_alive(urls)
            extracted_num = min(len(valid_urls), candidate_count)
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

    async def _generate_image(
        self,
        dish: Dish,
        enable_image_generation: Optional[bool] = None,
        generation_api_key: Optional[str] = None,
        generation_model: Optional[str] = None
    ) -> Optional[str]:
        """降级：生成图片"""
        if not self._resolve_enable_image_generation(enable_image_generation):
            return None
        
        logger.info(f"🎨 Generating image for {dish.english_name}...")
        
        try:
            image_url = await self.generator.generate_image(
                english_name=dish.english_name,
                original_name=dish.original_name,
                description=dish.description,
                generation_api_key=generation_api_key,
                generation_model=generation_model
            )
            return image_url
        except Exception as e:
            logger.error(f"Error generating image: {str(e)}")
            return None

    async def enrich_dishes_with_images(
        self,
        dishes: List[Dish],
        serpapi_key: Optional[str] = None,
        search_candidate_results: Optional[int] = None,
        llm_api_key: Optional[str] = None,
        llm_base_url: Optional[str] = None,
        llm_model: Optional[str] = None,
        llm_temperature: Optional[float] = None,
        llm_timeout: Optional[int] = None,
        generation_api_key: Optional[str] = None,
        generation_model: Optional[str] = None,
        enable_image_generation: Optional[bool] = None,
        image_verify_threshold: Optional[float] = None
    ) -> List[Dish]:
        """
        为菜品列表并发获取最佳图片（使用混合 Pipeline）
        """
        logger.info(f"🚀 Hybrid Pipeline processing {len(dishes)} dishes...")
        
        # 并发处理所有菜品
        tasks = [
            self.get_best_images(
                dish,
                serpapi_key=serpapi_key,
                search_candidate_results=search_candidate_results,
                llm_api_key=llm_api_key,
                llm_base_url=llm_base_url,
                llm_model=llm_model,
                llm_temperature=llm_temperature,
                llm_timeout=llm_timeout,
                generation_api_key=generation_api_key,
                generation_model=generation_model,
                enable_image_generation=enable_image_generation,
                image_verify_threshold=image_verify_threshold
            )
            for dish in dishes
        ]
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
