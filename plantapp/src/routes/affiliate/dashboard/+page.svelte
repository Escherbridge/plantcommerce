<script lang="ts">
	import '$lib/components/platform/platform.css';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let selectedPeriod = $state<'7d' | '30d' | '90d' | 'all'>('30d');

	const stats = $derived(
		data.stats || {
			totalClicks: 0,
			totalConversions: 0,
			totalEarnings: 0,
			conversionRate: 0
		}
	);

	const periods = [
		{ key: '7d' as const, label: '7d' },
		{ key: '30d' as const, label: '30d' },
		{ key: '90d' as const, label: '90d' },
		{ key: 'all' as const, label: 'All Time' }
	];

	// Commission tier logic
	const currentTierEarnings = $derived(stats.totalEarnings);
	const tiers = [
		{ name: 'Base', rate: 5, threshold: 0 },
		{ name: 'Silver', rate: 8, threshold: 500 },
		{ name: 'Gold', rate: 12, threshold: 2000 }
	];
	const currentTier = $derived(
		tiers.reduce((acc, tier) => (currentTierEarnings >= tier.threshold ? tier : acc), tiers[0])
	);
	const nextTier = $derived(tiers[tiers.indexOf(currentTier) + 1] || null);
	const tierProgress = $derived(
		nextTier
			? Math.min(
					((currentTierEarnings - currentTier.threshold) /
						(nextTier.threshold - currentTier.threshold)) *
						100,
					100
				)
			: 100
	);

	let codeCopied = $state(false);
	function copyCode() {
		navigator.clipboard.writeText(data.affiliate?.affiliateCode || '');
		codeCopied = true;
		setTimeout(() => (codeCopied = false), 2000);
	}
</script>

<div class="platform-content">
	<div class="platform-header">
		<h1 class="platform-header__title">Affiliate Dashboard</h1>
		{#if data.isAdmin && !data.affiliate}
			<p class="platform-header__subtitle">
				Admin view: Affiliate system overview. No affiliate record associated with your account.
			</p>
		{:else}
			<p class="platform-header__subtitle">
				Welcome back, {data.affiliate?.user?.firstName || 'Affiliate'}. Here is your performance overview.
			</p>
		{/if}
	</div>

	{#if data.isAdmin && !data.affiliate}
		<div class="admin-notice">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="admin-notice__icon">
				<circle cx="12" cy="12" r="10"/>
				<line x1="12" y1="8" x2="12" y2="12"/>
				<line x1="12" y1="16" x2="12.01" y2="16"/>
			</svg>
			<div class="admin-notice__content">
				<h3 class="admin-notice__title">Admin Viewing Without Affiliate</h3>
				<p class="admin-notice__text">You are viewing this as an admin. To use affiliate features, create an affiliate account or navigate to the admin affiliate management page.</p>
			</div>
		</div>
	{/if}

	<!-- Period Selector -->
	<div class="period-selector">
		{#each periods as period}
			<button
				class="period-btn"
				class:period-btn--active={selectedPeriod === period.key}
				onclick={() => (selectedPeriod = period.key)}
			>
				{period.label}
			</button>
		{/each}
	</div>

	<!-- Stats Grid -->
	<div class="platform-stats">
		<div class="platform-stat">
			<div class="platform-stat__icon">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="stat-icon">
					<path d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5"/>
				</svg>
			</div>
			<span class="platform-stat__label">Total Clicks</span>
			<span class="platform-stat__value">{stats.totalClicks.toLocaleString()}</span>
		</div>
		<div class="platform-stat">
			<div class="platform-stat__icon">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="stat-icon">
					<path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
					<polyline points="22 4 12 14.01 9 11.01"/>
				</svg>
			</div>
			<span class="platform-stat__label">Conversions</span>
			<span class="platform-stat__value">{stats.totalConversions.toLocaleString()}</span>
		</div>
		<div class="platform-stat">
			<div class="platform-stat__icon">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="stat-icon">
					<line x1="12" y1="1" x2="12" y2="23"/>
					<path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
				</svg>
			</div>
			<span class="platform-stat__label">Total Earnings</span>
			<span class="platform-stat__value">${stats.totalEarnings.toFixed(2)}</span>
		</div>
		<div class="platform-stat">
			<div class="platform-stat__icon">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="stat-icon">
					<line x1="19" y1="5" x2="5" y2="19"/>
					<circle cx="6.5" cy="6.5" r="2.5"/>
					<circle cx="17.5" cy="17.5" r="2.5"/>
				</svg>
			</div>
			<span class="platform-stat__label">Conversion Rate</span>
			<span class="platform-stat__value">{stats.conversionRate.toFixed(1)}%</span>
		</div>
	</div>

	<!-- Top Performing Links -->
	<div class="platform-card">
		<div class="platform-card__header">
			<h2 class="platform-card__title">Top Performing Links</h2>
		</div>
		{#if data.recentClicks && data.recentClicks.length > 0}
			<div class="platform-table-wrapper" style="border:none;">
				<table class="platform-table">
					<thead>
						<tr>
							<th>Product</th>
							<th>Clicks</th>
							<th>Conversions</th>
							<th>Earnings</th>
						</tr>
					</thead>
					<tbody>
						{#each data.recentClicks as activity}
							<tr>
								<td>{activity.product?.name || 'N/A'}</td>
								<td>{activity.clicks || 0}</td>
								<td>
									{#if activity.conversions > 0}
										<span class="platform-badge platform-badge--success">{activity.conversions}</span>
									{:else}
										<span class="platform-badge platform-badge--ghost">0</span>
									{/if}
								</td>
								<td>${(activity.earnings || 0).toFixed(2)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:else}
			<div class="platform-empty">
				<p class="platform-empty__title">No link data yet</p>
				<p class="platform-empty__text">Start promoting your links to see performance data here.</p>
			</div>
		{/if}
	</div>

	<!-- Affiliate Info Row -->
	<div class="info-grid">
		<div class="platform-card">
			<div class="platform-card__header">
				<h2 class="platform-card__title">Your Affiliate Code</h2>
			</div>
			<div class="code-row">
				<code class="affiliate-code">{data.affiliate?.affiliateCode || 'N/A'}</code>
				<button class="platform-action-btn copy-btn" onclick={copyCode}>
					{#if codeCopied}
						Copied
					{:else}
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="btn-icon">
							<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
							<path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
						</svg>
						Copy
					{/if}
				</button>
			</div>
		</div>

		<div class="platform-card">
			<div class="platform-card__header">
				<h2 class="platform-card__title">Commission Rate</h2>
			</div>
			<div class="commission-value">
				{data.affiliate?.commissionRate
					? (parseFloat(data.affiliate.commissionRate) * 100).toFixed(1)
					: '5.0'}%
			</div>
			<p class="commission-desc">Your current commission rate</p>
		</div>
	</div>

	<!-- Commission Tier Progress -->
	<div class="platform-card">
		<div class="platform-card__header">
			<h2 class="platform-card__title">Commission Tier Progress</h2>
		</div>
		<div class="tier-labels">
			{#each tiers as tier}
				<span
					class="tier-label"
					class:tier-label--active={currentTier.name === tier.name}
				>
					{tier.name} {tier.rate}%
				</span>
			{/each}
		</div>
		<div class="tier-progress-bar">
			<div class="tier-progress-fill" style="width: {tierProgress}%"></div>
		</div>
		{#if nextTier}
			<p class="tier-hint">
				Earn ${(nextTier.threshold - currentTierEarnings).toFixed(2)} more to reach {nextTier.name} tier.
			</p>
		{:else}
			<p class="tier-hint">You have reached the highest tier.</p>
		{/if}
	</div>
</div>

<style>
	.admin-notice {
		display: flex;
		gap: 1rem;
		padding: 1rem 1.25rem;
		background: oklch(var(--w) / 0.05);
		border: 1.5px solid oklch(var(--w) / 0.2);
		border-radius: var(--input-radius, 10px);
		margin-bottom: 1.5rem;
	}

	.admin-notice__icon {
		width: 1.25rem;
		height: 1.25rem;
		color: oklch(var(--w));
		flex-shrink: 0;
	}

	.admin-notice__content {
		flex: 1;
	}

	.admin-notice__title {
		font-family: var(--font-display);
		font-size: 0.875rem;
		font-weight: 700;
		color: oklch(var(--bc));
		margin-bottom: 0.25rem;
	}

	.admin-notice__text {
		font-size: 0.8125rem;
		color: oklch(var(--bc) / 0.6);
		line-height: 1.5;
	}

	.period-selector {
		display: flex;
		gap: 0.25rem;
		background: oklch(var(--b2));
		border-radius: var(--input-radius, 10px);
		padding: 0.25rem;
		width: fit-content;
	}

	.period-btn {
		padding: 0.375rem 0.875rem;
		border: none;
		border-radius: calc(var(--input-radius, 10px) - 2px);
		background: transparent;
		font-family: var(--font-display);
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: oklch(var(--bc) / 0.5);
		cursor: pointer;
		transition: all 150ms ease;
	}

	.period-btn:hover {
		color: oklch(var(--bc) / 0.8);
	}

	.period-btn--active {
		background: oklch(var(--p));
		color: oklch(var(--pc));
	}

	.stat-icon {
		width: 1.25rem;
		height: 1.25rem;
		color: oklch(var(--p));
	}

	.info-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1rem;
	}

	@media (min-width: 640px) {
		.info-grid {
			grid-template-columns: 1fr 1fr;
		}
	}

	.code-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.affiliate-code {
		flex: 1;
		font-family: var(--font-mono, monospace);
		font-size: 1.25rem;
		background: oklch(var(--b2));
		padding: 0.625rem 1rem;
		border-radius: calc(var(--input-radius, 10px) - 2px);
		border: 1px solid var(--input-border);
	}

	.copy-btn {
		width: auto;
		flex-shrink: 0;
	}

	.btn-icon {
		width: 1rem;
		height: 1rem;
	}

	.commission-value {
		font-size: 2.5rem;
		font-weight: 700;
		font-family: var(--font-display);
		color: oklch(var(--p));
		line-height: 1;
	}

	.commission-desc {
		font-size: 0.875rem;
		color: oklch(var(--bc) / 0.5);
		margin-top: 0.25rem;
	}

	.tier-labels {
		display: flex;
		gap: 1rem;
		margin-bottom: 0.75rem;
	}

	.tier-label {
		font-family: var(--font-display);
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: oklch(var(--bc) / 0.4);
		padding: 0.25rem 0.5rem;
		border-radius: 9999px;
		border: 1px solid transparent;
	}

	.tier-label--active {
		color: oklch(var(--p));
		background: oklch(var(--p) / 0.1);
		border-color: oklch(var(--p) / 0.2);
	}

	.tier-progress-bar {
		width: 100%;
		height: 0.5rem;
		background: oklch(var(--b2));
		border-radius: 9999px;
		overflow: hidden;
		border: 1px solid var(--input-border);
	}

	.tier-progress-fill {
		height: 100%;
		background: oklch(var(--p));
		border-radius: 9999px;
		transition: width 300ms ease;
	}

	.tier-hint {
		font-size: 0.875rem;
		color: oklch(var(--bc) / 0.6);
		margin-top: 0.5rem;
	}
</style>
