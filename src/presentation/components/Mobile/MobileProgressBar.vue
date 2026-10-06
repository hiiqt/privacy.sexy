<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<!--
  MobileProgressBar — shows "X of Y guides secured" with a filled progress bar.
  Purely presentational: receives checkedCount and totalCount as props.
-->
<template>
  <section class="progress" aria-label="Checklist progress">
    <div class="progress__header">
      <span class="progress__label">
        <strong>{{ checkedCount }}</strong> of <strong>{{ totalCount }}</strong> guides secured
      </span>
      <span v-if="isComplete" class="progress__badge">✓ All done!</span>
    </div>
    <div
      class="progress__track"
      role="progressbar"
      :aria-valuenow="checkedCount"
      :aria-valuemin="0"
      :aria-valuemax="totalCount"
    >
      <div
        class="progress__fill"
        :style="{ width: `${fillPercent}%` }"
        :class="{ 'progress__fill--complete': isComplete }"
      />
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';

export default defineComponent({
  name: 'MobileProgressBar',
  props: {
    checkedCount: {
      type: Number,
      required: true,
    },
    totalCount: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const fillPercent = computed(() => {
      if (props.totalCount <= 0) return 0;
      return Math.round((props.checkedCount / props.totalCount) * 100);
    });
    const isComplete = computed(
      () => props.totalCount > 0 && props.checkedCount >= props.totalCount,
    );
    return { fillPercent, isComplete };
  },
});
</script>

<style scoped>
.progress {
  background: #fff;
  padding: 0.75rem 1.25rem 0.875rem;
  border-bottom: 1px solid #d1d1d6;
}

.progress__header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 0.45rem;
}

.progress__label {
  font-size: 0.82rem;
  color: #3a3a3c;
}

.progress__label strong {
  color: #1d1d1f;
}

.progress__badge {
  font-size: 0.75rem;
  font-weight: 600;
  color: #34c759;
}

.progress__track {
  width: 100%;
  height: 6px;
  background: #e5e5ea;
  border-radius: 3px;
  overflow: hidden;
}

.progress__fill {
  height: 100%;
  background: #0071e3;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress__fill--complete {
  background: #34c759;
}
</style>
