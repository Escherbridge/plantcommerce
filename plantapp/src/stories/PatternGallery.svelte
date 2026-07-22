<script lang="ts">
	import LeafVenation from '$lib/components/patterns/LeafVenation.svelte';
	import MyceliumNetwork from '$lib/components/patterns/MyceliumNetwork.svelte';
	import PolycultureGrid from '$lib/components/patterns/PolycultureGrid.svelte';
	import WaterRipple from '$lib/components/patterns/WaterRipple.svelte';

	let {
		color = 'currentColor',
		opacity = 1,
		scale = 1,
		animate = false
	}: {
		color?: string;
		opacity?: number;
		scale?: number;
		animate?: boolean;
	} = $props();

	const patternProps = $derived({ color, opacity, scale, animate });
</script>

<div class="pattern-gallery">
	<article class="pattern-card pattern-card--light">
		<div class="pattern-canvas"><MyceliumNetwork {...patternProps} /></div>
		<p>Mycelium Network</p>
	</article>
	<article class="pattern-card pattern-card--light">
		<div class="pattern-canvas"><PolycultureGrid {...patternProps} /></div>
		<p>Polyculture Grid</p>
	</article>
	<article class="pattern-card pattern-card--dark">
		<div class="pattern-canvas"><LeafVenation {...patternProps} /></div>
		<p>Leaf Venation</p>
	</article>
	<article class="pattern-card pattern-card--dark">
		<div class="pattern-canvas"><WaterRipple {...patternProps} /></div>
		<p>Water Ripple</p>
	</article>
</div>

<style>
	.pattern-gallery {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		min-height: 600px;
	}

	.pattern-card {
		position: relative;
		min-height: 300px;
		overflow: hidden;
		padding: 1.5rem;
	}

	.pattern-card--light {
		background: #f7f5f0;
		color: #1b2d4a;
	}

	.pattern-card--dark {
		background: #1b2d4a;
		color: #f7f5f0;
	}

	.pattern-canvas {
		position: absolute;
		inset: 0;
		opacity: 0.16;
	}

	p {
		position: relative;
		margin: 0;
		font-family: 'Barlow Condensed', sans-serif;
		font-size: 1.4rem;
		font-weight: 700;
		text-transform: uppercase;
	}
</style>
