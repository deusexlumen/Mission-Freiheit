# Bolt's Journal

## 2024-05-23 - DOM Thrashing in Animation Loop
**Learning:** Frequent DOM reads (like `dataset.start`) and parsing inside high-frequency event handlers (like `timeupdate`) can be a silent performance killer.
**Action:** Cache static DOM data into plain JavaScript objects during initialization to avoid DOM bridge crossing during render/update loops.
