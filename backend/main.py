from fastapi import FastAPI, File, UploadFile, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
import base64
from typing import Optional
import io
from PIL import Image

from config import settings
from schemas import MenuResponse, Dish
from services.llm_service import gemini_analyzer
from services.search_service import google_searcher
from utils.file_utils import encode_image_to_base64, validate_image

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 创建 FastAPI 应用
app = FastAPI(
    title="MenuGen API",
    description="AI-powered menu item recognition and image search",
    version="1.0.0"
)

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.CORS_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 错误处理
@app.exception_handler(ValueError)
async def value_error_handler(request, exc):
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"success": False, "error": str(exc), "error_code": "INVALID_INPUT"}
    )


# ===== API 端点 =====

@app.get("/health")
async def health_check():
    """健康检查"""
    return {"status": "ok", "service": "MenuGen API"}


@app.post("/api/analyze-menu", response_model=MenuResponse)
async def analyze_menu(file: UploadFile = File(...)) -> MenuResponse:
    """
    分析菜单图片
    
    流程：
    1. 验证和编码图片
    2. 调用 Gemini 识别菜品
    3. 并发搜索菜品图片
    4. 返回完整数据
    """
    try:
        # 1. 验证文件
        if not file.content_type.startswith("image/"):
            raise ValueError("File must be an image")
        
        # 2. 读取和验证图片大小
        contents = await file.read()
        
        # 3. 验证图片格式和大小
        is_valid, error_msg = validate_image(contents)
        if not is_valid:
            raise ValueError(error_msg)
        
        # 4. 转换为 Base64
        base64_image = encode_image_to_base64(contents)
        
        # 5. 调用 Gemini 分析
        logger.info(f"Analyzing menu from file: {file.filename}")
        dishes = await gemini_analyzer.analyze_menu_image(base64_image)
        
        if not dishes:
            return MenuResponse(
                success=True,
                dishes=[],
                metadata={"message": "No dishes detected in the image"}
            )
        
        # 6. 并发搜索图片
        logger.info(f"Searching images for {len(dishes)} dishes")
        enriched_dishes = await google_searcher.enrich_dishes_with_images(dishes)
        
        logger.info(f"Successfully processed menu with {len(enriched_dishes)} dishes")
        
        return MenuResponse(
            success=True,
            dishes=enriched_dishes,
            metadata={
                "total_dishes": len(enriched_dishes),
                "filename": file.filename
            }
        )
        
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


# 开发环境下的测试端点
@app.post("/api/test-analyze")
async def test_analyze():
    """测试端点 - 不需要真实的 API Key"""
    # 模拟测试数据
    test_dishes = [
        Dish(
            original_name="宫保鸡丁",
            english_name="Kung Pao Chicken",
            description="Stir-fried chicken with peanuts and dried chilies in a spicy sauce",
            flavor_tags=["spicy", "savory", "nutty"],
            search_term="Kung Pao Chicken 宫保鸡丁 food dish",
            image_url="https://via.placeholder.com/300x200?text=Kung+Pao+Chicken"
        ),
        Dish(
            original_name="蛋炒饭",
            english_name="Fried Rice with Egg",
            description="Fluffy fried rice with scrambled eggs and vegetables",
            flavor_tags=["savory", "mild", "comforting"],
            search_term="Fried Rice with Egg 蛋炒饭 food dish",
            image_url="https://via.placeholder.com/300x200?text=Fried+Rice"
        )
    ]
    
    return MenuResponse(
        success=True,
        dishes=test_dishes,
        metadata={"message": "Test data - no real analysis performed"}
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.BACKEND_HOST, port=settings.BACKEND_PORT)
