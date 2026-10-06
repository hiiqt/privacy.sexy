<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<!--
  MobileScriptCard — renders a single script as an advice card.
  Displays:
  - Checkbox + name row
  - Emoji bullet list (from the "Affects: …" first line of docs)
  - Plain-English description (remaining lines of docs)
  - Read-only reference code block with Copy button
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

    <!-- Emoji affects line (first doc line starting with "Affects:") -->
    <ul v-if="affectsBullets.length" class="card__affects" aria-label="What this setting governs">
      <li
        v-for="(bullet, i) in affectsBullets"
        :key="i"
        class="card__affects-item"
      >
        {{ bullet }}
      </li>
    </ul>

    <!-- Plain-English description (remaining doc lines) -->
    <p
      v-for="(line, i) in descriptionLines"
      :key="i"
      class="card__docs"
    >
      {{ line }}
    </p>

    <!-- Reference code block (shown only when code is present) -->
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

    async function copy() {
      await copyText(props.script.code.execute);
      copyLabel.value = 'Copied!';
      setTimeout(() => { copyLabel.value = 'Copy'; }, 2000);
    }

    /**
     * Parse docs array: the first line may be "Affects: A · B · C".
     * If so, split into bullet items; remaining lines become description.
     */
    const affectsBullets = computed<string[]>(() => {
      const docs = props.script.docs ?? [];
      if (!docs.length) return [];
      const first = docs[0].trim();
      if (!first.startsWith('Affects:')) return [];
      return first
        .replace(/^Affects:\s*/, '')
        .split('·')
        .map((s) => s.trim())
        .filter(Boolean);
    });

    const descriptionLines = computed<string[]>(() => {
      const docs = props.script.docs ?? [];
      if (!docs.length) return [];
      const first = docs[0].trim();
      const rest = first.startsWith('Affects:') ? docs.slice(1) : docs;
      // Drop leading empty lines after the affects line
      let start = 0;
      while (start < rest.length && rest[start].trim() === '') start++;
      return rest.slice(start);
    });

    return {
      copyLabel, copy, affectsBullets, descriptionLines,
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
  margin-bottom: 0.4rem;
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

/* ── Affects bullet list ── */
.card__affects {
  list-style: none;
  margin: 0 0 0.5rem 1.7rem;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 0.5rem;
}

.card__affects-item {
  font-size: 0.78rem;
  color: var(--affects-color, #007aff);
  background: var(--affects-bg, rgba(0,122,255,0.07));
  border-radius: 4px;
  padding: 0.15rem 0.4rem;
  white-space: nowrap;
}

.card__docs {
  margin: 0 0 0.4rem;
  font-size: 0.85rem;
  color: var(--text-secondary, #3a3a3c);
  line-height: 1.55;
}

.card__code-block {
  margin-top: 0.6rem;
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
