<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<!--
  MobileGuideLayout — top-level layout:
  - Dark mode toggle (sun/moon) in header; synced to useDarkMode composable
  - MatrixRainCanvas behind all content
  - OS tab bar (Android / GrapheneOS)
  - Posture slider (Standard = RecommendationLevel.Standard, Strict = RecommendationLevel.Strict)
  - Progress bar (X of Y guides secured)
  - Scrollable category accordion list
  Reuses injectKey / UseCollectionState / UseApplication from existing DI system.
  Checklist state is backed by UserSelection (in-memory) and persisted to
  localStorage via useChecklistPersistence, keyed per OS.
-->
<template>
  <div class="guide" :class="{ 'guide--dark': isDark }">
    <!-- Matrix rain canvas (behind everything) -->
    <MatrixRainCanvas :is-dark="isDark" />

    <!-- Header -->
    <header class="guide__header">
      <div class="guide__header-inner">
        <div class="guide__title-block">
          <h1 class="guide__title">
            privacy.sexy
          </h1>
          <p class="guide__subtitle">
            Mobile Privacy Guide
          </p>
        </div>
        <button
          type="button"
          class="guide__dark-toggle"
          :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          :title="isDark ? 'Light mode' : 'Dark mode'"
          @click="toggleDark"
        >
          <span aria-hidden="true">{{ isDark ? '☀️' : '🌙' }}</span>
        </button>
      </div>
    </header>

    <!-- OS tab bar -->
    <nav class="guide__tabs" role="tablist" aria-label="Operating system">
      <button
        v-for="tab in osTabs"
        :key="tab.os"
        type="button"
        class="guide__tab"
        :class="{ 'guide__tab--active': currentOs === tab.os }"
        role="tab"
        :aria-selected="currentOs === tab.os"
        @click="switchOs(tab.os)"
      >
        {{ tab.emoji }} {{ tab.label }}
      </button>
    </nav>

    <!-- Posture slider -->
    <section class="guide__posture" aria-label="Privacy posture">
      <div class="posture__labels">
        <span :class="{ 'posture__label--active': postureLevel === PostureLevel.Standard }">
          🛡️ Standard
        </span>
        <span :class="{ 'posture__label--active': postureLevel === PostureLevel.Strict }">
          🔒 Strict
        </span>
      </div>
      <input
        class="posture__slider"
        type="range"
        min="0"
        max="1"
        step="1"
        :value="postureLevel"
        aria-label="Privacy posture: 0 = Standard, 1 = Strict"
        @input="onPostureInput"
      />
      <p class="posture__hint">
        <span v-if="postureLevel === PostureLevel.Standard">
          🛡️ Showing recommended tweaks for most users.
        </span>
        <span v-else>
          🔒 Showing all tweaks, including advanced hardening steps.
        </span>
      </p>
    </section>

    <!-- Progress bar -->
    <MobileProgressBar
      :checked-count="checkedCount"
      :total-count="totalVisibleCount"
    />

    <!-- Category list -->
    <main class="guide__categories">
      <template v-if="categories.length">
        <MobileCategoryAccordion
          v-for="category in categories"
          :key="category.executableId"
          :category="category"
          :posture-level="postureLevel"
          :checked-ids="checkedIds"
          @toggle="onToggle"
        />
      </template>
      <p v-else class="guide__empty">
        No categories available for this OS.
      </p>
    </main>
  </div>
</template>

<script lang="ts">
import {
  defineComponent, ref, computed, watch,
} from 'vue';
import { injectKey } from '@/presentation/injectionSymbols';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { RecommendationLevel } from '@/domain/Executables/Script/RecommendationLevel';
import type { ExecutableId } from '@/domain/Executables/Identifiable';
import MobileCategoryAccordion from './MobileCategoryAccordion.vue';
import MobileProgressBar from './MobileProgressBar.vue';
import MatrixRainCanvas from './MatrixRainCanvas.vue';
import { loadPersistedIds, persistIds } from './useChecklistPersistence';
import { useDarkMode } from './useDarkMode';

const PostureLevel = RecommendationLevel; // alias for template clarity

export default defineComponent({
  name: 'MobileGuideLayout',
  components: { MobileCategoryAccordion, MobileProgressBar, MatrixRainCanvas },
  setup() {
    const {
      currentState,
      modifyCurrentContext,
      modifyCurrentState,
    } = injectKey((keys) => keys.useCollectionState);

    const currentOs = computed(() => currentState.value.os);
    const categories = computed(() => currentState.value.collection.actions);

    const postureLevel = ref<RecommendationLevel>(RecommendationLevel.Standard);

    // ── Dark mode ────────────────────────────────────────────────────────────
    const { isDark, toggle: toggleDark } = useDarkMode();

    // ── Checklist state ──────────────────────────────────────────────────────
    const checkedIds = ref<ReadonlySet<ExecutableId>>(loadPersistedIds(currentOs.value));

    watch(currentOs, (newOs) => {
      checkedIds.value = loadPersistedIds(newOs);
    });

    watch(checkedIds, (ids) => {
      modifyCurrentState((state) => {
        const allScripts = categories.value.flatMap((cat) => cat.getAllScriptsRecursively());
        const toSelect = allScripts.filter((s) => ids.has(s.executableId));
        state.selection.scripts.selectOnly(toSelect);
      });
    });

    function onToggle(scriptId: ExecutableId): void {
      const next = new Set(checkedIds.value);
      if (next.has(scriptId)) {
        next.delete(scriptId);
      } else {
        next.add(scriptId);
      }
      checkedIds.value = next;
      persistIds(currentOs.value, next);
    }

    // ── Progress counts ──────────────────────────────────────────────────────
    const totalVisibleCount = computed(() => {
      let count = 0;
      for (const cat of categories.value) {
        for (const script of cat.getAllScriptsRecursively()) {
          if (script.level === undefined || script.level <= postureLevel.value) {
            count++;
          }
        }
      }
      return count;
    });

    const checkedCount = computed(() => {
      let count = 0;
      for (const cat of categories.value) {
        for (const script of cat.getAllScriptsRecursively()) {
          if (
            (script.level === undefined || script.level <= postureLevel.value)
            && checkedIds.value.has(script.executableId)
          ) {
            count++;
          }
        }
      }
      return count;
    });

    // ── OS / posture ─────────────────────────────────────────────────────────
    const osTabs = [
      { os: OperatingSystem.Android, label: 'Android', emoji: '🤖' },
      { os: OperatingSystem.GrapheneOS, label: 'GrapheneOS', emoji: '🔒' },
    ] as const;

    function switchOs(os: OperatingSystem) {
      modifyCurrentContext((ctx) => ctx.changeContext(os));
    }

    function onPostureInput(event: Event) {
      const value = parseInt((event.target as HTMLInputElement).value, 10);
      postureLevel.value = value as RecommendationLevel;
    }

    return {
      currentOs,
      categories,
      postureLevel,
      PostureLevel,
      osTabs,
      switchOs,
      onPostureInput,
      checkedIds,
      checkedCount,
      totalVisibleCount,
      onToggle,
      isDark,
      toggleDark,
    };
  },
});
</script>

<style scoped>
/* ══════════════════════════════════════════════════════
   CSS custom properties — light defaults, dark overrides
   ══════════════════════════════════════════════════════ */
.guide {
  /* Light-mode tokens */
  --bg-app:         #f5f5f7;
  --bg-surface:     #ffffff;
  --bg-header:      #1d1d1f;
  --header-text:    #f5f5f7;
  --border-color:   #d1d1d6;
  --tab-inactive:   #6e6e73;
  --tab-active:     #0071e3;
  --text-primary:   #1d1d1f;
  --text-secondary: #3a3a3c;
  --text-muted:     #6e6e73;
  --accent-blue:    #0071e3;
  --accent-check:   #34c759;
  --progress-track: #e5e5ea;
  --progress-fill:  #0071e3;
  --progress-done:  #34c759;
  --slider-accent:  #0071e3;
  --card-border:    #e5e5ea;
  --card-checked-bg:#f0faf0;
  --affects-color:  #007aff;
  --affects-bg:     rgba(0,122,255,0.07);
}

/* ── Dark-mode token overrides ── */
.guide--dark {
  --bg-app:         #0b0e17;
  --bg-surface:     #131720;
  --bg-header:      #080b12;
  --header-text:    #e0f7fa;
  --border-color:   #1e2535;
  --tab-inactive:   #8892a4;
  --tab-active:     #00e5ff;
  --text-primary:   #e0f7fa;
  --text-secondary: #a8b8cc;
  --text-muted:     #5a6a7e;
  --accent-blue:    #00e5ff;
  --accent-check:   #00e5c0;
  --progress-track: #1a2233;
  --progress-fill:  #00e5ff;
  --progress-done:  #00e5c0;
  --slider-accent:  #8b5cf6;
  --card-border:    #1e2535;
  --card-checked-bg:rgba(0,229,255,0.06);
  --affects-color:  #00e5ff;
  --affects-bg:     rgba(0,229,255,0.10);
}

/* ── Reset / base ── */
.guide {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background: var(--bg-app);
  color: var(--text-primary);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  max-width: 600px;
  margin: 0 auto;
  padding: 0;
  position: relative;
  transition: background 0.25s, color 0.25s;
}

/* ── Header ── */
.guide__header {
  background: var(--bg-header);
  color: var(--header-text);
  padding: 0.75rem 1.25rem;
  position: relative;
  z-index: 2;
}

.guide__header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.guide__title-block {
  display: flex;
  flex-direction: column;
}

.guide__title {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--header-text);
}

.guide__subtitle {
  margin: 0.15rem 0 0;
  font-size: 0.78rem;
  opacity: 0.65;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

/* ── Dark mode toggle ── */
.guide__dark-toggle {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 8px;
  padding: 0.3rem 0.55rem;
  font-size: 1.1rem;
  cursor: pointer;
  min-height: 36px;
  min-width: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
  flex-shrink: 0;
}

.guide__dark-toggle:hover,
.guide__dark-toggle:focus-visible {
  background: rgba(255,255,255,0.12);
  outline: none;
}

/* ── OS tabs ── */
.guide__tabs {
  display: flex;
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border-color);
  position: relative;
  z-index: 2;
}

.guide__tab {
  flex: 1;
  padding: 0.75rem 0;
  border: none;
  background: transparent;
  font-size: 0.92rem;
  font-weight: 500;
  color: var(--tab-inactive);
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: color 0.15s, border-color 0.15s;
}

.guide__tab--active {
  color: var(--tab-active);
  border-bottom-color: var(--tab-active);
}

.guide__tab:focus-visible {
  outline: 2px solid var(--accent-blue);
  outline-offset: -2px;
}

/* ── Posture slider ── */
.guide__posture {
  background: var(--bg-surface);
  padding: 0.875rem 1.25rem 0.75rem;
  border-bottom: 1px solid var(--border-color);
  position: relative;
  z-index: 2;
}

.posture__labels {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.35rem;
  font-size: 0.82rem;
  color: var(--text-muted);
}

.posture__label--active {
  color: var(--tab-active);
  font-weight: 600;
}

.posture__slider {
  width: 100%;
  accent-color: var(--slider-accent);
  cursor: pointer;
}

.posture__hint {
  margin: 0.4rem 0 0;
  font-size: 0.78rem;
  color: var(--text-muted);
  min-height: 1.2em;
}

/* ── Category list ── */
.guide__categories {
  flex: 1;
  padding: 0.75rem 0 2rem;
  position: relative;
  z-index: 1;
}

.guide__empty {
  text-align: center;
  color: var(--text-muted);
  padding: 2rem 1.25rem;
  font-size: 0.9rem;
}
</style>
