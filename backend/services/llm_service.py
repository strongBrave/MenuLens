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
            self._client = OpenAI(
                api_key=settings.GOOGLE_API_KEY,
                base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
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
                max_tokens=2000,
                timeout=settings.LLM_TIMEOUT
            )
            
            # 解析响应
            content = response.choices[0].message.content
            dishes_data = self._parse_json_response(content)
            
            # 转换为 Dish 对象
            dishes = []
            for item in dishes_data.get("dishes", []):
                dish = Dish(
                    original_name=item["original_name"],
                    english_name=item["english_name"],
                    description=item["description"],
                    flavor_tags=item.get("flavor_tags", []),
                    search_term=f"{item['english_name']} {item['original_name']} food dish"
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
        return """你是一个专业的菜单识别AI。分析这张菜单图片，提取所有可见的菜品信息。

返回严格的 JSON 格式（不要包含markdown标记或代码块），如下所示的格式：
{
  "dishes": [
    {
      "original_name": "菜品原名（中文或本地语言）",
      "english_name": "英文翻译或通用名称",
      "description": "详细描述，包括主要材料、烹饪方式和口感特点",
      "flavor_tags": ["tag1", "tag2", "tag3"]
    }
  ]
}

严格要求：
1. 只提取图片中实际看到的菜品，不要编造
2. description 保持在 100-200 字以内
3. flavor_tags 最多 5 个，使用英文（如: spicy, sweet, savory, nutty, sour, bitter, umami, fresh 等）
4. 返回必须是有效的 JSON，没有任何额外的文本或标记
5. 菜品名称要准确，优先保留原始名称
6. 如果图片不是菜单或无法识别菜品，返回空的 dishes 数组"""
    
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
