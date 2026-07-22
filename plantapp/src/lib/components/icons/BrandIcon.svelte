<script module lang="ts">
	export type BrandIconName = 'facebook' | 'instagram' | 'x';

	const BRAND_PATHS: Record<BrandIconName, string> = {
		facebook:
			'M13.5 22v-8h2.75l.4-3H13.5V9.1c0-.87.24-1.47 1.58-1.47h1.69V4.95c-.29-.04-1.3-.13-2.47-.13-2.44 0-4.12 1.49-4.12 4.23V11H7.42v3h2.76v8h3.32Z',
		instagram:
			'M7.75 2h8.5A5.76 5.76 0 0 1 22 7.75v8.5A5.76 5.76 0 0 1 16.25 22h-8.5A5.76 5.76 0 0 1 2 16.25v-8.5A5.76 5.76 0 0 1 7.75 2Zm0 2A3.75 3.75 0 0 0 4 7.75v8.5A3.75 3.75 0 0 0 7.75 20h8.5A3.75 3.75 0 0 0 20 16.25v-8.5A3.75 3.75 0 0 0 16.25 4h-8.5Zm8.75 1.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z',
		x: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z'
	};
</script>

<script lang="ts">
	import type { IconSize } from './Icon.svelte';

	interface Props {
		name: BrandIconName;
		size?: IconSize;
		label?: string;
		class?: string;
	}

	let { name, size = 24, label, class: className = '' }: Props = $props();
</script>

<svg
	viewBox="0 0 24 24"
	width={size}
	height={size}
	fill="currentColor"
	class={className}
	role={label ? 'img' : undefined}
	aria-label={label}
	aria-hidden={label ? undefined : 'true'}
	focusable="false"
>
	<path d={BRAND_PATHS[name]} />
</svg>
