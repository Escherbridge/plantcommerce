<script lang="ts">
	import TextReveal from './TextReveal.svelte';

	interface CtaLink {
		label: string;
		href: string;
		variant: 'primary' | 'outline';
	}

	interface Props {
		title?: string;
		subtitle?: string;
		backgroundImage?: string;
		ctaLinks?: CtaLink[];
	}

	let {
		title = 'AEVANI',
		subtitle = 'From monoculture to polyculture',
		backgroundImage = '',
		ctaLinks = []
	}: Props = $props();

	let heroEl: HTMLElement;
	let bgEl: HTMLElement;
	let scrollY = $state(0);
	let titleDone = $state(false);
	let subtitleVisible = $state(false);
	let ctaVisible = $state(false);
	let scrollIndicatorVisible = $state(true);
	let isMobile = $state(false);
	let prefersReduced = $state(false);

	const subtitleWords = $derived(subtitle.split(' '));

	function onTitleComplete() {
		titleDone = true;
		setTimeout(() => {
			subtitleVisible = true;
			setTimeout(() => {
				ctaVisible = true;
			}, subtitleWords.length * 80 + 200);
		}, 100);
	}

	$effect(() => {
		prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		isMobile = window.innerWidth < 768;

		if (prefersReduced) {
			titleDone = true;
			subtitleVisible = true;
			ctaVisible = true;
		}

		const handleResize = () => {
			isMobile = window.innerWidth < 768;
		};

		const handleScroll = () => {
			scrollY = window.scrollY;
			if (scrollY > 10) scrollIndicatorVisible = false;
			if (!isMobile && bgEl && !prefersReduced) {
				bgEl.style.transform = `translate3d(0, ${scrollY * 0.3}px, 0)`;
			}
		};

		window.addEventListener('scroll', handleScroll, { passive: true });
		window.addEventListener('resize', handleResize, { passive: true });

		return () => {
			window.removeEventListener('scroll', handleScroll);
			window.removeEventListener('resize', handleResize);
		};
	});
</script>

<section
	bind:this={heroEl}
	class="relative overflow-hidden min-h-svh flex flex-col items-center justify-center"
	aria-label="Hero section"
>
	<!-- Background image with parallax -->
	{#if backgroundImage}
		<div
			class="absolute inset-0"
			style="will-change: transform; z-index: 1;"
		>
			<img
				bind:this={bgEl}
				src={backgroundImage}
				alt=""
				aria-hidden="true"
				loading="eager"
				class="w-full h-[115%] object-cover object-center"
				style="will-change: transform;"
			/>
		</div>
	{/if}

	<!-- Dark overlay for text contrast + bottom fade to base-100 -->
	<div
		class="absolute inset-0 pointer-events-none"
		style="background: linear-gradient(to bottom, rgba(27,45,74,0.3) 0%, rgba(27,45,74,0.2) 50%, rgba(27,45,74,0.35) 78%, rgba(247,245,240,0.9) 93%, rgba(247,245,240,1) 100%); z-index: 2;"
	></div>

	<!-- Content -->
	<div class="relative flex flex-col items-center text-center px-6 gap-6 w-full max-w-7xl mx-auto text-white" style="z-index: 3;">
		<!-- Title -->
		<h1 class="text-hero font-display uppercase tracking-tight leading-none m-0"
			style="font-size: clamp(3rem, 10vw, 10rem);"
		>
			<TextReveal
				text={title}
				mode="fade-up"
				duration={900}
				oncomplete={onTitleComplete}
			/>
		</h1>

		<!-- Subtitle: staggered word reveal -->
		<p class="text-heading-2 font-sans max-w-xl" aria-label={subtitle}>
			{#each subtitleWords as word, i}
				<span
					aria-hidden="true"
					class="inline-block mr-[0.25em]"
					style="
						opacity: {subtitleVisible || prefersReduced ? 1 : 0};
						transform: {subtitleVisible || prefersReduced ? 'translateY(0)' : 'translateY(16px)'};
						transition: opacity 500ms var(--ease-out-expo, cubic-bezier(0.16, 1, 0.3, 1)) {i * 80}ms,
						            transform 500ms var(--ease-out-expo, cubic-bezier(0.16, 1, 0.3, 1)) {i * 80}ms;
					"
				>{word}</span>
			{/each}
			<span class="sr-only">{subtitle}</span>
		</p>

		<!-- CTA buttons -->
		{#if ctaLinks.length > 0}
			<div
				class="flex flex-wrap gap-4 justify-center"
				style="
					opacity: {ctaVisible || prefersReduced ? 1 : 0};
					transform: {ctaVisible || prefersReduced ? 'translateY(0)' : 'translateY(20px)'};
					transition: opacity 600ms var(--ease-out-expo, cubic-bezier(0.16, 1, 0.3, 1)),
					            transform 600ms var(--ease-out-expo, cubic-bezier(0.16, 1, 0.3, 1));
				"
			>
				{#each ctaLinks as cta}
					<a
						href={cta.href}
						class={cta.variant === 'primary' ? 'btn btn-primary' : 'btn btn-outline border-white/40 text-white hover:bg-white/10 hover:border-white/60'}
					>
						{cta.label}
					</a>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Scroll indicator -->
	{#if scrollIndicatorVisible}
		<div
			class="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/60"
			style="z-index: 3;"
			aria-hidden="true"
		>
			<span class="text-xs font-mono uppercase tracking-widest">Scroll</span>
			<svg
				class="scroll-chevron w-5 h-5"
				viewBox="0 0 20 20"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<polyline points="4 7 10 13 16 7" />
			</svg>
		</div>
	{/if}
</section>

<style>
	.scroll-chevron {
		animation: chevron-pulse 1.6s ease-in-out infinite;
	}

	@keyframes chevron-pulse {
		0%, 100% { transform: translateY(0); opacity: 0.6; }
		50% { transform: translateY(4px); opacity: 1; }
	}

	@media (prefers-reduced-motion: reduce) {
		.scroll-chevron {
			animation: none;
		}
	}
</style>
