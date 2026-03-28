<script lang="ts">
	interface Props {
		variant?: 'line' | 'gradient' | 'pattern' | 'text';
		text?: string;
		class?: string;
	}

	let {
		variant = 'line',
		text = '',
		class: className = ''
	}: Props = $props();
</script>

{#if variant === 'line'}
	<hr class="divider-line {className}" aria-hidden="true" />
{:else if variant === 'gradient'}
	<div class="divider-gradient {className}" role="separator" aria-hidden="true"></div>
{:else if variant === 'pattern'}
	<div class="divider-pattern {className}" role="separator" aria-hidden="true">
		<svg
			class="divider-pattern-svg"
			xmlns="http://www.w3.org/2000/svg"
			width="100%"
			height="6"
			preserveAspectRatio="xMidYMid slice"
		>
			<defs>
				<pattern id="dot-pattern" x="0" y="0" width="8" height="6" patternUnits="userSpaceOnUse">
					<circle cx="3" cy="3" r="1" fill="currentColor" />
				</pattern>
			</defs>
			<rect width="100%" height="6" fill="url(#dot-pattern)" />
		</svg>
	</div>
{:else if variant === 'text'}
	<div class="divider-text {className}" role="separator">
		<span class="divider-text-label">{text}</span>
	</div>
{/if}

<style>
	.divider-line {
		border: none;
		border-top: 1px solid oklch(var(--b3));
		margin: 0;
		width: 100%;
	}

	.divider-gradient {
		height: 1px;
		background: linear-gradient(
			to right,
			transparent,
			oklch(var(--b3)) 20%,
			oklch(var(--b3)) 80%,
			transparent
		);
		width: 100%;
	}

	.divider-pattern {
		width: 100%;
		overflow: hidden;
		line-height: 0;
		color: oklch(var(--b3));
	}

	.divider-pattern-svg {
		display: block;
	}

	.divider-text {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		width: 100%;
	}

	.divider-text::before,
	.divider-text::after {
		content: '';
		flex: 1;
		height: 1px;
		background-color: oklch(var(--b3));
	}

	.divider-text-label {
		font-size: 0.75rem;
		font-weight: 500;
		color: oklch(var(--bc) / 0.5);
		white-space: nowrap;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
</style>
