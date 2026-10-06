<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<!--
  MobileCategoryAccordion — collapsible category panel.
  Shows scripts whose recommend level is <= current posture.
  Scripts with no recommend (undefined) are always shown.
  Subcategories are rendered recursively.
  Passes checkedIds down for checkbox rendering and bubbles toggle events up.
  Styled with CSS custom properties that cascade from MobileGuideLayout's
  dark/light token definitions.
-->
<template>
  <div class="accordion">
    <!-- Category header / toggle -->
    <button
      type="button"
      class="accordion__header"
      :aria-expanded="open"
      :aria-controls="`cat-body-${category.executableId}`"
      @click="open = !open"
    >
      <span class="accordion__name">{{ category.name }}</span>
      <span class="accordion__count" aria-hidden="true">
        {{ visibleScripts.length }} tip{{ visibleScripts.length !== 1 ? 's' : '' }}
      </span>
      <span class="accordion__chevron" :class="{ 'accordion__chevron--open': open }" aria-hidden="true">›</span>
    </button>

    <!-- Body -->
    <div
      :id="`cat-body-${category.executableId}`"
      class="accordion__body"
      :class="{ 'accordion__body--open': open }"
    >
      <!-- Scripts in this category -->
      <MobileScriptCard
        v-for="script in visibleScripts"
        :key="script.executableId"
        :script="script"
        :is-checked="checkedIds.has(script.executableId)"
        @toggle="$emit('toggle', $event)"
      />

      <!-- Subcategories (recursive) -->
      <MobileCategoryAccordion
        v-for="sub in category.subcategories"
        :key="sub.executableId"
        :category="sub"
        :posture-level="postureLevel"
        :checked-ids="checkedIds"
        class="accordion__sub"
        @toggle="$emit('toggle', $event)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent, ref, computed, type PropType,
} from 'vue';
import type { Category } from '@/domain/Executables/Category/Category';
import type { ExecutableId } from '@/domain/Executables/Identifiable';
import { RecommendationLevel } from '@/domain/Executables/Script/RecommendationLevel';
import MobileScriptCard from './MobileScriptCard.vue';

export default defineComponent({
  name: 'MobileCategoryAccordion',
  components: { MobileScriptCard },
  props: {
    category: {
      type: Object as PropType<Category>,
      required: true,
    },
    postureLevel: {
      type: Number as PropType<RecommendationLevel>,
      required: true,
    },
    checkedIds: {
      type: Object as PropType<ReadonlySet<ExecutableId>>,
      default: () => new Set<ExecutableId>(),
    },
  },
  emits: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    toggle: (_scriptId: ExecutableId) => true,
  },
  setup(props) {
    const open = ref(false);

    // Show scripts whose level is <= current posture, or have no level set
    const visibleScripts = computed(() => props.category.scripts.filter((script) => {
      if (script.level === undefined) return true;
      return script.level <= props.postureLevel;
    }));

    return {
      open,
      visibleScripts,
    };
  },
});
</script>

<style scoped>
.accordion {
  margin: 0 0.75rem 0.5rem;
  background: var(--bg-surface, #fff);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--card-border, #e5e5ea);
  position: relative;
  z-index: 1;
}

/* Nested sub-accordion has less outer margin */
.accordion__sub {
  margin: 0;
  border-radius: 0;
  border-left: 3px solid var(--border-color, #d1d1d6);
  border-right: none;
  border-top: 1px solid var(--card-border, #e5e5ea);
  border-bottom: none;
}

.accordion__header {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.875rem 1rem;
  background: transparent;
  border: none;
  text-align: left;
  cursor: pointer;
  gap: 0.5rem;
  min-height: 48px; /* touch target */
}

.accordion__header:focus-visible {
  outline: 2px solid var(--accent-blue, #0071e3);
  outline-offset: -2px;
}

.accordion__name {
  flex: 1;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary, #1d1d1f);
}

.accordion__count {
  font-size: 0.78rem;
  color: var(--text-muted, #6e6e73);
  white-space: nowrap;
}

.accordion__chevron {
  font-size: 1.1rem;
  color: var(--text-muted, #6e6e73);
  transform: rotate(0deg);
  transition: transform 0.2s ease;
  line-height: 1;
}

.accordion__chevron--open {
  transform: rotate(90deg);
}

.accordion__body {
  display: none;
  border-top: 1px solid var(--card-border, #e5e5ea);
}

.accordion__body--open {
  display: block;
}
</style>
