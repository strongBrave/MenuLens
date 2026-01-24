import base64
import json
import logging
import asyncio
from typing import List
from openai import OpenAI, APIError, APITimeoutError
from schemas import Dish
from config import settings

logger = logging.getLogger(__name__)


class GeminiAnalyzer:
    def __init__(self):
        self._client = None
        self.model = settings.LLM_MODEL
    
    @property
    def client(self):
        """延迟初始化客户端"""
        if self._client is None:
            # 简化初始化，避免 proxies 参数问题
            self._client = OpenAI(
                api_key=settings.LLM_API_KEY,
                base_url=settings.LLM_BASE_URL
            )
        return self._client
    
    async def analyze_menu_image(self, base64_image: str) -> List[Dish]:
        """
        分析菜单图片，识别菜品信息
        
        Args:
            base64_image: Base64编码的图片
            
        Returns:
            菜品列表
            
        Raises:
            ValueError: 解析失败
            APIError: API调用失败
        """
        try:
            # 构造消息
            message = {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": self._get_system_prompt()
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{base64_image}"
                        }
                    }
                ]
            }
            
            # 调用 Gemini API
            response = await asyncio.to_thread(
                self.client.chat.completions.create,
                model=self.model,
                messages=[message],
                temperature=settings.LLM_TEMPERATURE,
                timeout=settings.LLM_TIMEOUT
            )
            
            # 解析响应
            content = response.choices[0].message.content
            dishes_data = self._parse_json_response(content)
            
            # 转换为 Dish 对象
            dishes = []
            for item in dishes_data.get("dishes", []):
                # 截断描述以确保不超过限制
                description = item.get("description", "")[:500]

                name_to_search = item['original_name'] if item.get('original_name') else item['english_name']
                
                dish = Dish(
                    original_name=item["original_name"],
                    english_name=item["english_name"],
                    description=description,
                    flavor_tags=item.get("flavor_tags", [])[:5],
                    dietary_tags=item.get("dietary_tags", []),
                    ingredients=item.get("ingredients", []),
                    search_term=f"{name_to_search} food dish",
                    price=item.get("price"),
                    currency=item.get("currency"),
                    language_code=item.get("language_code", "en")
                )
                dishes.append(dish)
            
            logger.info(f"Successfully analyzed {len(dishes)} dishes from menu")
            return dishes
            
        except APITimeoutError:
            logger.error("Gemini API timeout")
            raise ValueError("API timeout - please try again")
        except APIError as e:
            logger.error(f"Gemini API error: {str(e)}")
            raise ValueError(f"API error: {str(e)}")
    
    def _get_system_prompt(self) -> str:
        """获取系统提示词"""
        return """You are a professional Menu AI Expert. Analyze the menu image and extract dish information.

Output STRICT JSON format. No markdown, no code blocks.

Format:
{
  "dishes": [
    {
      "original_name": "Original Name (Local Language)",
      "english_name": "English Name",
      "description": "Rich, detailed, and appetizing description (around 30-50 words). Describe the taste, texture, cooking method, and cultural background if applicable. Make the user hungry.",
      "flavor_tags": ["spicy", "sweet", "savory", "sour", "bitter", "umami", "fresh"],
      "dietary_tags": ["vegetarian", "vegan", "gluten-free", "contains-nuts", "contains-pork", "contains-alcohol", "spicy", "seafood"],
      "ingredients": ["main ingredient 1", "main ingredient 2"],
      "price": "Number only (e.g. 1200)",
      "currency": "Symbol (e.g. JPY, USD, THB, CNY)",
      "language_code": "ISO code (e.g. ja, zh, th, fr)"
    }
  ]
}

Rules:
1. Extract REAL dishes from the image. Do not hallucinate.
2. Infer `dietary_tags` based on common knowledge.
3. Infer `ingredients` from dish name and description.
4. Description MUST be detailed and appetizing (NOT short).
5. If price is missing, leave null. Infer currency from context if possible.
6. Return empty `dishes` array if no menu detected."""
    
    def _parse_json_response(self, content: str) -> dict:
        """解析 JSON 响应"""
        try:
            # 尝试直接解析
            return json.loads(content)
        except json.JSONDecodeError:
            # 尝试提取 JSON 块
            start = content.find("{")
            end = content.rfind("}") + 1
            if start >= 0 and end > start:
                try:
                    return json.loads(content[start:end])
                except json.JSONDecodeError:
                    pass
            raise ValueError("Failed to parse JSON from LLM response")


# 全局实例
gemini_analyzer = GeminiAnalyzer()
