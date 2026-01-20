"""图片生成服务 - 作为搜索结果验证失败时的降级方案"""

import logging
import asyncio
from typing import Optional
import aiohttp

logger = logging.getLogger(__name__)


class ImageGenerator:
    """
    使用 DALL-E 3 或其他生成模型生成菜品图片
    
    当搜索结果验证失败时作为降级方案
    """
    
    def __init__(self, api_key: str = "", model: str = "dall-e-3", base_url: str = ""):
        self.api_key = api_key
        self.model = model
        self.base_url = base_url
    
    async def generate_image(
        self,
        english_name: str,
        original_name: str,
        description: str
    ) -> Optional[str]:
        """
        生成菜品图片
        
        Args:
            english_name: 英文菜名
            original_name: 原始菜名（中文）
            description: 菜品描述
            
        Returns:
            生成图片的 URL，失败返回 None
        """
        if not self.api_key:
            logger.warning("Image generation API key not configured, skipping generation")
            return None
        
        try:
            # 构建高质量的生成提示词
            prompt = self._build_prompt(english_name, original_name, description)
            
            logger.info(f"Generating image for {english_name}...")
            
            timeout = aiohttp.ClientTimeout(total=60)
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.base_url}/images/generations",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": self.model,
                        "prompt": prompt,
                        "n": 1,
                        "size": "1024x1024",
                        "quality": "hd",
                        "style": "natural"
                    },
                    timeout=timeout
                ) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        image_url = data.get("data", [{}])[0].get("url")
                        if image_url:
                            logger.info(f"✨ Generated image for {english_name}")
                            return image_url
                    else:
                        error_data = await resp.text()
                        logger.error(f"Image generation failed ({resp.status}): {error_data}")
            
            return None
            
        except asyncio.TimeoutError:
            logger.error(f"Timeout generating image for {english_name}")
            return None
        except Exception as e:
            logger.error(f"Error generating image for {english_name}: {str(e)}")
            return None
    
    def _build_prompt(
        self,
        english_name: str,
        original_name: str,
        description: str
    ) -> str:
        """
        构建高质量的生成提示词
        
        使用专业食物摄影的风格指令以获得最佳效果
        """
        # 提取主要食材和特点
        prompt = f"""Professional, high-quality food photography of {english_name} ({original_name}).

Description: {description}

Style requirements:
- Photorealistic, restaurant-quality food photography
- Soft, professional lighting
- White or neutral background
- 8K resolution
- Appetizing colors and presentation
- Professional plating style
- Clear, focused shot

This is for a menu, so make it look delicious and professional."""
        
        return prompt.strip()


# 全局实例（需要通过环境变量配置）
from config import settings

image_generator = ImageGenerator(
    api_key=settings.GENERATION_API_KEY,
    model=settings.GENERATION_MODEL,
    base_url=settings.GENERATION_API_URL
)
