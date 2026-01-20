# MenuGen - 快速参考 & 代码模板库

## 📌 核心代码片段库

### 1. 后端 - schemas.py（数据模型）

```python
# backend/schemas.py
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class Dish(BaseModel):
    """单个菜品数据模型"""
    id: str = Field(default_factory=lambda: str(datetime.now().timestamp()))
    original_name: str = Field(..., description="菜品原名（中文/本地语言）")
    english_name: str = Field(..., description="英文名称或通用名")
    description: str = Field(..., max_length=200, description="菜品描述")
    flavor_tags: List[str] = Field(..., max_items=5, description="口味标签")
    search_term: str = Field(..., description="搜索词，格式: {EN} {ZH} food dish")
    image_url: Optional[str] = Field(None, description="菜品图片URL")

    class Config:
        json_schema_extra = {
            "example": {
                "original_name": "宫保鸡丁",
                "english_name": "Kung Pao Chicken",
                "description": "Stir-fried chicken with peanuts and dried chilies",
                "flavor_tags": ["spicy", "savory", "nutty"],
                "search_term": "Kung Pao Chicken 宫保鸡丁 food dish",
                "image_url": None
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
```

---

### 2. 后端 - config.py（配置管理）

```python
# backend/config.py
import os
from dotenv import load_dotenv
import logging

load_dotenv()

class Settings:
    """应用全局配置"""
    
    # API Keys
    GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY", "")
    SEARCH_API_KEY: str = os.getenv("SEARCH_API_KEY", "")
    SEARCH_ENGINE_ID: str = os.getenv("SEARCH_ENGINE_ID", "")
    
    # Server
    BACKEND_HOST: str = os.getenv("BACKEND_HOST", "0.0.0.0")
    BACKEND_PORT: int = int(os.getenv("BACKEND_PORT", 8000))
    
    # CORS
    CORS_ORIGIN: str = os.getenv("CORS_ORIGIN", "http://localhost:5173")
    
    # LLM
    LLM_MODEL: str = os.getenv("LLM_MODEL", "gemini-1.5-pro")
    LLM_TIMEOUT: int = int(os.getenv("LLM_TIMEOUT", 30))
    LLM_TEMPERATURE: float = float(os.getenv("LLM_TEMPERATURE", 0.2))
    
    # Search
    SEARCH_TIMEOUT: int = int(os.getenv("SEARCH_TIMEOUT", 5))
    SEARCH_NUM_RESULTS: int = int(os.getenv("SEARCH_NUM_RESULTS", 1))
    MAX_CONCURRENT_SEARCHES: int = int(os.getenv("MAX_CONCURRENT_SEARCHES", 10))
    
    # File
    MAX_FILE_SIZE_MB: int = int(os.getenv("MAX_FILE_SIZE_MB", 10))
    ALLOWED_EXTENSIONS: list = ["jpg", "jpeg", "png", "webp"]
    
    # Validation
    VALIDATE_SETTINGS: bool = os.getenv("VALIDATE_SETTINGS", "true").lower() == "true"
    
    def __init__(self):
        if self.VALIDATE_SETTINGS:
            self._validate()
    
    def _validate(self):
        """验证必需的环境变量"""
        required = ["GOOGLE_API_KEY", "SEARCH_API_KEY", "SEARCH_ENGINE_ID"]
        missing = [k for k in required if not getattr(self, k, None)]
        if missing:
            logging.warning(f"Missing environment variables: {missing}")

settings = Settings()
```

---

### 3. 后端 - llm_service.py（Gemini 调用）

```python
# backend/services/llm_service.py
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
        self.client = OpenAI(
            api_key=settings.GOOGLE_API_KEY,
            base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
        )
        self.model = settings.LLM_MODEL
    
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
```

---

### 4. 后端 - search_service.py（异步搜索）

```python
# backend/services/search_service.py
import aiohttp
import asyncio
import logging
from typing import List, Optional
from schemas import Dish
from config import settings

logger = logging.getLogger(__name__)

class GoogleSearcher:
    """Google Custom Search 并发搜索"""
    
    def __init__(self):
        self.api_key = settings.SEARCH_API_KEY
        self.engine_id = settings.SEARCH_ENGINE_ID
        self.search_url = "https://www.googleapis.com/customsearch/v1"
    
    async def enrich_dishes_with_images(self, dishes: List[Dish]) -> List[Dish]:
        """
        为菜品并发搜索图片
        
        Args:
            dishes: 菜品列表
            
        Returns:
            带有图片URL的菜品列表
        """
        semaphore = asyncio.Semaphore(settings.MAX_CONCURRENT_SEARCHES)
        
        async with aiohttp.ClientSession() as session:
            tasks = [
                self._search_single_image(session, dish, semaphore)
                for dish in dishes
            ]
            results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # 处理结果
        enriched_dishes = []
        for dish, result in zip(dishes, results):
            if isinstance(result, Exception):
                logger.warning(f"Failed to search image for {dish.english_name}: {str(result)}")
            else:
                dish.image_url = result
            enriched_dishes.append(dish)
        
        return enriched_dishes
    
    async def _search_single_image(
        self,
        session: aiohttp.ClientSession,
        dish: Dish,
        semaphore: asyncio.Semaphore
    ) -> Optional[str]:
        """搜索单个菜品的图片"""
        async with semaphore:
            try:
                params = {
                    "q": dish.search_term,
                    "cx": self.engine_id,
                    "key": self.api_key,
                    "searchType": "image",
                    "num": settings.SEARCH_NUM_RESULTS,
                    "safe": "active",
                }
                
                async with session.get(
                    self.search_url,
                    params=params,
                    timeout=aiohttp.ClientTimeout(total=settings.SEARCH_TIMEOUT)
                ) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        items = data.get("items", [])
                        if items:
                            return items[0].get("link")
                    elif resp.status == 403:
                        logger.error("Google Search API quota exceeded")
                    else:
                        logger.warning(f"Search API returned status {resp.status}")
                
                return None
                
            except asyncio.TimeoutError:
                logger.warning(f"Timeout searching for {dish.english_name}")
                return None
            except Exception as e:
                logger.error(f"Error searching for {dish.english_name}: {str(e)}")
                return None

# 全局实例
google_searcher = GoogleSearcher()
```

---

### 5. 后端 - main.py（FastAPI 应用）

```python
# backend/main.py
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
        if len(contents) > settings.MAX_FILE_SIZE_MB * 1024 * 1024:
            raise ValueError(f"File size exceeds {settings.MAX_FILE_SIZE_MB}MB")
        
        # 3. 验证图片格式
        try:
            image = Image.open(io.BytesIO(contents))
            image.verify()
        except Exception:
            raise ValueError("Invalid or corrupted image file")
        
        # 4. 转换为 Base64
        base64_image = base64.b64encode(contents).decode("utf-8")
        
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.BACKEND_HOST, port=settings.BACKEND_PORT)
```

---

### 6. 前端 - App.jsx（主应用）

```jsx
// frontend/src/App.jsx
import React, { useState } from 'react';
import MenuUpload from './components/MenuUpload';
import MenuGrid from './components/MenuGrid';
import LoadingState from './components/LoadingState';
import ErrorBoundary from './components/ErrorBoundary';
import { analyzeMenu } from './api/client';
import './styles/App.css';

function App() {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('upload'); // 'upload' | 'analyzing' | 'searching' | 'done'
  const [error, setError] = useState(null);

  const handleUpload = async (file) => {
    setError(null);
    setLoading(true);
    setStep('analyzing');

    try {
      // 调用后端 API
      const response = await analyzeMenu(file);
      
      if (response.data.success) {
        setStep('searching');
        // 模拟搜索延迟以改善 UX
        await new Promise(r => setTimeout(r, 500));
        
        setDishes(response.data.dishes);
        setStep('done');
      } else {
        setError(response.data.error || 'Failed to analyze menu');
        setStep('upload');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'An error occurred';
      setError(errorMessage);
      setStep('upload');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setDishes([]);
    setStep('upload');
    setError(null);
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* 页头 */}
        <header className="bg-white shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-indigo-600">🍜 MenuGen</h1>
            {step === 'done' && (
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                Upload Another Menu
              </button>
            )}
          </div>
        </header>

        {/* 主内容 */}
        <main className="max-w-6xl mx-auto px-4 py-8">
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {step === 'upload' && <MenuUpload onUpload={handleUpload} disabled={loading} />}
          {(step === 'analyzing' || step === 'searching') && <LoadingState step={step} />}
          {step === 'done' && <MenuGrid dishes={dishes} />}
        </main>

        {/* 页脚 */}
        <footer className="mt-12 py-6 bg-gray-800 text-white text-center">
          <p>MenuGen © 2026 | Powered by Gemini & Google Search</p>
        </footer>
      </div>
    </ErrorBoundary>
  );
}

export default App;
```

---

### 7. 前端 - components/MenuCard.jsx

```jsx
// frontend/src/components/MenuCard.jsx
import React from 'react';

export default function MenuCard({ dish }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
      {/* 菜品图片 */}
      <div className="relative w-full h-48 bg-gray-200 overflow-hidden">
        {dish.image_url ? (
          <img
            src={dish.image_url}
            alt={dish.english_name}
            className="w-full h-full object-cover hover:scale-105 transition-transform"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-300">
            <span className="text-gray-500">No image found</span>
          </div>
        )}
      </div>

      {/* 菜品信息 */}
      <div className="p-4">
        {/* 名称 */}
        <h3 className="font-bold text-lg text-gray-800 mb-1">
          {dish.english_name}
        </h3>
        <p className="text-gray-600 text-sm mb-3">{dish.original_name}</p>

        {/* 描述 */}
        <p className="text-gray-700 text-sm mb-4 leading-relaxed">
          {dish.description.length > 100
            ? dish.description.substring(0, 100) + '...'
            : dish.description}
        </p>

        {/* 口味标签 */}
        <div className="flex flex-wrap gap-2">
          {dish.flavor_tags.map(tag => (
            <span
              key={tag}
              className="inline-block bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-xs font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

## 📋 快速开发检查清单

### 启动前检查
```
后端准备：
□ Python 3.9+ 安装
□ 虚拟环境创建和激活
□ requirements.txt 已安装
□ .env 文件已配置（API Keys）
□ 测试 Gemini API 连接
□ 测试 Google Search API 连接

前端准备：
□ Node.js 18+ 安装
□ npm install 已运行
□ Tailwind CSS 已编译
□ Vite 开发服务器可启动

配置检查：
□ CORS 域名正确
□ 前后端端口不冲突
□ 所有环境变量已设置
```

### 开发流程
```
1. 启动后端：
   cd backend
   source venv/bin/activate
   uvicorn main:app --reload --port 8000

2. 启动前端（新终端）：
   cd frontend
   npm run dev

3. 打开浏览器：
   http://localhost:5173

4. 测试流程：
   □ 上传测试菜单图片
   □ 查看控制台日志
   □ 验证 Gemini 响应
   □ 检查图片搜索结果
   □ 确认卡片渲染
```

### 常见问题排查
```
问题：后端 CORS 错误
→ 检查 CORS_ORIGIN 环境变量
→ 前端实际访问地址是否匹配

问题：Gemini API 返回 401
→ 验证 GOOGLE_API_KEY 正确性
→ 检查 API 是否已启用

问题：图片搜索返回 None
→ 验证 SEARCH_ENGINE_ID 和 SEARCH_API_KEY
→ 检查搜索配额

问题：图片上传超时
→ 减小 MAX_FILE_SIZE_MB
→ 检查网络连接

问题：前端组件不显示
→ 检查 Tailwind CSS 是否编译
→ 清理浏览器缓存
→ 检查控制台错误信息
```

---

## 🎨 UI 组件预设样式

### 通用按钮
```jsx
// 主按钮
<button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">

// 次要按钮
<button className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition">

// 危险按钮
<button className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
```

### 通用卡片
```jsx
// 标准卡片
<div className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6">

// 大卡片
<div className="bg-white rounded-lg shadow-lg p-8">

// 信息卡片
<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
```

### 加载动画
```jsx
// 转圈动画
<div className="animate-spin w-12 h-12 border-4 border-indigo-300 border-t-indigo-600 rounded-full"></div>

// 脉冲动画
<div className="animate-pulse w-full h-48 bg-gray-300 rounded"></div>
```

---

**准备好开始开发了吗？** 🚀

