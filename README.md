# MenuGen

AI 菜单识别与菜品图片检索 Web 应用（FastAPI + React）。

## 项目定位

MenuGen 是一个 **Web 项目**：
- 上传菜单图片后，先快速抽取菜品文本信息。
- 再异步为每道菜检索/验证图片，逐步回填到前端列表。
- 关键 API 参数现在支持在前端设置面板中运行时配置，不再强依赖后端 `.env`。

## 技术栈

- Frontend: React + Vite + Tailwind CSS
- Backend: FastAPI + Pydantic
- LLM/Vision: OpenAI 兼容接口（如 Gemini 兼容网关）
- Image Search: SerpAPI（默认）/ Google Custom Search（可选）

## 本地开发

### 1. 启动后端

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload --port 8000
```

### 2. 启动前端

```bash
cd frontend
npm install
# 可选：cp .env.example .env
npm run dev
```

前端默认地址：`http://localhost:5173`  
后端默认地址：`http://127.0.0.1:8000`

## 配置策略（重要）

当前项目分为两类配置：

### A. 前端运行时配置（设置面板）

以下字段由前端保存到 `localStorage` 并在请求时传给后端：

- `llm_api_key`
- `llm_base_url`
- `llm_model`
- `llm_temperature`
- `llm_timeout`
- `serpapi_key`
- `search_candidate_results`
- `generation_api_key`
- `generation_model`
- `enable_image_generation`
- `enable_rag_pipeline`
- `image_verify_threshold`

说明：这些字段已经不要求写进 `backend/.env`。

### B. 后端环境配置（`.env`）

后端 `.env` 现在主要保留：
- 服务监听与 CORS（`BACKEND_HOST` / `BACKEND_PORT` / `CORS_ORIGIN`）
- 搜索服务基础策略（`SEARCH_PROVIDER`、`SERPAPI_ENGINE` 等）
- 非运行时通用参数（超时、并发、上传限制、代理等）

## API 端点

- `POST /api/analyze-text-only`：仅做文本分析（第一阶段）
- `POST /api/search-dish-image`：按菜品补图（第二阶段）
- `POST /api/analyze-menu`：兼容的全流程接口
- `POST /api/menu-chat`：菜单问答
- `GET /health`：健康检查

## 常见问题

### 1) 出现 401 / No token provided

表示请求里没有带有效 API Key。请在前端设置面板填写对应 Key（LLM 或 SerpAPI）。

### 2) 前端有配置但后端仍报错

先确认请求是否命中当前后端实例（`VITE_API_BASE_URL`），再看后端日志是否收到对应运行时字段。

## 项目结构

```text
MenuGen/
├── backend/
│   ├── main.py
│   ├── config.py
│   ├── schemas.py
│   └── services/
├── frontend/
│   ├── src/
│   │   ├── api/client.js
│   │   ├── components/
│   │   └── App.jsx
│   └── .env.example
└── README.md
```
