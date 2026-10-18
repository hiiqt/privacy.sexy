<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<!--
  MobileScriptCard — renders a single script as an advice card.
  Displays:
  - Checkbox + name row
  - Setting location row (Path: line from docs)
  - Expandable plain-English description (collapsed by default)
  - Side-by-side row: affects chips (left) + reference command (right)
  A checkbox lets users mark guides as done; state is backed by
  UserSelection (in-memory) and persisted to localStorage via the
  checklist:toggle event handled in MobileGuideLayout.
  No "Run" button — this is a guide, not an executor.
-->
<template>
  <article class="card" :class="{ 'card--checked': isChecked }">
    <!-- Checkbox + Script name row -->
    <label class="card__title-row">
      <input
        class="card__checkbox"
        type="checkbox"
        :checked="isChecked"
        :aria-label="`Mark '${script.name}' as completed`"
        @change="$emit('toggle', script.executableId)"
      />
      <span class="card__name" :class="{ 'card__name--done': isChecked }">{{ script.name }}</span>
    </label>

    <!-- Setting location row (Path: line) -->
    <div v-if="settingPath" class="card__path">
      <span class="card__path-icon" aria-hidden="true">📍</span>
      <span class="card__path-text">{{ settingPath }}</span>
    </div>

    <!-- Expandable description -->
    <div v-if="descriptionLines.length" class="card__details">
      <div
        class="card__details-body"
        :class="{ 'card__details-body--expanded': detailsExpanded }"
      >
        <p
          v-for="(line, i) in descriptionLines"
          :key="i"
          class="card__docs"
        >
          {{ line }}
        </p>
      </div>
      <button
        type="button"
        class="card__details-toggle"
        :aria-expanded="detailsExpanded"
        @click="detailsExpanded = !detailsExpanded"
      >
        {{ detailsExpanded ? 'Less details' : 'More details' }}
      </button>
    </div>

    <!-- Side-by-side: affects chips (left) + reference command (right) -->
    <div
      v-if="affectsBullets.length || script.code.execute"
      class="card__bottom-row"
    >
      <!-- Emoji affects chips -->
      <ul
        v-if="affectsBullets.length"
        class="card__affects"
        aria-label="What this setting governs"
      >
        <li
          v-for="(bullet, i) in affectsBullets"
          :key="i"
          class="card__affects-item"
        >
          {{ bullet }}
        </li>
      </ul>

      <!-- Reference code block -->
      <div v-if="script.code.execute" class="card__code-block">
        <div class="card__code-header">
          <span class="card__code-label">Reference command</span>
          <button
            type="button"
            class="card__copy-btn"
            :aria-label="`Copy reference command for ${script.name}`"
            @click="copy"
          >
            {{ copyLabel }}
          </button>
        </div>
        <pre class="card__code"><code>{{ script.code.execute }}</code></pre>
      </div>
    </div>
  </article>
</template>

<script lang="ts">
import {
  defineComponent, ref, computed, type PropType,
} from 'vue';
import type { Script } from '@/domain/Executables/Script/Script';
import type { ExecutableId } from '@/domain/Executables/Identifiable';
import { injectKey } from '@/presentation/injectionSymbols';

export default defineComponent({
  name: 'MobileScriptCard',
  props: {
    script: {
      type: Object as PropType<Script>,
      required: true,
    },
    isChecked: {
      type: Boolean,
      default: false,
    },
  },
  emits: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    toggle: (_scriptId: ExecutableId) => true,
  },
  setup(props) {
    const { copyText } = injectKey((keys) => keys.useClipboard);

    const copyLabel = ref('Copy');
    const detailsExpanded = ref(false);

    async function copy() {
      await copyText(props.script.code.execute);
      copyLabel.value = 'Copied!';
      setTimeout(() => { copyLabel.value = 'Copy'; }, 2000);
    }

    /**
     * Parse docs array. The first line may be "Path: …" (setting location).
     * The second (or first if no Path:) may be "Affects: A · B · C".
     * Remaining non-empty lines become the expandable description.
     */
    const settingPath = computed<string>(() => {
      const docs = props.script.docs ?? [];
      if (!docs.length) return '';
      const first = docs[0].trim();
      if (!first.startsWith('Path:')) return '';
      return first.replace(/^Path:\s*/, '');
    });

    const affectsBullets = computed<string[]>(() => {
      const docs = props.script.docs ?? [];
      if (!docs.length) return [];
      // Skip Path: line if present
      const startIdx = docs[0]?.trim().startsWith('Path:') ? 1 : 0;
      const candidate = docs[startIdx]?.trim() ?? '';
      if (!candidate.startsWith('Affects:')) return [];
      return candidate
        .replace(/^Affects:\s*/, '')
        .split('·')
        .map((s) => s.trim())
        .filter(Boolean);
    });

    const descriptionLines = computed<string[]>(() => {
      const docs = props.script.docs ?? [];
      if (!docs.length) return [];
      let start = 0;
      // Skip Path: line
      if (docs[start]?.trim().startsWith('Path:')) start += 1;
      // Skip Affects: line
      if (docs[start]?.trim().startsWith('Affects:')) start += 1;
      const rest = docs.slice(start);
      // Drop leading empty lines
      let trim = 0;
      while (trim < rest.length && rest[trim].trim() === '') trim++;
      return rest.slice(trim);
    });

    return {
      copyLabel,
      copy,
      settingPath,
      affectsBullets,
      descriptionLines,
      detailsExpanded,
    };
  },
});
</script>

<style scoped>
.card {
  padding: 0.875rem 1rem;
  border-top: 1px solid var(--card-border, #e5e5ea);
  transition: background 0.15s;
  position: relative;
  z-index: 1;
}

.card:first-child {
  border-top: none;
}

.card--checked {
  background: var(--card-checked-bg, #f0faf0);
}

.card__title-row {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  cursor: pointer;
  margin-bottom: 0.3rem;
}

.card__checkbox {
  flex-shrink: 0;
  margin-top: 0.1rem;
  width: 1.1rem;
  height: 1.1rem;
  accent-color: var(--accent-check, #00c896);
  cursor: pointer;
}

.card__name {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary, #1d1d1f);
  line-height: 1.3;
}

.card__name--done {
  color: var(--text-muted, #6e6e73);
  text-decoration: line-through;
}

/* ── Setting location row ── */
.card__path {
  display: flex;
  align-items: baseline;
  gap: 0.3rem;
  margin: 0 0 0.45rem 1.7rem;
}

.card__path-icon {
  font-size: 0.75rem;
  flex-shrink: 0;
}

.card__path-text {
  font-size: 0.78rem;
  color: var(--text-secondary, #3a3a3c);
  font-style: italic;
  line-height: 1.4;
}

/* ── Expandable description ── */
.card__details {
  margin: 0 0 0.5rem;
}

.card__details-body {
  overflow: hidden;
  /* Collapsed: show ~2 lines via max-height */
  max-height: 2.8em;
  mask-image: linear-gradient(to bottom, black 50%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, black 50%, transparent 100%);
  transition: max-height 0.25s ease, mask-image 0s 0.25s;
}

.card__details-body--expanded {
  max-height: 60em; /* large enough for any content */
  mask-image: none;
  -webkit-mask-image: none;
  transition: max-height 0.25s ease;
}

.card__docs {
  margin: 0 0 0.4rem;
  font-size: 0.85rem;
  color: var(--text-secondary, #3a3a3c);
  line-height: 1.55;
}

.card__details-toggle {
  background: none;
  border: none;
  padding: 0;
  margin-top: 0.15rem;
  font-size: 0.78rem;
  color: var(--affects-color, #007aff);
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
  min-height: 28px;
  line-height: 28px;
}

.card__details-toggle:hover,
.card__details-toggle:focus-visible {
  opacity: 0.75;
  outline: none;
}

/* ── Bottom row: affects chips + code block side by side ── */
.card__bottom-row {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 0.6rem;
  margin-top: 0.5rem;
}

/* ── Affects bullet list ── */
.card__affects {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 0.4rem;
  flex: 0 0 38%;
  min-width: 0;
}

.card__affects-item {
  font-size: 0.75rem;
  color: var(--affects-color, #007aff);
  background: var(--affects-bg, rgba(0,122,255,0.07));
  border-radius: 4px;
  padding: 0.15rem 0.4rem;
  white-space: nowrap;
}

/* Code block takes remaining width */
.card__code-block {
  flex: 1 1 58%;
  min-width: 0;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #2c2c2e;
  background: #1d1d1f;
}

.card__code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.35rem 0.6rem;
  background: #2c2c2e;
}

.card__code-label {
  font-size: 0.7rem;
  color: #98989d;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.card__copy-btn {
  background: transparent;
  border: 1px solid #48484a;
  border-radius: 4px;
  color: #98989d;
  font-size: 0.7rem;
  padding: 0.2rem 0.5rem;
  cursor: pointer;
  min-height: 28px;
  transition: background 0.15s, color 0.15s;
}

.card__copy-btn:hover,
.card__copy-btn:focus-visible {
  background: #48484a;
  color: #f5f5f7;
  outline: none;
}

.card__code {
  margin: 0;
  padding: 0.6rem 0.75rem;
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 0.75rem;
  color: #e5e5ea;
  white-space: pre-wrap;
  word-break: break-all;
  line-height: 1.5;
  overflow-x: auto;
}

/* ── Narrow viewport: stack command under chips ── */
@media (max-width: 380px) {
  .card__bottom-row {
    flex-direction: column;
  }

  .card__affects {
    flex: none;
    width: 100%;
  }

  .card__code-block {
    flex: none;
    width: 100%;
  }
}
</style>
