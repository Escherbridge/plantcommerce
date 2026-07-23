<script lang="ts">
	// Aevani leaf-mark logo. See spec §3 for the canonical SVG paths.
	interface Props {
		size?: number;
		variant?: 'light' | 'dark';
		class?: string;
	}

	let { size = 36, variant = 'light', class: className = '' }: Props = $props();

	const isDark = $derived(variant === 'dark');
	// Light: forest square, cream stem, mint + cream leaves.
	// Dark (footer): mint square, deep stem, deep + green leaves.
	const rectFill = $derived(isDark ? '#8FD8B4' : '#1C3527');
	const stemStroke = $derived(isDark ? '#14261B' : '#F4F1EA');
	const leafPrimary = $derived(isDark ? '#14261B' : '#8FD8B4');
	const leafSecondary = $derived(isDark ? '#1E4A36' : '#F4F1EA');
</script>

<svg
	class={className}
	width={size}
	height={size}
	viewBox="0 0 48 48"
	fill="none"
	role="img"
	aria-label="Aevani"
	xmlns="http://www.w3.org/2000/svg"
>
	<rect width="48" height="48" rx="13" fill={rectFill} />
	<path d="M24 38 V21" stroke={stemStroke} stroke-width="2.6" stroke-linecap="round" fill="none" />
	<path
		d="M24.5 22.5 C24.5 14.5 30 10 37.5 9.5 C37.5 17.5 32 22.5 24.5 22.5 Z"
		fill={leafPrimary}
	/>
	<path
		d="M23.5 28 C23.5 21.8 19.3 18.5 13.5 18 C13.5 24.2 17.7 28 23.5 28 Z"
		fill={leafSecondary}
	/>
</svg>
