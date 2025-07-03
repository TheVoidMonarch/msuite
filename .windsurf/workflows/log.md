---
description: a Dev -Log
---

From now on, every time you finish an edit or generate new code:

1. Re-analyze all related files that were changed or connected via imports.
2. Check for:
   - Logical consistency across modules
   - TypeScript errors or mismatches
   - Broken IPC calls or schema references
   - UI-state misalignment (e.g., Zustand store vs component use)
3. Log your analysis in a markdown file at `/devlog/ai-review-log.md` with:
   - Timestamp
   - What was changed
   - What you found after re-checking
   - Whether anything was auto-fixed
   - Suggestions for future improvements
4. Do not overwrite the file — always append.

This will serve as a living devlog written by you, Windsurf.
