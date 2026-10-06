<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<!--
  MobileScriptCard — renders a single script as an advice card.
  Displays: name, docs (plain-English reason), and code.execute as a
  read-only reference block with a Copy button via UseClipboard.
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

    <!-- Plain-English docs -->
    <p
      v-for="(line, i) in script.docs"
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
import { defineComponent, ref, type PropType } from 'vue';
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

    return { copyLabel, copy };
  },
});
</script>

<style scoped>
.card {
  padding: 0.875rem 1rem;
  border-top: 1px solid #e5e5ea;
  transition: background 0.15s;
}

.card:first-child {
  border-top: none;
}

.card--checked {
  background: #f0faf0;
}

.card__title-row {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  cursor: pointer;
  margin-bottom: 0.35rem;
}

.card__checkbox {
  flex-shrink: 0;
  margin-top: 0.1rem;
  width: 1.1rem;
  height: 1.1rem;
  accent-color: #34c759;
  cursor: pointer;
}

.card__name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1d1d1f;
  line-height: 1.3;
}

.card__name--done {
  color: #6e6e73;
  text-decoration: line-through;
}

.card__docs {
  margin: 0 0 0.4rem;
  font-size: 0.85rem;
  color: #3a3a3c;
  line-height: 1.5;
}

.card__code-block {
  margin-top: 0.6rem;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #d1d1d6;
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
  min-height: 28px; /* touch target */
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
