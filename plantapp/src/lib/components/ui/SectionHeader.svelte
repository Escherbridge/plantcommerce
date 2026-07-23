<script lang="ts">
	// Aevani section header: eyebrow + display title + optional ghost action link.
	// See design-spec.md §4/§6.
	interface Props {
		eyebrow: string;
		title: string;
		actionLabel?: string;
		actionHref?: string;
		class?: string;
	}

	let { eyebrow, title, actionLabel, actionHref, class: className = '' }: Props = $props();
</script>

<div class="section-header {className}">
	<div class="section-header__text">
		<span class="section-header__eyebrow">{eyebrow}</span>
		<h2 class="section-header__title">{title}</h2>
	</div>
	{#if actionLabel && actionHref}
		<a class="section-header__action" href={actionHref}>{actionLabel}</a>
	{/if}
</div>

<style>
	.section-header {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 24px;
		flex-wrap: wrap;
	}

	.section-header__eyebrow {
		display: block;
		font-family: var(--font-body);
		font-size: 13px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.14em;
		color: #2e6b4f;
	}

	.section-header__title {
		margin: 10px 0 0;
		font-family: var(--font-display);
		font-size: 40px;
		font-weight: 600;
		line-height: 1.08;
		letter-spacing: -0.015em;
		color: #1c3527;
		text-wrap: balance;
	}

	.section-header__action {
		flex-shrink: 0;
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 10px 20px;
		border-radius: 999px;
		border: 1px solid rgba(46, 107, 79, 0.3);
		background: transparent;
		font-family: var(--font-body);
		font-size: 14px;
		font-weight: 600;
		color: #2e6b4f;
		text-decoration: none;
		transition:
			background-color 250ms var(--ease-out-expo, cubic-bezier(0.16, 1, 0.3, 1)),
			border-color 250ms var(--ease-out-expo, cubic-bezier(0.16, 1, 0.3, 1));
	}

	.section-header__action:hover {
		background: rgba(46, 107, 79, 0.08);
		border-color: rgba(46, 107, 79, 0.45);
	}

	@media (max-width: 640px) {
		.section-header__title {
			font-size: 30px;
		}
	}
</style>
