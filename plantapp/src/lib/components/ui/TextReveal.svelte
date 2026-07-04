<script lang="ts">
	type Mode = 'fade-up' | 'typewriter';

	interface Props {
		text: string;
		mode?: Mode;
		duration?: number;
		delay?: number;
		triggerOnMount?: boolean;
		class?: string;
		oncomplete?: () => void;
	}

	let {
		text,
		mode = 'fade-up',
		duration = 800,
		delay = 0,
		triggerOnMount = true,
		class: className = '',
		oncomplete
	}: Props = $props();

	let visible = $state(false);
	let done = $state(false);

	// Typewriter state
	let display = $state('');

	function typewriter() {
		const target = text;
		const perChar = duration / target.length;
		let i = 0;

		function step() {
			i++;
			display = target.slice(0, i);
			if (i < target.length) {
				setTimeout(step, perChar);
			} else {
				done = true;
				oncomplete?.();
			}
		}

		setTimeout(() => {
			display = '';
			step();
		}, delay);
	}

	$effect(() => {
		const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (prefersReduced) {
			display = text;
			visible = true;
			done = true;
			oncomplete?.();
			return;
		}

		if (triggerOnMount) {
			if (mode === 'fade-up') {
				display = text;
				setTimeout(() => {
					visible = true;
					// Fire complete after the CSS transition finishes
					setTimeout(() => {
						done = true;
						oncomplete?.();
					}, duration);
				}, delay);
			} else {
				typewriter();
			}
		} else {
			display = '';
		}
	});
</script>

<span class="text-reveal {className}" class:text-reveal--visible={visible} style="--reveal-duration: {duration}ms">
	<span aria-hidden="true">{display}</span>
	<span class="sr-only">{text}</span>
</span>

<style>
	.text-reveal {
		display: inline-block;
		opacity: 0;
		transform: translateY(0.35em);
		filter: blur(4px);
		transition:
			opacity var(--reveal-duration, 800ms) cubic-bezier(0.16, 1, 0.3, 1),
			transform var(--reveal-duration, 800ms) cubic-bezier(0.16, 1, 0.3, 1),
			filter var(--reveal-duration, 800ms) cubic-bezier(0.16, 1, 0.3, 1);
	}

	.text-reveal--visible {
		opacity: 1;
		transform: translateY(0);
		filter: blur(0);
	}
</style>
