import os
from dotenv import load_dotenv
import logging

load_dotenv()

class Settings:
    """应用全局配置"""
    
    # API Keys
    SEARCH_API_KEY: str = os.getenv("SEARCH_API_KEY", "")  # SerpAPI key (新)
    SEARCH_ENGINE_ID: str = os.getenv("SEARCH_ENGINE_ID", "")  # 保留向后兼容，但不再使用
    SEARCH_PROVIDER: str = os.getenv("SEARCH_PROVIDER", "serpapi")  # "serpapi" 或 "google"
    
    # SerpAPI 配置
    SERPAPI_KEY: str = os.getenv("SERPAPI_KEY", "")
    SERPAPI_ENGINE: str = os.getenv("SERPAPI_ENGINE", "google")  # google, bing, baidu 等
    
    # Server
    BACKEND_HOST: str = os.getenv("BACKEND_HOST", "0.0.0.0")
    BACKEND_PORT: int = int(os.getenv("BACKEND_PORT", 8000))
    
    # CORS
    CORS_ORIGIN: str = os.getenv("CORS_ORIGIN", "http://localhost:5173")
    
    # LLM
    LLM_API_KEY: str = os.getenv("LLM_API_KEY", "")
    LLM_BASE_URL: str = os.getenv("LLM_BASE_URL", "https://generativelanguage.googleapis.com/v1beta/openai/")
    LLM_MODEL: str = os.getenv("LLM_MODEL", "gemini-2.0-flash-lite-preview-02-05")  # Updated default model
    LLM_TIMEOUT: int = int(os.getenv("LLM_TIMEOUT", 30))
    LLM_TEMPERATURE: float = float(os.getenv("LLM_TEMPERATURE", 0.2))
    
    # Search
    SEARCH_TIMEOUT: int = int(os.getenv("SEARCH_TIMEOUT", 5))
    SEARCH_NUM_RESULTS: int = int(os.getenv("SEARCH_NUM_RESULTS", 1))
    MAX_CONCURRENT_SEARCHES: int = int(os.getenv("MAX_CONCURRENT_SEARCHES", 10))
    
    # RAG Pipeline
    ENABLE_RAG_PIPELINE: bool = os.getenv("ENABLE_RAG_PIPELINE", "true").lower() == "true"
    SEARCH_CANDIDATE_RESULTS: int = int(os.getenv("SEARCH_CANDIDATE_RESULTS", 10))  # 搜索 Top 3
    IMAGE_VERIFY_SCORE_THRESHOLD: float = float(os.getenv("IMAGE_VERIFY_SCORE_THRESHOLD", 0.7))
    ENABLE_IMAGE_GENERATION: bool = os.getenv("ENABLE_IMAGE_GENERATION", "true").lower() == "true"
    GENERATION_API_URL: str = os.getenv("GENERATION_API_URL", "https://api.openai.com/v1/images/generations")
    GENERATION_API_KEY: str = os.getenv("GENERATION_API_KEY", "")  # DALL-E 或 Imagen API Key
    GENERATION_MODEL: str = os.getenv("GENERATION_MODEL", "dall-e-3")  # 生成模型
    IMAGE_URL_CHECK_TIMEOUT: int = int(os.getenv("IMAGE_URL_CHECK_TIMEOUT", 5))
    IMAGE_VERIFY_TIMEOUT: int = int(os.getenv("IMAGE_VERIFY_TIMEOUT", 15))
    
    # File
    MAX_FILE_SIZE_MB: int = int(os.getenv("MAX_FILE_SIZE_MB", 10))
    ALLOWED_EXTENSIONS: list = ["jpg", "jpeg", "png", "webp"]
    
    # Validation
    VALIDATE_SETTINGS: bool = os.getenv("VALIDATE_SETTINGS", "true").lower() == "true"

    # Proxy
    PROXY_URL: str = os.getenv("PROXY_URL", "")
    
    def __init__(self):
        if self.VALIDATE_SETTINGS:
            self._validate()
    
    def _validate(self):
        """验证必需的环境变量"""
        # 注意: 某些环境变量可能在 .env 中设置，不强制要求所有都通过 os.getenv 获取
        # 简化验证逻辑，避免不必要的警告
        pass


settings = Settings()
