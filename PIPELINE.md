# MenuGen - 开发 Pipeline & 时间表

**项目周期**: 约 7-10 天（完整MVP）  
**团队**: 1 名全栈开发者  
**状态**: 筹备阶段

---

## 📋 Phase 1: 项目初始化 (Day 1)

### 1.1 工作空间准备 ✅
- [ ] 创建 Git 仓库
- [ ] 初始化项目结构（frontend / backend）
- [ ] 创建 `.gitignore` 文件
- [ ] README 模板

### 1.2 后端基础设置 (Day 1 - 2h)
- [ ] Python venv 创建
- [ ] FastAPI 项目初始化
- [ ] 安装核心依赖 (fastapi, pydantic, openai, aiohttp, python-dotenv)
- [ ] 配置文件结构 (config.py, .env.example)

### 1.3 前端基础设置 (Day 1 - 1h)
- [ ] Vite + React 项目初始化
- [ ] Tailwind CSS 配置
- [ ] 目录结构创建
- [ ] ESLint / Prettier 配置

### 交付物
```
MenuGen/
├── backend/
│   ├── venv/
│   ├── main.py (基础骨架)
│   ├── config.py
│   ├── .env.example
│   ├── requirements.txt
│   └── README.md
├── frontend/
│   ├── src/
│   ├── tailwind.config.js
│   ├── vite.config.js
│   ├── package.json
│   └── README.md
├── PROJECT_SPEC.md ✅
├── PIPELINE.md (本文件)
└── .gitignore
```

**时间**: 3-4 小时

---

## 🔧 Phase 2: 后端核心模块 (Day 2-3)

### 2.1 数据模型层 (Day 2 - 1h)

**文件**: `backend/schemas.py`

```python
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class Dish(BaseModel):
    original_name: str
    english_name: str
    description: str
    flavor_tags: List[str]
    search_term: str
    image_url: Optional[str] = None

class MenuRequest(BaseModel):
    image_file: str  # Base64 encoded

class MenuResponse(BaseModel):
    success: bool
    dishes: Optional[List[Dish]] = None
    error: Optional[str] = None
    error_code: Optional[str] = None
    metadata: Optional[dict] = None
```

**完成标志**: `pytest` 通过所有数据验证测试

### 2.2 配置管理 (Day 2 - 30min)

**文件**: `backend/config.py`

```python
import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
    SEARCH_API_KEY = os.getenv("SEARCH_API_KEY")
    SEARCH_ENGINE_ID = os.getenv("SEARCH_ENGINE_ID")
    BACKEND_PORT = int(os.getenv("BACKEND_PORT", 8000))
    CORS_ORIGIN = os.getenv("CORS_ORIGIN", "http://localhost:5173")
    MAX_CONCURRENT_SEARCHES = int(os.getenv("MAX_CONCURRENT_SEARCHES", 10))

settings = Settings()
```

### 2.3 Gemini LLM 服务 (Day 2-3 - 3h)

**文件**: `backend/services/llm_service.py`

关键任务:
- [ ] OpenAI client 初始化 (base_url 配置)
- [ ] Base64 图片编码
- [ ] Prompt 工程与 JSON 解析
- [ ] 错误处理与重试机制
- [ ] Unit 测试

```python
async def analyze_menu_image(base64_image: str) -> List[Dish]:
    # 1. 初始化 OpenAI 客户端（指向 Gemini）
    # 2. 发送 Vision request
    # 3. 解析 JSON 响应
    # 4. 转换为 Dish 对象列表
    # 5. 处理异常
    pass
```

**完成标志**: 成功调用 Gemini，返回正确格式的菜品列表

### 2.4 Google 图片搜索服务 (Day 3 - 2h)

**文件**: `backend/services/search_service.py`

关键任务:
- [ ] 异步 HTTP 客户端 (aiohttp)
- [ ] Google Custom Search API 调用
- [ ] 并发任务管理 (asyncio)
- [ ] 错误处理与超时
- [ ] Unit 测试

```python
async def search_image_for_dish(dish: Dish) -> Optional[str]:
    # 构建搜索词："{english} {original} food dish"
    # 调用 Google Custom Search API
    # 提取第一个结果的图片 URL
    pass

async def enrich_dishes_with_images(dishes: List[Dish]) -> List[Dish]:
    # 并发搜索所有菜品的图片
    # 返回更新后的 dishes
    pass
```

**完成标志**: 1 个菜品 < 1s，10 个菜品并发 < 2s

### 2.5 工具模块 (Day 3 - 1h)

**文件**: `backend/utils/file_utils.py`

```python
import base64
from PIL import Image
import io

def encode_image_to_base64(image_file) -> str:
    # 读取上传的图片
    # 转换为 Base64
    pass

def validate_image_format(image_file) -> bool:
    # 验证图片格式（JPEG, PNG）
    # 检查文件大小
    pass
```

**时间**: 7-8 小时

---

## 🌐 Phase 3: 后端 API 层 (Day 4)

### 3.1 FastAPI 主应用 (Day 4 - 2h)

**文件**: `backend/main.py`

```python
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import logging

app = FastAPI(title="MenuGen API", version="1.0")

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.CORS_ORIGIN],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/analyze-menu")
async def analyze_menu(file: UploadFile = File(...)):
    # 1. 验证文件
    # 2. 编码为 Base64
    # 3. 调用 llm_service.analyze_menu_image
    # 4. 调用 search_service.enrich_dishes_with_images
    # 5. 返回 MenuResponse
    pass

@app.get("/health")
async def health_check():
    return {"status": "ok"}
```

### 3.2 错误处理与日志 (Day 4 - 1h)

- [ ] 自定义异常类
- [ ] 中央错误处理器
- [ ] 请求日志记录
- [ ] 性能监控点

### 3.3 集成测试 (Day 4 - 1h)

- [ ] 单元测试框架 (pytest)
- [ ] 模拟 Gemini 和 Search API
- [ ] 端到端流程测试

**完成标志**: `pytest` 全部通过，能处理上传、调用模型、搜索图片

**时间**: 4 小时

---

## ⚛️ Phase 4: 前端 UI 组件 (Day 5-6)

### 4.1 基础页面骨架 (Day 5 - 1h)

**文件**: `frontend/src/App.jsx`

```jsx
import React, { useState } from 'react';
import MenuUpload from './components/MenuUpload';
import MenuGrid from './components/MenuGrid';
import LoadingState from './components/LoadingState';

function App() {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('upload'); // 'upload' | 'analyzing' | 'searching' | 'done'

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {step === 'upload' && <MenuUpload onUpload={handleUpload} />}
      {(step === 'analyzing' || step === 'searching') && <LoadingState step={step} />}
      {step === 'done' && <MenuGrid dishes={dishes} />}
    </div>
  );
}

export default App;
```

### 4.2 上传组件 (Day 5 - 2h)

**文件**: `frontend/src/components/MenuUpload.jsx`

特性：
- [ ] 拖拽上传区域
- [ ] 文件选择对话框
- [ ] 文件验证（大小、格式）
- [ ] 上传按钮
- [ ] 错误提示

```jsx
export function MenuUpload({ onUpload }) {
  const handleDrop = (e) => {
    // 处理拖拽
  };

  const handleFileChange = (e) => {
    // 处理文件选择
    // 调用 onUpload
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-8">
      <div className="border-4 border-dashed border-blue-300 rounded-lg p-12 text-center">
        {/* 拖拽区域 */}
      </div>
    </div>
  );
}
```

### 4.3 菜品卡片组件 (Day 5 - 2h)

**文件**: `frontend/src/components/MenuCard.jsx`

```jsx
export function MenuCard({ dish }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
      {/* 菜品图片 */}
      <img src={dish.image_url} alt={dish.english_name} className="w-full h-48 object-cover" />
      
      {/* 菜品信息 */}
      <div className="p-4">
        <h3 className="font-bold text-lg">{dish.english_name}</h3>
        <p className="text-gray-600 text-sm mb-2">{dish.original_name}</p>
        <p className="text-gray-700 text-sm mb-3">{dish.description}</p>
        
        {/* 口味标签 */}
        <div className="flex flex-wrap gap-2">
          {dish.flavor_tags.map(tag => (
            <span key={tag} className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### 4.4 加载状态组件 (Day 6 - 1h)

**文件**: `frontend/src/components/LoadingState.jsx`

- [ ] 进度指示器（识别中 → 搜索图片中）
- [ ] 动画效果
- [ ] 取消按钮

### 4.5 菜品网格展示 (Day 6 - 1h)

**文件**: `frontend/src/components/MenuGrid.jsx`

```jsx
export function MenuGrid({ dishes }) {
  return (
    <div className="container mx-auto p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dishes.map(dish => <MenuCard key={dish.id} dish={dish} />)}
      </div>
    </div>
  );
}
```

### 4.6 API 客户端 (Day 6 - 1h)

**文件**: `frontend/src/api/client.js`

```js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 30000,
});

export async function analyzeMenu(imageFile) {
  const formData = new FormData();
  formData.append('file', imageFile);
  
  return apiClient.post('/api/analyze-menu', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
}
```

**时间**: 8-9 小时

---

## 🔗 Phase 5: 前后端集成 (Day 7)

### 5.1 完整流程测试 (Day 7 - 3h)

- [ ] 上传菜单图片 → 后端接收
- [ ] 触发 Gemini 分析 → 获取菜品列表
- [ ] 并发搜索图片 → 返回 URLs
- [ ] 前端渲染卡片网格
- [ ] 处理各种错误场景

### 5.2 UI/UX 调优 (Day 7 - 2h)

- [ ] 响应式布局测试（移动、平板、桌面）
- [ ] 加载动画优化
- [ ] 错误提示美化
- [ ] 颜色方案调整

### 5.3 性能测试 (Day 7 - 1h)

- [ ] 前端加载时间 < 2s
- [ ] 后端 API 响应时间 < 5s
- [ ] 图片加载优化（lazy load）

**时间**: 6 小时

---

## 📦 Phase 6: 部署 & 优化 (Day 8)

### 6.1 环境配置

- [ ] 生成 `.env` 模板
- [ ] 文档化所需 API Keys
- [ ] 部署说明编写

### 6.2 Docker 容器化（可选）

```dockerfile
# backend/Dockerfile
FROM python:3.11
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 6.3 本地运行验证

```bash
# 后端
cd backend
source venv/bin/activate
uvicorn main:app --reload

# 前端
cd frontend
npm run dev
```

**时间**: 2-3 小时

---

## 🐛 Phase 7: 测试 & 文档 (Day 9)

### 7.1 完整 E2E 测试

- [ ] 真实菜单图片测试
- [ ] 多菜品识别测试
- [ ] 错误恢复测试
- [ ] 性能压力测试

### 7.2 文档完善

- [ ] API 文档 (Swagger/OpenAPI)
- [ ] 前端组件文档
- [ ] 部署指南
- [ ] 故障排查指南

### 7.3 代码清理

- [ ] 去除 console.log
- [ ] 代码格式统一
- [ ] 注释完善

**时间**: 4-5 小时

---

## 🚀 Phase 8: 收尾 (Day 10)

### 8.1 最后验证

- [ ] 所有单元测试通过
- [ ] E2E 测试无异常
- [ ] 代码 review
- [ ] 性能基准验证

### 8.2 项目交付

- [ ] README 确认
- [ ] 部署文档完整
- [ ] Git 提交清理
- [ ] 版本标记

**时间**: 1-2 小时

---

## 📊 总体时间表

| Phase | 内容 | Days | Hours |
|-------|------|------|-------|
| 1 | 项目初始化 | Day 1 | 3-4 |
| 2 | 后端核心模块 | Day 2-3 | 7-8 |
| 3 | 后端 API 层 | Day 4 | 4 |
| 4 | 前端 UI 组件 | Day 5-6 | 8-9 |
| 5 | 前后端集成 | Day 7 | 6 |
| 6 | 部署 & 优化 | Day 8 | 2-3 |
| 7 | 测试 & 文档 | Day 9 | 4-5 |
| 8 | 收尾 | Day 10 | 1-2 |
| **总计** | | **~10 days** | **36-42 hrs** |

---

## ⚡ 快速启动检查清单

启动开发前，确保准备好：

- [ ] Google Cloud 项目已创建
- [ ] Gemini API 已启用，获得 `GOOGLE_API_KEY`
- [ ] Custom Search Engine 已创建，获得 `SEARCH_ENGINE_ID` 和 `SEARCH_API_KEY`
- [ ] Python 3.9+ 已安装
- [ ] Node.js 18+ 已安装
- [ ] VS Code / IDE 已配置
- [ ] Git 已初始化

---

## 🎯 MVP 验收标准

✅ **完成标准**:
1. 能上传菜单图片（支持 JPG, PNG）
2. 后端成功调用 Gemini，识别 ≥2 道菜品
3. 并发搜索菜品图片 < 2 秒
4. 前端美观展示菜品卡片（含图、名称、描述、标签）
5. 错误处理合理（网络错误、API 异常）
6. 代码有基本注释和文档

❌ **不需要的 (v2+)**:
- 用户认证
- 数据库存储
- 生产级监控
- 国际化
- 高级缓存

---

## 📞 关键决策点

| 问题 | 建议 | 理由 |
|------|------|------|
| 前端框架选择 | React + Vite | 快速开发，生态成熟 |
| 后端框架 | FastAPI | 异步支持好，文档清晰 |
| 样式方案 | Tailwind CSS | 快速迭代，预置组件多 |
| 搜索 API | Google Custom Search | 稳定可靠，集成简单 |
| 并发策略 | asyncio | Python 原生，无额外依赖 |
| 部署方式 | 本地运行或简单云部署 | MVP 不需复杂架构 |

---

## 🔗 参考资源

- FastAPI 文档: https://fastapi.tiangolo.com/
- OpenAI Python SDK (Gemini 兼容): https://github.com/openai/openai-python
- React 文档: https://react.dev/
- Tailwind CSS: https://tailwindcss.com/
- Vite 文档: https://vitejs.dev/

---

**最后更新**: 2026-01-20  
**准备好开始 Vibe Coding 了吗？** 🚀

