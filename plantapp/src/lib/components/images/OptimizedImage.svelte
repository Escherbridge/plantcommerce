<script lang="ts">
	import { onMount } from 'svelte';
	import { Icon } from '$lib/components/icons';

	interface Props {
		src: string;
		alt: string;
		width?: number;
		height?: number;
		sizes?: string;
		loading?: 'eager' | 'lazy';
		placeholder?: 'blur' | 'empty';
		blurDataUrl?: string;
		className?: string;
		containerClassName?: string;
		aspectRatio?: 'square' | 'video' | 'portrait' | 'landscape' | string;
		objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
		quality?: number;
		formats?: ('webp' | 'avif' | 'jpg' | 'png')[];
		onLoad?: () => void;
		onError?: () => void;
	}

	let {
		src,
		alt,
		width,
		height,
		sizes = '100vw',
		loading = 'lazy',
		placeholder = 'blur',
		blurDataUrl,
		className = '',
		containerClassName = '',
		aspectRatio,
		objectFit = 'cover',
		quality = 75,
		formats = ['webp', 'jpg'],
		onLoad,
		onError
	}: Props = $props();

	let imageElement: HTMLImageElement = $state()!;
	let isLoaded = $state(false);
	let hasError = $state(false);
	let isIntersecting = $state(false);

	// Create optimized src URLs for different formats
	function createOptimizedUrl(originalSrc: string, format: string, q: number = quality): string {
		// This would typically integrate with your image optimization service
		// For now, returning the original src as a fallback
		return originalSrc;
	}

	// Generate srcset for responsive images
	function generateSrcSet(): string {
		if (!width) return '';

		const breakpoints = [320, 640, 768, 1024, 1280, 1536];
		const srcset = breakpoints
			.filter((bp) => bp <= (width || 1536))
			.map((bp) => {
				const optimizedSrc = createOptimizedUrl(src, 'webp', quality);
				return `${optimizedSrc} ${bp}w`;
			})
			.join(', ');

		return srcset;
	}

	// Handle image load
	function handleLoad() {
		isLoaded = true;
		onLoad?.();
	}

	// Handle image error
	function handleError() {
		hasError = true;
		onError?.();
	}

	// Lazy loading with Intersection Observer
	onMount(() => {
		if (loading === 'eager') {
			isIntersecting = true;
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				const entry = entries[0];
				if (entry.isIntersecting) {
					isIntersecting = true;
					observer.disconnect();
				}
			},
			{
				rootMargin: '50px'
			}
		);

		if (imageElement) {
			observer.observe(imageElement);
		}

		return () => {
			observer.disconnect();
		};
	});

	// Aspect ratio classes
	const aspectRatioClass = $derived(getAspectRatioClass());

	function getAspectRatioClass(): string {
		if (!aspectRatio) return '';

		const ratioMap: Record<string, string> = {
			square: 'aspect-square',
			video: 'aspect-video',
			portrait: 'aspect-[3/4]',
			landscape: 'aspect-[4/3]'
		};

		return ratioMap[aspectRatio] || aspectRatio;
	}

	// Object fit classes
	const objectFitClass = $derived(`object-${objectFit}`);

	// Show placeholder while loading
	const showPlaceholder = $derived(!isLoaded && !hasError && placeholder === 'blur');
</script>

<div class="relative overflow-hidden {aspectRatioClass} {containerClassName}">
	{#if showPlaceholder && blurDataUrl}
		<!-- Blur placeholder -->
		<img
			src={blurDataUrl}
			alt=""
			class="absolute inset-0 h-full w-full {objectFitClass} filter scale-110 blur-sm transition-opacity duration-300
        {isLoaded ? 'opacity-0' : 'opacity-100'}"
			aria-hidden="true"
		/>
	{:else if showPlaceholder}
		<!-- Default placeholder -->
		<div class="absolute inset-0 flex animate-pulse items-center justify-center bg-base-200">
			<Icon name="image" size={48} class="text-base-content/20" />
		</div>
	{/if}

	{#if hasError}
		<!-- Error state -->
		<div class="absolute inset-0 flex flex-col items-center justify-center bg-base-200">
			<Icon name="alert-triangle" size={48} class="mb-2 text-error" />
			<span class="text-sm text-base-content/60">Failed to load image</span>
		</div>
	{:else if isIntersecting || loading === 'eager'}
		<!-- Main image with modern formats support -->
		<picture>
			{#each formats as format}
				{#if format === 'webp'}
					<source srcset={generateSrcSet()} {sizes} type="image/webp" />
				{:else if format === 'avif'}
					<source srcset={generateSrcSet()} {sizes} type="image/avif" />
				{/if}
			{/each}

			<img
				bind:this={imageElement}
				{src}
				{alt}
				{width}
				{height}
				{sizes}
				srcset={generateSrcSet()}
				{loading}
				class="h-full w-full {objectFitClass} transition-opacity duration-300 {className}
          {isLoaded ? 'opacity-100' : 'opacity-0'}"
				onload={handleLoad}
				onerror={handleError}
			/>
		</picture>
	{/if}
</div>
