<script lang="ts">
	import type { Snippet } from 'svelte';

	type Animation = 'fade-up' | 'fade-in' | 'slide-left' | 'slide-right' | 'scale-up' | 'stagger-children';

	interface Props {
		animation?: Animation;
		delay?: number;
		duration?: number;
		threshold?: number;
		once?: boolean;
		children: Snippet;
	}

	let {
		animation = 'fade-up',
		delay = 0,
		duration = 600,
		threshold = 0.15,
		once = true,
		children
	}: Props = $props();

	let container: HTMLElement;
	let revealed = $state(false);

	const INITIAL_TRANSFORMS: Record<Animation, string> = {
		'fade-up': 'translateY(40px)',
		'fade-in': 'none',
		'slide-left': 'translateX(-40px)',
		'slide-right': 'translateX(40px)',
		'scale-up': 'scale(0.92)',
		'stagger-children': 'translateY(40px)'
	};

	$effect(() => {
		const el = container;
		if (!el) return;

		// prefers-reduced-motion: reveal immediately
		const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (prefersReduced) {
			revealed = true;
			applyRevealed(el);
			return;
		}

		applyHidden(el);

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						revealed = true;
						applyRevealed(el);
						if (once) observer.disconnect();
					} else if (!once) {
						revealed = false;
						applyHidden(el);
					}
				}
			},
			{ threshold }
		);

		observer.observe(el);
		return () => observer.disconnect();
	});

	function applyHidden(el: HTMLElement) {
		if (animation === 'stagger-children') {
			const children = Array.from(el.children) as HTMLElement[];
			for (const child of children) {
				child.style.opacity = '0';
				child.style.transform = INITIAL_TRANSFORMS['stagger-children'];
				child.style.transition = 'none';
			}
		} else {
			el.style.opacity = '0';
			el.style.transform = INITIAL_TRANSFORMS[animation];
			el.style.transition = 'none';
		}
	}

	function applyRevealed(el: HTMLElement) {
		const easing = 'var(--ease-out-expo, cubic-bezier(0.16, 1, 0.3, 1))';

		if (animation === 'stagger-children') {
			const kids = Array.from(el.children) as HTMLElement[];
			for (let i = 0; i < kids.length; i++) {
				const child = kids[i];
				const childDelay = delay + i * 100;
				// Use requestAnimationFrame to ensure transition fires after hidden state
				requestAnimationFrame(() => {
					child.style.transition = `opacity ${duration}ms ${easing} ${childDelay}ms, transform ${duration}ms ${easing} ${childDelay}ms`;
					child.style.opacity = '1';
					child.style.transform = 'none';
				});
			}
		} else {
			requestAnimationFrame(() => {
				el.style.transition = `opacity ${duration}ms ${easing} ${delay}ms, transform ${duration}ms ${easing} ${delay}ms`;
				el.style.opacity = '1';
				el.style.transform = 'none';
			});
		}
	}
</script>

<div bind:this={container}>
	{@render children()}
</div>
