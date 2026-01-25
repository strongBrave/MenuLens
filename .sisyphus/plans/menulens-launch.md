# MenuLens Launch Plan: Landing Page & Deployment

## Context

### Original Request
User wants to deploy the "MenuLens" system (Python Backend + React Frontend) and create a new "Visual-First" Landing Page to market the app.

### Decisions & Decisions
- **Architecture**: 3-Tier System
  - **Landing Page**: Next.js (Visual-first marketing site) -> `menulens.com`
  - **Main App**: React/Vite (Existing utility) -> `app.menulens.com`
  - **Backend**: FastAPI (Existing API) -> `api.menulens.com` (hosted on PaaS)
- **Design Vibe**: "Foodie Magazine" (Premium).
  - Typography: Serif Headers (Playfair Display) + Sans Body (Inter).
  - Visuals: High-quality stock food backgrounds, "Magic Window" interaction.
- **Hosting Strategy**:
  - Frontend/Landing: Vercel (best for Next.js/React).
  - Backend: Render or Railway (PaaS for Python/Docker).

---

## Work Objectives

### Core Objective
1. Create a stunning, high-performance Landing Page in `landing/`.
2. Configure the entire project for deployment (add necessary config files).

### Must Have
- [ ] **Landing Page**: "Hero" section with food visuals.
- [ ] **Landing Page**: "Magic Demo" (interactive scroll/hover effect).
- [ ] **Deployment Config**: `render.yaml` or `Dockerfile` for Backend.
- [ ] **Mobile Responsive**: Perfect layout on phones (primary use case).

### Must NOT Have
- [ ] **Code Sharing**: Do not attempt to create a shared UI library (too complex for now). Copy-paste Tailwind config is acceptable.
- [ ] **Complex CMS**: Hardcode content for v1. No Strapi/Contentful.

---

## Verification Strategy

### Manual QA (Visual-First)
Since the Landing Page is marketing-focused, verification is primarily visual.
- **Mobile Check**: Verify layout on 375px width (iPhone SE/X).
- **Interactive Check**: Verify the "Magic Demo" works smoothly on hover/tap.
- **Assets Check**: Ensure placeholders are loaded and look acceptable.

### Deployment Verification
- **Backend**: `curl https://[backend-url]/health` -> returns 200 OK.
- **Frontend**: Navigate to app, upload image -> verify result.

---

## Task Flow
```
Setup (Phase 1) → Landing Implementation (Phase 2) → Deployment Prep (Phase 3)
```

## TODOs

### Phase 1: Project Structure & Setup

- [ ] 1. Initialize Landing Page Directory
  - **Action**: Run `npx create-next-app@latest landing --typescript --tailwind --eslint --src-dir --import-alias "@/*"`
  - **Cleanup**: Remove default Next.js boilerplate in `landing/src/app/page.tsx` and `landing/src/app/globals.css`.
  - **Config**: Update `landing/tailwind.config.ts` to include the "Foodie" palette.
    - Primary: `#FF5E00` (Safety Orange)
    - Background: `#FDFBF7` (Warm White)
    - Text: `#1A1A1A` (Soft Black)
  - **Verification**: `cd landing && npm run dev` -> Shows blank page.

- [ ] 2. Install Dependencies & Fonts
  - **Action**: `cd landing && npm install framer-motion lucide-react clsx tailwind-merge`
  - **Fonts**: Configure `landing/src/app/layout.tsx` with `next/font/google`:
    - `Playfair_Display` (variable) for headings.
    - `Inter` (variable) for body.
  - **Verification**: Inspect element on localhost shows correct font-family.

### Phase 2: Landing Page Implementation

- [ ] 3. Implement "Hero" Section (Visual-First)
  - **Action**: Create `landing/src/components/Hero.tsx`.
  - **Content**:
    - Full-screen background using `source.unsplash.com/random/1920x1080/?gourmet,food`.
    - Headline: "Eat like a local, anywhere." (Playfair Display, 4rem+, White text).
    - Subhead: "Instant menu translation with AI-powered visual discovery."
    - CTA Button: "Try it Now" -> Links to `https://app.menulens.com`.
      - Style: `bg-orange-500 hover:bg-orange-600 text-white rounded-full px-8 py-4`.
  - **Verification**:
    - Mobile: Text stacks vertically, font size adjusts to 2.5rem.
    - Desktop: Background covers full viewport (`h-screen`).

- [ ] 4. Implement "Magic Demo" Component
  - **Action**: Create `landing/src/components/MagicDemo.tsx`.
  - **Logic**:
    - Use `framer-motion` `AnimatePresence`.
    - Left side: List of "Foreign Menu Items" (e.g., "Pizza Margherita", "Spaghetti Carbonara").
    - Hovering an item triggers `opacity: 1` on the corresponding image overlay.
  - **Verification**: Mouseover changes the displayed image instantly (<200ms).

- [ ] 5. Implement Features & Footer
  - **Action**: Create `landing/src/components/Features.tsx` and `landing/src/components/Footer.tsx`.
  - **Features**:
    - Icon: `Scan` (Lucide) -> "Snap a photo".
    - Icon: `Sparkles` (Lucide) -> "AI Analysis".
    - Icon: `Utensils` (Lucide) -> "Eat with confidence".
  - **Verification**: Grid layout: 1 col on mobile, 3 cols on desktop (`md:grid-cols-3`).

- [ ] 6. Assemble Landing Page
  - **Action**: Update `landing/src/app/page.tsx`.
    - Import and stack: `<Hero />`, `<MagicDemo />`, `<Features />`, `<Footer />`.
  - **Verification**: `npm run build` succeeds with no type errors.

### Phase 3: Deployment Preparation

- [ ] 7. Backend Deployment Config (Docker)
  - **Action**: Create `backend/Dockerfile` with content:
    ```dockerfile
    FROM python:3.9-slim
    WORKDIR /app
    COPY requirements.txt .
    RUN pip install --no-cache-dir -r requirements.txt
    COPY . .
    CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
    ```
  - **Action**: Create `backend/render.yaml` (for Render Blueprint):
    ```yaml
    services:
      - type: web
        name: menulens-backend
        env: python
        buildCommand: pip install -r requirements.txt
        startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT
        envVars:
          - key: GEMINI_API_KEY
            sync: false
    ```
  - **Verification**: `docker build -t menulens-backend ./backend` builds successfully.

- [ ] 8. Frontend Deployment Config
  - **Action**: Verify `frontend/vite.config.js` builds to `dist/`.
  - **Action**: Create `DEPLOY.md` listing all required environment variables.
  - **Verification**: `DEPLOY.md` exists.

---

## Success Criteria
- [ ] `landing/` directory exists and runs locally.
- [ ] Landing page shows "Foodie" vibe with Serif fonts and images.
- [ ] "Try it now" button exists.
- [ ] `backend/Dockerfile` is created and valid.
