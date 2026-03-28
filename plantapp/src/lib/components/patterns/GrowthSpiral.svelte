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

  const id = $derived(`growth-spiral-${Math.random().toString(36).slice(2, 9)}`);
  const patternSize = $derived(90 * scale);

  // Golden ratio spiral nodes placed along the fibonacci arc
  // Centers approximately follow the logarithmic spiral from (45,45)
  const nodes: Array<{ cx: number; cy: number; r: number; opacity: number }> = [
    { cx: 45, cy: 45, r: 1.2, opacity: 0.9 },   // center
    { cx: 50, cy: 43, r: 1.0, opacity: 0.85 },
    { cx: 55, cy: 39, r: 0.9, opacity: 0.8 },
    { cx: 58, cy: 34, r: 0.85, opacity: 0.75 },
    { cx: 57, cy: 28, r: 0.8, opacity: 0.7 },
    { cx: 53, cy: 23, r: 0.75, opacity: 0.65 },
    { cx: 47, cy: 19, r: 0.7, opacity: 0.6 },
    { cx: 40, cy: 18, r: 0.65, opacity: 0.55 },
    { cx: 33, cy: 20, r: 0.6, opacity: 0.5 },
    { cx: 27, cy: 25, r: 0.55, opacity: 0.45 },
    { cx: 23, cy: 32, r: 0.5, opacity: 0.4 },
    { cx: 22, cy: 40, r: 0.45, opacity: 0.35 },
    { cx: 25, cy: 48, r: 0.4, opacity: 0.3 },
    { cx: 31, cy: 55, r: 0.4, opacity: 0.28 },
    { cx: 39, cy: 59, r: 0.35, opacity: 0.25 },
    { cx: 48, cy: 60, r: 0.35, opacity: 0.22 },
    { cx: 57, cy: 57, r: 0.3, opacity: 0.18 },
    { cx: 64, cy: 51, r: 0.3, opacity: 0.15 },
    { cx: 68, cy: 43, r: 0.28, opacity: 0.12 },
  ];
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
        fill={color}
        opacity={opacity}
        class={animate ? 'spiral-rotate' : ''}
        style={animate ? `transform-origin: ${patternSize / 2}px ${patternSize / 2}px` : ''}
      >
        <!-- Golden ratio spiral path using arc commands -->
        <!-- Approximated with a multi-segment bezier path for organic feel -->
        <path
          d="
            M 45 45
            C 48 43, 54 40, 58 34
            C 62 28, 60 19, 53 16
            C 46 13, 36 16, 30 22
            C 24 28, 21 38, 23 47
            C 25 56, 33 63, 43 65
            C 53 67, 64 62, 69 53
            C 74 44, 72 31, 65 24
            C 58 17, 46 13, 36 14
            C 26 15, 16 22, 12 32
          "
          stroke-width="1.2"
          stroke-linecap="round"
          fill="none"
          stroke-opacity="0.85"
        />
        <!-- Inner tight spiral curl -->
        <path
          d="
            M 45 45
            C 47 44, 49 42, 50 40
            C 51 38, 50 35, 48 34
            C 46 33, 43 34, 42 36
            C 41 38, 42 41, 44 43
          "
          stroke-width="0.8"
          stroke-linecap="round"
          fill="none"
          stroke-opacity="0.7"
        />

        <!-- Growth nodes along the spiral -->
        {#each nodes as node}
          <circle
            cx={node.cx}
            cy={node.cy}
            r={node.r}
            stroke="none"
            fill={color}
            opacity={node.opacity}
          />
        {/each}
      </g>
    </pattern>
  </defs>

  <rect width="100%" height="100%" fill="url(#{id})" />
</svg>

<style>
  .spiral-rotate {
    animation: spiral-rotate 20s linear infinite;
  }

  @keyframes spiral-rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
</style>
