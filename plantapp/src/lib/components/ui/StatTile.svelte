<script lang="ts">
	// Aevani "by the numbers" stat tile. See design-spec.md §5.4.
	interface Props {
		value: string | number;
		label: string;
		class?: string;
	}

	let { value, label, class: className = '' }: Props = $props();
</script>

<div class="stat-tile {className}">
	<div class="stat-tile__value">{value}</div>
	<div class="stat-tile__label">{label}</div>
</div>

<style>
	.stat-tile {
		background: rgba(255, 255, 255, 0.72);
		backdrop-filter: blur(14px);
		-webkit-backdrop-filter: blur(14px);
		border: 1px solid rgba(255, 255, 255, 0.9);
		border-radius: 22px;
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.95),
			0 8px 26px rgba(23, 48, 31, 0.1);
		padding: 24px 26px;
	}

	.stat-tile__value {
		font-family: var(--font-display);
		font-size: 34px;
		font-weight: 700;
		line-height: 1.05;
		letter-spacing: -0.02em;
		color: #1c3527;
	}

	.stat-tile__label {
		margin-top: 6px;
		font-family: var(--font-body);
		font-size: 14px;
		line-height: 1.35;
		color: #5a7263;
	}
</style>
