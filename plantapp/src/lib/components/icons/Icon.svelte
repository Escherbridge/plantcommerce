<script module lang="ts">
	export type IconName =
		| 'alert-circle'
		| 'alert-triangle'
		| 'arrow-left'
		| 'arrow-right'
		| 'audio'
		| 'award'
		| 'bar-chart'
		| 'bell'
		| 'book-open'
		| 'briefcase'
		| 'calendar'
		| 'check'
		| 'check-circle'
		| 'chevron-down'
		| 'chevron-left'
		| 'chevron-right'
		| 'chevron-up'
		| 'circle'
		| 'clipboard-list'
		| 'clock'
		| 'code'
		| 'copy'
		| 'dollar-circle'
		| 'download'
		| 'external-link'
		| 'file'
		| 'file-download'
		| 'gift'
		| 'globe'
		| 'graduation-cap'
		| 'grid'
		| 'heart'
		| 'help-circle'
		| 'home'
		| 'hospital'
		| 'image'
		| 'link'
		| 'lightbulb'
		| 'list'
		| 'lock'
		| 'log-out'
		| 'mail'
		| 'maintenance'
		| 'map-pin'
		| 'menu'
		| 'message-circle'
		| 'moon'
		| 'package'
		| 'pause'
		| 'play'
		| 'play-circle'
		| 'plus'
		| 'presentation'
		| 'search'
		| 'settings'
		| 'shield-check'
		| 'shopping-bag'
		| 'shopping-cart'
		| 'sparkle'
		| 'sprout'
		| 'store'
		| 'sun'
		| 'trending-up'
		| 'upload'
		| 'upload-cloud'
		| 'user'
		| 'users'
		| 'video'
		| 'wrench'
		| 'x'
		| 'zap';

	export type IconSize = 12 | 14 | 16 | 20 | 24 | 28 | 32 | 40 | 48 | 64 | 80 | 96;

	const ICON_PATHS: Record<IconName, readonly string[]> = {
		'alert-circle': ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', 'M12 8v5', 'M12 17h.01'],
		'alert-triangle': [
			'M10.3 3.9 2.8 17a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z',
			'M12 9v4',
			'M12 17h.01'
		],
		'arrow-left': ['M19 12H5', 'm11 18-6-6 6-6'],
		'arrow-right': ['M5 12h14', 'm13 6 6 6-6 6'],
		audio: ['M11 5 6 9H3v6h3l5 4V5Z', 'M15.5 8.5a5 5 0 0 1 0 7', 'M18 6a8 8 0 0 1 0 12'],
		award: ['M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z', 'm8.5 14.5-1 7 4.5-2 4.5 2-1-7'],
		'bar-chart': ['M4 20h16', 'M7 16V9', 'M12 16V4', 'M17 16v-5'],
		bell: ['M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9', 'M14 21h-4'],
		'book-open': [
			'M3.5 5.5h5.25A3.25 3.25 0 0 1 12 8.75V21a3.25 3.25 0 0 0-3.25-3.25H3.5V5.5Z',
			'M20.5 5.5h-5.25A3.25 3.25 0 0 0 12 8.75V21a3.25 3.25 0 0 1 3.25-3.25h5.25V5.5Z'
		],
		briefcase: ['M4 8h16v12H4V8Z', 'M9 8V5h6v3', 'M4 13h16', 'M12 12v2'],
		calendar: ['M4 5.5h16v15H4v-15Z', 'M8 3v5', 'M16 3v5', 'M4 10h16'],
		check: ['m5 12 4 4L19 6'],
		'check-circle': ['M21 11.1V12a9 9 0 1 1-5.3-8.2', 'm21 4-10 10-3-3'],
		'chevron-down': ['m6 9 6 6 6-6'],
		'chevron-left': ['m15 18-6-6 6-6'],
		'chevron-right': ['m9 6 6 6-6 6'],
		'chevron-up': ['m18 15-6-6-6 6'],
		circle: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z'],
		'clipboard-list': [
			'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2',
			'M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2 2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2Z',
			'M9 12h6',
			'M9 16h4'
		],
		clock: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', 'M12 7v5l3 2'],
		code: ['m8 9-3 3 3 3', 'm16 9 3 3-3 3', 'm14 5-4 14'],
		copy: ['M8 8h11v12H8V8Z', 'M16 8V4H4v12h4'],
		'dollar-circle': [
			'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z',
			'M12 6v12',
			'M15.5 8.5H10a2 2 0 0 0 0 4h4a2 2 0 0 1 0 4H8.5'
		],
		download: ['M12 3v12', 'm7 10 5 5 5-5', 'M5 21h14'],
		'external-link': ['M14 5h5v5', 'm10 14 9-9', 'M19 14v5H5V5h5'],
		file: ['M6 3h8l4 4v14H6V3Z', 'M14 3v5h4'],
		'file-download': ['M6 3h8l4 4v14H6V3Z', 'M14 3v5h4', 'M12 11v6', 'm9 14 3 3 3-3'],
		gift: [
			'M4 9h16v12H4V9Z',
			'M2.5 6h19v3h-19V6Z',
			'M12 6v15',
			'M12 6H8.5A2.5 2.5 0 1 1 11 3.5C12 5 12 6 12 6Z',
			'M12 6h3.5A2.5 2.5 0 1 0 13 3.5C12 5 12 6 12 6Z'
		],
		globe: [
			'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z',
			'M3 12h18',
			'M12 3a14 14 0 0 1 0 18',
			'M12 3a14 14 0 0 0 0 18'
		],
		'graduation-cap': [
			'm2.5 9 9.5-5 9.5 5-9.5 5-9.5-5Z',
			'M6 11v5.5c3.7 2.3 8.3 2.3 12 0V11',
			'M21.5 9v6'
		],
		grid: ['M4 4h6v6H4V4Z', 'M14 4h6v6h-6V4Z', 'M4 14h6v6H4v-6Z', 'M14 14h6v6h-6v-6Z'],
		heart: [
			'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8Z'
		],
		'help-circle': [
			'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z',
			'M9.5 9a2.7 2.7 0 1 1 4.4 2.1c-1.1.8-1.9 1.3-1.9 2.9',
			'M12 17h.01'
		],
		home: ['m3 10 9-7 9 7v10H3V10Z', 'M9 20v-6h6v6'],
		hospital: ['M4 3h16v18H4V3Z', 'M12 7v10', 'M7 12h10'],
		image: [
			'M4 4h16v16H4V4Z',
			'M8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z',
			'm4 17 4-4 3 3 4-5 5 6'
		],
		link: [
			'M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.8 1.7',
			'M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.8-1.7'
		],
		lightbulb: [
			'M9 18h6',
			'M10 22h4',
			'M8.2 14.5a7 7 0 1 1 7.6 0c-.8.6-.8 1.5-.8 2.5H9c0-1 0-1.9-.8-2.5Z'
		],
		list: ['M8 6h13', 'M8 12h13', 'M8 18h13', 'M3 6h.01', 'M3 12h.01', 'M3 18h.01'],
		lock: ['M5 10h14v11H5V10Z', 'M8 10V7a4 4 0 0 1 8 0v3'],
		'log-out': ['M10 4H6a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h4', 'M14 8l4 4-4 4', 'M18 12H8'],
		mail: ['M3 5h18v14H3V5Z', 'm3 5 9 7 9-7'],
		maintenance: [
			'M20 7h-5V2',
			'M4 17h5v5',
			'M6.1 8.1A7 7 0 0 1 18.8 6L20 7',
			'M17.9 15.9A7 7 0 0 1 5.2 18L4 17',
			'M12 14.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z'
		],
		'map-pin': [
			'M12 22s7-7.2 7-13a7 7 0 1 0-14 0c0 5.8 7 13 7 13Z',
			'M12 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z'
		],
		menu: ['M4 6h16', 'M4 12h16', 'M4 18h16'],
		'message-circle': [
			'M20.5 11.5a8 8 0 0 1-9 8 8.6 8.6 0 0 1-3.2-.8L3 21l2.3-5.3a8.6 8.6 0 0 1-.8-3.2 8 8 0 0 1 8-9 8 8 0 0 1 8 8Z',
			'M8.5 12h7',
			'M8.5 8.5h4'
		],
		moon: ['M20.5 14.1A8.5 8.5 0 0 1 9.9 3.5a8.5 8.5 0 1 0 10.6 10.6Z'],
		package: ['m3 7 9-4 9 4-9 4-9-4Z', 'M3 7v10l9 4 9-4V7', 'M12 11v10'],
		pause: ['M9 7v10', 'M15 7v10'],
		play: ['m9 7 8 5-8 5V7Z'],
		'play-circle': ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', 'm10 8 6 4-6 4V8Z'],
		plus: ['M12 5v14', 'M5 12h14'],
		presentation: ['M4 4h16v12H4V4Z', 'M8 21l4-5 4 5'],
		search: ['M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13Z', 'm15.5 15.5 5 5'],
		settings: [
			'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
			'M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1-2.9 2.9-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5v.1h-4v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1-2.9-2.9.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3v-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1 2.9-2.9.1.1a1.7 1.7 0 0 0 1.8.3 1.7 1.7 0 0 0 1-1.5V3h4v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1 2.9 2.9-.1.1a1.7 1.7 0 0 0-.3 1.8 1.7 1.7 0 0 0 1.5 1h.1v4h-.1a1.7 1.7 0 0 0-1.5 1Z'
		],
		'shield-check': [
			'M12 22c5.2-1.3 9-6 9-11.6V6.8A12 12 0 0 1 12 3a12 12 0 0 1-9 3.8v3.6C3 16 6.8 20.7 12 22Z',
			'm8.5 12 2.2 2.2 4.8-4.8'
		],
		'shopping-bag': ['M6 8h12l2 13H4L6 8Z', 'M9 9V6a3 3 0 0 1 6 0v3'],
		'shopping-cart': ['M3 4h2l2.5 11h11l2-8H6', 'M9 20h.01', 'M18 20h.01'],
		sparkle: [
			'm12 2 1.6 4.4L18 8l-4.4 1.6L12 14l-1.6-4.4L6 8l4.4-1.6L12 2Z',
			'm19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z'
		],
		sprout: [
			'M12 21v-9',
			'M12 13C7.5 13 5 10.5 5 6c4.5 0 7 2.5 7 7Z',
			'M12 10c0-4.5 2.5-7 7-7 0 4.5-2.5 7-7 7Z'
		],
		store: ['M3 9h18', 'm4 9 1-5h14l1 5', 'M5 9v11h14V9', 'M9 20v-6h6v6'],
		sun: [
			'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
			'M12 2v2',
			'M12 20v2',
			'm4.9 4.9 1.4 1.4',
			'm17.7 17.7 1.4 1.4',
			'M2 12h2',
			'M20 12h2',
			'm4.9 19.1 1.4-1.4',
			'm17.7 6.3 1.4-1.4'
		],
		'trending-up': ['m3 17 6-6 4 4 8-8', 'M14 7h7v7'],
		upload: ['M12 16V3', 'm7 8 5-5 5 5', 'M5 21h14'],
		'upload-cloud': [
			'M16 16h2a4 4 0 0 0 .8-7.9A6 6 0 0 0 7.2 7 4.5 4.5 0 0 0 7 16h2',
			'M12 21V11',
			'm8.5 14.5 3.5-3.5 3.5 3.5'
		],
		user: ['M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M4 21v-1a8 8 0 0 1 16 0v1'],
		users: [
			'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
			'M1 21v-2a6 6 0 0 1 12 0v2',
			'M17 11a4 4 0 0 0 0-8',
			'M23 21v-2a6 6 0 0 0-4-5.7'
		],
		video: ['M3 5h13.5v14H3V5Z', 'm10 9 4 3-4 3V9Z', 'm16.5 10 4.5-2.5v9L16.5 14'],
		wrench: [
			'M14.7 6.3a4.5 4.5 0 0 0-5.5 5.5L3 18l3 3 6.2-6.2a4.5 4.5 0 0 0 5.5-5.5l-3 3-3-3 3-3Z'
		],
		x: ['M6 6l12 12', 'M18 6 6 18'],
		zap: ['m13 2-9 12h7l-1 8 9-12h-7l1-8Z']
	};
</script>

<script lang="ts">
	interface Props {
		name: IconName;
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
	fill="none"
	stroke="currentColor"
	stroke-width="1.75"
	stroke-linecap="round"
	stroke-linejoin="round"
	class={className}
	role={label ? 'img' : undefined}
	aria-label={label}
	aria-hidden={label ? undefined : 'true'}
	focusable="false"
>
	{#each ICON_PATHS[name] as path}
		<path d={path} />
	{/each}
</svg>
