# Landing Page Content Enhancements

## Context
User requested to add specific features and project description to the Landing Page.
- **Currency Conversion**
- **Language Support**
- **AI Assistant**
- **Project Brief**

## Objectives
- [ ] Update `Features.tsx` to include the requested content.
- [ ] Ensure the design remains responsive (shift from 3-col to 4-col or 2x2 grid).

## TODOs

- [ ] 1. Update `Features.tsx`
  - **Action**: Replace the content of `landing/src/components/Features.tsx`.
  - **Imports**: `import { Languages, Coins, Bot, Image as ImageIcon } from 'lucide-react';`
  - **Data**: Update `FEATURES` array with 4 items:
    1. **Global Translation** (Languages icon)
    2. **Smart Currency** (Coins icon)
    3. **AI Assistant** (Bot icon)
    4. **Visual Discovery** (ImageIcon)
  - **UI**: Add a header section above the grid:
    - Title: "Understand what you eat, anywhere in the world."
    - Desc: "MenuLens combines advanced AI vision with real-time data to turn confusing text menus into clear, visual, and translated experiences."
  - **Grid**: Change `md:grid-cols-3` to `md:grid-cols-2 lg:grid-cols-4`.

## Verification
- [ ] `cd landing && npm run dev`
- [ ] Check Features section displays 4 items.
- [ ] Check new Description text is visible.
