<script lang="ts">
	interface Props {
		category: string;
		title: string;
		excerpt: string;
		readingTime: string;
		image?: string;
		href: string;
		date?: string;
		class?: string;
	}

	let {
		category,
		title,
		excerpt,
		readingTime,
		image,
		href,
		date,
		class: className = ''
	}: Props = $props();
</script>

<style>
	.content-card {
		border-radius: var(--radius-lg, 0.75rem);
		box-shadow: var(--shadow-md);
		transition:
			box-shadow 300ms var(--ease-out-expo, cubic-bezier(0.19, 1, 0.22, 1)),
			border-color 300ms var(--ease-out-expo, cubic-bezier(0.19, 1, 0.22, 1));
		overflow: hidden;
	}

	.content-card:hover {
		box-shadow: var(--shadow-xl);
	}

	.content-card:hover .content-card__image {
		transform: scale(1.05);
	}

	.content-card:hover .content-card__title {
		color: oklch(var(--p));
	}

	.content-card__image-wrap {
		position: relative;
		overflow: hidden;
		aspect-ratio: 16 / 9;
	}

	.content-card__image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 400ms var(--ease-out-expo, cubic-bezier(0.19, 1, 0.22, 1));
	}

	.content-card__title {
		transition: color 200ms ease;
	}
</style>

<a
	{href}
	class="content-card block border border-base-300 bg-base-100 hover:border-primary/30 {className}"
>
	{#if image}
		<div class="content-card__image-wrap">
			<img src={image} alt={title} class="content-card__image" loading="lazy" />
		</div>
	{/if}

	<div class="p-5 flex flex-col gap-3">
		<div class="flex items-center justify-between gap-2">
			<span class="font-mono text-xs uppercase tracking-widest text-secondary">{category}</span>
			{#if date}
				<span class="font-mono text-xs text-base-content/50">{date}</span>
			{/if}
		</div>

		<h3 class="content-card__title font-display text-xl font-bold text-base-content line-clamp-2">
			{title}
		</h3>

		<p class="font-sans text-base text-base-content/70 line-clamp-3">{excerpt}</p>

		<span class="font-mono text-xs text-base-content/50 mt-auto">{readingTime}</span>
	</div>
</a>
