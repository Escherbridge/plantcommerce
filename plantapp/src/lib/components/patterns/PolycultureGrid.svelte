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

  const id = `polyculture-${Math.random().toString(36).slice(2, 9)}`;
</script>

{#if animate}
  <style>
    @keyframes polyculture-breathe {
      0%, 100% { transform: scale(1) rotate(0deg); }
      50% { transform: scale(1.015) rotate(0.3deg); }
    }
    .polyculture-animate {
      animation: polyculture-breathe 12s ease-in-out infinite;
      transform-origin: center;
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
      width={160 * scale}
      height={140 * scale}
      patternUnits="userSpaceOnUse"
    >
      <g
        stroke={color}
        fill="none"
        stroke-width="0.9"
        stroke-linejoin="round"
        style="opacity: {opacity}"
        class={animate ? 'polyculture-animate' : ''}
      >
        <!-- Large central cell — irregular hexagon-ish -->
        <path d="M52,14 C64,10 82,18 88,30 C94,42 90,60 80,68 C70,76 52,74 42,64 C32,54 32,36 40,24 C44,18 48,16 52,14 Z" />

        <!-- Medium upper-right cell -->
        <path d="M96,8 C106,6 118,12 122,22 C126,32 120,44 110,46 C100,48 90,40 88,30 C86,22 90,12 96,8 Z" />

        <!-- Small upper-left cell -->
        <path d="M10,10 C18,6 30,10 34,20 C38,30 32,42 22,44 C14,46 6,38 4,28 C2,18 6,12 10,10 Z" />

        <!-- Small cell top-center -->
        <path d="M38,2 C44,0 54,4 56,12 C58,20 52,28 44,28 C36,28 30,22 30,14 C30,8 34,4 38,2 Z" />

        <!-- Large lower-left cell -->
        <path d="M8,54 C16,48 32,50 40,60 C48,70 46,88 36,96 C26,104 8,100 2,90 C-4,80 -2,64 8,54 Z" />

        <!-- Medium lower-center cell -->
        <path d="M44,80 C54,74 70,76 76,88 C82,100 76,116 64,120 C52,124 40,116 36,104 C32,92 36,84 44,80 Z" />

        <!-- Small lower-right cell -->
        <path d="M90,76 C100,72 114,78 116,90 C118,100 110,112 100,112 C90,112 82,104 82,94 C82,84 84,80 90,76 Z" />

        <!-- Tiny accent cell upper-far-right -->
        <path d="M126,48 C132,44 140,50 140,58 C140,66 132,72 124,70 C116,68 114,60 118,54 C120,50 124,50 126,48 Z" />

        <!-- Tiny cell far lower -->
        <path d="M116,118 C122,114 132,118 134,126 C136,134 128,140 120,138 C112,136 110,128 114,122 C115,120 116,120 116,118 Z" />

        <!-- Interior vein lines suggesting cell walls -->
        <path d="M60,40 C65,50 70,55 76,62" stroke-width="0.4" stroke-dasharray="1,3" />
        <path d="M20,60 C28,65 30,72 28,82" stroke-width="0.4" stroke-dasharray="1,3" />
        <path d="M100,30 C106,38 108,46 104,54" stroke-width="0.4" stroke-dasharray="1,3" />
      </g>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#{id})" />
</svg>
