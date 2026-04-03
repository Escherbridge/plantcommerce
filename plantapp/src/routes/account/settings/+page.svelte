<script lang="ts">
	import '$lib/components/platform/platform.css';
	import { browser } from '$app/environment';

	// Theme preferences
	let theme = $state('system');

	// Email preferences (placeholder)
	let emailOrderUpdates = $state(true);
	let emailPromotions = $state(false);
	let emailNewsletter = $state(false);

	// Notification preferences (placeholder)
	let pushNotifications = $state(false);
	let emailNotifications = $state(true);

	// Delete account confirmation
	let showDeleteWarning = $state(false);

	// Initialize theme from localStorage
	$effect(() => {
		if (!browser) return;
		const saved = localStorage.getItem('theme');
		if (saved) {
			theme = saved;
		}
	});

	function setTheme(value: string) {
		theme = value;
		if (!browser) return;
		localStorage.setItem('theme', value);
		if (value === 'system') {
			const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
			document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
		} else {
			document.documentElement.setAttribute('data-theme', value);
		}
	}
</script>

<div class="platform-content">
	<!-- Page Header -->
	<div class="platform-header">
		<h1 class="platform-header__title">Account Settings</h1>
		<p class="platform-header__subtitle">Manage your preferences and account configuration</p>
	</div>

	<!-- Theme Preferences -->
	<div class="platform-card">
		<div class="platform-card__header">
			<h2 class="platform-card__title">Theme Preferences</h2>
		</div>

		<div class="theme-options">
			<label class="theme-option" class:theme-option--active={theme === 'light'}>
				<input
					type="radio"
					name="theme"
					value="light"
					checked={theme === 'light'}
					onchange={() => setTheme('light')}
					class="radio-hidden"
				/>
				<div class="theme-option__icon">
					<svg viewBox="0 0 24 24" class="theme-svg" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
						<circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
					</svg>
				</div>
				<span class="theme-option__label">Light</span>
			</label>

			<label class="theme-option" class:theme-option--active={theme === 'dark'}>
				<input
					type="radio"
					name="theme"
					value="dark"
					checked={theme === 'dark'}
					onchange={() => setTheme('dark')}
					class="radio-hidden"
				/>
				<div class="theme-option__icon">
					<svg viewBox="0 0 24 24" class="theme-svg" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
						<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
					</svg>
				</div>
				<span class="theme-option__label">Dark</span>
			</label>

			<label class="theme-option" class:theme-option--active={theme === 'system'}>
				<input
					type="radio"
					name="theme"
					value="system"
					checked={theme === 'system'}
					onchange={() => setTheme('system')}
					class="radio-hidden"
				/>
				<div class="theme-option__icon">
					<svg viewBox="0 0 24 24" class="theme-svg" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
						<rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><path d="M8 21h8M12 17v4"/>
					</svg>
				</div>
				<span class="theme-option__label">System</span>
			</label>
		</div>
	</div>

	<!-- Email Preferences -->
	<div class="platform-card">
		<div class="platform-card__header">
			<h2 class="platform-card__title">Email Preferences</h2>
		</div>

		<div class="toggle-list">
			<label class="toggle-item">
				<div class="toggle-item__info">
					<span class="toggle-item__label">Order Updates</span>
					<span class="toggle-item__desc">Receive emails about order status changes</span>
				</div>
				<input type="checkbox" class="toggle toggle-primary" bind:checked={emailOrderUpdates} />
			</label>

			<label class="toggle-item">
				<div class="toggle-item__info">
					<span class="toggle-item__label">Promotions</span>
					<span class="toggle-item__desc">Receive emails about sales and special offers</span>
				</div>
				<input type="checkbox" class="toggle toggle-primary" bind:checked={emailPromotions} />
			</label>

			<label class="toggle-item">
				<div class="toggle-item__info">
					<span class="toggle-item__label">Newsletter</span>
					<span class="toggle-item__desc">Receive our weekly newsletter with tips and updates</span>
				</div>
				<input type="checkbox" class="toggle toggle-primary" bind:checked={emailNewsletter} />
			</label>
		</div>
	</div>

	<!-- Notification Settings -->
	<div class="platform-card">
		<div class="platform-card__header">
			<h2 class="platform-card__title">Notification Settings</h2>
		</div>

		<div class="toggle-list">
			<label class="toggle-item">
				<div class="toggle-item__info">
					<span class="toggle-item__label">Push Notifications</span>
					<span class="toggle-item__desc">Receive push notifications in your browser</span>
				</div>
				<input type="checkbox" class="toggle toggle-primary" bind:checked={pushNotifications} />
			</label>

			<label class="toggle-item">
				<div class="toggle-item__info">
					<span class="toggle-item__label">Email Notifications</span>
					<span class="toggle-item__desc">Receive important account notifications via email</span>
				</div>
				<input type="checkbox" class="toggle toggle-primary" bind:checked={emailNotifications} />
			</label>
		</div>
	</div>

	<!-- Danger Zone -->
	<div class="platform-card danger-card">
		<div class="platform-card__header">
			<h2 class="platform-card__title danger-title">Danger Zone</h2>
		</div>

		<p class="danger-text">
			Once you delete your account, all of your data will be permanently removed. This action cannot be undone.
		</p>

		{#if showDeleteWarning}
			<div class="danger-warning">
				<div class="danger-warning__icon">
					<svg viewBox="0 0 24 24" class="danger-svg" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
						<path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
					</svg>
				</div>
				<p class="danger-warning__text">
					This feature is not yet available. Please contact support if you wish to delete your account.
				</p>
			</div>
		{/if}

		<button
			class="platform-action-btn platform-action-btn--danger"
			onclick={() => (showDeleteWarning = !showDeleteWarning)}
		>
			<svg viewBox="0 0 24 24" class="action-icon" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
				<path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/>
			</svg>
			Delete Account
		</button>
	</div>
</div>

<style>
	/* Theme options */
	.theme-options {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.75rem;
	}

	.radio-hidden {
		position: absolute;
		opacity: 0;
		width: 0;
		height: 0;
	}

	.theme-option {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		padding: 1.25rem 1rem;
		border: 1.5px solid var(--input-border);
		border-radius: calc(var(--radius-lg, 16px) - 4px);
		cursor: pointer;
		transition: border-color 200ms ease, background-color 200ms ease;
		background: oklch(var(--b2));
	}

	.theme-option:hover {
		border-color: oklch(var(--p) / 0.3);
	}

	.theme-option--active {
		border-color: oklch(var(--p));
		background: oklch(var(--p) / 0.06);
	}

	.theme-option__icon {
		color: oklch(var(--bc) / 0.6);
	}

	.theme-option--active .theme-option__icon {
		color: oklch(var(--p));
	}

	.theme-svg {
		width: 1.5rem;
		height: 1.5rem;
	}

	.theme-option__label {
		font-family: var(--font-display);
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: oklch(var(--bc) / 0.6);
	}

	.theme-option--active .theme-option__label {
		color: oklch(var(--p));
	}

	/* Toggle list */
	.toggle-list {
		display: flex;
		flex-direction: column;
	}

	.toggle-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.875rem 0;
		border-bottom: 1px solid oklch(var(--bc) / 0.06);
		cursor: pointer;
	}

	.toggle-item:last-child {
		border-bottom: none;
	}

	.toggle-item__info {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.toggle-item__label {
		font-size: 0.875rem;
		font-weight: 600;
		color: oklch(var(--bc));
	}

	.toggle-item__desc {
		font-size: 0.75rem;
		color: oklch(var(--bc) / 0.5);
	}

	/* Danger zone */
	.danger-card {
		border-color: oklch(var(--er) / 0.2);
	}

	.danger-title {
		color: oklch(var(--er));
	}

	.danger-text {
		font-size: 0.875rem;
		color: oklch(var(--bc) / 0.6);
		line-height: 1.5;
		margin-bottom: 1rem;
	}

	.danger-warning {
		display: flex;
		gap: 0.75rem;
		align-items: flex-start;
		padding: 1rem;
		background: oklch(var(--er) / 0.06);
		border: 1px solid oklch(var(--er) / 0.15);
		border-radius: calc(var(--radius-lg, 16px) - 4px);
		margin-bottom: 1rem;
	}

	.danger-warning__icon {
		flex-shrink: 0;
		color: oklch(var(--er));
	}

	.danger-svg {
		width: 1.25rem;
		height: 1.25rem;
	}

	.danger-warning__text {
		font-size: 0.8125rem;
		color: oklch(var(--er) / 0.8);
		line-height: 1.5;
	}

	.action-icon {
		width: 1.25rem;
		height: 1.25rem;
		flex-shrink: 0;
	}
</style>
