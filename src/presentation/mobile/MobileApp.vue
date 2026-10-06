<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<template>
  <MobileGuideLayout />
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import MobileGuideLayout from '@/presentation/components/Mobile/MobileGuideLayout.vue';

export default defineComponent({
  name: 'MobileApp',
  components: { MobileGuideLayout },
  setup() {
    onMounted(() => {
      document.dispatchEvent(new CustomEvent('app-ready'));
    });
  },
});
</script>
