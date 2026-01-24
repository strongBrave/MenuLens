from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Union
from datetime import datetime


class Dish(BaseModel):
    """单个菜品数据模型"""
    id: str = Field(default_factory=lambda: str(datetime.now().timestamp()))
    original_name: str = Field(..., description="菜品原名（中文/本地语言）")
    english_name: str = Field(..., description="英文名称或通用名")
    description: str = Field(..., max_length=500, description="菜品描述")
    flavor_tags: List[str] = Field(..., max_items=5, description="口味标签")
    dietary_tags: List[str] = Field(default_factory=list, description="膳食标签，如: vegetarian, vegan, gluten-free, contains-nuts, pork, spicy")
    ingredients: List[str] = Field(default_factory=list, description="主要食材列表")
    search_term: str = Field(..., description="搜索词，格式: {EN} {ZH} food dish")
    image_url: Optional[str] = Field(None, description="主要图片URL（向下兼容）")
    image_urls: List[str] = Field(default_factory=list, description="备选图片URL列表")
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
