<script lang="ts">
	// Aevani leaf-mark logo. See spec §3 for the canonical SVG paths.
	import { leafMarkSvg, type LeafMarkVariant } from '$lib/brand/leafMark';

	interface Props {
		size?: number;
		variant?: LeafMarkVariant;
		class?: string;
	}

	let { size = 36, variant = 'light', class: className = '' }: Props = $props();
	const markup = $derived(leafMarkSvg({ size, variant, className }));
</script>

{@html markup}
