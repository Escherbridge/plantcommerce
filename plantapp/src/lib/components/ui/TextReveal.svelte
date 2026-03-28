<script lang="ts">
	type Mode = 'scramble' | 'typewriter';

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
		mode = 'scramble',
		duration = 1200,
		delay = 0,
		triggerOnMount = true,
		class: className = '',
		oncomplete
	}: Props = $props();

	const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';

	let display = $state('');
	let done = $state(false);

	function rand(n: number) {
		return Math.floor(Math.random() * n);
	}

	function scramble() {
		const target = text;
		const len = target.length;
		const start = performance.now() + delay;
		const end = start + duration;

		// How many chars are "locked" grows linearly over time
		function frame(now: number) {
			if (now < start) {
				display = Array.from({ length: len }, () => CHARSET[rand(CHARSET.length)]).join('');
				requestAnimationFrame(frame);
				return;
			}
			const elapsed = now - start;
			const progress = Math.min(elapsed / duration, 1);
			const lockedCount = Math.floor(progress * len);

			let result = '';
			for (let i = 0; i < len; i++) {
				if (i < lockedCount) {
					result += target[i];
				} else {
					result += CHARSET[rand(CHARSET.length)];
				}
			}
			display = result;

			if (progress < 1) {
				requestAnimationFrame(frame);
			} else {
				display = target;
				done = true;
				oncomplete?.();
			}
		}

		requestAnimationFrame(frame);
	}

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
			done = true;
			oncomplete?.();
			return;
		}

		if (triggerOnMount) {
			if (mode === 'scramble') {
				scramble();
			} else {
				typewriter();
			}
		} else {
			display = '';
		}
	});
</script>

<span class={className}>
	<span aria-hidden="true">{display}</span>
	<span class="sr-only">{text}</span>
</span>
