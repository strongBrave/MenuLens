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
                    timeout=timeout,
                    proxy='http://127.0.0.1:7897',
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
        为菜品列表搜索图片（增强模式，多结果）
        
        Args:
            dishes: 菜品列表
            
        Returns:
            带有图片 URL 列表的菜品列表
        """
        semaphore = asyncio.Semaphore(settings.MAX_CONCURRENT_SEARCHES)
        
        async with aiohttp.ClientSession() as session:
            tasks = [
                self._search_dish_images(session, dish, semaphore)
                for dish in dishes
            ]
            # 等待所有搜索完成
            await asyncio.gather(*tasks, return_exceptions=True)
        
        # 统计结果
        success_count = sum(1 for d in dishes if d.image_urls)
        logger.info(f"Image search completed: {success_count}/{len(dishes)} dishes got images")
        return dishes
    
    async def _search_dish_images(
        self,
        session: aiohttp.ClientSession,
        dish: Dish,
        semaphore: asyncio.Semaphore
    ) -> None:
        """搜索单个菜品的多张图片并填充到 dish 对象"""
        async with semaphore:
            try:
                # 搜索 Top 3 图片
                urls = await self.search_images(dish.search_term, num=3)
                
                if urls:
                    dish.image_urls = urls
                    dish.image_url = urls[0]  # 向下兼容
            
            except Exception as e:
                logger.error(f"Error searching for {dish.english_name}: {str(e)}")
                # 出错时保留空列表


# 全局实例
google_searcher = GoogleSearcher()
