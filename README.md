<div align="center">

# MenuGen (MenuLens)

**AI-Powered Visual Menu Explorer**

[![Project Site](https://img.shields.io/badge/Project%20Site-menulens--vert.vercel.app-2563eb?style=for-the-badge&logo=vercel&logoColor=white)](https://menulens-vert.vercel.app/)
[![Backend](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](#)
[![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-1f2937?style=for-the-badge&logo=react&logoColor=61dafb)](#)

</div>

<br/>

MenuGen is a full-stack web app that turns raw menu photos into a visual, understandable menu experience.

It first extracts dish text with an LLM-powered pipeline, then asynchronously searches and verifies dish images so users can quickly understand what to order.

The project supports runtime API configuration from the frontend settings panel, so core model/search keys are no longer required in backend `.env`.

---

## ✨ Core Features

| Feature | Description | Status |
| :--- | :--- | :---: |
| 📸 **Menu OCR + Structuring** | Extracts dish names, prices, and descriptions from menu images | ✅ |
| 🌍 **Multilingual Output** | Returns translated dish info while keeping original names for ordering | ✅ |
| 💱 **Currency Context** | Supports source currency input for better menu understanding | ✅ |
| 🔍 **Hybrid Image Retrieval** | Finds candidate dish images and verifies relevance before display | ✅ |
| ⚡ **Two-Stage UX** | Fast text-first response, then progressive image backfill | ✅ |
| 🧠 **Runtime API Settings** | Configure LLM/Search/Image generation settings directly in frontend UI | ✅ |
| 💬 **Menu Chat Assistant** | Ask follow-up questions with current menu context | ✅ |

---

## 🎬 Preview

![MenuGen Main Page](./assets/main_page.png)

---

## 🚀 Getting Started

### Prerequisites

- Python 3.9+
- Node.js 18+

### 1. Start Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload --port 8000
```

### 2. Start Frontend

```bash
cd frontend
npm install
# optional: cp .env.example .env
npm run dev
```

### 3. Open the App

- Frontend: `http://localhost:5173`
- Backend: `http://127.0.0.1:8000`

### 4. Configure Runtime API Settings (in UI)

Open **Settings** in the frontend and fill in what you need:

- LLM: API Key / Base URL / Model / Temperature / Timeout
- Search: SerpAPI Key / Candidate Results
- Pipeline: RAG toggle / Verify threshold
- Generation: Enable toggle / API Key / Model

---

## ⚙️ Configuration Guide

### Runtime settings (frontend-driven)

These values are sent from frontend requests at runtime and do not need to be fixed in backend `.env`:

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

### Backend `.env` (system-level defaults)

Keep backend `.env` for service-level defaults such as:

- host/port/CORS
- search provider policy
- timeout and concurrency defaults
- upload limits and optional proxy

See `backend/.env.example` for the current minimal template.

---

## 🔌 Main API Endpoints

- `POST /api/analyze-text-only` - Phase 1 text analysis
- `POST /api/search-dish-image` - Phase 2 single-dish image retrieval
- `POST /api/analyze-menu` - Legacy full flow
- `POST /api/menu-chat` - Chat with menu context
- `GET /health` - Health check

---

## 📁 Project Structure

```text
MenuGen/
├── backend/
│   ├── main.py
│   ├── config.py
│   ├── schemas.py
│   ├── services/
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/client.js
│   │   ├── components/
│   │   └── App.jsx
│   └── .env.example
├── assets/
└── README.md
```

---

## 📜 License

MIT License.
