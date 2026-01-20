"""混合 RAG Pipeline - Search-Verify-Generate"""

import asyncio
import logging
import aiohttp
import time
from typing import List, Optional

from schemas import Dish
from config import settings
from .image_verifier import image_verifier
from .image_generator import image_generator

logger = logging.getLogger(__name__)


class HybridImagePipeline:
    """
    Search-Verify-Generate 混合 Pipeline
    
    核心逻辑：
    1. 搜索：获取 Top 3 结果（而非仅 Top 1）
    2. 验证：通过视觉模型验证相关性（Score > 0.7）
    3. 生成：验证失败则调用图片生成模型
    """
    
    def __init__(self, searcher, search_service):
        """
        初始化 Pipeline
        
        Args:
            searcher: GoogleSearcher 实例（已配置的搜索服务）
            search_service: 完整的搜索服务（包含多结果获取）
        """
        self.searcher = searcher
        self.search_service = search_service
        self.verifier = image_verifier
        self.generator = image_generator
    
    async def get_best_image(self, dish: Dish) -> Optional[str]:
        """
        获取菜品的最佳图片
        
        执行流程：
        1. 搜索 Top 3 图片
        2. 检查 URL 有效性
        3. 视觉验证（Gating）
        4. 验证失败 → 降级为生成
        
        Args:
            dish: 菜品对象
            
        Returns:
            图片 URL（搜索或生成）
        """
        if not settings.ENABLE_RAG_PIPELINE:
            logger.info(f"RAG Pipeline disabled, using legacy search for {dish.english_name}")
            return None
        
        start_time = time.time()
        logger.info(f"🔍 Pipeline START for {dish.english_name}")
        
        # Step 1: 搜索多个候选图片
        search_start = time.time()
        candidate_urls = await self._search_candidates(dish)
        search_time = time.time() - search_start
        
        if not candidate_urls:
            logger.warning(f"⚠️  No search results for {dish.english_name} ({search_time:.1f}s), skipping to generation")
            return await self._generate_image(dish)
        
        logger.info(f"📋 Found {len(candidate_urls)} candidates ({search_time:.1f}s)")
        
        # Step 2: 验证候选图片
        verify_start = time.time()
        best_image_url = await self._verify_and_select(dish, candidate_urls)
        verify_time = time.time() - verify_start
        
        if best_image_url:
            total_time = time.time() - start_time
            logger.info(f"✅ Using search result ({verify_time:.1f}s verification, {total_time:.1f}s total)")
            return best_image_url
        
        # Step 3: 验证失败，降级为生成
        logger.warning(f"⚠️  No valid search result (Score < {settings.IMAGE_VERIFY_SCORE_THRESHOLD}), "
                      f"generating image ({verify_time:.1f}s verification)")
        return await self._generate_image(dish)
    
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
            logger.info(f"URL validity check: {len(valid_urls)}/{len(urls)} alive")
            
            return valid_urls
            
        except Exception as e:
            logger.error(f"Error searching candidates for {dish.english_name}: {str(e)}")
            return []
    
    async def _check_urls_alive(self, urls: List[str], timeout: int = None) -> List[str]:
        """
        批量检查 URL 是否存活且是真正的图片
        
        验证项：
        1. HTTP 状态码 < 400
        2. Content-Type 必须是图片类型（image/jpeg, image/png, image/webp）
        3. 排除 HTML 重定向/错误页面
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
                            logger.debug(f"URL check failed ({resp.status}): {url[:50]}...")
                            return None
                        
                        # 检查 Content-Type 是否是图片
                        content_type = resp.headers.get('content-type', '').lower()
                        # 提取主类型（处理 "image/jpeg; charset=utf-8" 的情况）
                        base_type = content_type.split(';')[0].strip()
                        
                        if base_type not in VALID_IMAGE_TYPES:
                            logger.debug(f"Invalid content-type ({base_type}): {url[:50]}...")
                            return None
                        
                        return url
                        
            except asyncio.TimeoutError:
                logger.debug(f"URL check timeout: {url[:50]}...")
                return None
            except Exception as e:
                logger.debug(f"URL check error: {type(e).__name__}")
                return None
        
        # 并发检查所有 URL
        tasks = [check_single_url(url) for url in urls]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # 过滤有效的 URL
        valid_urls = [url for url in results if isinstance(url, str)]
        return valid_urls
    
    async def _verify_and_select(
        self,
        dish: Dish,
        candidate_urls: List[str]
    ) -> Optional[str]:
        """
        视觉验证并选择最佳图片
        
        这是 RAG Pipeline 的核心：使用 Gating Agent 验证相关性
        """
        if not candidate_urls:
            logger.debug(f"No candidate URLs for {dish.english_name}")
            return None
        
        # 快速过滤：如果只有 1 个候选且验证失败会很浪费时间
        # 如果候选数量很少，使用更严格的标准
        if len(candidate_urls) < 2:
            logger.info(f"⚠️  Only {len(candidate_urls)} candidate, skipping verification (too risky)")
            return None
        
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
        url_scores = []
        for url, score in zip(candidate_urls, scores):
            if isinstance(score, float):
                url_scores.append((url, score))
                logger.debug(f"  {dish.english_name}: {score:.2f} - {url[:50]}...")
        
        if not url_scores:
            return None
        
        # 选择最高分的图片
        best_url, best_score = max(url_scores, key=lambda x: x[1])
        
        # 检查是否超过阈值
        if best_score >= settings.IMAGE_VERIFY_SCORE_THRESHOLD:
            logger.info(f"✓ Best match: {best_score:.2f} >= {settings.IMAGE_VERIFY_SCORE_THRESHOLD}")
            return best_url
        else:
            logger.warning(f"✗ Best score {best_score:.2f} < threshold {settings.IMAGE_VERIFY_SCORE_THRESHOLD}")
            return None
    
    async def _generate_image(self, dish: Dish) -> Optional[str]:
        """降级：生成图片"""
        if not settings.ENABLE_IMAGE_GENERATION:
            logger.warning(f"Image generation disabled, returning None for {dish.english_name}")
            return None
        
        logger.info(f"🎨 Generating image for {dish.english_name}...")
        
        try:
            image_url = await self.generator.generate_image(
                english_name=dish.english_name,
                original_name=dish.original_name,
                description=dish.description
            )
            
            if image_url:
                logger.info(f"✨ Generated image URL: {image_url[:60]}...")
            
            return image_url
            
        except Exception as e:
            logger.error(f"Error generating image: {str(e)}")
            return None
    
    async def enrich_dishes_with_images(self, dishes: List[Dish]) -> List[Dish]:
        """
        为菜品列表并发获取最佳图片（使用混合 Pipeline）
        
        Args:
            dishes: 菜品列表
            
        Returns:
            带有图片的菜品列表
        """
        logger.info(f"🚀 Hybrid Pipeline processing {len(dishes)} dishes...")
        
        # 并发处理所有菜品
        tasks = [self.get_best_image(dish) for dish in dishes]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # 更新菜品图片
        success_count = 0
        for dish, image_url in zip(dishes, results):
            if isinstance(image_url, str) and image_url:
                dish.image_url = image_url
                success_count += 1
            elif isinstance(image_url, Exception):
                logger.warning(f"Exception for {dish.english_name}: {image_url}")
        
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
