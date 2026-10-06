# Mobile Privacy Guide — Theme 2 Plan

## Overview

Build a mobile-first privacy **guide** webapp on top of the existing privacy.sexy codebase. The guide advises users on Android / GrapheneOS privacy settings — it never executes scripts. The desktop build (Windows / macOS / Linux) must remain entirely unaffected.

**Approach:** Add new YAML data, wire a new mobile entry point, then build new mobile-only UI components. Every sub-task is independently reviewable and independently deployable.

---

## Architecture Summary

The codebase already has a clean boundary:

- **Reusable (untouched):** All of `src/domain/`, `src/application/` (context, state, filter, selection, compiler pipeline), and the Vue DI system.
- **Desktop-only (untouched):** `src/presentation/electron/`, `src/infrastructure/CodeRunner/`, `src/infrastructure/Dialog/Electron/`.
- **New mobile surface:** New YAML files, a new Vite entry point, and new components under `src/presentation/components/Mobile/`.

The key OS values (`Android`, `iOS`, etc.) already exist in [`src/domain/OperatingSystem.ts`](../src/domain/OperatingSystem.ts) — no changes needed there.

`UseDialog` already auto-selects a browser-safe implementation via `createEnvironmentSpecificLoggedDialog`, so no stub is needed. `UseCodeRunner` returns `window.codeRunner`, which will simply be `undefined` in the browser — mobile UI must never render the Run button.

---

## Sub-Tasks

---

### Sub-Task 1 — Add Android YAML Collection

**Status:** [ ] pending

**Intent**
Populate `src/application/collections/android.yaml` with real Android privacy tweaks following the existing Collection/Category/Script schema. This is the primary content deliverable. The `docs` field is the product — plain-English advice for non-technical users. The `code` field holds a reference ADB command or settings path for documentation only; the webapp never runs it.

**Expected Outcomes**
- `android.yaml` exists, validates against `.schema.yaml`, and can be loaded by the existing `CollectionsLoader`.
- Categories cover the main Android privacy surfaces (permissions, network, accounts, lock screen, etc.).
- Every script has a `docs` value written for a non-technical audience.
- `recommend: standard` or `recommend: strict` is set on every script per the posture slider convention.

**Todo List**
1. Activate the `privacy-yaml` skill for authoring conventions.
2. Create `src/application/collections/android.yaml` — set `os: Android`.
3. Define top-level categories: Permissions, Network & Connectivity, Google Services, Lock Screen & Biometrics, Browser, App Hygiene.
4. Under each category, add scripts with `name`, `docs`, `code` (reference only), and `recommend`.
5. Validate the file against `.schema.yaml`.
6. Register the new collection in `CollectionsLoader` so it is included in the compiled `Application`.

**Relevant Context**
- Schema reference: [`src/application/collections/.schema.yaml`](../src/application/collections/.schema.yaml)
- Loader to update: [`src/application/Application/Loader/Collections/CollectionsLoader.ts`](../src/application/Application/Loader/Collections/CollectionsLoader.ts)
- Data provider: [`src/application/Application/Loader/Collections/DataProvider/PreloadedCollectionDataProvider.ts`](../src/application/Application/Loader/Collections/DataProvider/PreloadedCollectionDataProvider.ts)
- Existing example: [`src/application/collections/linux.yaml`](../src/application/collections/linux.yaml)
- OS enum (Android already defined): [`src/domain/OperatingSystem.ts`](../src/domain/OperatingSystem.ts)

---

### Sub-Task 2 — Add GrapheneOS YAML Collection

**Status:** [ ] pending

**Intent**
Same as Sub-Task 1 but for GrapheneOS. GrapheneOS has additional hardening options not present in stock Android (Sandboxed Google Play, per-app network/sensors toggles, exploit protection settings). This collection is strictly additive — it does not replace the Android collection.

**Expected Outcomes**
- `grapheneos.yaml` exists, validates, and loads.
- Categories cover GrapheneOS-specific features: Sandboxed Google Play, Network Permission Toggle, Sensors Permission Toggle, Exploit Protection, Attestation.
- Scripts that overlap with Android are not duplicated — GrapheneOS scripts focus on what is unique to the platform.
- `recommend` values reflect GrapheneOS's higher-assurance user base (more `strict`-level defaults).

**Todo List**
1. Create `src/application/collections/grapheneos.yaml` — set `os: GrapheneOS` (verify this value exists in `OperatingSystem.ts`; add it if not).
2. Define categories covering GrapheneOS-specific surfaces.
3. Write `docs` values that assume the user already follows the Android guide.
4. Validate against `.schema.yaml`.
5. Register in `CollectionsLoader`.

**Relevant Context**
- Same files as Sub-Task 1.
- GrapheneOS may require adding a new `OperatingSystem` enum value — check [`src/domain/OperatingSystem.ts`](../src/domain/OperatingSystem.ts) first.

---

### Sub-Task 3 — Mobile Build Entry Point

**Status:** [ ] pending

**Intent**
Add a second Vite build entry that boots the existing `ApplicationContext` (unchanged) but mounts a new mobile root component. This creates the mobile webapp as a completely separate HTML/JS artifact — the desktop build is not touched.

**Expected Outcomes**
- `src/presentation/mobile/index.html` and `src/presentation/mobile/main.ts` exist and boot a Vue app.
- The mobile entry uses the same `ApplicationBootstrapper` pattern as the desktop entry (`src/presentation/main.ts`).
- A new `vite.mobile.config.ts` (or a second entry in `vite.config.ts`) produces a `dist-mobile/` output.
- The mobile build loads all three desktop collections plus the two new mobile ones.
- `window.codeRunner` is absent in the mobile build — no code is executed; the mobile UI simply never renders execution controls.

**Todo List**
1. Create `src/presentation/mobile/main.ts` mirroring `src/presentation/main.ts` but mounting `MobileApp.vue`.
2. Create `src/presentation/mobile/index.html` mirroring `src/presentation/index.html`.
3. Create `MobileApp.vue` as a thin root component (just `<RouterView>` or a direct layout — no router needed in Phase 1).
4. Add `vite.mobile.config.ts` at the repo root; set `root` to `src/presentation/mobile`, `outDir` to `../../dist-mobile`.
5. Add a `build:mobile` script to `package.json`.
6. Confirm the mobile build compiles without errors.

**Relevant Context**
- Desktop entry to mirror: [`src/presentation/main.ts`](../src/presentation/main.ts)
- Bootstrap class: [`src/presentation/bootstrapping/ApplicationBootstrapper.ts`](../src/presentation/bootstrapping/ApplicationBootstrapper.ts)
- Vite config factory: [`vite.config.ts`](../vite.config.ts) — exports `createVueConfig(options)`, reuse this.
- DI registration: [`src/presentation/bootstrapping/DependencyProvider.ts`](../src/presentation/bootstrapping/DependencyProvider.ts) — `useDialog` is already environment-aware; `useCodeRunner` returns `window.codeRunner` (undefined in browser = safe).

---

### Sub-Task 4 — Mobile Guide UI: Category & Script Browser

**Status:** [ ] pending

**Intent**
Build the core mobile UI — a collapsible category tree that surfaces the Android/GrapheneOS scripts as readable advice cards. This is the primary user-facing deliverable. All components are new and live under `src/presentation/components/Mobile/`; no existing desktop components are modified.

**Expected Outcomes**
- User can open the mobile webapp, select Android or GrapheneOS, and browse categories.
- Each script displays: its `name`, its `docs` text, and its `code` as a reference-only block with a Copy button.
- The posture slider (Standard / Strict) filters visible scripts via the existing `RecommendationLevel` on `FilterContext`.
- UI works correctly on a 390 px wide viewport (iPhone-sized).
- No Run button exists anywhere in the mobile UI.

**Todo List**
1. Create `src/presentation/components/Mobile/MobileGuideLayout.vue` — OS tab bar (Android / GrapheneOS) + posture slider + category list area.
2. Create `MobileCategoryAccordion.vue` — collapsible category using `UseCollectionState` to read `currentState.collection`.
3. Create `MobileScriptCard.vue` — renders `script.name`, `script.docs`, and `script.code.execute` as a copyable reference block.
4. Create `MobilePostureSlider.vue` — maps slider position to `RecommendationLevel` and writes to `FilterContext`.
5. Wire OS tab to `context.changeContext(os)` using `UseCollectionState`.
6. Add mobile-first CSS (no framework required — scoped styles per component).
7. Integrate components into `MobileApp.vue`.

**Relevant Context**
- State composable: [`src/presentation/components/Shared/Hooks/UseCollectionState.ts`](../src/presentation/components/Shared/Hooks/UseCollectionState.ts)
- Collection interface: [`src/domain/Collection/CategoryCollection.ts`](../src/domain/Collection/CategoryCollection.ts)
- Script interface: [`src/domain/Executables/Script/Script.ts`](../src/domain/Executables/Script/Script.ts)
- Filter state: [`src/application/Context/State/Filter/FilterContext.ts`](../src/application/Context/State/Filter/FilterContext.ts)
- Selection state (may be needed for checklist): [`src/application/Context/State/Selection/UserSelection.ts`](../src/application/Context/State/Selection/UserSelection.ts)
- Injection keys: [`src/presentation/injectionSymbols.ts`](../src/presentation/injectionSymbols.ts)
- Existing simple composable example: [`src/presentation/components/Shared/Hooks/UseApplication.ts`](../src/presentation/components/Shared/Hooks/UseApplication.ts)

---

### Sub-Task 5 — Checklist & Share

**Status:** [ ] pending

**Intent**
Let users mark scripts as applied and export their checklist as plain text — a minimal but complete "take-away" for the guide. Uses the existing `UserSelection` state; no new state needed.

**Expected Outcomes**
- Each `MobileScriptCard` has a checkbox that writes to `UserSelection`.
- A "Copy checklist" button generates a plain-text summary of selected items and copies it to the clipboard via the browser Clipboard API.
- No Electron/file-system dependency.

**Todo List**
1. Add checkbox state to `MobileScriptCard` backed by `UseUserSelectionState`.
2. Add a `MobileChecklistExport.vue` button component.
3. Implement plain-text export: selected script names + docs, grouped by category.
4. Use `navigator.clipboard.writeText()` — no `UseDialog` or `UseCodeRunner` involved.
5. Show a brief confirmation toast after copy.

**Relevant Context**
- Selection composable: [`src/presentation/components/Shared/Hooks/UseUserSelectionState.ts`](../src/presentation/components/Shared/Hooks/UseUserSelectionState.ts) (verify path — may be `UseCollectionState` with selection sub-property).
- Clipboard hook: [`src/presentation/components/Shared/Hooks/UseClipboard.ts`](../src/presentation/components/Shared/Hooks/UseClipboard.ts) — already exists, reuse it.

---

## Non-Goals

- Do not modify any existing desktop components or the desktop build pipeline.
- Do not add a router — a single-page layout is sufficient for Phase 1.
- Do not add a UI framework (Vuetify, Quasar, etc.) — scoped CSS per component.
- Do not implement iOS-specific collections in this plan (Android + GrapheneOS only).
- Do not implement PWA offline caching in this plan.

---

## License

All new files must carry: `// SPDX-License-Identifier: AGPL-3.0-or-later`  
New YAML files are data, not code — no header needed, but the collection must remain AGPL-compatible.
