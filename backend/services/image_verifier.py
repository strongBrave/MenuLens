"""图片相关性验证服务 - 使用 Gemini Flash 作为视觉裁判"""

import asyncio
import logging
import base64
from typing import Optional
import aiohttp
from openai import OpenAI, APIError, APITimeoutError

from config import settings

logger = logging.getLogger(__name__)


class ImageVerifier:
    """使用 Gemini Flash 验证搜索到的图片是否与菜品相匹配"""
    
    def __init__(self):
        self._client = None
        self.model = "gemini-2.5-flash-lite"  # 快速且便宜的模型用于验证

    def _normalize_optional_str(self, value: Optional[str]) -> Optional[str]:
        if value is None:
            return None
        normalized = value.strip()
        return normalized if normalized else None
    
    @property
    def client(self) -> OpenAI:
        """懒加载 OpenAI 客户端（指向 Gemini）"""
        if self._client is None:
            self._client = OpenAI(
                api_key=settings.LLM_API_KEY,
                base_url=settings.LLM_BASE_URL,
            )
        return self._client

    def _get_client(self, llm_api_key: Optional[str] = None, llm_base_url: Optional[str] = None) -> OpenAI:
        normalized_api_key = self._normalize_optional_str(llm_api_key)
        normalized_base_url = self._normalize_optional_str(llm_base_url)

        if not normalized_api_key and not normalized_base_url:
            if not settings.LLM_API_KEY:
                raise ValueError("LLM API key is missing for image verification")
            return self.client

        effective_api_key = normalized_api_key or settings.LLM_API_KEY
        if not effective_api_key:
            raise ValueError("LLM API key is missing for image verification")

        return OpenAI(
            api_key=effective_api_key,
            base_url=normalized_base_url or settings.LLM_BASE_URL,
        )
    
    async def verify_image_relevance(
        self,
        dish_name: str,
        description: str,
        image_url: str,
        original_name: str = "",
        llm_api_key: Optional[str] = None,
        llm_base_url: Optional[str] = None,
        llm_model: Optional[str] = None,
        llm_temperature: Optional[float] = None,
        llm_timeout: Optional[int] = None
    ) -> float:
        """
        验证图片是否与菜品相关
        
        使用 Gemini Flash 进行快速视觉验证
        
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
            
            # 使用异步线程调用同步 API
            response = await asyncio.to_thread(
                self._call_verify_api,
                dish_name=dish_name,
                image_url=image_url,
                prompt=prompt,
                llm_api_key=llm_api_key,
                llm_base_url=llm_base_url,
                llm_model=llm_model,
                llm_temperature=llm_temperature,
                llm_timeout=llm_timeout,
            )
            
            # 解析分数
            try:
                score = float(response.strip())
                # 确保分数在 0-1 范围内
                score = max(0.0, min(1.0, score))
                logger.debug(f"Image verification: {dish_name} = {score:.2f}")
                return score
            except ValueError:
                logger.warning(f"Failed to parse verification score: {response}")
                return 0.0
                
        except APITimeoutError as e:
            logger.warning(f"⏱️  Timeout verifying image for {dish_name} - returning 0.0")
            return 0.0
        except APIError as e:
            # 捕获 OpenAI SDK 抛出的 API 错误
            error_str = str(e).lower()
            if 'mime type' in error_str or 'text/html' in error_str or 'connection reset' in error_str or '500' in str(e):
                logger.debug(f"Invalid image URL (API Error): {dish_name} - {str(e)[:50]}...")
            else:
                logger.error(f"API error verifying {dish_name}: {str(e)}")
            return 0.0
        except Exception as e:
            # 捕获其他所有异常
            error_str = str(e).lower()
            if 'connection reset' in error_str or 'mime type' in error_str:
                logger.debug(f"Image verification failed (Network/Format): {str(e)[:50]}...")
            else:
                logger.error(f"Error verifying image for {dish_name}: {str(e)}")
            return 0.0
    
    def _call_verify_api(
        self,
        dish_name: str,
        image_url: str,
        prompt: str,
        llm_api_key: Optional[str] = None,
        llm_base_url: Optional[str] = None,
        llm_model: Optional[str] = None,
        llm_temperature: Optional[float] = None,
        llm_timeout: Optional[int] = None
    ) -> str:
        """
        同步 API 调用（在线程中执行以保持异步）
        
        使用 chat.completions.create 而非 messages.create
        """
        try:
            # 使用 chat.completions.create（OpenAI SDK 的正确方法）
            client = self._get_client(llm_api_key, llm_base_url)
            model = self._normalize_optional_str(llm_model) or self.model
            timeout = llm_timeout if llm_timeout is not None else settings.IMAGE_VERIFY_TIMEOUT

            request_kwargs = {
                "model": model,
                "max_tokens": 10,
                "timeout": timeout,
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": prompt
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": image_url
                                }
                            }
                        ]
                    }
                ]
            }
            if llm_temperature is not None:
                request_kwargs["temperature"] = llm_temperature

            message = client.chat.completions.create(**request_kwargs)
            
            # 提取响应文本
            response_text = message.choices[0].message.content.strip()
            return response_text
            
        except Exception as e:
            # 在这里我们不抛出异常，而是记录并返回空，让外层捕获
            # 或者直接重新抛出，让外层的 except Exception as e 捕获
            # 为了调试清晰，我们 raise 出去
            raise
    
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
