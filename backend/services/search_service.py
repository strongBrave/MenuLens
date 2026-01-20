import aiohttp
import asyncio
import logging
from typing import List, Optional
from schemas import Dish
from config import settings

logger = logging.getLogger(__name__)


class GoogleSearcher:
    """Google Custom Search 并发搜索"""
    
    def __init__(self):
        self.api_key = settings.SEARCH_API_KEY
        self.engine_id = settings.SEARCH_ENGINE_ID
        self.search_url = "https://www.googleapis.com/customsearch/v1"
    
    async def enrich_dishes_with_images(self, dishes: List[Dish]) -> List[Dish]:
        """
        为菜品并发搜索图片
        
        Args:
            dishes: 菜品列表
            
        Returns:
            带有图片URL的菜品列表
        """
        semaphore = asyncio.Semaphore(settings.MAX_CONCURRENT_SEARCHES)
        
        async with aiohttp.ClientSession() as session:
            tasks = [
                self._search_single_image(session, dish, semaphore)
                for dish in dishes
            ]
            results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # 处理结果
        enriched_dishes = []
        for dish, result in zip(dishes, results):
            if isinstance(result, Exception):
                logger.warning(f"Failed to search image for {dish.english_name}: {str(result)}")
            else:
                dish.image_url = result
            enriched_dishes.append(dish)
        
        return enriched_dishes
    
    async def _search_single_image(
        self,
        session: aiohttp.ClientSession,
        dish: Dish,
        semaphore: asyncio.Semaphore
    ) -> Optional[str]:
        """搜索单个菜品的图片"""
        async with semaphore:
            try:
                params = {
                    "q": dish.search_term,
                    "cx": self.engine_id,
                    "key": self.api_key,
                    "searchType": "image",
                    "num": settings.SEARCH_NUM_RESULTS,
                    "safe": "active",
                }
                
                async with session.get(
                    self.search_url,
                    params=params,
                    timeout=aiohttp.ClientTimeout(total=settings.SEARCH_TIMEOUT)
                ) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        items = data.get("items", [])
                        if items:
                            return items[0].get("link")
                    elif resp.status == 403:
                        logger.error("Google Search API quota exceeded")
                    else:
                        logger.warning(f"Search API returned status {resp.status}")
                
                return None
                
            except asyncio.TimeoutError:
                logger.warning(f"Timeout searching for {dish.english_name}")
                return None
            except Exception as e:
                logger.error(f"Error searching for {dish.english_name}: {str(e)}")
                return None


# 全局实例
google_searcher = GoogleSearcher()
