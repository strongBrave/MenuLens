# Draft: Fix Filter Button Text Disappearance

## Requirements (confirmed)
- [requirement]: Fix the bug where text disappears when a filter button is selected.
- [requirement]: Ensure selected state has a visible background color contrasting with the white text, OR change the text color.

## Technical Decisions
- [decision]: Define `brand-primary` in `tailwind.config.js` if missing.
- [decision]: Alternatively, replace `bg-brand-primary` with a standard Tailwind class (e.g., `bg-orange-500`) in `MasterPanel.jsx`.

## Research Findings
- [pending]: Checking `tailwind.config.js` for color definitions.
- [pending]: Verifying `MasterPanel.jsx` class usage.

## Open Questions
- What is the intended primary brand color? (Likely orange/red based on existing UI).

## Scope Boundaries
- INCLUDE: `frontend/tailwind.config.js` or `frontend/src/components/MasterPanel.jsx`.
