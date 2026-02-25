from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Union
from datetime import datetime


class Dish(BaseModel):
    """单个菜品数据模型"""
    id: str = Field(default_factory=lambda: str(datetime.now().timestamp()))
    original_name: str = Field(..., description="菜品原名（中文/本地语言）")
    english_name: str = Field(..., description="英文名称或通用名")
    description: str = Field(..., max_length=1000, description="菜品描述")
    flavor_tags: List[str] = Field(..., max_items=5, description="口味标签")
    dietary_tags: List[str] = Field(default_factory=list, description="膳食标签，如: vegetarian, vegan, gluten-free, contains-nuts, pork, spicy")
    ingredients: List[str] = Field(default_factory=list, description="主要食材列表")
    search_term: str = Field(..., description="搜索词，格式: {EN} {ZH} food dish")
    image_url: Optional[str] = Field(None, description="主要图片URL（向下兼容）")
    image_urls: List[str] = Field(default_factory=list, description="备选图片URL列表")
    image_scores: List[int] = Field(default_factory=list, description="每张图片的匹配置信度列表 (0-100)")
    match_score: Optional[int] = Field(None, description="最佳匹配置信度 (向下兼容)")
    price: Optional[Union[str, int, float]] = Field(None, description="价格（数字部分）")
    currency: Optional[str] = Field(None, description="货币符号（如 JPY, THB, USD）")
    language_code: Optional[str] = Field("en", description="原文语言代码（如 ja, th, fr）")

    @field_validator('price')
    @classmethod
    def coerce_price_to_string(cls, v):
        if v is None:
            return None
        return str(v)

    class Config:
        json_schema_extra = {
            "example": {
                "original_name": "宫保鸡丁",
                "english_name": "Kung Pao Chicken",
                "description": "Stir-fried chicken with peanuts and dried chilies",
                "flavor_tags": ["spicy", "savory", "nutty"],
                "dietary_tags": ["contains-nuts", "spicy"],
                "ingredients": ["chicken", "peanuts", "dried chili", "sichuan peppercorn"],
                "search_term": "Kung Pao Chicken 宫保鸡丁 food dish",
                "image_url": "https://example.com/kungpao.jpg",
                "image_urls": ["https://example.com/kungpao.jpg", "https://example.com/kungpao2.jpg"],
                "image_scores": [95, 82],
                "match_score": 95,
                "price": "58",
                "currency": "CNY",
                "language_code": "zh"
            }
        }


class MenuResponse(BaseModel):
    """API 响应数据模型"""
    success: bool
    dishes: Optional[List[Dish]] = None
    error: Optional[str] = None
    error_code: Optional[str] = None
    metadata: Optional[dict] = Field(None, description="处理元数据")


class MenuRequest(BaseModel):
    """菜单分析请求"""
    image_file: str = Field(..., description="Base64 编码的图片")
    restaurant_context: Optional[str] = Field(None, description="餐厅背景信息（可选）")
    target_language: Optional[str] = Field("English", description="目标输出语言")
    source_currency: Optional[str] = Field(None, description="菜单原始货币单位 (如 USD, CNY)")


class ChatRequest(BaseModel):
    """聊天请求模型"""
    message: str = Field(..., description="用户消息")
    dishes: List[Dish] = Field(..., description="当前菜单的所有菜品上下文")
    history: List[dict] = Field(default_factory=list, description="对话历史 [{'role': 'user', 'content': '...'}, ...]")
    llm_api_key: Optional[str] = Field(None, description="运行时覆盖 LLM API Key")
    llm_base_url: Optional[str] = Field(None, description="运行时覆盖 LLM Base URL")
    llm_model: Optional[str] = Field(None, description="运行时覆盖 LLM Model")
    llm_temperature: Optional[float] = Field(None, description="运行时覆盖 LLM Temperature")
    llm_timeout: Optional[int] = Field(None, description="运行时覆盖 LLM Timeout")


class ChatResponse(BaseModel):
    """聊天响应模型"""
    success: bool
    reply: str
    error: Optional[str] = None


class SearchDishImageRequest(BaseModel):
    """单菜品图片搜索请求（支持运行时覆盖搜索配置）"""
    dish: Dish = Field(..., description="需要搜索图片的菜品")
    serpapi_key: Optional[str] = Field(None, description="运行时覆盖 SerpAPI Key")
    search_candidate_results: Optional[int] = Field(
        None,
        description="候选图片数量（1-10）"
    )
    llm_api_key: Optional[str] = Field(None, description="运行时覆盖 LLM API Key")
    llm_base_url: Optional[str] = Field(None, description="运行时覆盖 LLM Base URL")
    llm_model: Optional[str] = Field(None, description="运行时覆盖 LLM Model")
    llm_temperature: Optional[float] = Field(None, description="运行时覆盖 LLM Temperature")
    llm_timeout: Optional[int] = Field(None, description="运行时覆盖 LLM Timeout")
    generation_api_key: Optional[str] = Field(None, description="运行时覆盖图片生成 API Key")
    generation_model: Optional[str] = Field(None, description="运行时覆盖图片生成模型")
    enable_image_generation: Optional[bool] = Field(None, description="是否启用图片生成降级")
    enable_rag_pipeline: Optional[bool] = Field(None, description="是否启用 RAG Pipeline")
    image_verify_threshold: Optional[float] = Field(None, description="图片验证阈值 (0-1)")
