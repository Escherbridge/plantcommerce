<script lang="ts">
	// Aevani growing-system card (01-04 numbered). See design-spec.md §4.3.
	interface Props {
		href: string;
		number: string | number;
		title: string;
		description: string;
		image?: string;
		class?: string;
	}

	let { href, number, title, description, image, class: className = '' }: Props = $props();
</script>

<a {href} class="system-card {className}">
	<div class="system-card__media" class:system-card__media--fallback={!image}>
		{#if image}
			<img class="system-card__img" src={image} alt={title} loading="lazy" />
		{/if}
	</div>
	<div class="system-card__body">
		<span class="system-card__number">{number}</span>
		<h3 class="system-card__title">{title}</h3>
		<p class="system-card__desc">{description}</p>
	</div>
</a>

<style>
	.system-card {
		display: block;
		text-decoration: none;
		border-radius: 24px;
		overflow: hidden;
		background: rgba(255, 255, 255, 0.72);
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
		border: 1px solid rgba(255, 255, 255, 0.9);
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.95),
			0 8px 26px rgba(23, 48, 31, 0.1);
		transition:
			transform 300ms var(--ease-out-expo, cubic-bezier(0.16, 1, 0.3, 1)),
			box-shadow 300ms var(--ease-out-expo, cubic-bezier(0.16, 1, 0.3, 1));
	}

	.system-card:hover {
		transform: translateY(-4px);
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.95),
			0 16px 40px rgba(23, 48, 31, 0.16);
	}

	.system-card__media {
		position: relative;
		height: 168px;
		overflow: hidden;
	}

	.system-card__media--fallback {
		background:
			radial-gradient(120% 120% at 80% 0%, rgba(143, 216, 180, 0.5) 0%, transparent 55%),
			linear-gradient(150deg, #347a56 0%, #1e4a36 100%);
	}

	.system-card__img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 500ms var(--ease-out-expo, cubic-bezier(0.16, 1, 0.3, 1));
	}

	.system-card:hover .system-card__img {
		transform: scale(1.04);
	}

	.system-card__body {
		padding: 20px 22px 24px;
	}

	.system-card__number {
		display: block;
		font-family: var(--font-body);
		font-size: 12px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.14em;
		color: #7c9585;
	}

	.system-card__title {
		margin: 10px 0 0;
		font-family: var(--font-display);
		font-size: 21px;
		font-weight: 600;
		line-height: 1.15;
		letter-spacing: -0.01em;
		color: #1c3527;
	}

	.system-card__desc {
		margin: 8px 0 0;
		font-family: var(--font-body);
		font-size: 14.5px;
		line-height: 1.5;
		color: #5a7263;
		text-wrap: pretty;
	}
</style>
