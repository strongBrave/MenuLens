# MenuGen - 完整项目结构和初始化步骤

## 📁 完整文件夹结构

```
MenuGen/
│
├── 📄 README.md                      # 项目总体说明
├── 📄 PROJECT_SPEC.md                # ✅ 项目规范（已创建）
├── 📄 PIPELINE.md                    # ✅ 开发流程表（已创建）
├── 📄 QUICK_REFERENCE.md             # ✅ 快速参考库（已创建）
├── 📄 INIT_CHECKLIST.md              # 本文件
├── .gitignore                        # Git 忽略配置
│
├── backend/                          # 🐍 Python FastAPI 后端
│   ├── main.py                       # FastAPI 应用入口
│   ├── config.py                     # 全局配置
│   ├── schemas.py                    # Pydantic 数据模型
│   ├── requirements.txt              # Python 依赖
│   ├── .env                          # 环境变量（本地，不提交）
│   ├── .env.example                  # 环境变量模板
│   │
│   ├── services/                     # 核心业务逻辑
│   │   ├── __init__.py
│   │   ├── llm_service.py           # Gemini 视觉识别
│   │   └── search_service.py        # Google 图片搜索
│   │
│   ├── utils/                        # 工具函数
│   │   ├── __init__.py
│   │   └── file_utils.py            # 文件处理
│   │
│   ├── tests/                        # 单元测试
│   │   ├── __init__.py
│   │   ├── test_schemas.py
│   │   ├── test_llm_service.py
│   │   └── test_search_service.py
│   │
│   └── README.md                     # 后端说明
│
├── frontend/                         # ⚛️ React Vite 前端
│   ├── src/
│   │   ├── main.jsx                 # 应用入口
│   │   ├── index.html               # HTML 模板
│   │   ├── App.jsx                  # 主应用组件
│   │   │
│   │   ├── components/              # React 组件
│   │   │   ├── MenuUpload.jsx       # 上传区域
│   │   │   ├── MenuCard.jsx         # 菜品卡片
│   │   │   ├── MenuGrid.jsx         # 卡片网格
│   │   │   ├── LoadingState.jsx     # 加载状态
│   │   │   └── ErrorBoundary.jsx    # 错误边界
│   │   │
│   │   ├── api/                     # API 客户端
│   │   │   └── client.js            # Axios 配置
│   │   │
│   │   ├── styles/                  # 样式文件
│   │   │   ├── App.css
│   │   │   └── index.css            # Tailwind 入口
│   │   │
│   │   └── hooks/                   # React Hooks（可选）
│   │       └── useApi.js
│   │
│   ├── public/                       # 静态资源
│   ├── tailwind.config.js            # Tailwind 配置
│   ├── vite.config.js                # Vite 构建配置
│   ├── package.json                  # NPM 依赖
│   ├── .env                          # 前端环境变量
│   ├── .env.example
│   │
│   └── README.md                     # 前端说明
│
└── .github/                          # GitHub 配置（可选）
    └── workflows/
        └── ci.yml                    # CI/CD 配置
```

---

## 🚀 初始化步骤

### 第 1 步：创建基础项目结构

```bash
# 进入项目目录
cd /Users/junhao/Desktop/MenuGen

# 创建后端目录结构
mkdir -p backend/services backend/utils backend/tests
mkdir -p frontend/src/{components,api,styles,hooks,pages}
mkdir -p frontend/public
mkdir -p .github/workflows

# 创建 Python 虚拟环境
cd backend
python3.9 -m venv venv
source venv/bin/activate
cd ..

# 创建 Node 项目（使用 Vite）
cd frontend
npm create vite@latest . -- --template react
npm install
cd ..
```

### 第 2 步：安装依赖

```bash
# 后端依赖
cd backend
source venv/bin/activate
pip install --upgrade pip
pip install fastapi uvicorn pydantic python-dotenv openai aiohttp
pip install pytest pytest-asyncio pillow  # 测试 + 图片处理
pip freeze > requirements.txt
deactivate
cd ..

# 前端依赖
cd frontend
npm install axios tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install -D eslint prettier
cd ..
```

### 第 3 步：配置环境变量

```bash
# 后端
cd backend
cat > .env.example << 'EOF'
# Gemini API
GOOGLE_API_KEY=AIza...your_key...

# Google Search
SEARCH_API_KEY=AIza...your_search_key...
SEARCH_ENGINE_ID=cx_...your_engine_id...

# Server
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
CORS_ORIGIN=http://localhost:5173

# LLM
LLM_MODEL=gemini-1.5-pro
LLM_TIMEOUT=30
LLM_TEMPERATURE=0.2

# Search
SEARCH_TIMEOUT=5
SEARCH_NUM_RESULTS=1
MAX_CONCURRENT_SEARCHES=10

# File
MAX_FILE_SIZE_MB=10
EOF

# 复制作为本地 .env
cp .env.example .env
# ⚠️ 编辑 .env 并填入实际的 API Keys
cd ..

# 前端
cd frontend
cat > .env.example << 'EOF'
VITE_API_BASE_URL=http://localhost:8000
EOF

cp .env.example .env
cd ..
```

### 第 4 步：初始化 Git

```bash
cd MenuGen
git init
git config user.name "Your Name"
git config user.email "your@email.com"

# 创建 .gitignore
cat > .gitignore << 'EOF'
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
venv/
ENV/
env/
.venv

# Node
node_modules/
dist/
.env.local
.env.*.local
*.pem

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Environment
.env
EOF

git add .
git commit -m "Initial project structure"
```

### 第 5 步：创建核心文件（使用 QUICK_REFERENCE.md 中的代码模板）

```bash
# 后端核心文件
cd backend

# schemas.py
cat > schemas.py << 'EOF'
# 复制 QUICK_REFERENCE.md 中的 schemas.py 代码
EOF

# config.py
cat > config.py << 'EOF'
# 复制 QUICK_REFERENCE.md 中的 config.py 代码
EOF

# services/__init__.py
touch services/__init__.py

# services/llm_service.py
cat > services/llm_service.py << 'EOF'
# 复制 QUICK_REFERENCE.md 中的 llm_service.py 代码
EOF

# services/search_service.py
cat > services/search_service.py << 'EOF'
# 复制 QUICK_REFERENCE.md 中的 search_service.py 代码
EOF

# main.py
cat > main.py << 'EOF'
# 复制 QUICK_REFERENCE.md 中的 main.py 代码
EOF

# utils/__init__.py
touch utils/__init__.py

# utils/file_utils.py
cat > utils/file_utils.py << 'EOF'
import base64
from PIL import Image
import io

def encode_image_to_base64(image_bytes: bytes) -> str:
    """将图片字节转换为 Base64"""
    return base64.b64encode(image_bytes).decode("utf-8")

def validate_image(image_bytes: bytes, max_size_mb: int = 10) -> bool:
    """验证图片有效性"""
    if len(image_bytes) > max_size_mb * 1024 * 1024:
        return False
    try:
        img = Image.open(io.BytesIO(image_bytes))
        img.verify()
        return True
    except:
        return False
EOF

cd ..

# 前端核心文件
cd frontend/src

# components/MenuUpload.jsx
cat > components/MenuUpload.jsx << 'EOF'
# 将在下一步创建
EOF

# components/MenuCard.jsx
cat > components/MenuCard.jsx << 'EOF'
# 复制 QUICK_REFERENCE.md 中的 MenuCard.jsx 代码
EOF

# api/client.js
cat > api/client.js << 'EOF'
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.VITE_API_BASE_URL || 'http://localhost:8000',
  timeout: 30000,
});

export async function analyzeMenu(imageFile) {
  const formData = new FormData();
  formData.append('file', imageFile);
  
  return apiClient.post('/api/analyze-menu', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
}

export default apiClient;
EOF

cd ../..
```

### 第 6 步：验证安装

```bash
# 验证后端
cd backend
source venv/bin/activate
python -c "from fastapi import FastAPI; print('✓ FastAPI OK')"
python -c "from openai import OpenAI; print('✓ OpenAI SDK OK')"
python -c "from pydantic import BaseModel; print('✓ Pydantic OK')"
deactivate
cd ..

# 验证前端
cd frontend
npm list react tailwindcss axios
cd ..

# 验证项目结构
echo "Project structure:"
tree -L 2 --dirsfirst (或 ls -la backend/ frontend/)
```

---

## 📋 快速启动命令

### 启动开发环境

```bash
# 终端 1 - 后端
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8000

# 终端 2 - 前端
cd frontend
npm run dev

# 访问
http://localhost:5173
```

### 生产构建

```bash
# 前端构建
cd frontend
npm run build

# 后端准备（使用 Gunicorn 或 Docker）
cd backend
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 main:app
```

---

## 🔐 API Keys 获取指南

### Google Gemini API

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目
3. 启用 "Generative Language API"
4. 创建 API Key（应用默认凭证）
5. 复制 Key 到 `backend/.env` 的 `GOOGLE_API_KEY`

### Google Custom Search API

1. 访问 [Google Custom Search](https://programmablesearchengine.google.com/)
2. 创建新的搜索引擎（包含所有网站）
3. 在 Cloud Console 启用 "Custom Search API"
4. 创建 API Key
5. 获取搜索引擎 ID（cx）
6. 复制到 `backend/.env`：
   - `SEARCH_API_KEY` = API Key
   - `SEARCH_ENGINE_ID` = 搜索引擎 ID

---

## ✅ 初始化检查清单

完成以下步骤后，你就可以开始 Vibe Coding 了：

```
□ 项目文件夹创建完毕
□ 文档已准备（PROJECT_SPEC.md, PIPELINE.md, QUICK_REFERENCE.md）
□ Python 虚拟环境已激活
□ Python 依赖已安装（requirements.txt）
□ Node.js 项目已初始化
□ 前端依赖已安装（package.json）
□ .env 文件已创建并填入 API Keys
□ .gitignore 已配置
□ 后端核心文件已创建（schemas.py, config.py, main.py）
□ 前端核心文件已创建（App.jsx, components）
□ 后端可启动（uvicorn main:app --reload）
□ 前端可启动（npm run dev）
□ 浏览器能访问 http://localhost:5173
```

当所有项目都打勾时，开始 PIPELINE.md 中的 Phase 1！

---

## 📞 故障排查

| 问题 | 解决方案 |
|------|---------|
| `ModuleNotFoundError: No module named 'fastapi'` | 激活虚拟环境：`source venv/bin/activate` 后重试 |
| `npm: command not found` | 安装 Node.js 18+ |
| `GOOGLE_API_KEY not found` | 检查 backend/.env 是否存在且有 API Key |
| 前端 CORS 错误 | 检查 VITE_API_BASE_URL 和后端 CORS_ORIGIN |
| Tailwind CSS 样式不显示 | 运行 `npm run build:css` 或重启 `npm run dev` |

---

**现在你已经准备好开始开发了！** 🎉

参考 PIPELINE.md 按照 Phase 开始你的 vibe coding 之旅！

