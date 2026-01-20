"""Google Custom Search 服务 - 支持多结果获取"""

import aiohttp
import asyncio
import logging
from typing import List, Optional

from schemas import Dish
from config import settings

logger = logging.getLogger(__name__)


class GoogleSearcher:
    """Google Custom Search 并发搜索 - 支持 RAG Pipeline"""
    
    def __init__(self):
        self.api_key = settings.SEARCH_API_KEY
        self.engine_id = settings.SEARCH_ENGINE_ID
        self.search_url = "https://www.googleapis.com/customsearch/v1"
    
    async def search_images(
        self,
        query: str,
        num: int = 3
    ) -> List[str]:
        """
        搜索图片并返回多个候选 URL
        
        Args:
            query: 搜索关键词
            num: 返回结果数量（默认 3）
            
        Returns:
            图片 URL 列表
        """
        if not self.api_key or not self.engine_id:
            logger.warning("Search API not configured")
            return []
        
        if self.engine_id == "google":
            logger.warning("Invalid engine ID 'google' - use valid Custom Search cx ID")
            return []
        
        try:
            params = {
                "q": query,
                "cx": self.engine_id,
                "key": self.api_key,
                "searchType": "image",
                "num": min(num, 10),  # Google API 最多 10 个结果
                "safe": "active",
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
                        items = data.get("items", [])
                        urls = [item.get("link") for item in items if item.get("link")]
                        logger.debug(f"Search '{query}': found {len(urls)} results")
                        return urls
                    
                    elif resp.status == 403:
                        logger.error("Google Search API: quota exceeded or permission denied")
                    elif resp.status == 429:
                        logger.warning("Google Search API: rate limit exceeded")
                    else:
                        logger.warning(f"Google Search API returned {resp.status}")
                    
                    return []
        
        except asyncio.TimeoutError:
            logger.warning(f"Search timeout for '{query}' (timeout: {settings.SEARCH_TIMEOUT}s)")
            return []
        except Exception as e:
            logger.error(f"Search error for '{query}': {type(e).__name__}: {str(e)}")
            return []
    
    async def enrich_dishes_with_images(self, dishes: List[Dish]) -> List[Dish]:
        """
        为菜品列表搜索图片（传统模式，单结果）
        
        此方法保留向后兼容性。新代码应使用 hybrid_pipeline。
        
        Args:
            dishes: 菜品列表
            
        Returns:
            带有图片 URL 的菜品列表
        """
        semaphore = asyncio.Semaphore(settings.MAX_CONCURRENT_SEARCHES)
        
        async with aiohttp.ClientSession() as session:
            tasks = [
                self._search_single_image(session, dish, semaphore)
                for dish in dishes
            ]
            results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # 处理结果
        success_count = 0
        for dish, result in zip(dishes, results):
            if isinstance(result, str):
                dish.image_url = result
                success_count += 1
            elif isinstance(result, Exception):
                logger.warning(f"Failed to search for {dish.english_name}: {result}")
        
        logger.info(f"Image search completed: {success_count}/{len(dishes)} dishes got images")
        return dishes
    
    async def _search_single_image(
        self,
        session: aiohttp.ClientSession,
        dish: Dish,
        semaphore: asyncio.Semaphore
    ) -> Optional[str]:
        """搜索单个菜品的图片（返回第一个有效结果）"""
        async with semaphore:
            try:
                urls = await self.search_images(dish.search_term, num=3)
                
                if urls:
                    return urls[0]
                
                return None
            
            except Exception as e:
                logger.error(f"Error searching for {dish.english_name}: {str(e)}")
                return None


# 全局实例
google_searcher = GoogleSearcher()
