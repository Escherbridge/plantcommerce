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

  const id = $derived(`leaf-venation-${Math.random().toString(36).slice(2, 9)}`);
  const patternSize = $derived(80 * scale);
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
        class={animate ? 'leaf-pulse' : ''}
      >
        <!-- Midrib - central main vein, thickest -->
        <path
          d="M 40 8 C 40 25, 40 45, 40 72"
          stroke-width="2"
          stroke-linecap="round"
        />

        <!-- Secondary veins branching right at ~45 degrees -->
        <path d="M 40 18 C 48 20, 54 22, 58 26" stroke-width="1" stroke-linecap="round" />
        <path d="M 40 28 C 50 30, 56 32, 62 36" stroke-width="1" stroke-linecap="round" />
        <path d="M 40 38 C 50 38, 57 40, 62 44" stroke-width="1" stroke-linecap="round" />
        <path d="M 40 50 C 49 50, 55 52, 59 56" stroke-width="1" stroke-linecap="round" />
        <path d="M 40 61 C 47 61, 52 63, 55 67" stroke-width="1" stroke-linecap="round" />

        <!-- Secondary veins branching left at ~45 degrees -->
        <path d="M 40 18 C 32 20, 26 22, 22 26" stroke-width="1" stroke-linecap="round" />
        <path d="M 40 28 C 30 30, 24 32, 18 36" stroke-width="1" stroke-linecap="round" />
        <path d="M 40 38 C 30 38, 23 40, 18 44" stroke-width="1" stroke-linecap="round" />
        <path d="M 40 50 C 31 50, 25 52, 21 56" stroke-width="1" stroke-linecap="round" />
        <path d="M 40 61 C 33 61, 28 63, 25 67" stroke-width="1" stroke-linecap="round" />

        <!-- Tertiary veins from right secondaries -->
        <path d="M 51 23 C 54 21, 57 20, 59 19" stroke-width="0.5" stroke-linecap="round" />
        <path d="M 53 33 C 57 31, 60 30, 63 29" stroke-width="0.5" stroke-linecap="round" />
        <path d="M 54 42 C 57 40, 60 39, 63 38" stroke-width="0.5" stroke-linecap="round" />
        <path d="M 52 53 C 55 52, 57 51, 60 50" stroke-width="0.5" stroke-linecap="round" />

        <!-- Tertiary veins from left secondaries -->
        <path d="M 29 23 C 26 21, 23 20, 21 19" stroke-width="0.5" stroke-linecap="round" />
        <path d="M 27 33 C 23 31, 20 30, 17 29" stroke-width="0.5" stroke-linecap="round" />
        <path d="M 26 42 C 23 40, 20 39, 17 38" stroke-width="0.5" stroke-linecap="round" />
        <path d="M 28 53 C 25 52, 23 51, 20 50" stroke-width="0.5" stroke-linecap="round" />
      </g>
    </pattern>
  </defs>

  <rect width="100%" height="100%" fill="url(#{id})" />
</svg>

<style>
  .leaf-pulse {
    animation: leaf-pulse var(--duration-reveal, 4s) ease-in-out infinite;
  }

  @keyframes leaf-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
</style>
