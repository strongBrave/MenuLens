# 🍜 MenuGen - AI 菜单识别系统

> 使用 Gemini AI 和 Google Search 的智能菜单图片分析工具  
> 自动识别菜品信息并搜索美食图片

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Python](https://img.shields.io/badge/python-3.9+-green.svg)
![Node.js](https://img.shields.io/badge/node.js-18+-green.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

---

## 📸 功能概览

### 核心特性
- ✅ **AI 菜单识别**: 使用 Google Gemini 1.5 Pro 自动识别菜单中的菜品
- ✅ **多语言支持**: 自动提取原名和英文翻译
- ✅ **智能搜索**: 并发调用 Google Custom Search API 为菜品搜索图片
- ✅ **美观展示**: React + Tailwind CSS 打造的响应式卡片网格
- ✅ **实时反馈**: 进度指示器展示 AI 识别和图片搜索进度
- ✅ **错误处理**: 完善的异常处理和用户友好的错误提示

### 技术亮点
- 🚀 **高并发**: FastAPI 异步处理 + Asyncio 并发搜索
- 🔒 **安全验证**: Pydantic 数据模型 + 图片格式验证
- 🎯 **精准搜索**: 通用搜索词策略（禁用餐厅名称，避免歧义）
- 🎨 **现代 UI**: Vite + React Hooks + Tailwind CSS

---

## 🏗️ 系统架构

```
┌─────────────────────────────────────┐
│      React 前端 (Vite)              │
│  • 拖拽上传菜单图片                 │
│  • 实时进度展示                     │
│  • 响应式卡片网格                   │
└──────────────┬──────────────────────┘
               │ (FormData + Axios)
               ▼
┌─────────────────────────────────────┐
│    FastAPI 后端 (Python)            │
│  ┌─────────────────────────────────┐│
│  │ 1. Gemini Vision API            ││
│  │    ├─ 图片编码 (Base64)         ││
│  │    ├─ 菜品识别                  ││
│  │    └─ 信息提取                  ││
│  └─────────────────────────────────┘│
│  ┌─────────────────────────────────┐│
│  │ 2. Google Custom Search (并发)  ││
│  │    ├─ 构建搜索词                ││
│  │    ├─ 并发 HTTP 请求            ││
│  │    └─ 提取图片 URL              ││
│  └─────────────────────────────────┘│
└──────────────┬──────────────────────┘
               │ (JSON Response)
               ▼
┌─────────────────────────────────────┐
│   返回菜品数据 (含图片 URL)          │
│   • 原名称                          │
│   • 英文名称                        │
│   • 描述信息                        │
│   • 口味标签                        │
│   • 菜品图片                        │
└─────────────────────────────────────┘
```

---

## 🚀 快速开始

### 前置条件
- Python 3.9+
- Node.js 18+
- Google Gemini API Key
- Google Custom Search API Key 和 Search Engine ID

### 1️⃣ 项目初始化

详见 [INIT_CHECKLIST.md](INIT_CHECKLIST.md) 的完整初始化步骤。快速版本：

```bash
# 创建目录结构
mkdir -p backend/services backend/utils backend/tests
mkdir -p frontend/src/{components,api,styles,hooks}

# 后端设置
cd backend
python3.9 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# 编辑 .env 填入 API Keys
cd ..

# 前端设置
cd frontend
npm install
cp .env.example .env
cd ..
```

### 2️⃣ 启动开发服务

```bash
# 终端 1 - 后端（port 8000）
cd backend
source venv/bin/activate
uvicorn main:app --reload

# 终端 2 - 前端（port 5173）
cd frontend
npm run dev
```

### 3️⃣ 访问应用

打开浏览器：http://localhost:5173

1. 上传菜单图片（支持 JPG, PNG, WebP）
2. 等待 AI 识别和搜索
3. 查看菜品卡片

---

## 📁 项目结构

```
MenuGen/
├── 📄 README.md                 # 本文件
├── 📄 PROJECT_SPEC.md           # 项目规范（详细）
├── 📄 PIPELINE.md               # 开发流程表和时间表
├── 📄 QUICK_REFERENCE.md        # 代码模板库
├── 📄 INIT_CHECKLIST.md         # 初始化步骤
│
├── backend/                     # 🐍 FastAPI 后端
│   ├── main.py                  # 应用入口和 API 端点
│   ├── config.py                # 全局配置和环境变量
│   ├── schemas.py               # Pydantic 数据模型
│   ├── requirements.txt         # Python 依赖
│   ├── .env.example             # 环境变量模板
│   ├── services/
│   │   ├── llm_service.py       # Gemini 视觉识别
│   │   └── search_service.py    # Google 图片搜索
│   ├── utils/
│   │   └── file_utils.py        # 文件处理工具
│   └── tests/                   # 单元测试
│
└── frontend/                    # ⚛️ React + Vite 前端
    ├── src/
    │   ├── App.jsx              # 主应用组件
    │   ├── components/
    │   │   ├── MenuUpload.jsx    # 拖拽上传区
    │   │   ├── MenuCard.jsx      # 菜品卡片
    │   │   ├── MenuGrid.jsx      # 卡片网格
    │   │   ├── LoadingState.jsx  # 加载状态
    │   │   └── ErrorBoundary.jsx # 错误处理
    │   ├── api/
    │   │   └── client.js         # Axios HTTP 客户端
    │   └── styles/
    │       └── App.css           # 样式
    ├── vite.config.js            # Vite 配置
    ├── tailwind.config.js        # Tailwind 配置
    └── package.json              # NPM 依赖
```

---

## 🔌 API 端点

### `POST /api/analyze-menu`

分析菜单图片并识别菜品信息

**请求**:
```bash
curl -X POST http://localhost:8000/api/analyze-menu \
  -F "file=@menu.jpg"
```

**响应**:
```json
{
  "success": true,
  "dishes": [
    {
      "id": "dish_001",
      "original_name": "宫保鸡丁",
      "english_name": "Kung Pao Chicken",
      "description": "Tender chicken pieces with peanuts and dried chilies...",
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

**错误响应**:
```json
{
  "success": false,
  "error": "Invalid image format",
  "error_code": "INVALID_IMAGE"
}
```

---

## 🛠️ 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| **Frontend** | React | 18+ |
| **Build** | Vite | 5+ |
| **Styling** | Tailwind CSS | 3+ |
| **HTTP Client** | Axios | 1.6+ |
| **Backend** | FastAPI | 0.100+ |
| **Python** | Python | 3.9+ |
| **LLM** | Gemini 1.5 Pro | Latest |
| **LLM SDK** | OpenAI Python | 1.0+ |
| **Async HTTP** | aiohttp | 3.9+ |
| **Validation** | Pydantic | 2.0+ |
| **Search** | Google Custom Search | API v1 |

---

## 📋 环境变量配置

### 后端 (`backend/.env`)

```env
# Gemini API - 用于菜品识别
GOOGLE_API_KEY=AIza...your_key_here...

# Google Custom Search - 用于图片搜索
SEARCH_API_KEY=AIza...search_key_here...
SEARCH_ENGINE_ID=cx_...your_custom_search_id...

# 服务器配置
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
CORS_ORIGIN=http://localhost:5173

# LLM 配置
LLM_MODEL=gemini-1.5-pro
LLM_TIMEOUT=30
LLM_TEMPERATURE=0.2

# 搜索配置
SEARCH_TIMEOUT=5
SEARCH_NUM_RESULTS=1
MAX_CONCURRENT_SEARCHES=10

# 文件配置
MAX_FILE_SIZE_MB=10
```

### 前端 (`frontend/.env`)

```env
VITE_API_BASE_URL=http://localhost:8000
```

---

## 📊 性能指标

| 指标 | 目标 | 说明 |
|------|------|------|
| 菜单识别时间 | < 3 秒 | Gemini API 响应 |
| 图片搜索时间 | < 2 秒 | 10 道菜并发搜索 |
| 总处理时间 | < 5 秒 | 从上传到完整结果 |
| 前端首屏加载 | < 2 秒 | 初始页面加载 |
| 最大菜品数 | 50 道 | 单张图片识别能力 |
| 并发搜索数 | 10 | 同时 Google Search 请求 |

---

## 🧪 测试

```bash
# 后端单元测试
cd backend
source venv/bin/activate
pytest tests/ -v

# 前端组件测试（可选）
cd frontend
npm run test
```

---

## 🚢 部署

### Docker 方式（可选）

```dockerfile
# backend/Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install -r requirements.txt
COPY backend/ .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```bash
# 构建和运行
docker build -t mengen-backend backend/
docker run -p 8000:8000 --env-file backend/.env mengen-backend
```

### 生产部署

```bash
# 后端（使用 Gunicorn）
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 main:app

# 前端（构建静态文件）
npm run build
# 部署 dist/ 文件夹到静态文件服务器（Nginx, Vercel 等）
```

---

## 🐛 常见问题

### Q: 后端返回 401 Gemini API 错误
**A**: 检查 `GOOGLE_API_KEY` 是否正确，以及 Gemini API 是否已启用。

### Q: 图片搜索返回 None
**A**: 验证 `SEARCH_ENGINE_ID` 和 `SEARCH_API_KEY` 是否正确，检查 API 配额。

### Q: 前端报 CORS 错误
**A**: 确保 `CORS_ORIGIN` 环境变量与前端实际访问地址一致。

### Q: 上传图片超时
**A**: 减小 `MAX_FILE_SIZE_MB` 或检查网络连接。

### Q: Tailwind CSS 样式不显示
**A**: 运行 `npm run build:css` 或重启 `npm run dev`。

更多详见 [PIPELINE.md](PIPELINE.md) 的故障排查部分。

---

## 🎯 开发路线图

### MVP (v1.0) ✅
- [x] 菜单图片上传
- [x] Gemini 菜品识别
- [x] 并发图片搜索
- [x] 响应式卡片展示
- [x] 基础错误处理

### 计划中 (v2.0+)
- [ ] 菜品价格提取
- [ ] 营养信息 OCR
- [ ] 用户账号与收藏
- [ ] 菜品分享功能
- [ ] 餐厅位置推荐
- [ ] 多语言支持
- [ ] 本地模型部署

---

## 📚 学习资源

- [FastAPI 官方文档](https://fastapi.tiangolo.com/)
- [React 官方文档](https://react.dev/)
- [Tailwind CSS 文档](https://tailwindcss.com/)
- [Vite 文档](https://vitejs.dev/)
- [OpenAI Python SDK](https://github.com/openai/openai-python)
- [Google Custom Search API](https://developers.google.com/custom-search/v1/overview)

---

## 📝 文档指南

| 文档 | 内容 | 适用人群 |
|------|------|---------|
| **README.md** | 项目总体概览 | 所有人 |
| **PROJECT_SPEC.md** | 详细技术规范 | 开发者 |
| **PIPELINE.md** | 开发流程和时间表 | 项目经理 + 开发者 |
| **QUICK_REFERENCE.md** | 代码模板库 | 开发者（快速参考） |
| **INIT_CHECKLIST.md** | 初始化步骤 | 新开发者上手 |

---

## 🤝 贡献指南

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 📄 许可

本项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。

---

## 👥 作者

- **MenuGen Team** - 2026

---

## 🎉 致谢

- Google Gemini 团队
- Google Custom Search 团队
- React 和 FastAPI 开源社区

---

## 📞 联系方式

有问题或建议？

- 📧 邮件: support@menuge.local
- 🐛 提交 Issue: [GitHub Issues](https://github.com/your-repo/issues)
- 💬 讨论: [GitHub Discussions](https://github.com/your-repo/discussions)

---

## ⭐ 如果这个项目对你有帮助，请给个 Star！

```
        ___
       /   \___
      | O_O |
       \_-_/    
         |
       __|__
      /MenuGen\
     🍜 🍲 🍱 🍛
```

**准备好开始开发了吗？** 详见 [INIT_CHECKLIST.md](INIT_CHECKLIST.md) 开始你的 Vibe Coding 之旅！

---

**最后更新**: 2026-01-20 | **版本**: 1.0.0

