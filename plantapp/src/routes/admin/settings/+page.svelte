<script lang="ts">
	let storeName = $state('Aevani');
	let currency = $state('USD');
	let taxRate = $state('8.5');
	let baseCommission = $state('10');

	const commissionTiers = [
		{ name: 'Bronze', minSales: 0, rate: '10%' },
		{ name: 'Silver', minSales: 50, rate: '12%' },
		{ name: 'Gold', minSales: 100, rate: '15%' },
		{ name: 'Platinum', minSales: 250, rate: '18%' }
	];

	const auditLog = [
		{ action: 'Updated product pricing', user: 'Admin', details: 'Hydroponic Kit price changed to $89.99', timestamp: '2 hours ago' },
		{ action: 'Created new user', user: 'System', details: 'User john@example.com registered', timestamp: '5 hours ago' },
		{ action: 'Order status changed', user: 'Admin', details: 'Order #1038 marked as shipped', timestamp: '8 hours ago' },
		{ action: 'Commission processed', user: 'System', details: 'Affiliate payout of $124.50 processed', timestamp: '1 day ago' },
		{ action: 'Product created', user: 'Admin', details: 'New product "LED Grow Light Panel" added', timestamp: '2 days ago' }
	];

	function handleSaveStore() {
		console.log('Saving store settings:', { storeName, currency, taxRate });
	}

	function handleSaveCommission() {
		console.log('Saving commission settings:', { baseCommission });
	}
</script>

<div class="platform-content">
	<div class="platform-header">
		<h1 class="platform-header__title">Store Settings</h1>
		<p class="platform-header__subtitle">Configure your store, commissions, and view admin activity</p>
	</div>

	<!-- Store Configuration -->
	<div class="platform-card">
		<div class="platform-card__header">
			<h2 class="platform-card__title">Store Configuration</h2>
		</div>
		<div class="platform-form-grid">
			<div class="admin-form-field">
				<label class="admin-form-label" for="store-name">Store Name</label>
				<input
					id="store-name"
					type="text"
					class="admin-form-input"
					bind:value={storeName}
				/>
			</div>
			<div class="admin-form-field">
				<label class="admin-form-label" for="currency">Currency</label>
				<select id="currency" class="admin-form-input" bind:value={currency}>
					<option value="USD">USD - US Dollar</option>
					<option value="EUR">EUR - Euro</option>
					<option value="GBP">GBP - British Pound</option>
					<option value="CAD">CAD - Canadian Dollar</option>
					<option value="AUD">AUD - Australian Dollar</option>
				</select>
			</div>
			<div class="admin-form-field">
				<label class="admin-form-label" for="tax-rate">Tax Rate (%)</label>
				<input
					id="tax-rate"
					type="number"
					step="0.1"
					class="admin-form-input"
					bind:value={taxRate}
				/>
			</div>
		</div>
		<div class="platform-card__actions">
			<button class="platform-action-btn admin-save-btn" onclick={handleSaveStore}>
				<svg viewBox="0 0 24 24" class="w-4 h-4" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
					<path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
					<polyline points="17 21 17 13 7 13 7 21"/>
					<polyline points="7 3 7 8 15 8"/>
				</svg>
				Save Store Settings
			</button>
		</div>
	</div>

	<!-- Commission Settings -->
	<div class="platform-card">
		<div class="platform-card__header">
			<h2 class="platform-card__title">Commission Settings</h2>
		</div>
		<div class="admin-form-field" style="max-width: 20rem; margin-bottom: 1.25rem;">
			<label class="admin-form-label" for="base-commission">Base Commission Rate (%)</label>
			<input
				id="base-commission"
				type="number"
				step="0.5"
				class="admin-form-input"
				bind:value={baseCommission}
			/>
		</div>

		<h3 class="admin-section-subtitle">Tier Structure</h3>
		<div class="platform-table-wrapper">
			<table class="platform-table">
				<thead>
					<tr>
						<th>Tier</th>
						<th>Min Sales</th>
						<th>Commission Rate</th>
					</tr>
				</thead>
				<tbody>
					{#each commissionTiers as tier}
						<tr>
							<td class="font-semibold">{tier.name}</td>
							<td>{tier.minSales} orders</td>
							<td>
								<span class="platform-badge platform-badge--primary">{tier.rate}</span>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<div class="platform-card__actions">
			<button class="platform-action-btn admin-save-btn" onclick={handleSaveCommission}>
				<svg viewBox="0 0 24 24" class="w-4 h-4" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
					<path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
					<polyline points="17 21 17 13 7 13 7 21"/>
					<polyline points="7 3 7 8 15 8"/>
				</svg>
				Save Commission Settings
			</button>
		</div>
	</div>

	<!-- Audit Log -->
	<div class="platform-card">
		<div class="platform-card__header">
			<h2 class="platform-card__title">Audit Log</h2>
		</div>
		<div class="platform-table-wrapper">
			<table class="platform-table">
				<thead>
					<tr>
						<th>Action</th>
						<th>User</th>
						<th>Details</th>
						<th>Timestamp</th>
					</tr>
				</thead>
				<tbody>
					{#each auditLog as entry}
						<tr>
							<td class="font-semibold">{entry.action}</td>
							<td>
								<span class="platform-badge platform-badge--ghost">{entry.user}</span>
							</td>
							<td style="font-size: 0.8125rem; color: oklch(var(--bc) / 0.65)">
								{entry.details}
							</td>
							<td style="font-size: 0.8125rem; color: oklch(var(--bc) / 0.45); white-space: nowrap">
								{entry.timestamp}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>

<style>
	.admin-form-field {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.admin-form-label {
		font-family: var(--font-display);
		font-size: 0.6875rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: oklch(var(--bc) / 0.5);
	}

	.admin-form-input {
		padding: 0.625rem 1rem;
		border: 1.5px solid var(--input-border);
		border-radius: var(--input-radius, 10px);
		background: oklch(var(--b1));
		color: oklch(var(--bc));
		font-size: 0.875rem;
		transition: border-color 150ms ease;
	}

	.admin-form-input:focus {
		outline: none;
		border-color: oklch(var(--p));
		box-shadow: var(--shadow-glow-focus);
	}

	.admin-save-btn {
		width: auto;
	}

	.admin-section-subtitle {
		font-family: var(--font-display);
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: oklch(var(--bc) / 0.6);
		margin: 0 0 0.75rem;
	}
</style>
