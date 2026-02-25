"""SerpAPI 搜索服务 - 支持多结果获取，绕过反爬虫机制"""

import aiohttp
import asyncio
import logging
from typing import List, Optional

from config import settings

logger = logging.getLogger(__name__)


class SerpAPISearcher:
    """使用 SerpAPI 进行图片搜索 - 支持 RAG Pipeline"""
    
    def __init__(self):
        self.api_key = settings.SERPAPI_KEY or settings.SEARCH_API_KEY
        self.engine = settings.SERPAPI_ENGINE
        self.search_url = "https://serpapi.com/search"
    
    async def search_images(
        self,
        query: str,
        num: int = 3,
        api_key: Optional[str] = None
    ) -> List[str]:
        """
        通过 SerpAPI 搜索图片
        
        SerpAPI 优势：
        - 自动处理反爬虫
        - 返回高质量结果
        - 支持多种搜索引擎
        - 更稳定的链接
        
        Args:
            query: 搜索关键词
            num: 返回结果数量
            
        Returns:
            图片 URL 列表
        """
        effective_api_key = (api_key or "").strip() or self.api_key
        if not effective_api_key:
            logger.warning("SerpAPI key not configured")
            return []
        
        try:
            params = {
                "q": query,
                "api_key": effective_api_key,
                "engine": self.engine,
                "tbm": "isch",  # 图片搜索
                "num": min(num, 10),  # 最多 10 个结果
            }
            
            timeout = aiohttp.ClientTimeout(total=settings.SEARCH_TIMEOUT)
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    self.search_url,
                    params=params,
                    timeout=timeout
                ) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        
                        # 从 images_results 提取图片 URL
                        images_results = data.get("images_results", [])
                        urls = [img.get("original") for img in images_results if img.get("original")]
                        
                        logger.debug(f"SerpAPI search '{query}': found {len(urls)} results")
                        return urls
                    
                    elif resp.status == 401:
                        logger.error("SerpAPI: Invalid API key")
                    elif resp.status == 429:
                        logger.warning("SerpAPI: Rate limit exceeded")
                    else:
                        logger.warning(f"SerpAPI returned {resp.status}")
                    
                    return []
        
        except asyncio.TimeoutError:
            logger.warning(f"SerpAPI timeout for '{query}' (timeout: {settings.SEARCH_TIMEOUT}s)")
            return []
        except Exception as e:
            logger.error(f"SerpAPI error for '{query}': {type(e).__name__}: {str(e)}")
            return []
    
    async def enrich_dishes_with_images(
        self,
        dishes: List,
        serpapi_key: Optional[str] = None,
        search_candidate_results: Optional[int] = None
    ) -> List:
        """
        为菜品列表搜索图片（传统模式，单结果）
        
        向后兼容旧代码
        
        Args:
            dishes: 菜品列表
            
        Returns:
            带有图片 URL 的菜品列表
        """
        from schemas import Dish  # 本地导入避免循环依赖
        
        num_results = 3
        if isinstance(search_candidate_results, int):
            num_results = max(1, min(search_candidate_results, 10))

        semaphore = asyncio.Semaphore(settings.MAX_CONCURRENT_SEARCHES)
        
        async def search_one_dish(dish: Dish) -> Optional[str]:
            """搜索单个菜品的图片"""
            async with semaphore:
                try:
                    urls = await self.search_images(
                        dish.search_term,
                        num=num_results,
                        api_key=serpapi_key
                    )
                    if urls:
                        return urls[0]
                    return None
                except Exception as e:
                    logger.error(f"Error searching for {dish.english_name}: {str(e)}")
                    return None
        
        # 并发搜索
        tasks = [search_one_dish(dish) for dish in dishes]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # 处理结果
        success_count = 0
        for dish, result in zip(dishes, results):
            if isinstance(result, str):
                dish.image_url = result
                success_count += 1
            elif isinstance(result, Exception):
                logger.warning(f"Failed to search for {dish.english_name}: {result}")
        
        logger.info(f"SerpAPI search completed: {success_count}/{len(dishes)} dishes got images")
        return dishes


# 全局实例
serp_searcher = SerpAPISearcher()
