# Deployment Guide

## Backend (Render)
1. Connect your GitHub repository to Render.
2. Create a new **Web Service**.
3. Select the repository and use the `backend` directory as the Root Directory.
4. Environment Variables required:
   - `GEMINI_API_KEY`: Your Google Gemini API Key.
   - `SEARCH_API_KEY`: Google Custom Search API Key.
   - `SEARCH_ENGINE_ID`: Google Custom Search Engine ID.
   - `LLM_MODEL`: `gemini-2.0-flash-lite-preview-02-05` (or preferred model).

## Frontend (Vercel)
1. Connect your GitHub repository to Vercel.
2. Import the `landing` directory as a new project for the Landing Page.
   - Framework Preset: Next.js
   - Root Directory: `landing`
3. Import the `frontend` directory as a separate project for the Main App.
   - Framework Preset: Vite
   - Root Directory: `frontend`
   - Environment Variables:
     - `VITE_API_BASE_URL`: The URL of your deployed Backend (e.g., `https://menulens-backend.onrender.com`).

## Domain Setup (Optional)
- Point `menulens.com` to the Vercel Landing Page project.
- Point `app.menulens.com` to the Vercel Main App project.
- Point `api.menulens.com` to the Render Backend service.
