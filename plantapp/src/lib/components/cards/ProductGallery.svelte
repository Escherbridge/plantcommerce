<script lang="ts">
	// Aevani product-detail gallery: large main image + up-to-5 thumbnail selectors.
	// See design-spec.md §5.2.
	interface GalleryImage {
		url: string;
		alt?: string;
	}

	interface Props {
		images: GalleryImage[];
		caption?: string;
		class?: string;
	}

	let { images, caption, class: className = '' }: Props = $props();

	let selected = $state(0);

	const thumbs = $derived(images.slice(0, 5));
	const active = $derived(images[selected] ?? images[0]);
	const showThumbs = $derived(images.length > 1);
</script>

<div class="gallery {className}">
	<div class="gallery__main">
		{#if active}
			<img class="gallery__img" src={active.url} alt={active.alt ?? ''} />
		{/if}
		{#if caption}
			<span class="gallery__caption">{caption}</span>
		{/if}
	</div>

	{#if showThumbs}
		<div class="gallery__thumbs">
			{#each thumbs as thumb, i (thumb.url + i)}
				<button
					type="button"
					class="gallery__thumb"
					class:gallery__thumb--active={i === selected}
					aria-label={thumb.alt ?? `View image ${i + 1}`}
					aria-pressed={i === selected}
					onclick={() => (selected = i)}
				>
					<img class="gallery__thumb-img" src={thumb.url} alt={thumb.alt ?? ''} loading="lazy" />
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.gallery {
		display: flex;
		flex-direction: column;
		gap: 14px;
	}

	.gallery__main {
		position: relative;
		border-radius: 28px;
		overflow: hidden;
		height: 520px;
		background: rgba(255, 255, 255, 0.5);
		border: 1px solid rgba(255, 255, 255, 0.9);
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.95),
			0 12px 40px rgba(23, 48, 31, 0.14);
	}

	.gallery__img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.gallery__caption {
		position: absolute;
		left: 16px;
		bottom: 16px;
		padding: 8px 16px;
		border-radius: 999px;
		background: rgba(20, 38, 27, 0.55);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.16);
		font-family: var(--font-body);
		font-size: 13px;
		font-weight: 500;
		color: #eaf6ee;
	}

	.gallery__thumbs {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 12px;
	}

	.gallery__thumb {
		position: relative;
		padding: 0;
		border-radius: 16px;
		overflow: hidden;
		aspect-ratio: 1 / 1;
		cursor: pointer;
		background: rgba(255, 255, 255, 0.6);
		border: 2px solid rgba(255, 255, 255, 0.9);
		box-shadow: 0 4px 14px rgba(23, 48, 31, 0.08);
		transition:
			transform 250ms var(--ease-out-expo, cubic-bezier(0.16, 1, 0.3, 1)),
			border-color 250ms var(--ease-out-expo, cubic-bezier(0.16, 1, 0.3, 1)),
			box-shadow 250ms var(--ease-out-expo, cubic-bezier(0.16, 1, 0.3, 1));
	}

	.gallery__thumb:hover {
		transform: translateY(-2px);
	}

	.gallery__thumb--active {
		border-color: #2e6b4f;
		transform: translateY(-3px);
		box-shadow: 0 10px 24px rgba(46, 107, 79, 0.28);
	}

	.gallery__thumb:focus-visible {
		outline: none;
		border-color: #2e6b4f;
		box-shadow: 0 0 0 3px rgba(46, 107, 79, 0.35);
	}

	.gallery__thumb-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	@media (max-width: 640px) {
		.gallery__main {
			height: 380px;
		}
	}
</style>
