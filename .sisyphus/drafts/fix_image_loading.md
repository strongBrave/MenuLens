# Draft: Fix Image Search Loading State

## Requirements (confirmed)
- [requirement]: Change "No image found" text during search to "Searching..." (or similar) with a spinner.
- [requirement]: Use the existing "Finding best match..." state in `DishImage.jsx` which matches the description (spinner + text).

## Technical Decisions
- [decision]: Add `is_searching` boolean to dish objects in `App.jsx`.
- [decision]: Initialize `is_searching: true` when dishes are first loaded from OCR.
- [decision]: Set `is_searching: false` when image search completes (success or error).
- [decision]: Pass `isSearching` prop from `MenuCard` to `DishImage`.

## Research Findings
- [found]: `DishImage.jsx` already has a `showSearching` state with a spinner and text "Finding best match...".
- [found]: `MenuCard.jsx` does not pass the `isSearching` prop.
- [found]: `App.jsx` handles image loading but doesn't track per-dish searching state explicitly in the `dishes` array.

## Open Questions
- None. The implementation path is clear.

## Scope Boundaries
- INCLUDE: `frontend/src/App.jsx`, `frontend/src/components/MenuCard.jsx`
- EXCLUDE: Backend changes.
