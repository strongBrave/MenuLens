"""图片相关性验证服务 - 使用 Gemini Flash 作为视觉裁判"""

import aiohttp
import asyncio
import logging
import base64
from typing import Optional
from openai import OpenAI

from config import settings

logger = logging.getLogger(__name__)


class ImageVerifier:
    """使用 Gemini Flash 验证搜索到的图片是否与菜品相匹配"""
    
    def __init__(self):
        self._client = None
    
    @property
    def client(self) -> OpenAI:
        """懒加载 OpenAI 客户端（指向 Gemini）"""
        if self._client is None:
            self._client = OpenAI(
                api_key=settings.LLM_API_KEY,
                base_url=settings.LLM_BASE_URL,
            )
        return self._client
    
    async def verify_image_relevance(
        self,
        dish_name: str,
        description: str,
        image_url: str,
        original_name: str = ""
    ) -> float:
        """
        验证图片是否与菜品相关
        
        使用 Gemini 1.5 Flash 进行快速视觉验证
        
        Args:
            dish_name: 英文菜名
            description: 菜品描述
            image_url: 图片 URL
            original_name: 原始菜名（中文）
            
        Returns:
            相关性分数 (0.0 - 1.0)
        """
        try:
            # 构建验证提示词
            prompt = f"""你是一个严格的美食图片质量检查官。
            
请评估这张图片是否准确展示了以下菜品：

菜品名称：{original_name} ({dish_name})
菜品描述：{description}

请根据以下标准评分（0-1）：
1. 图片内容是否明确为食物？(否则为 0)
2. 食物类型是否与菜名相符？(例如搜索"红烧肉"不应该返回生肉或其他菜)
3. 图片质量是否足以用于菜单展示？(清晰度、颜色饱和度)
4. 是否存在明显的误导或不相关元素？

请返回一个单独的数字，范围 0.0-1.0，只返回数字，不要有其他文字。
示例：0.85"""
            
            # 调用 Gemini 进行验证（使用 vision 能力）
            message = self.client.messages.create(
                model="gemini-1.5-flash",  # 快速且便宜的模型
                max_tokens=10,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "image",
                                "source": {
                                    "type": "url",
                                    "url": image_url,
                                },
                            },
                            {
                                "type": "text",
                                "text": prompt
                            }
                        ],
                    }
                ],
            )
            
            # 解析分数
            response_text = message.content[0].text.strip()
            try:
                score = float(response_text)
                # 确保分数在 0-1 范围内
                score = max(0.0, min(1.0, score))
                logger.info(f"Image verification: {dish_name} = {score:.2f}")
                return score
            except ValueError:
                logger.warning(f"Failed to parse verification score: {response_text}")
                return 0.0
                
        except asyncio.TimeoutError:
            logger.error(f"Timeout verifying image for {dish_name}")
            return 0.0
        except Exception as e:
            logger.error(f"Error verifying image for {dish_name}: {str(e)}")
            return 0.0
    
    async def download_image_as_base64(self, image_url: str) -> Optional[str]:
        """
        下载图片并转换为 Base64
        
        Args:
            image_url: 图片 URL
            
        Returns:
            Base64 编码的图片，失败返回 None
        """
        try:
            timeout = aiohttp.ClientTimeout(total=5)
            async with aiohttp.ClientSession() as session:
                async with session.get(image_url, timeout=timeout) as resp:
                    if resp.status == 200:
                        image_data = await resp.read()
                        return base64.b64encode(image_data).decode('utf-8')
                    else:
                        logger.warning(f"Failed to download image: {resp.status}")
                        return None
        except Exception as e:
            logger.error(f"Error downloading image: {str(e)}")
            return None


# 全局实例
image_verifier = ImageVerifier()
