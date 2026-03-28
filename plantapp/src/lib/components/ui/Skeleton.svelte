<script lang="ts">
	interface Props {
		variant?: 'text' | 'image' | 'card' | 'custom';
		width?: string;
		height?: string;
		count?: number;
		class?: string;
	}

	let {
		variant = 'text',
		width = '100%',
		height,
		count = 1,
		class: className = ''
	}: Props = $props();

	const lines = $derived(
		variant === 'text' ? Array.from({ length: count }, (_, i) => i) : []
	);

	const customStyle = $derived(
		variant === 'custom'
			? `width: ${width}; height: ${height ?? '1rem'};`
			: `width: ${width};`
	);
</script>

{#if variant === 'text'}
	<div class="skeleton-text-group" style="width: {width};" role="status" aria-label="Loading...">
		{#each lines as i (i)}
			<div
				class="skeleton-text {className}"
				style={i === lines.length - 1 && lines.length > 1 ? 'width: 75%;' : ''}
			></div>
		{/each}
		<span class="sr-only">Loading...</span>
	</div>
{:else if variant === 'image'}
	<div
		class="skeleton-image {className}"
		style="width: {width};"
		role="status"
		aria-label="Loading image..."
	>
		<span class="sr-only">Loading...</span>
	</div>
{:else if variant === 'card'}
	<div
		class="skeleton-card {className}"
		style="width: {width};"
		role="status"
		aria-label="Loading card..."
	>
		<div class="skeleton-card-image"></div>
		<div class="skeleton-card-body">
			<div class="skeleton-text" style="width: 80%;"></div>
			<div class="skeleton-text" style="width: 60%;"></div>
			<div class="skeleton-text" style="width: 40%;"></div>
		</div>
		<span class="sr-only">Loading...</span>
	</div>
{:else}
	<div
		class="skeleton-custom {className}"
		style={customStyle}
		role="status"
		aria-label="Loading..."
	>
		<span class="sr-only">Loading...</span>
	</div>
{/if}

<style>
	.skeleton-base {
		background-color: oklch(var(--b3));
		border-radius: var(--radius-md, 0.5rem);
		animation: skeleton-pulse 1.8s ease-in-out infinite;
	}

	@keyframes skeleton-pulse {
		0%, 100% {
			opacity: 1;
		}
		50% {
			opacity: 0.4;
		}
	}

	.skeleton-text-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.skeleton-text {
		height: 1rem;
		border-radius: 9999px;
		background-color: oklch(var(--b3));
		animation: skeleton-pulse 1.8s ease-in-out infinite;
	}

	.skeleton-image {
		aspect-ratio: 16 / 9;
		border-radius: var(--radius-lg, 0.75rem);
		background-color: oklch(var(--b3));
		animation: skeleton-pulse 1.8s ease-in-out infinite;
	}

	.skeleton-card {
		border-radius: var(--radius-lg, 0.75rem);
		overflow: hidden;
		background-color: oklch(var(--b2));
	}

	.skeleton-card-image {
		aspect-ratio: 3 / 4;
		background-color: oklch(var(--b3));
		animation: skeleton-pulse 1.8s ease-in-out infinite;
	}

	.skeleton-card-body {
		padding: 0.75rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.skeleton-card-body .skeleton-text {
		height: 0.75rem;
	}

	.skeleton-custom {
		border-radius: var(--radius-md, 0.5rem);
		background-color: oklch(var(--b3));
		animation: skeleton-pulse 1.8s ease-in-out infinite;
	}
</style>
