<script lang="ts">
	import { Container, Section } from '$lib/components/layout';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let editMode = $state(false);
	let formData = $state({
		firstName: data.user?.firstName || '',
		lastName: data.user?.lastName || '',
		email: data.user?.email || '',
		phone: '',
		addressLine1: '',
		addressLine2: '',
		city: '',
		state: '',
		zipCode: '',
		country: 'United States'
	});
</script>

<Section>
	<Container>
		<div class="profile-header">
			<h1 class="text-4xl font-display uppercase tracking-tight mb-2">My Profile</h1>
			<p class="text-lg text-base-content/70">Manage your account information and preferences</p>
		</div>

		<div class="profile-layout">
			<!-- Sidebar Navigation -->
			<aside class="profile-sidebar">
				<div class="profile-card">
					<h3 class="profile-card__title">Account Menu</h3>
					<nav class="profile-nav">
						<a href="/account/profile" class="profile-nav__link active">Profile</a>
						<a href="/account/orders" class="profile-nav__link">Orders</a>
						<a href="/account/wishlist" class="profile-nav__link">Wishlist</a>
						<a href="/account/addresses" class="profile-nav__link">Addresses</a>
						<a href="/account/payment-methods" class="profile-nav__link">Payment Methods</a>
						<a href="/account/settings" class="profile-nav__link">Settings</a>
					</nav>
				</div>
			</aside>

			<!-- Main Content -->
			<div class="profile-main">
				<!-- Personal Information -->
				<div class="profile-card">
					<div class="profile-card__header">
						<h2 class="profile-card__title">Personal Information</h2>
						<button
							class="btn btn-sm btn-outline font-display uppercase tracking-wider"
							onclick={() => (editMode = !editMode)}
						>
							{editMode ? 'Cancel' : 'Edit'}
						</button>
					</div>

					<div class="profile-form-grid">
						<div class="form-control">
							<label class="label" for="firstName">
								<span class="label-text">First Name</span>
							</label>
							<input
								id="firstName"
								type="text"
								class="input input-bordered w-full"
								bind:value={formData.firstName}
								disabled={!editMode}
							/>
						</div>

						<div class="form-control">
							<label class="label" for="lastName">
								<span class="label-text">Last Name</span>
							</label>
							<input
								id="lastName"
								type="text"
								class="input input-bordered w-full"
								bind:value={formData.lastName}
								disabled={!editMode}
							/>
						</div>

						<div class="form-control">
							<label class="label" for="email">
								<span class="label-text">Email</span>
							</label>
							<input
								id="email"
								type="email"
								class="input input-bordered w-full"
								bind:value={formData.email}
								disabled={!editMode}
							/>
						</div>

						<div class="form-control">
							<label class="label" for="phone">
								<span class="label-text">Phone Number</span>
							</label>
							<input
								id="phone"
								type="tel"
								class="input input-bordered w-full"
								bind:value={formData.phone}
								disabled={!editMode}
							/>
						</div>
					</div>

					{#if editMode}
						<div class="profile-card__actions">
							<button class="btn btn-primary font-display uppercase tracking-wider">Save Changes</button>
						</div>
					{/if}
				</div>

				<!-- Password Change -->
				<div class="profile-card">
					<h2 class="profile-card__title mb-5">Change Password</h2>
					<div class="profile-form-stack">
						<div class="form-control">
							<label class="label" for="currentPassword">
								<span class="label-text">Current Password</span>
							</label>
							<input
								id="currentPassword"
								type="password"
								class="input input-bordered w-full"
								placeholder="Enter current password"
							/>
						</div>

						<div class="form-control">
							<label class="label" for="newPassword">
								<span class="label-text">New Password</span>
							</label>
							<input
								id="newPassword"
								type="password"
								class="input input-bordered w-full"
								placeholder="Enter new password"
							/>
						</div>

						<div class="form-control">
							<label class="label" for="confirmPassword">
								<span class="label-text">Confirm New Password</span>
							</label>
							<input
								id="confirmPassword"
								type="password"
								class="input input-bordered w-full"
								placeholder="Confirm new password"
							/>
						</div>
					</div>

					<div class="profile-card__actions">
						<button class="btn btn-primary font-display uppercase tracking-wider">Update Password</button>
					</div>
				</div>

				<!-- Account Stats -->
				<div class="profile-card">
					<h2 class="profile-card__title mb-5">Account Overview</h2>
					<div class="profile-stats">
						<div class="profile-stat">
							<span class="profile-stat__label">Total Orders</span>
							<span class="profile-stat__value text-primary">{data.stats?.totalOrders || 0}</span>
						</div>
						<div class="profile-stat">
							<span class="profile-stat__label">Wishlist Items</span>
							<span class="profile-stat__value text-secondary">{data.stats?.wishlistItems || 0}</span>
						</div>
					</div>
				</div>

				<!-- Account Actions -->
				<div class="profile-card">
					<h2 class="profile-card__title mb-5">Account Actions</h2>
					<div class="profile-actions">
						<button class="profile-action-btn">
							<svg viewBox="0 0 24 24" class="w-5 h-5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
								<path d="M3 5h18v14H3V5zM3 5l9 7 9-7"/>
							</svg>
							Email Preferences
						</button>
						<button class="profile-action-btn">
							<svg viewBox="0 0 24 24" class="w-5 h-5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
								<path d="M15 17h5l-1.4-1.4A6 6 0 0118 11V8a6 6 0 00-12 0v3c0 1.3-.4 2.5-1.2 3.6L4 17h5m6 0v1a3 3 0 01-6 0v-1m6 0H9"/>
							</svg>
							Notification Settings
						</button>
						<button class="profile-action-btn">
							<svg viewBox="0 0 24 24" class="w-5 h-5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
								<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
							</svg>
							Theme Preferences
						</button>
						<button class="profile-action-btn profile-action-btn--danger">
							<svg viewBox="0 0 24 24" class="w-5 h-5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
								<path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
							</svg>
							Delete Account
						</button>
					</div>
				</div>
			</div>
		</div>
	</Container>
</Section>

<style>
	.profile-header {
		margin-bottom: 2rem;
	}

	.profile-layout {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1.5rem;
	}

	@media (min-width: 768px) {
		.profile-layout {
			grid-template-columns: 16rem 1fr;
			gap: 2rem;
		}
	}

	/* ── Card (scoped — no daisyUI dependency) ── */
	.profile-card {
		background: oklch(var(--b1));
		border: 1.5px solid var(--input-border);
		border-radius: var(--radius-lg, 16px);
		padding: 1.75rem;
		box-shadow: var(--shadow-glow-sm);
	}

	.profile-card__header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.25rem;
	}

	.profile-card__title {
		font-family: var(--font-display);
		font-size: 0.875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: oklch(var(--bc));
	}

	.profile-card__actions {
		display: flex;
		justify-content: flex-end;
		margin-top: 1.25rem;
	}

	/* ── Sidebar nav ── */
	.profile-sidebar {
		position: sticky;
		top: 5rem;
		align-self: start;
	}

	.profile-nav {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		margin-top: 0.75rem;
	}

	.profile-nav__link {
		display: block;
		padding: 0.5rem 0.75rem;
		font-size: 0.875rem;
		font-weight: 500;
		color: oklch(var(--bc) / 0.65);
		text-decoration: none;
		border-radius: calc(var(--input-radius, 10px) - 2px);
		transition: background-color 150ms ease, color 150ms ease;
	}

	.profile-nav__link:hover {
		background: oklch(var(--p) / 0.06);
		color: oklch(var(--bc));
	}

	.profile-nav__link.active {
		background: oklch(var(--p) / 0.1);
		color: oklch(var(--p));
		font-weight: 600;
	}

	/* ── Form layouts ── */
	.profile-form-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1rem;
	}

	@media (min-width: 640px) {
		.profile-form-grid {
			grid-template-columns: 1fr 1fr;
			gap: 1.25rem 1rem;
		}
	}

	.profile-form-stack {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.profile-main {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	/* ── Stats ── */
	.profile-stats {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.profile-stat {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		padding: 1.25rem;
		background: oklch(var(--b2));
		border-radius: calc(var(--radius-lg, 16px) - 4px);
		border: 1px solid var(--input-border);
	}

	.profile-stat__label {
		font-size: 0.75rem;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: oklch(var(--bc) / 0.5);
	}

	.profile-stat__value {
		font-size: 2rem;
		font-weight: 700;
		font-family: var(--font-display);
		line-height: 1;
	}

	/* ── Action buttons ── */
	.profile-actions {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.profile-action-btn {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		width: 100%;
		padding: 0.75rem 1rem;
		background: transparent;
		border: 1.5px solid var(--input-border);
		border-radius: var(--input-radius, 10px);
		font-family: var(--font-body);
		font-size: 0.875rem;
		font-weight: 500;
		color: oklch(var(--bc) / 0.7);
		cursor: pointer;
		text-align: left;
		transition:
			border-color 200ms ease,
			background-color 200ms ease,
			color 200ms ease;
	}

	.profile-action-btn:hover {
		border-color: var(--input-border-hover);
		background: oklch(var(--p) / 0.04);
		color: oklch(var(--bc));
	}

	.profile-action-btn--danger {
		color: oklch(var(--er) / 0.7);
	}

	.profile-action-btn--danger:hover {
		border-color: oklch(var(--er) / 0.3);
		background: oklch(var(--er) / 0.04);
		color: oklch(var(--er));
	}
</style>
