import type { Meta, StoryObj } from '@storybook/svelte';
import MyceliumNetwork from '$lib/components/patterns/MyceliumNetwork.svelte';
import PolycultureGrid from '$lib/components/patterns/PolycultureGrid.svelte';
import LeafVenation from '$lib/components/patterns/LeafVenation.svelte';
import WaterRipple from '$lib/components/patterns/WaterRipple.svelte';

// ──────────────────────────────────────────────
// Shared arg types for all pattern controls
// ──────────────────────────────────────────────
const patternArgTypes = {
  color: {
    control: { type: 'color' },
    description: 'CSS color value for the pattern strokes',
    table: { defaultValue: { summary: 'currentColor' } },
  },
  opacity: {
    control: { type: 'range', min: 0, max: 1, step: 0.01 },
    description: 'Pattern stroke opacity (0–1)',
    table: { defaultValue: { summary: '1' } },
  },
  scale: {
    control: { type: 'range', min: 0.25, max: 4, step: 0.25 },
    description: 'Pattern tile size multiplier',
    table: { defaultValue: { summary: '1' } },
  },
  animate: {
    control: { type: 'boolean' },
    description: 'Enable ambient animation',
    table: { defaultValue: { summary: 'false' } },
  },
};

// Wrapper styles for light and dark previews
const wrapperLight = 'width:100%;height:400px;background:#F7F5F0;position:relative;overflow:hidden;';
const wrapperDark = 'width:100%;height:400px;background:#1B2D4A;position:relative;overflow:hidden;';
const wrapperCharcoal = 'width:100%;height:400px;background:#1A1A1A;position:relative;overflow:hidden;';

// ──────────────────────────────────────────────
// Default meta — Mycelium Network as primary
// ──────────────────────────────────────────────
const meta = {
  title: 'Design System/Patterns',
  component: MyceliumNetwork,
  tags: ['autodocs'],
  argTypes: patternArgTypes,
  args: {
    color: '#1B2D4A',
    opacity: 0.15,
    scale: 1,
    animate: false,
  },
  decorators: [
    () => ({
      template: `<div style="${wrapperLight}"><slot /></div>`,
    }),
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
Aevani's SVG pattern library — six organic patterns that replace generic grid textures and connect the visual language directly to the polyculture mission.

All patterns share a consistent props API:
- **color** — CSS color value
- **opacity** — stroke opacity (0–1)
- **scale** — tile size multiplier
- **animate** — enables ambient animation

Use the \`PatternBackground\` wrapper component to layer any pattern behind content.
        `,
      },
    },
  },
} satisfies Meta<typeof MyceliumNetwork>;

export default meta;
type Story = StoryObj<typeof meta>;

// ──────────────────────────────────────────────
// MYCELIUM NETWORK
// ──────────────────────────────────────────────
export const MyceliumNetworkLight: Story = {
  name: 'Mycelium Network — Light',
  args: { color: '#1B2D4A', opacity: 0.15, scale: 1, animate: false },
  parameters: {
    docs: {
      description: {
        story: 'Branching filament paths with spore-body dots. Represents underground connectivity. Tile: 120×120px.',
      },
    },
  },
};

export const MyceliumNetworkDark: Story = {
  name: 'Mycelium Network — Dark',
  args: { color: '#F7F5F0', opacity: 0.2, scale: 1, animate: false },
  decorators: [
    () => ({ template: `<div style="${wrapperCharcoal}"><slot /></div>` }),
  ],
};

export const MyceliumNetworkAnimated: Story = {
  name: 'Mycelium Network — Animated',
  args: { color: '#1B2D4A', opacity: 0.18, scale: 1, animate: true },
  parameters: {
    docs: {
      description: { story: 'Ambient 18s drift. Use sparingly — one animated pattern per viewport.' },
    },
  },
};

// ──────────────────────────────────────────────
// POLYCULTURE GRID
// ──────────────────────────────────────────────
export const PolycultureGridLight: Story = {
  name: 'Polyculture Grid — Light',
  render: (args) => ({ Component: PolycultureGrid, props: args }),
  args: { color: '#0A4B3E', opacity: 0.12, scale: 1, animate: false },
  parameters: {
    docs: {
      description: {
        story: 'Irregular organic cells suggesting companion planting zones. Tile: 160×140px. Animation: 12s breathe.',
      },
    },
  },
};

export const PolycultureGridAnimated: Story = {
  name: 'Polyculture Grid — Animated',
  render: (args) => ({ Component: PolycultureGrid, props: args }),
  args: { color: '#0A4B3E', opacity: 0.15, scale: 1, animate: true },
};

export const PolycultureGridLarge: Story = {
  name: 'Polyculture Grid — Large Scale',
  render: (args) => ({ Component: PolycultureGrid, props: args }),
  args: { color: '#1B2D4A', opacity: 0.08, scale: 2, animate: false },
  parameters: {
    docs: {
      description: { story: 'Scale 2x — larger cells for full-bleed hero section backgrounds.' },
    },
  },
};

// ──────────────────────────────────────────────
// LEAF VENATION
// ──────────────────────────────────────────────
export const LeafVenationLight: Story = {
  name: 'Leaf Venation — Light',
  render: (args) => ({ Component: LeafVenation, props: args }),
  args: { color: '#1B2D4A', opacity: 0.1, scale: 1, animate: false },
  parameters: {
    docs: {
      description: {
        story: 'Midrib with hierarchical secondary and tertiary vein branching. Tile: 80×80px. Animation: 4s opacity pulse.',
      },
    },
  },
};

export const LeafVenationGreen: Story = {
  name: 'Leaf Venation — Growth Green',
  render: (args) => ({ Component: LeafVenation, props: args }),
  args: { color: '#0A4B3E', opacity: 0.12, scale: 1, animate: false },
};

export const LeafVenationAnimated: Story = {
  name: 'Leaf Venation — Animated',
  render: (args) => ({ Component: LeafVenation, props: args }),
  args: { color: '#0A4B3E', opacity: 0.14, scale: 1, animate: true },
};

export const LeafVenationDense: Story = {
  name: 'Leaf Venation — Dense',
  render: (args) => ({ Component: LeafVenation, props: args }),
  args: { color: '#1B2D4A', opacity: 0.18, scale: 0.5, animate: false },
  parameters: {
    docs: {
      description: { story: 'Scale 0.5 — denser tiling for texture-heavy backgrounds.' },
    },
  },
};

// ──────────────────────────────────────────────
// WATER RIPPLE
// ──────────────────────────────────────────────
export const WaterRippleLight: Story = {
  name: 'Water Ripple — Light',
  render: (args) => ({ Component: WaterRipple, props: args }),
  args: { color: '#457B9D', opacity: 0.12, scale: 1, animate: false },
  parameters: {
    docs: {
      description: {
        story: 'Overlapping concentric organic rings from multiple centers. Tile: 100×100px. Animation: 3s expand cycle.',
      },
    },
  },
};

export const WaterRippleNavy: Story = {
  name: 'Water Ripple — Navy Background',
  render: (args) => ({ Component: WaterRipple, props: args }),
  args: { color: '#A8DADC', opacity: 0.18, scale: 1.5, animate: false },
  decorators: [
    () => ({ template: `<div style="${wrapperDark}"><slot /></div>` }),
  ],
  parameters: {
    docs: {
      description: { story: 'Navy background with light blue-teal ripples. Scale 1.5x for larger ring spacing.' },
    },
  },
};

export const WaterRippleAnimated: Story = {
  name: 'Water Ripple — Animated',
  render: (args) => ({ Component: WaterRipple, props: args }),
  args: { color: '#457B9D', opacity: 0.15, scale: 1, animate: true },
  parameters: {
    docs: {
      description: { story: '3s expand-and-contract cycle. Most kinetic of the four patterns.' },
    },
  },
};

// ──────────────────────────────────────────────
// GALLERY — all patterns side by side
// ──────────────────────────────────────────────
export const Gallery: Story = {
  name: 'Gallery — All Patterns',
  render: () => ({
    template: `
      <div style="display:grid;grid-template-columns:1fr 1fr;width:100%;min-height:600px;">

        <!-- Mycelium Network — light -->
        <div style="position:relative;height:300px;background:#F7F5F0;display:flex;flex-direction:column;justify-content:flex-end;padding:1.5rem;overflow:hidden;border-right:1px solid #E8E5DE;border-bottom:1px solid #E8E5DE;">
          <div style="position:absolute;inset:0;opacity:0.13;color:#1B2D4A;pointer-events:none;">
            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" aria-hidden="true">
              <defs><pattern id="g-mycelium" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
                <g stroke="currentColor" fill="none" stroke-linecap="round">
                  <path d="M20,60 C35,52 45,68 60,55 C75,42 85,70 100,58" stroke-width="1.2"/>
                  <path d="M35,54 C30,42 22,38 14,28 C10,22 8,14 12,6" stroke-width="0.8"/>
                  <path d="M50,62 C48,72 40,80 36,92" stroke-width="0.7"/>
                  <path d="M60,10 C68,22 55,34 65,46 C72,54 80,48 88,56 C94,62 96,72 104,76" stroke-width="1.0"/>
                  <circle cx="60" cy="55" r="1.5" fill="currentColor" stroke="none"/>
                  <circle cx="88" cy="56" r="1.2" fill="currentColor" stroke="none"/>
                  <circle cx="50" cy="62" r="0.8" fill="currentColor" stroke="none"/>
                </g>
              </pattern></defs>
              <rect width="100%" height="100%" fill="url(#g-mycelium)"/>
            </svg>
          </div>
          <p style="font-family:'JetBrains Mono',monospace;font-size:0.6rem;letter-spacing:0.12em;color:#6B7064;margin:0 0 0.25rem;position:relative;z-index:1;">PATTERN 01</p>
          <p style="font-family:'Barlow Condensed',sans-serif;font-size:1.4rem;font-weight:700;text-transform:uppercase;color:#1B2D4A;margin:0;position:relative;z-index:1;">Mycelium Network</p>
        </div>

        <!-- Polyculture Grid — light -->
        <div style="position:relative;height:300px;background:#F7F5F0;display:flex;flex-direction:column;justify-content:flex-end;padding:1.5rem;overflow:hidden;border-bottom:1px solid #E8E5DE;">
          <div style="position:absolute;inset:0;opacity:0.1;color:#0A4B3E;pointer-events:none;">
            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" aria-hidden="true">
              <defs><pattern id="g-polyculture" x="0" y="0" width="160" height="140" patternUnits="userSpaceOnUse">
                <g stroke="currentColor" fill="none" stroke-width="0.9" stroke-linejoin="round">
                  <path d="M52,14 C64,10 82,18 88,30 C94,42 90,60 80,68 C70,76 52,74 42,64 C32,54 32,36 40,24 C44,18 48,16 52,14 Z"/>
                  <path d="M96,8 C106,6 118,12 122,22 C126,32 120,44 110,46 C100,48 90,40 88,30 C86,22 90,12 96,8 Z"/>
                  <path d="M10,10 C18,6 30,10 34,20 C38,30 32,42 22,44 C14,46 6,38 4,28 C2,18 6,12 10,10 Z"/>
                  <path d="M44,80 C54,74 70,76 76,88 C82,100 76,116 64,120 C52,124 40,116 36,104 C32,92 36,84 44,80 Z"/>
                  <path d="M90,76 C100,72 114,78 116,90 C118,100 110,112 100,112 C90,112 82,104 82,94 C82,84 84,80 90,76 Z"/>
                </g>
              </pattern></defs>
              <rect width="100%" height="100%" fill="url(#g-polyculture)"/>
            </svg>
          </div>
          <p style="font-family:'JetBrains Mono',monospace;font-size:0.6rem;letter-spacing:0.12em;color:#6B7064;margin:0 0 0.25rem;position:relative;z-index:1;">PATTERN 02</p>
          <p style="font-family:'Barlow Condensed',sans-serif;font-size:1.4rem;font-weight:700;text-transform:uppercase;color:#1B2D4A;margin:0;position:relative;z-index:1;">Polyculture Grid</p>
        </div>

        <!-- Leaf Venation — dark navy -->
        <div style="position:relative;height:300px;background:#1B2D4A;display:flex;flex-direction:column;justify-content:flex-end;padding:1.5rem;overflow:hidden;border-right:1px solid rgba(255,255,255,0.06);">
          <div style="position:absolute;inset:0;opacity:0.18;color:#F7F5F0;pointer-events:none;">
            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" aria-hidden="true">
              <defs><pattern id="g-leaf" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                <g stroke="currentColor" fill="none">
                  <path d="M 40 8 C 40 25, 40 45, 40 72" stroke-width="2" stroke-linecap="round"/>
                  <path d="M 40 18 C 48 20, 54 22, 58 26" stroke-width="1" stroke-linecap="round"/>
                  <path d="M 40 28 C 50 30, 56 32, 62 36" stroke-width="1" stroke-linecap="round"/>
                  <path d="M 40 38 C 50 38, 57 40, 62 44" stroke-width="1" stroke-linecap="round"/>
                  <path d="M 40 50 C 49 50, 55 52, 59 56" stroke-width="1" stroke-linecap="round"/>
                  <path d="M 40 18 C 32 20, 26 22, 22 26" stroke-width="1" stroke-linecap="round"/>
                  <path d="M 40 28 C 30 30, 24 32, 18 36" stroke-width="1" stroke-linecap="round"/>
                  <path d="M 40 38 C 30 38, 23 40, 18 44" stroke-width="1" stroke-linecap="round"/>
                  <path d="M 40 50 C 31 50, 25 52, 21 56" stroke-width="1" stroke-linecap="round"/>
                </g>
              </pattern></defs>
              <rect width="100%" height="100%" fill="url(#g-leaf)"/>
            </svg>
          </div>
          <p style="font-family:'JetBrains Mono',monospace;font-size:0.6rem;letter-spacing:0.12em;color:rgba(247,245,240,0.4);margin:0 0 0.25rem;position:relative;z-index:1;">PATTERN 03</p>
          <p style="font-family:'Barlow Condensed',sans-serif;font-size:1.4rem;font-weight:700;text-transform:uppercase;color:#F7F5F0;margin:0;position:relative;z-index:1;">Leaf Venation</p>
        </div>

        <!-- Water Ripple — dark navy -->
        <div style="position:relative;height:300px;background:#1B2D4A;display:flex;flex-direction:column;justify-content:flex-end;padding:1.5rem;overflow:hidden;">
          <div style="position:absolute;inset:0;opacity:0.16;color:#457B9D;pointer-events:none;">
            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" aria-hidden="true">
              <defs><pattern id="g-ripple" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                <g stroke="currentColor" fill="none">
                  <path d="M 30 25 C 37 24, 42 28, 42 35 C 42 42, 37 46, 30 46 C 23 46, 18 42, 18 35 C 18 28, 23 24, 30 25 Z" stroke-width="0.8" stroke-opacity="0.9"/>
                  <path d="M 30 17 C 41 15, 51 24, 51 35 C 51 46, 41 55, 30 55 C 19 55, 9 46, 9 35 C 9 24, 19 15, 30 17 Z" stroke-width="0.7" stroke-opacity="0.65"/>
                  <path d="M 30 8 C 46 5, 61 19, 61 35 C 61 51, 46 65, 30 65 C 14 65, -1 51, -1 35 C -1 19, 14 5, 30 8 Z" stroke-width="0.5" stroke-opacity="0.4"/>
                  <path d="M 72 60 C 78 59, 82 63, 82 68 C 82 73, 78 77, 72 77 C 66 77, 62 73, 62 68 C 62 63, 66 59, 72 60 Z" stroke-width="0.8" stroke-opacity="0.85"/>
                  <path d="M 72 52 C 82 50, 91 58, 91 68 C 91 78, 82 86, 72 86 C 62 86, 53 78, 53 68 C 53 58, 62 50, 72 52 Z" stroke-width="0.6" stroke-opacity="0.55"/>
                  <path d="M 72 43 C 86 40, 100 53, 100 68 C 100 83, 86 96, 72 96 C 58 96, 44 83, 44 68 C 44 53, 58 40, 72 43 Z" stroke-width="0.4" stroke-opacity="0.3"/>
                </g>
              </pattern></defs>
              <rect width="100%" height="100%" fill="url(#g-ripple)"/>
            </svg>
          </div>
          <p style="font-family:'JetBrains Mono',monospace;font-size:0.6rem;letter-spacing:0.12em;color:rgba(247,245,240,0.4);margin:0 0 0.25rem;position:relative;z-index:1;">PATTERN 04</p>
          <p style="font-family:'Barlow Condensed',sans-serif;font-size:1.4rem;font-weight:700;text-transform:uppercase;color:#F7F5F0;margin:0;position:relative;z-index:1;">Water Ripple</p>
        </div>

      </div>
    `,
  }),
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story:
          'All four active patterns at recommended defaults. Top row: warm cream background (light sections). Bottom row: deep navy (dark/hero sections). Root System and Growth Spiral patterns are planned.',
      },
    },
  },
};
