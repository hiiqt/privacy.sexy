---
name: privacy-yaml
description: Author or validate privacy.sexy YAML collection files (Collection/Category/Script/Function schema) for the mobile privacy guide, including Android and GrapheneOS settings collections.
---

# privacy.sexy YAML collections

privacy.sexy is data-driven: src/application/collections/*.yaml define every tweak. A .schema.yaml ships with the repo — validate new files against it.

## Schema (per docs/collection-files.md)

- Collection: os (required), actions: [Category] (required, at least 1), scripting: {language, startCode, endCode} (required), functions: [Function] (optional).
- Category: category (required, unique across the collection), children: [Category|Script] (required, at least 1), docs (markdown).
- Script: name (required, unique); EITHER code (+ optional revertCode) OR call — never both; docs (markdown, plain-English reason); recommend: standard | strict | unset.
- Function: name (camelCase, verb-first, unique), parameters, then code/revertCode OR call.

## Mobile-guide conventions (this project)

- Mobile collections ADVISE; they don't execute. code may hold reference ADB commands or settings paths for documentation only — the webapp never runs them.
- docs is the product: plain-English what/why for non-technical users.
- recommend maps to the posture slider: standard = suggested at "personalized" and up; strict = suggested only at "private".
- New collections: android / legacy-android / grapheneos. Check OperatingSystem.ts for allowed os values first — add new ones if Android isn't there.
