<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<!--
  MobileScriptCard — renders a single script as an advice card.
  Card order (top → bottom):
  1. Checkbox + title
  2. Path row  (⚙️ icon + path text)
  3. Affects row  ("Affects:" label + blue pill chips)
  4. Details dropdown  (collapsed; prose paragraphs + "- " bullet lines)
  5. Reference command  (full-width, Copy button)
  Checkbox state is backed by UserSelection and persisted via checklist:toggle.
  No "Run" button — this is a guide, not an executor.
-->
<template>
  <article class="card" :class="{ 'card--checked': isChecked }">
    <!-- 1. Checkbox + title -->
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

    <!-- 2. Path row -->
    <div v-if="settingPath" class="card__path">
      <span class="card__path-icon" aria-hidden="true">⚙️</span>
      <span class="card__path-text">{{ settingPath }}</span>
    </div>

    <!-- 3. Affects row -->
    <div v-if="affectsBullets.length" class="card__affects-row">
      <span class="card__affects-label">Affects:</span>
      <ul class="card__affects" aria-label="What this setting governs">
        <li
          v-for="(bullet, i) in affectsBullets"
          :key="i"
          class="card__affects-item"
        >{{ bullet }}</li>
      </ul>
    </div>

    <!-- 4. Details dropdown -->
    <div v-if="proseBlocks.length" class="card__details">
      <div
        class="card__details-body"
        :class="{ 'card__details-body--expanded': detailsExpanded }"
      >
        <template v-for="(block, i) in proseBlocks" :key="i">
          <p v-if="block.type === 'paragraph'" class="card__docs">{{ block.text }}</p>
          <ul v-else-if="block.type === 'bullets'" class="card__bullets">
            <li v-for="(item, j) in block.items" :key="j" class="card__bullet-item">{{ item }}</li>
          </ul>
        </template>
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

    <!-- 5. Reference command (full width) -->
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
     * Each YAML `|-` block scalar arrives as a single string in docs[0].
     * Split on newlines, peel off the optional Path:/Affects: prefix lines,
     * then convert remaining prose lines into typed blocks:
     *   - lines starting with "- " → collected into a 'bullets' block
     *   - all other non-empty lines → individual 'paragraph' blocks
     */
    type ProseBlock =
      | { type: 'paragraph'; text: string }
      | { type: 'bullets'; items: string[] };

    function parsedDocs() {
      const raw = (props.script.docs ?? []).join('\n');
      const lines = raw.split('\n');
      let idx = 0;

      let path = '';
      if (lines[idx]?.trim().startsWith('Path:')) {
        path = lines[idx].trim().replace(/^Path:\s*/, '');
        idx += 1;
      }

      let affects: string[] = [];
      if (lines[idx]?.trim().startsWith('Affects:')) {
        affects = lines[idx].trim()
          .replace(/^Affects:\s*/, '')
          .split('·')
          .map((s) => s.trim())
          .filter(Boolean);
        idx += 1;
      }

      // Drop leading blank lines before prose
      while (idx < lines.length && lines[idx].trim() === '') idx += 1;

      // Build typed prose blocks
      const blocks: ProseBlock[] = [];
      while (idx < lines.length) {
        const line = lines[idx];
        if (line.trim() === '') {
          idx += 1;
          continue;
        }
        if (line.trimStart().startsWith('- ')) {
          // Collect consecutive bullet lines into one block
          const items: string[] = [];
          while (idx < lines.length && lines[idx].trimStart().startsWith('- ')) {
            items.push(lines[idx].trimStart().slice(2));
            idx += 1;
          }
          blocks.push({ type: 'bullets', items });
        } else {
          blocks.push({ type: 'paragraph', text: line });
          idx += 1;
        }
      }

      return { path, affects, blocks };
    }

    const settingPath = computed<string>(() => parsedDocs().path);
    const affectsBullets = computed<string[]>(() => parsedDocs().affects);
    const proseBlocks = computed<ProseBlock[]>(() => parsedDocs().blocks);

    return {
      copyLabel,
      copy,
      settingPath,
      affectsBullets,
      proseBlocks,
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
  margin: 0 0 0.35rem 1.7rem;
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

/* ── Affects row ── */
.card__affects-row {
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 0.25rem 0.4rem;
  margin: 0 0 0.45rem 1.7rem;
}

.card__affects-label {
  font-size: 0.75rem;
  color: var(--text-secondary, #3a3a3c);
  font-weight: 600;
  white-space: nowrap;
  line-height: 1.6;
  margin-right: 0.15rem;
}

.card__affects {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 0.4rem;
}

.card__affects-item {
  font-size: 0.75rem;
  color: var(--affects-color, #007aff);
  background: rgba(0, 122, 255, 0.18);
  border: 1px solid rgba(0, 122, 255, 0.45);
  border-radius: 4px;
  padding: 0.15rem 0.4rem;
  white-space: nowrap;
}

/* ── Expandable description ── */
.card__details {
  margin: 0 0 0.5rem;
}

.card__details-body {
  overflow: hidden;
  max-height: 2.8em;
  mask-image: linear-gradient(to bottom, black 50%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, black 50%, transparent 100%);
  transition: max-height 0.25s ease, mask-image 0s 0.25s;
}

.card__details-body--expanded {
  max-height: 60em;
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

.card__bullets {
  margin: 0 0 0.4rem 1.1rem;
  padding: 0;
}

.card__bullet-item {
  font-size: 0.85rem;
  color: var(--text-secondary, #3a3a3c);
  line-height: 1.55;
  margin-bottom: 0.15rem;
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

/* ── Reference command (full width) ── */
.card__code-block {
  margin-top: 0.5rem;
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
</style>
