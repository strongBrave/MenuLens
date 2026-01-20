# 🚀 MenuGen - 快速启动指南

## ✅ 项目状态

**刚完成**:
- ✅ Git 仓库初始化 (2 commits)
- ✅ 后端完整代码 (FastAPI + Gemini + 异步搜索)
- ✅ 前端完整代码 (React + Tailwind CSS)
- ✅ 所有依赖已安装
- ✅ Tailwind CSS 已配置并成功构建

---

## 🎯 接下来的步骤

### 1️⃣ 启动开发环境

**打开 2 个终端**

**终端 1 - 后端服务** (Port 8000):
```bash
cd /Users/junhao/Desktop/MenuGen/backend
conda activate menuge
uvicorn main:app --reload
```

预期输出:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete
```

**终端 2 - 前端开发服务器** (Port 5173):
```bash
cd /Users/junhao/Desktop/MenuGen/frontend
npm run dev
```

预期输出:
```
  VITE v7.3.1  ready in XXX ms
  ➜  Local:   http://localhost:5173/
```

### 2️⃣ 打开浏览器

访问: **http://localhost:5173**

你应该看到 MenuGen 应用的首页（有拖拽上传区域）

---

## 📝 配置 API Keys (重要!)

目前后端 `.env` 中的 API Keys 是空的。为了让应用完整工作，需要填入:

**编辑 `backend/.env` 并填入**:

```env
# 从 Google Cloud Console 获取
GOOGLE_API_KEY=your_actual_key_here

# 从 Google Custom Search 获取
SEARCH_API_KEY=your_search_key_here
SEARCH_ENGINE_ID=your_search_engine_id_here
```

获取方法见 [PROJECT_SPEC.md](PROJECT_SPEC.md) 第 5 节和 [INIT_CHECKLIST.md](INIT_CHECKLIST.md) 最后部分。

---

## 🧪 测试应用

1. **上传一张菜单图片** (JPG/PNG, <10MB)
2. **等待 AI 识别**:
   - 会显示 "Analyzing Menu..."
   - 然后显示 "Searching Images..."
3. **查看结果**: 菜品卡片网格展示

---

## 📦 项目文件树

```
MenuGen/
├── 📄 README.md                 # 项目概览
├── 📄 PROJECT_SPEC.md           # 完整技术规范
├── 📄 PIPELINE.md               # 开发流程表
├── 📄 QUICK_REFERENCE.md        # 代码参考库
├── 📄 INIT_CHECKLIST.md         # 初始化指南
│
├── backend/                     # 🐍 Python FastAPI
│   ├── main.py                  # ✅ FastAPI 应用入口
│   ├── config.py                # ✅ 配置管理
│   ├── schemas.py               # ✅ 数据模型 (Pydantic)
│   ├── requirements.txt         # ✅ 依赖列表
│   ├── .env                     # ✅ 环境变量（需填入 API Keys）
│   ├── .env.example             # ✅ 模板
│   ├── services/
│   │   ├── llm_service.py       # ✅ Gemini Vision API
│   │   └── search_service.py    # ✅ 异步 Google 搜索
│   └── utils/
│       └── file_utils.py        # ✅ 文件处理
│
└── frontend/                    # ⚛️ React + Vite
    ├── src/
    │   ├── App.jsx              # ✅ 主应用组件
    │   ├── index.css            # ✅ Tailwind CSS
    │   ├── api/
    │   │   └── client.js        # ✅ Axios HTTP 客户端
    │   └── components/
    │       ├── MenuUpload.jsx    # ✅ 上传区域
    │       ├── MenuCard.jsx      # ✅ 菜品卡片
    │       ├── MenuGrid.jsx      # ✅ 卡片网格
    │       ├── LoadingState.jsx  # ✅ 加载状态
    │       └── ErrorBoundary.jsx # ✅ 错误处理
    ├── package.json             # ✅ npm 依赖
    ├── .env                     # ✅ 前端环境变量
    ├── tailwind.config.js       # ✅ Tailwind 配置
    └── postcss.config.js        # ✅ PostCSS 配置
```

---

## 🔌 API 端点

### 核心端点: `POST /api/analyze-menu`

**测试方法** (使用 curl):

```bash
curl -X POST http://localhost:8000/api/analyze-menu \
  -F "file=@path/to/menu.jpg"
```

**成功响应** (HTTP 200):
```json
{
  "success": true,
  "dishes": [
    {
      "id": "dish_001",
      "original_name": "宫保鸡丁",
      "english_name": "Kung Pao Chicken",
      "description": "Tender chicken pieces with peanuts...",
      "flavor_tags": ["spicy", "savory", "nutty"],
      "search_term": "Kung Pao Chicken 宫保鸡丁 food dish",
      "image_url": "https://..."
    }
  ],
  "metadata": {
    "total_dishes": 1,
    "filename": "menu.jpg"
  }
}
```

**错误响应** (HTTP 400):
```json
{
  "success": false,
  "error": "Invalid image format",
  "error_code": "INVALID_IMAGE"
}
```

---

## 🛠️ 常见开发任务

### 修改后端代码

编辑 `backend/` 中的任何 Python 文件后，`uvicorn --reload` 会自动重启服务器。

```bash
# 后端会自动重载
# 无需重启
```

### 修改前端代码

编辑 `frontend/src/` 中的任何文件后，Vite 会自动热重载浏览器。

```bash
# 热重载已启用
# 浏览器会自动刷新显示变化
```

### 添加新的 Python 包

```bash
cd backend
conda activate menuge
pip install package_name
pip freeze > requirements.txt
```

### 添加新的 npm 包

```bash
cd frontend
npm install package_name
npm install -D package_name  # dev dependency
```

---

## 🔍 调试技巧

### 后端日志

后端在 `uvicorn` 控制台显示所有请求日志:
```
INFO:     127.0.0.1:54321 - "POST /api/analyze-menu HTTP/1.1" 200 OK
```

### 前端调试

打开浏览器开发者工具 (F12 或 Cmd+Option+I)：
- **Console** 标签显示 JavaScript 错误
- **Network** 标签显示 API 请求

### 查看后端错误

如果 API 返回错误，后端控制台会显示完整错误栈：
```python
ERROR:     Error during request:
Traceback (most recent call last):
  ...
```

---

## 📚 下一步开发

参考这些文件继续开发：

| 需求 | 查看文件 |
|------|---------|
| 完整 API 文档 | [PROJECT_SPEC.md](PROJECT_SPEC.md) |
| 代码实现参考 | [QUICK_REFERENCE.md](QUICK_REFERENCE.md) |
| 开发时间表 | [PIPELINE.md](PIPELINE.md) |
| 故障排查 | [QUICK_REFERENCE.md](QUICK_REFERENCE.md) 最后一节 |

---

## ✨ 项目特点

✅ **完整功能**:
- 菜单图片上传 (拖拽 + 文件选择)
- AI 自动识别菜品
- 并发搜索菜品图片
- 美观响应式卡片展示

✅ **生产级代码质量**:
- 完整的错误处理
- Pydantic 数据验证
- CORS 配置
- 异步处理 (asyncio + aiohttp)

✅ **开发者友好**:
- 热重载 (前后端都支持)
- 详细的注释和文档
- 环境变量配置管理
- Git 版本控制

---

## 🎉 现在可以开始开发了！

**快速启动命令速查**:

```bash
# 后端
cd backend && conda activate menuge && uvicorn main:app --reload

# 前端
cd frontend && npm run dev

# 访问
http://localhost:5173
```

**祝编码愉快！** 🚀

---

**最后更新**: 2026-01-20  
**当前状态**: ✅ 完全可用的开发环境  
**下一步**: 添加 API Keys 并测试完整流程

