import type { Meta, StoryObj } from '@storybook/svelte';
import LeafVenation from '$lib/components/patterns/LeafVenation.svelte';
import MyceliumNetwork from '$lib/components/patterns/MyceliumNetwork.svelte';
import PolycultureGrid from '$lib/components/patterns/PolycultureGrid.svelte';
import WaterRipple from '$lib/components/patterns/WaterRipple.svelte';
import PatternGallery from './PatternGallery.svelte';

const patternArgTypes = {
	color: {
		control: { type: 'color' },
		description: 'CSS color value for the pattern strokes'
	},
	opacity: {
		control: { type: 'range', min: 0, max: 1, step: 0.01 },
		description: 'Pattern stroke opacity'
	},
	scale: {
		control: { type: 'range', min: 0.25, max: 4, step: 0.25 },
		description: 'Pattern tile size multiplier'
	},
	animate: {
		control: { type: 'boolean' },
		description: 'Enable ambient animation'
	}
};

const meta = {
	title: 'Design System/Patterns',
	component: MyceliumNetwork,
	tags: ['autodocs'],
	argTypes: patternArgTypes,
	args: {
		color: '#1B2D4A',
		opacity: 0.15,
		scale: 1,
		animate: false
	},
	parameters: {
		layout: 'fullscreen',
		docs: {
			description: {
				component:
					"Aevani's SVG pattern library for the polyculture visual system. All patterns share color, opacity, scale, and animate controls."
			}
		}
	}
} satisfies Meta<typeof MyceliumNetwork>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MyceliumNetworkLight: Story = {
	name: 'Mycelium Network — Light'
};

export const MyceliumNetworkDark: Story = {
	name: 'Mycelium Network — Dark',
	args: { color: '#F7F5F0', opacity: 0.2, scale: 1, animate: false }
};

export const MyceliumNetworkAnimated: Story = {
	name: 'Mycelium Network — Animated',
	args: { color: '#1B2D4A', opacity: 0.18, scale: 1, animate: true }
};

export const PolycultureGridLight: Story = {
	name: 'Polyculture Grid — Light',
	render: (args) => ({ Component: PolycultureGrid, props: args }),
	args: { color: '#0A4B3E', opacity: 0.12, scale: 1, animate: false }
};

export const PolycultureGridAnimated: Story = {
	name: 'Polyculture Grid — Animated',
	render: (args) => ({ Component: PolycultureGrid, props: args }),
	args: { color: '#0A4B3E', opacity: 0.15, scale: 1, animate: true }
};

export const PolycultureGridLarge: Story = {
	name: 'Polyculture Grid — Large Scale',
	render: (args) => ({ Component: PolycultureGrid, props: args }),
	args: { color: '#1B2D4A', opacity: 0.08, scale: 2, animate: false }
};

export const LeafVenationLight: Story = {
	name: 'Leaf Venation — Light',
	render: (args) => ({ Component: LeafVenation, props: args }),
	args: { color: '#1B2D4A', opacity: 0.1, scale: 1, animate: false }
};

export const LeafVenationGreen: Story = {
	name: 'Leaf Venation — Growth Green',
	render: (args) => ({ Component: LeafVenation, props: args }),
	args: { color: '#0A4B3E', opacity: 0.12, scale: 1, animate: false }
};

export const LeafVenationAnimated: Story = {
	name: 'Leaf Venation — Animated',
	render: (args) => ({ Component: LeafVenation, props: args }),
	args: { color: '#0A4B3E', opacity: 0.14, scale: 1, animate: true }
};

export const LeafVenationDense: Story = {
	name: 'Leaf Venation — Dense',
	render: (args) => ({ Component: LeafVenation, props: args }),
	args: { color: '#1B2D4A', opacity: 0.18, scale: 0.5, animate: false }
};

export const WaterRippleLight: Story = {
	name: 'Water Ripple — Light',
	render: (args) => ({ Component: WaterRipple, props: args }),
	args: { color: '#457B9D', opacity: 0.12, scale: 1, animate: false }
};

export const WaterRippleNavy: Story = {
	name: 'Water Ripple — Navy Background',
	render: (args) => ({ Component: WaterRipple, props: args }),
	args: { color: '#A8DADC', opacity: 0.18, scale: 1.5, animate: false }
};

export const WaterRippleAnimated: Story = {
	name: 'Water Ripple — Animated',
	render: (args) => ({ Component: WaterRipple, props: args }),
	args: { color: '#457B9D', opacity: 0.15, scale: 1, animate: true }
};

export const Gallery: Story = {
	name: 'Gallery — All Patterns',
	render: (args) => ({ Component: PatternGallery, props: args })
};
