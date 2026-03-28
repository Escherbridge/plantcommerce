<script lang="ts">
  let {
    color = 'currentColor',
    opacity = 1,
    scale = 1,
    animate = false,
  }: {
    color?: string;
    opacity?: number;
    scale?: number;
    animate?: boolean;
  } = $props();

  const id = $derived(`water-ripple-${Math.random().toString(36).slice(2, 9)}`);
  const patternSize = $derived(100 * scale);
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  width="100%"
  height="100%"
  aria-hidden="true"
>
  <defs>
    <pattern
      id={id}
      x="0"
      y="0"
      width={patternSize}
      height={patternSize}
      patternUnits="userSpaceOnUse"
    >
      <g
        stroke={color}
        fill="none"
        opacity={opacity}
        class={animate ? 'ripple-expand' : ''}
      >
        <!-- Primary ripple center at (30, 35) -->
        <!-- Innermost ring — slightly organic using bezier -->
        <path
          d="M 30 25 C 37 24, 42 28, 42 35 C 42 42, 37 46, 30 46 C 23 46, 18 42, 18 35 C 18 28, 23 24, 30 25 Z"
          stroke-width="0.8"
          stroke-opacity="0.9"
        />
        <!-- Middle ring -->
        <path
          d="M 30 17 C 41 15, 51 24, 51 35 C 51 46, 41 55, 30 55 C 19 55, 9 46, 9 35 C 9 24, 19 15, 30 17 Z"
          stroke-width="0.7"
          stroke-opacity="0.65"
        />
        <!-- Outer ring -->
        <path
          d="M 30 8 C 46 5, 61 19, 61 35 C 61 51, 46 65, 30 65 C 14 65, -1 51, -1 35 C -1 19, 14 5, 30 8 Z"
          stroke-width="0.5"
          stroke-opacity="0.4"
        />

        <!-- Second ripple center at (72, 68) — offset for overlapping interest -->
        <path
          d="M 72 60 C 78 59, 82 63, 82 68 C 82 73, 78 77, 72 77 C 66 77, 62 73, 62 68 C 62 63, 66 59, 72 60 Z"
          stroke-width="0.8"
          stroke-opacity="0.85"
        />
        <path
          d="M 72 52 C 82 50, 91 58, 91 68 C 91 78, 82 86, 72 86 C 62 86, 53 78, 53 68 C 53 58, 62 50, 72 52 Z"
          stroke-width="0.6"
          stroke-opacity="0.55"
        />
        <path
          d="M 72 43 C 86 40, 100 53, 100 68 C 100 83, 86 96, 72 96 C 58 96, 44 83, 44 68 C 44 53, 58 40, 72 43 Z"
          stroke-width="0.4"
          stroke-opacity="0.3"
        />

        <!-- Third ripple center at (85, 15) — corner accent -->
        <path
          d="M 85 9 C 90 8, 94 11, 94 15 C 94 19, 90 22, 85 22 C 80 22, 76 19, 76 15 C 76 11, 80 8, 85 9 Z"
          stroke-width="0.7"
          stroke-opacity="0.8"
        />
        <path
          d="M 85 2 C 94 0, 102 7, 102 15 C 102 23, 94 30, 85 30 C 76 30, 68 23, 68 15 C 68 7, 76 0, 85 2 Z"
          stroke-width="0.5"
          stroke-opacity="0.45"
        />
      </g>
    </pattern>
  </defs>

  <rect width="100%" height="100%" fill="url(#{id})" />
</svg>

<style>
  .ripple-expand {
    animation: ripple-expand 3s ease-out infinite;
    transform-origin: center;
  }

  @keyframes ripple-expand {
    0% { opacity: 1; transform: scale(0.92); }
    60% { opacity: 0.5; transform: scale(1.04); }
    100% { opacity: 1; transform: scale(0.92); }
  }
</style>
