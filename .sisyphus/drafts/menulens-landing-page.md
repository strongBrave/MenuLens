# Draft: MenuLens Landing Page

## Context
User has built "MenuLens" (Menu -> Picture/Info for travelers).
Core App is ready (React/FastAPI).
Goal: Create a separate "Landing Page" (Marketing) that links to the "Main App" (Utility).

## Strategy Validation
The "Marketing Site" -> "Web App" separation is standard SaaS architecture.
- Marketing Site: Optimized for SEO, speed, storytelling, conversion.
- Web App: Optimized for functionality, state management.

## Decisions (Confirmed)
- **Vibe:** Visual-First (Foodie Vibe). Focus on high-quality food imagery, immersion, and the result.
- **Tech Stack:** Next.js / Astro. (Will prioritize Next.js for ecosystem consistency, using Tailwind CSS).

## Design Concept: "The Visual Feast"
- **Reference Apps:** Uber Eats (Card design, food photography), Airbnb (Immersive hero), Google Lens (AR overlay visuals).
- **Core Visual:** A "Magic Window" effect. Show a boring text menu, and when the user scrolls/hovers, reveal the delicious food images overlaying the text.
- **Color Palette:** Minimalist UI (White/Cream background) to let food colors pop. Primary accent: A warm "Appetite" color (Orange/Coral).

## Structure
1. **Hero:** Full-screen delicious background video or image. "Eat like a local, anywhere." CTA: "Try it Now".
2. **The "Magic" Demo:** Interactive component showing Text Menu -> Picture transformation.
3. **Features:** "AI Analysis," "Instant Translation," "Dish Discovery."
4. **Trust/Social:** "Works in X languages," "Powered by Gemini 1.5".
5. **Footer:** Simple links.

## Requirements (to confirm)
- **Target Audience:** Backpackers? Luxury travelers? Foodies?
- **Key Features to Highlight:** Translation accuracy? Image search? Speed?
- **Assets:** Are there demo videos or screenshots ready?
- **Domain Strategy:** Is the main app on a subdomain (app.menulens.com) or a path (/app)?

## Open Questions
- What is the brand "vibe"? (Playful, Minimalist, Premium?)
- Does the user need a specific domain strategy (e.g., menulens.com vs app.menulens.com)?
