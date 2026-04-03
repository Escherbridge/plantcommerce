<script lang="ts">
	import '$lib/components/platform/platform.css';

	let paymentMethod = $state<'paypal' | 'bank'>('paypal');
	let paypalEmail = $state('');

	let notifyEarnings = $state(true);
	let notifyConversions = $state(true);
	let notifyMonthlySummary = $state(true);

	let displayName = $state('');
	let bio = $state('');
	let websiteUrl = $state('');
</script>

<div class="platform-content">
	<div class="platform-header">
		<h1 class="platform-header__title">Affiliate Settings</h1>
		<p class="platform-header__subtitle">
			Manage your payment preferences, notifications, and profile information.
		</p>
	</div>

	<!-- Payment Preferences -->
	<div class="platform-card">
		<div class="platform-card__header">
			<h2 class="platform-card__title">Payment Preferences</h2>
		</div>
		<div class="platform-form-stack">
			<div class="radio-group">
				<label class="radio-option">
					<input
						type="radio"
						name="payment"
						value="paypal"
						bind:group={paymentMethod}
						class="radio-input"
					/>
					<span class="radio-label">PayPal</span>
				</label>
				<label class="radio-option">
					<input
						type="radio"
						name="payment"
						value="bank"
						bind:group={paymentMethod}
						class="radio-input"
					/>
					<span class="radio-label">Bank Transfer</span>
				</label>
			</div>

			{#if paymentMethod === 'paypal'}
				<div class="field">
					<label for="paypal-email" class="field-label">PayPal Email</label>
					<input
						id="paypal-email"
						type="email"
						placeholder="your@email.com"
						class="field-input"
						bind:value={paypalEmail}
					/>
				</div>
			{/if}
		</div>
		<div class="platform-card__actions">
			<button class="save-btn">Save Payment Settings</button>
		</div>
	</div>

	<!-- Notification Preferences -->
	<div class="platform-card">
		<div class="platform-card__header">
			<h2 class="platform-card__title">Notification Preferences</h2>
		</div>
		<div class="toggle-list">
			<label class="toggle-item">
				<span class="toggle-label">New Earnings</span>
				<div class="toggle-switch" class:toggle-switch--on={notifyEarnings}>
					<input type="checkbox" bind:checked={notifyEarnings} class="toggle-checkbox" />
					<div class="toggle-track">
						<div class="toggle-thumb"></div>
					</div>
				</div>
			</label>
			<label class="toggle-item">
				<span class="toggle-label">New Conversions</span>
				<div class="toggle-switch" class:toggle-switch--on={notifyConversions}>
					<input type="checkbox" bind:checked={notifyConversions} class="toggle-checkbox" />
					<div class="toggle-track">
						<div class="toggle-thumb"></div>
					</div>
				</div>
			</label>
			<label class="toggle-item">
				<span class="toggle-label">Monthly Summary</span>
				<div class="toggle-switch" class:toggle-switch--on={notifyMonthlySummary}>
					<input type="checkbox" bind:checked={notifyMonthlySummary} class="toggle-checkbox" />
					<div class="toggle-track">
						<div class="toggle-thumb"></div>
					</div>
				</div>
			</label>
		</div>
	</div>

	<!-- Profile -->
	<div class="platform-card">
		<div class="platform-card__header">
			<h2 class="platform-card__title">Profile</h2>
		</div>
		<div class="platform-form-stack">
			<div class="field">
				<label for="display-name" class="field-label">Display Name</label>
				<input
					id="display-name"
					type="text"
					placeholder="Your display name"
					class="field-input"
					bind:value={displayName}
				/>
			</div>
			<div class="field">
				<label for="bio" class="field-label">Bio</label>
				<textarea
					id="bio"
					rows="3"
					placeholder="Tell us about yourself..."
					class="field-textarea"
					bind:value={bio}
				></textarea>
			</div>
			<div class="field">
				<label for="website" class="field-label">Website URL</label>
				<input
					id="website"
					type="url"
					placeholder="https://yoursite.com"
					class="field-input"
					bind:value={websiteUrl}
				/>
			</div>
		</div>
		<div class="platform-card__actions">
			<button class="save-btn">Save Profile</button>
		</div>
	</div>
</div>

<style>
	.field {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.field-label {
		font-family: var(--font-display);
		font-size: 0.6875rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: oklch(var(--bc) / 0.5);
	}

	.field-input,
	.field-textarea {
		padding: 0.625rem 0.875rem;
		border: 1.5px solid var(--input-border);
		border-radius: var(--input-radius, 10px);
		background: oklch(var(--b1));
		color: oklch(var(--bc));
		font-size: 0.875rem;
		font-family: var(--font-body);
		transition: border-color 150ms ease;
	}

	.field-textarea {
		resize: vertical;
		min-height: 5rem;
	}

	.field-input:focus,
	.field-textarea:focus {
		outline: none;
		border-color: oklch(var(--p));
	}

	.radio-group {
		display: flex;
		gap: 1.5rem;
	}

	.radio-option {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
	}

	.radio-input {
		appearance: none;
		width: 1.125rem;
		height: 1.125rem;
		border: 2px solid var(--input-border);
		border-radius: 50%;
		cursor: pointer;
		position: relative;
		transition: border-color 150ms ease;
	}

	.radio-input:checked {
		border-color: oklch(var(--p));
	}

	.radio-input:checked::after {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 50%;
		background: oklch(var(--p));
	}

	.radio-label {
		font-size: 0.875rem;
		color: oklch(var(--bc) / 0.8);
	}

	.toggle-list {
		display: flex;
		flex-direction: column;
		gap: 0.875rem;
	}

	.toggle-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		cursor: pointer;
		padding: 0.5rem 0;
	}

	.toggle-label {
		font-size: 0.875rem;
		color: oklch(var(--bc) / 0.8);
	}

	.toggle-switch {
		position: relative;
	}

	.toggle-checkbox {
		position: absolute;
		opacity: 0;
		width: 0;
		height: 0;
	}

	.toggle-track {
		width: 2.5rem;
		height: 1.375rem;
		border-radius: 9999px;
		background: oklch(var(--bc) / 0.15);
		transition: background 200ms ease;
		position: relative;
	}

	.toggle-switch--on .toggle-track {
		background: oklch(var(--p));
	}

	.toggle-thumb {
		position: absolute;
		top: 0.125rem;
		left: 0.125rem;
		width: 1.125rem;
		height: 1.125rem;
		border-radius: 50%;
		background: white;
		transition: transform 200ms ease;
		box-shadow: 0 1px 3px oklch(0 0 0 / 0.2);
	}

	.toggle-switch--on .toggle-thumb {
		transform: translateX(1.125rem);
	}

	.save-btn {
		padding: 0.625rem 1.5rem;
		background: oklch(var(--p));
		color: oklch(var(--pc));
		border: none;
		border-radius: var(--input-radius, 10px);
		font-family: var(--font-display);
		font-size: 0.8125rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		cursor: pointer;
		transition: opacity 150ms ease;
	}

	.save-btn:hover {
		opacity: 0.9;
	}
</style>
