<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<!--
  MobileGuideLayout — top-level layout:
  - OS tab bar (Android / GrapheneOS)
  - Posture slider (Standard = RecommendationLevel.Standard, Strict = RecommendationLevel.Strict)
  - Progress bar (X of Y guides secured)
  - Scrollable category accordion list
  Reuses injectKey / UseCollectionState / UseApplication from existing DI system.
  Checklist state is backed by UserSelection (in-memory) and persisted to
  localStorage via useChecklistPersistence, keyed per OS.
-->
<template>
  <div class="guide">
    <!-- Header -->
    <header class="guide__header">
      <h1 class="guide__title">
        privacy.sexy
      </h1>
      <p class="guide__subtitle">
        Mobile Privacy Guide
      </p>
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
        {{ tab.label }}
      </button>
    </nav>

    <!-- Posture slider -->
    <section class="guide__posture" aria-label="Privacy posture">
      <div class="posture__labels">
        <span :class="{ 'posture__label--active': postureLevel === PostureLevel.Standard }">Standard</span>
        <span :class="{ 'posture__label--active': postureLevel === PostureLevel.Strict }">Strict</span>
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
          Showing recommended tweaks for most users.
        </span>
        <span v-else>
          Showing all tweaks, including advanced hardening steps.
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
import { loadPersistedIds, persistIds } from './useChecklistPersistence';

const PostureLevel = RecommendationLevel; // alias for template clarity

export default defineComponent({
  name: 'MobileGuideLayout',
  components: { MobileCategoryAccordion, MobileProgressBar },
  setup() {
    const {
      currentState,
      modifyCurrentContext,
      modifyCurrentState,
    } = injectKey((keys) => keys.useCollectionState);

    const currentOs = computed(() => currentState.value.os);
    const categories = computed(() => currentState.value.collection.actions);

    const postureLevel = ref<RecommendationLevel>(RecommendationLevel.Standard);

    // ── Checklist state ──────────────────────────────────────────────────────
    // Reactive set of checked IDs for the current OS.
    // We use a ref wrapping a new Set so Vue detects replacement.
    const checkedIds = ref<ReadonlySet<ExecutableId>>(loadPersistedIds(currentOs.value));

    // Restore persisted IDs whenever the OS changes.
    watch(currentOs, (newOs) => {
      checkedIds.value = loadPersistedIds(newOs);
    });

    // Sync checkedIds → UserSelection whenever checkedIds changes.
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
    // Total visible scripts (filtered by current posture).
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

    // Checked count among currently visible scripts only.
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
      { os: OperatingSystem.Android, label: 'Android' },
      { os: OperatingSystem.GrapheneOS, label: 'GrapheneOS' },
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
    };
  },
});
</script>

<style scoped>
/* ── Reset / base ── */
.guide {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background: #f5f5f7;
  color: #1d1d1f;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  max-width: 600px;
  margin: 0 auto;
  padding: 0;
}

/* ── Header ── */
.guide__header {
  background: #1d1d1f;
  color: #f5f5f7;
  padding: 1rem 1.25rem 0.75rem;
  text-align: center;
}

.guide__title {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.guide__subtitle {
  margin: 0.2rem 0 0;
  font-size: 0.8rem;
  opacity: 0.65;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

/* ── OS tabs ── */
.guide__tabs {
  display: flex;
  background: #fff;
  border-bottom: 1px solid #d1d1d6;
}

.guide__tab {
  flex: 1;
  padding: 0.75rem 0;
  border: none;
  background: transparent;
  font-size: 0.95rem;
  font-weight: 500;
  color: #6e6e73;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: color 0.15s, border-color 0.15s;
}

.guide__tab--active {
  color: #0071e3;
  border-bottom-color: #0071e3;
}

.guide__tab:focus-visible {
  outline: 2px solid #0071e3;
  outline-offset: -2px;
}

/* ── Posture slider ── */
.guide__posture {
  background: #fff;
  padding: 0.875rem 1.25rem 0.75rem;
  border-bottom: 1px solid #d1d1d6;
}

.posture__labels {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.35rem;
  font-size: 0.8rem;
  color: #6e6e73;
}

.posture__label--active {
  color: #0071e3;
  font-weight: 600;
}

.posture__slider {
  width: 100%;
  accent-color: #0071e3;
  cursor: pointer;
}

.posture__hint {
  margin: 0.4rem 0 0;
  font-size: 0.78rem;
  color: #6e6e73;
  min-height: 1.2em;
}

/* ── Category list ── */
.guide__categories {
  flex: 1;
  padding: 0.75rem 0 2rem;
}

.guide__empty {
  text-align: center;
  color: #6e6e73;
  padding: 2rem 1.25rem;
  font-size: 0.9rem;
}
</style>
