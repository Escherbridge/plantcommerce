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

  const id = `mycelium-${Math.random().toString(36).slice(2, 9)}`;
</script>

{#if animate}
  <style>
    @keyframes mycelium-drift {
      0% { transform: translate(0, 0); }
      33% { transform: translate(-6px, -4px); }
      66% { transform: translate(4px, -8px); }
      100% { transform: translate(0, 0); }
    }
    .mycelium-animate {
      animation: mycelium-drift 18s ease-in-out infinite;
    }
  </style>
{/if}

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
      width={120 * scale}
      height={120 * scale}
      patternUnits="userSpaceOnUse"
    >
      <g
        stroke={color}
        fill="none"
        stroke-linecap="round"
        stroke-linejoin="round"
        style="opacity: {opacity}"
        class={animate ? 'mycelium-animate' : ''}
      >
        <!-- Main trunk filament -->
        <path d="M20,60 C35,52 45,68 60,55 C75,42 85,70 100,58" stroke-width="1.2" />

        <!-- Branch off main, upper left -->
        <path d="M35,54 C30,42 22,38 14,28 C10,22 8,14 12,6" stroke-width="0.8" />

        <!-- Branch off main, lower -->
        <path d="M50,62 C48,72 40,80 36,92 C33,100 34,108 30,116" stroke-width="0.7" />

        <!-- Tertiary off upper-left branch -->
        <path d="M14,28 C6,26 0,22 -4,16" stroke-width="0.5" />
        <path d="M22,38 C28,32 26,22 32,14" stroke-width="0.5" />

        <!-- Second main filament, diagonal -->
        <path d="M60,10 C68,22 55,34 65,46 C72,54 80,48 88,56 C94,62 96,72 104,76" stroke-width="1.0" />

        <!-- Branch up from second filament -->
        <path d="M65,46 C70,38 78,30 72,18 C68,10 74,4 80,0" stroke-width="0.6" />

        <!-- Tertiary from above -->
        <path d="M72,18 C80,16 86,10 92,8" stroke-width="0.4" />

        <!-- Cross-connection spore thread -->
        <path d="M45,68 C52,72 58,68 65,72 C70,75 72,82 78,80" stroke-width="0.45" stroke-dasharray="2,3" />

        <!-- Lower network node and branch -->
        <path d="M88,90 C80,96 70,100 65,110 C62,116 64,120 60,124" stroke-width="0.65" />
        <path d="M88,90 C94,98 102,100 108,110" stroke-width="0.55" />

        <!-- Network node dots (spore bodies) -->
        <circle cx="60" cy="55" r="1.5" fill={color} stroke="none" />
        <circle cx="35" cy="54" r="1" fill={color} stroke="none" />
        <circle cx="88" cy="56" r="1.2" fill={color} stroke="none" />
        <circle cx="50" cy="62" r="0.8" fill={color} stroke="none" />
        <circle cx="88" cy="90" r="1.4" fill={color} stroke="none" />
      </g>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#{id})" />
</svg>
