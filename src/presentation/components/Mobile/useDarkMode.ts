// SPDX-License-Identifier: AGPL-3.0-or-later
/**
 * useDarkMode — reactive dark-mode toggle.
 * Default: prefers-color-scheme media query.
 * Choice persisted in localStorage under 'mobile-dark-mode'.
 * Applies/removes the `dark` class on <html>.
 */
import { ref, watch } from 'vue';

const STORAGE_KEY = 'mobile-dark-mode';

function getInitialDark(): boolean {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored !== null) return stored === 'true';
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

const isDark = ref<boolean>(getInitialDark());

function applyClass(dark: boolean) {
  document.documentElement.classList.toggle('dark', dark);
}

// Apply immediately on module load
applyClass(isDark.value);

watch(isDark, (dark) => {
  applyClass(dark);
  localStorage.setItem(STORAGE_KEY, String(dark));
});

export function useDarkMode() {
  function toggle() {
    isDark.value = !isDark.value;
  }
  return { isDark, toggle };
}
