import type { Meta, StoryObj } from '@storybook/svelte';
import DesignTokens from './DesignTokens.svelte';

const meta = {
  title: 'Design System/Tokens',
  component: DesignTokens,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Visual reference for all Aevani design tokens: color palette, typography scale, spacing, border radii, and shadows. Use this story as a living style guide during development.',
      },
    },
  },
} satisfies Meta<typeof DesignTokens>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllTokens: Story = {};
