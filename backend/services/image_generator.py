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

    def _resolve_generation_url(self, base_url: str) -> str:
        """兼容 base_url 为 /v1 或 /images/generations 两种格式。"""
        normalized = (base_url or "").rstrip("/")
        if normalized.endswith("/images/generations"):
            return normalized
        return f"{normalized}/images/generations"
    
    async def generate_image(
        self,
        english_name: str,
        original_name: str,
        description: str,
        generation_api_key: Optional[str] = None,
        generation_model: Optional[str] = None,
        generation_base_url: Optional[str] = None
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
        effective_api_key = (generation_api_key or "").strip() or self.api_key
        effective_model = (generation_model or "").strip() or self.model
        effective_base_url = (generation_base_url or "").strip() or self.base_url

        if not effective_api_key:
            logger.warning("Image generation API key not configured, skipping generation")
            return None
        if not effective_base_url:
            logger.warning("Image generation base URL not configured, skipping generation")
            return None
        
        try:
            # 构建高质量的生成提示词
            prompt = self._build_prompt(english_name, original_name, description)
            
            logger.info(f"Generating image for {english_name}...")
            
            timeout = aiohttp.ClientTimeout(total=60)
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    self._resolve_generation_url(effective_base_url),
                    headers={
                        "Authorization": f"Bearer {effective_api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": effective_model,
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
