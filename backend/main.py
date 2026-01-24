from fastapi import FastAPI, File, UploadFile, HTTPException, status, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
import logging
import base64
from typing import Optional
import io
from PIL import Image

from config import settings
from schemas import MenuResponse, Dish, MenuRequest
from services.llm_service import gemini_analyzer
from services import hybrid_pipeline as hp_module
from services.image_proxy import image_proxy
from utils.file_utils import encode_image_to_base64, validate_image

# 根据配置选择搜索服务
if settings.SEARCH_PROVIDER == "serpapi":
    from services.serp_search import serp_searcher as searcher
    logger_msg = "SerpAPI"
else:
    from services.search_service import google_searcher as searcher
    logger_msg = "Google Custom Search"

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# 创建 FastAPI 应用
app = FastAPI(
    title="MenuGen API",
    description="AI-powered menu item recognition and RAG image enhancement",
    version="2.0.0"
)

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.CORS_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 全局 Pipeline 实例（在启动时初始化）
_hybrid_pipeline = None

# 初始化 Hybrid Pipeline
@app.on_event("startup")
async def startup_event():
    """应用启动时初始化 Pipeline"""
    global _hybrid_pipeline
    _hybrid_pipeline = hp_module.initialize_hybrid_pipeline(searcher, searcher)
    logger.info(f"✅ MenuGen API v2.0 started - Using {logger_msg} for image search")

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
    return {
        "status": "ok",
        "service": "MenuGen API",
        "version": "2.0.0",
        "rag_pipeline_enabled": settings.ENABLE_RAG_PIPELINE
    }


@app.post("/api/analyze-menu", response_model=MenuResponse)
async def analyze_menu(
    file: UploadFile = File(...), 
    target_language: str = Form("English"),
    source_currency: Optional[str] = Form(None)
) -> MenuResponse:
    """
    分析菜单图片并获取图片
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
        
        # 5. 调用 Gemini 分析菜品 (传入 target_language 和 source_currency)
        logger.info(f"🔍 Analyzing menu from file: {file.filename} in {target_language} (Currency: {source_currency})")
        dishes = await gemini_analyzer.analyze_menu_image(base64_image, target_language, source_currency)
        
        if not dishes:
            return MenuResponse(
                success=True,
                dishes=[],
                metadata={"message": "No dishes detected in the image"}
            )
        
        # 6. 使用 RAG Pipeline 获取图片
        logger.info(f"🚀 RAG Pipeline: Processing {len(dishes)} dishes")
        
        if settings.ENABLE_RAG_PIPELINE and _hybrid_pipeline:
            # 使用新的混合 Pipeline
            enriched_dishes = await _hybrid_pipeline.enrich_dishes_with_images(dishes)
        else:
            # 使用传统搜索（向后兼容）
            if not _hybrid_pipeline:
                logger.warning("⚠️  RAG Pipeline not initialized, using fallback search")
            else:
                logger.info("RAG Pipeline disabled in config, using legacy search")
            enriched_dishes = await google_searcher.enrich_dishes_with_images(dishes)
        
        logger.info(f"✅ Successfully processed menu with {len(enriched_dishes)} dishes")
        
        return MenuResponse(
            success=True,
            dishes=enriched_dishes,
            metadata={
                "total_dishes": len(enriched_dishes),
                "filename": file.filename,
                "rag_pipeline": settings.ENABLE_RAG_PIPELINE,
                "language": target_language
            }
        )
        
    except ValueError as e:
        logger.error(f"❌ Validation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"❌ Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.post("/api/analyze-text-only", response_model=MenuResponse)
async def analyze_text_only(
    file: UploadFile = File(...), 
    target_language: str = Form("English"),
    source_currency: Optional[str] = Form(None)
) -> MenuResponse:
    """
    第一阶段：仅分析文本（快速响应）
    """
    try:
        if not file.content_type.startswith("image/"):
            raise ValueError("File must be an image")
        
        contents = await file.read()
        is_valid, error_msg = validate_image(contents)
        if not is_valid:
            raise ValueError(error_msg)
        
        base64_image = encode_image_to_base64(contents)
        
        logger.info(f"🔍 Analyzing text only from file: {file.filename} in {target_language} (Currency: {source_currency})")
        dishes = await gemini_analyzer.analyze_menu_image(base64_image, target_language, source_currency)
        
        return MenuResponse(
            success=True,
            dishes=dishes,
            metadata={
                "total_dishes": len(dishes),
                "filename": file.filename,
                "mode": "text_only",
                "language": target_language
            }
        )
    except ValueError as e:
        logger.error(f"❌ Validation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"❌ Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.post("/api/search-dish-image", response_model=MenuResponse)
async def search_dish_image(dish: Dish) -> MenuResponse:
    """
    第二阶段：为单个菜品搜索图片（异步加载）
    用于前端在收到 text-only 结果后，单独为每个菜品发起搜索
    """
    try:
        logger.info(f"🔍 Searching images for dish: {dish.english_name}")
        
        # 优先使用 RAG Pipeline
        if settings.ENABLE_RAG_PIPELINE and _hybrid_pipeline:
            enriched_dishes = await _hybrid_pipeline.enrich_dishes_with_images([dish])
        else:
            # 否则使用普通搜索 (searcher 是在文件头部定义的全局实例)
            # 注意：searcher 可能是 google_searcher 或 serp_searcher
            enriched_dishes = await searcher.enrich_dishes_with_images([dish])
        
        return MenuResponse(
            success=True,
            dishes=enriched_dishes,
            metadata={"mode": "single_dish_search"}
        )
    except Exception as e:
        logger.error(f"❌ Search error: {str(e)}")
        # 即使搜索失败，也返回原 dish，避免前端崩溃
        return MenuResponse(
            success=True,
            dishes=[dish],
            metadata={"error": str(e)}
        )


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
            image_url="https://via.placeholder.com/300x200?text=Kung+Pao+Chicken",
            match_score=98
        ),
        Dish(
            original_name="蛋炒饭",
            english_name="Fried Rice with Egg",
            description="Fluffy fried rice with scrambled eggs and vegetables",
            flavor_tags=["savory", "mild", "comforting"],
            search_term="Fried Rice with Egg 蛋炒饭 food dish",
            image_url="https://via.placeholder.com/300x200?text=Fried+Rice",
            match_score=85
        )
    ]
    
    return MenuResponse(
        success=True,
        dishes=test_dishes,
        metadata={"message": "Test data - no real analysis performed"}
    )


# ===== 图片代理端点 =====

@app.get("/api/proxy-image")
async def proxy_image_endpoint(url: str, retry: int = 3):
    """
    图片代理端点 - 绕过 CORS 和反爬虫限制
    """
    try:
        if not url:
            raise HTTPException(status_code=400, detail="Missing 'url' parameter")
        
        # 限制重试次数在合理范围内
        retry = min(max(retry, 1), 5)
        
        # 获取图片（包含重试机制）
        result = await image_proxy.proxy_image(url, timeout=15, retry=retry)
        
        if result is None:
            raise HTTPException(status_code=502, detail="Failed to fetch image from URL after retries")
        
        image_data, content_type = result
        
        # 返回图片流
        return StreamingResponse(
            iter([image_data]),
            media_type=content_type,
            headers={
                "Cache-Control": "public, max-age=86400",  # 缓存 24 小时
                "Content-Disposition": "inline",
            }
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Proxy error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.BACKEND_HOST, port=settings.BACKEND_PORT)
