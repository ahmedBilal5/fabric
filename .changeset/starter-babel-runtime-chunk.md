---
"@fabric-kit/create-app": patch
---

The starter's `vite.config.ts` now puts `@babel/runtime` in the `mui` chunk. In the shared `mui-x` chunk it made `mui` and `mui-x` import each other (a circular chunk).
