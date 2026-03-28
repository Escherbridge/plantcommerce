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

  const id = `roots-${Math.random().toString(36).slice(2, 9)}`;
</script>

{#if animate}
  <style>
    @keyframes roots-sway {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-3px); }
      75% { transform: translateX(3px); }
    }
    .roots-animate {
      animation: roots-sway 20s ease-in-out infinite;
      transform-origin: top center;
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
      width={100 * scale}
      height={160 * scale}
      patternUnits="userSpaceOnUse"
    >
      <g
        stroke={color}
        fill="none"
        stroke-linecap="round"
        stroke-linejoin="round"
        style="opacity: {opacity}"
        class={animate ? 'roots-animate' : ''}
      >
        <!-- Primary taproot — descends center, thickest -->
        <path d="M50,0 C49,18 51,36 48,58 C46,76 50,96 47,120 C45,138 48,152 46,168" stroke-width="2.2" />

        <!-- Secondary root — branches left at ~30px depth -->
        <path d="M49,30 C42,38 34,44 26,54 C20,62 16,72 10,82 C6,90 4,100 2,112" stroke-width="1.4" />

        <!-- Secondary root — branches right at ~45px depth -->
        <path d="M48,46 C56,54 66,58 74,68 C80,76 82,88 88,98 C92,106 96,116 98,130" stroke-width="1.3" />

        <!-- Secondary root — branches left again ~70px -->
        <path d="M47,72 C40,80 32,86 24,96 C18,104 16,114 12,126 C10,134 8,142 6,152" stroke-width="1.1" />

        <!-- Secondary root — branches right ~90px -->
        <path d="M47,92 C54,100 62,106 70,116 C76,124 78,136 82,146" stroke-width="1.0" />

        <!-- Tertiary roots off left secondary (at ~54px node) -->
        <path d="M26,54 C18,50 10,48 2,44" stroke-width="0.6" />
        <path d="M26,54 C22,64 14,70 6,76" stroke-width="0.55" />

        <!-- Tertiary roots off right secondary (at ~68px node) -->
        <path d="M74,68 C82,64 90,60 98,54" stroke-width="0.6" />
        <path d="M74,68 C80,78 86,84 94,88" stroke-width="0.55" />

        <!-- Tertiary roots off left-lower secondary -->
        <path d="M24,96 C16,92 8,90 0,86" stroke-width="0.5" />
        <path d="M10,82 C4,90 -2,96 -6,106" stroke-width="0.45" />

        <!-- Fine root hairs — quaternary, very thin -->
        <path d="M2,112 C-4,118 -8,126 -10,136" stroke-width="0.3" />
        <path d="M12,126 C8,134 4,140 2,150" stroke-width="0.3" />
        <path d="M98,130 C102,138 104,146 102,156" stroke-width="0.3" />
        <path d="M82,146 C86,154 88,162 86,170" stroke-width="0.3" />
        <path d="M46,168 C44,174 46,180 42,186" stroke-width="0.3" />

        <!-- Lateral root hair clusters near tip of taproot -->
        <path d="M47,120 C40,124 34,122 28,128" stroke-width="0.35" />
        <path d="M47,120 C54,124 60,122 66,128" stroke-width="0.35" />

        <!-- Root tip markers — tiny bulge suggestion -->
        <circle cx="46" cy="168" r="1" fill={color} stroke="none" />
        <circle cx="2" cy="112" r="0.8" fill={color} stroke="none" />
        <circle cx="98" cy="130" r="0.8" fill={color} stroke="none" />
        <circle cx="6" cy="152" r="0.7" fill={color} stroke="none" />
        <circle cx="82" cy="146" r="0.7" fill={color} stroke="none" />
      </g>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#{id})" />
</svg>
