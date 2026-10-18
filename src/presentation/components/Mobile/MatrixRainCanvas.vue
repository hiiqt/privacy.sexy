<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<!--
  MatrixRainCanvas — lightweight canvas cipher-rain.
  Katakana + hex glyphs, cyan with violet accents.
  Cyan/violet on dark, very faint on light.
  Pauses when tab hidden; honours prefers-reduced-motion.
  Mobile-safe: capped DPR, modest column density.
-->
<template>
  <canvas
    ref="canvasEl"
    class="matrix-rain"
    aria-hidden="true"
  />
</template>

<script lang="ts">
import {
  defineComponent, ref, onMounted, onBeforeUnmount, watch, type PropType,
} from 'vue';

// Katakana block + a handful of hex digits for the cipher aesthetic
const GLYPHS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF';

export default defineComponent({
  name: 'MatrixRainCanvas',
  props: {
    isDark: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
  },
  setup(props) {
    const canvasEl = ref<HTMLCanvasElement | null>(null);
    let rafId = 0;
    let drops: number[] = [];
    const COL_WIDTH = 18; // pixels per column — keeps column count modest on mobile
    const MAX_DPR = 1.5; // cap to protect mobile GPU

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function resize() {
      const canvas = canvasEl.value;
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      const cols = Math.floor(canvas.offsetWidth / COL_WIDTH);
      drops = Array.from({ length: cols }, () => Math.random() * -50);
    }

    function drawFrame() {
      const canvas = canvasEl.value;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      const w = canvas.width;
      const h = canvas.height;
      const cols = drops.length;
      const charH = COL_WIDTH * dpr;

      // Fade trail
      const dark = props.isDark;
      ctx.fillStyle = dark
        ? 'rgba(11,14,23,0.18)' // #0B0E17 at 18%
        : 'rgba(245,245,247,0.22)'; // light bg fade
      ctx.fillRect(0, 0, w, h);

      ctx.font = `${Math.round(13 * dpr)}px monospace`;

      for (let i = 0; i < cols; i++) {
        const char = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        const x = (i * COL_WIDTH + COL_WIDTH / 2) * dpr;
        const y = drops[i] * charH;

        // Leading glyph is brighter; violet accent ~15% of the time
        const accent = Math.random() < 0.15;
        if (dark) {
          ctx.fillStyle = accent ? 'rgba(139,92,246,0.75)' : 'rgba(0,229,255,0.70)';
        } else {
          // Very faint in light mode — barely visible watermark
          ctx.fillStyle = accent ? 'rgba(139,92,246,0.10)' : 'rgba(0,180,210,0.10)';
        }
        ctx.fillText(char, x, y);

        // Dim tail glyphs — re-render two rows back slightly dimmer
        if (dark) {
          ctx.fillStyle = accent ? 'rgba(139,92,246,0.25)' : 'rgba(0,229,255,0.22)';
        } else {
          ctx.fillStyle = 'rgba(0,180,210,0.05)';
        }
        if (drops[i] > 1) {
          const prevChar = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          ctx.fillText(prevChar, x, y - charH);
        }

        // Advance drop; reset with random delay after passing bottom
        if (drops[i] * charH > h && Math.random() > 0.975) {
          drops[i] = Math.random() * -20;
        } else {
          drops[i] += 0.4; // slow drizzle speed
        }
      }
    }

    let paused = false;

    function tick() {
      if (!paused) drawFrame();
      rafId = requestAnimationFrame(tick);
    }

    function onVisibilityChange() {
      paused = document.hidden;
    }

    const resizeObserver = new ResizeObserver(() => {
      resize();
    });

    onMounted(() => {
      const canvas = canvasEl.value;
      if (!canvas) return;

      resize();

      if (prefersReduced) {
        // Static single frame — no animation
        drawFrame();
        return;
      }

      document.addEventListener('visibilitychange', onVisibilityChange);
      resizeObserver.observe(canvas.parentElement ?? canvas);
      rafId = requestAnimationFrame(tick);
    });

    onBeforeUnmount(() => {
      cancelAnimationFrame(rafId);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      resizeObserver.disconnect();
    });

    // Re-draw on mode switch so colours update immediately
    watch(() => props.isDark, () => {
      if (prefersReduced) drawFrame();
    });

    return { canvasEl };
  },
});
</script>

<style scoped>
.matrix-rain {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  display: block;
}
</style>
