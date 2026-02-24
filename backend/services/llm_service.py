import base64
import json
import logging
import asyncio
from typing import List
from openai import OpenAI, APIError, APITimeoutError
from schemas import Dish, ChatRequest
from config import settings

logger = logging.getLogger(__name__)


class GeminiAnalyzer:
    def __init__(self):
        self._client = None
        self.model = settings.LLM_MODEL
        
    def _get_model(self, override_model: str = None) -> str:
        """Get the model to use, with optional override"""
        return override_model if override_model else self.model
    
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
    
    async def analyze_menu_image(self, base64_image: str, target_language: str = "English", source_currency: str = None, llm_model: str = None) -> List[Dish]:
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
                        "text": self._get_system_prompt(target_language, source_currency)
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
                
                # 强制使用用户指定的货币（如果提供了且 LLM 没填或填错）
                # 但这里我们主要依赖 Prompt 的引导，并在转换时兜底
                currency = item.get("currency")
                if source_currency and (not currency or currency == "Unknown"):
                    currency = source_currency
                
                dish = Dish(
                    original_name=item["original_name"],
                    english_name=item["english_name"],
                    description=description,
                    flavor_tags=item.get("flavor_tags", [])[:5],
                    dietary_tags=item.get("dietary_tags", []),
                    ingredients=item.get("ingredients", []),
                    search_term=f"{name_to_search} food dish",
                    price=item.get("price"),
                    currency=currency,
                    language_code=item.get("language_code", "en")
                )
                dishes.append(dish)
            
            logger.info(f"Successfully analyzed {len(dishes)} dishes from menu in {target_language}")
            return dishes
            
        except APITimeoutError:
            logger.error("Gemini API timeout")
            raise ValueError("API timeout - please try again")
        except APIError as e:
            logger.error(f"Gemini API error: {str(e)}")
            raise ValueError(f"API error: {str(e)}")
    
    async def chat_with_menu(self, request: ChatRequest) -> str:
        """
        基于菜单上下文与用户聊天
        """
        try:
            # 构造上下文 Prompt
            menu_context = "Here is the menu data you have analyzed:\n"
            for dish in request.dishes:
                price_str = f"{dish.price} {dish.currency}" if dish.price else "Price unknown"
                menu_context += f"- {dish.english_name} ({dish.original_name}): {price_str}, {dish.description}. Tags: {', '.join(dish.flavor_tags + dish.dietary_tags)}\n"
            
            system_instruction = f"""You are **MenuLens AI**, a friendly and expert Dining Assistant that helps users explore and enjoy menus.

## Your Role
You are helping a user who is looking at a menu from a restaurant. Your job is to be their personal food advisor - making dining decisions easier and more enjoyable.

## Current Menu Context
{menu_context}

## Menu Information You Have Access To:
- **Dishes**: All available items with names (original + English)
- **Prices**: Original currency
- **Descriptions**: AI-generated dish explanations
- **Flavor Tags**: Spicy, savory, sweet, etc.
- **Dietary Tags**: Vegetarian, vegan, gluten-free, contains pork/nuts, etc.
- **Ingredients**: Main ingredients for each dish

## Core Guidelines

### 1. Response Style
- **Language**: Always reply in the same language as the user's input.
- Be warm, helpful, and enthusiastic (but not over-the-top).
- Keep answers **concise but complete** - 2-3 sentences for simple questions.
- Use **bullet points** for lists (e.g., "Here are 3 options:") to make it readable on mobile.
- When recommending dishes, **always explain why** ("This is great because...").

### 2. Answering Questions
✅ **DO**:
- Answer based ONLY on the current menu data.
- Ask for clarification if the question is ambiguous.
- Provide specific dish names (English or Original) when recommending.
- Calculate totals when discussing budgets.
- Mention dietary tags when relevant.
- When discussing prices, use the currency the user is most likely referring to (usually the one in their question), but you can mention the menu's original price for clarity.

❌ **DON'T**:
- Make up information not in the menu.
- Recommend dishes from other restaurants.
- Be overly formal - conversational is better.

### 3. Common Scenarios

**Budget/Price Questions** (e.g., "I have $50"):
- Suggest 2-3 dish combinations.
- Show individual prices and calculate total.
- Consider value for money ("This gives you the most variety").

**Dietary Restrictions** (e.g., "Is there vegan food?"):
- List all suitable options.
- Check both `dietary_tags` and `ingredients`.
- If unsure, advise asking the staff.

**"What to order?" / Recommendations**:
- Consider group size and budget.
- Suggest a mix of dishes (appetizers, mains, etc.).
- Highlight signature or popular items based on descriptions.

**Flavor/Ingredient Questions** (e.g., "Is it spicy?", "What's in it?"):
- Reference the dish description and ingredients.
- Don't guess - say "The menu doesn't specify" if unsure.

## Remember
You're a helpful friend, not a robot. Be natural, be helpful, and make their dining decision easier! 🍽️
"""

            messages = [{"role": "system", "content": system_instruction}]
            
            # Add history (last 5 messages to save tokens)
            for msg in request.history[-5:]:
                messages.append({"role": msg.get("role"), "content": msg.get("content")})
            
            # Add current user message
            messages.append({"role": "user", "content": request.message})

            response = await asyncio.to_thread(
                self.client.chat.completions.create,
                model=self.model,
                messages=messages,
                temperature=0.7, # Slightly higher for creative recommendations
                timeout=20
            )
            
            return response.choices[0].message.content

        except Exception as e:
            logger.error(f"Chat API error: {str(e)}")
            raise ValueError(f"Chat failed: {str(e)}")

    def _get_system_prompt(self, target_language: str, source_currency: str = None) -> str:
        """获取系统提示词"""
        currency_instruction = ""
        if source_currency:
            currency_instruction = f"IMPORTANT: The menu currency is '{source_currency}'. If no currency symbol is found on the image, use '{source_currency}' as the currency for all prices."

        return f"""You are a professional Menu AI Expert. Analyze the menu image and extract dish information.

Output STRICT JSON format. No markdown, no code blocks.

IMPORTANT: Translate 'english_name', 'description', 'flavor_tags', and 'ingredients' into {target_language}.
However, 'original_name' MUST remain in the original language shown on the menu.

{currency_instruction}

Format:
{{
  "dishes": [
    {{
      "original_name": "Original Name (Local Language)",
      "english_name": "Translated Name in {target_language}",
      "description": "Rich, detailed, and appetizing description in {target_language} (80-100 words). Describe taste, texture, cooking method, cultural background, and key ingredients. Make the user hungry.",
      "flavor_tags": ["tag1", "tag2", "tag3 (in {target_language})"],
      "dietary_tags": ["vegetarian", "vegan", "gluten-free", "contains-nuts", "contains-pork", "contains-alcohol", "spicy", "seafood"],
      "ingredients": ["ingredient 1", "ingredient 2 (in {target_language})"],
      "price": "Number only",
      "currency": "Symbol (e.g. JPY, USD, THB)",
      "language_code": "ISO code of original menu language"
    }}
  ]
}}

Rules:
1. Extract REAL dishes.
2. Infer `dietary_tags` (keep these keys in English for system logic).
3. Translate content to {target_language}.
4. Description MUST be appetizing and detailed (80-100 words).
5. If price missing, null.
6. Return empty `dishes` if no menu."""
    
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
