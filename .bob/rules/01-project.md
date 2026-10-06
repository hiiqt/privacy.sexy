# Project: privacy.sexy mobile modernization (Theme 2)

- Theme 2 ("Modernize What Matters") hackathon build on privacy.sexy (AGPL-3.0, upstream: undergroundwires/privacy.sexy).
- Goal: a mobile-first privacy GUIDE webapp. It ADVISES on settings — it never executes system tweaks on mobile.
- src/application/collections/*.yaml remain the source of truth for tweak data. New mobile collections follow the existing Collection/Category/Script schema.
- Do not break existing desktop (Windows/macOS/Linux) functionality. New work lives in clearly separated modules.
- Mobile-first: every UI addition must work on a phone viewport first, desktop second.
- Batch your work: propose the plan, then implement. Avoid chatty iteration — bobcoins are limited.
