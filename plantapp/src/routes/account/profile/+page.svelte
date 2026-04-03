<script lang="ts">
	import '$lib/components/platform/platform.css';
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

<div class="platform-content">
	<!-- Page Header -->
	<div class="platform-header">
		<h1 class="platform-header__title">My Profile</h1>
		<p class="platform-header__subtitle">Manage your account information and preferences</p>
	</div>

	<!-- Personal Information -->
	<div class="platform-card">
		<div class="platform-card__header">
			<h2 class="platform-card__title">Personal Information</h2>
			<button
				class="btn btn-sm btn-outline font-display uppercase tracking-wider"
				onclick={() => (editMode = !editMode)}
			>
				{editMode ? 'Cancel' : 'Edit'}
			</button>
		</div>

		<div class="platform-form-grid">
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
			<div class="platform-card__actions">
				<button class="btn btn-primary font-display uppercase tracking-wider">Save Changes</button>
			</div>
		{/if}
	</div>

	<!-- Password Change -->
	<div class="platform-card">
		<h2 class="platform-card__title" style="margin-bottom: 1.25rem;">Change Password</h2>
		<div class="platform-form-stack">
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

		<div class="platform-card__actions">
			<button class="btn btn-primary font-display uppercase tracking-wider">Update Password</button>
		</div>
	</div>

	<!-- Account Stats -->
	<div class="platform-card">
		<h2 class="platform-card__title" style="margin-bottom: 1.25rem;">Account Overview</h2>
		<div class="platform-stats">
			<div class="platform-stat">
				<span class="platform-stat__label">Total Orders</span>
				<span class="platform-stat__value" style="color: oklch(var(--p));">{data.stats?.totalOrders || 0}</span>
			</div>
			<div class="platform-stat">
				<span class="platform-stat__label">Wishlist Items</span>
				<span class="platform-stat__value" style="color: oklch(var(--s));">{data.stats?.wishlistItems || 0}</span>
			</div>
		</div>
	</div>

	<!-- Account Actions -->
	<div class="platform-card">
		<h2 class="platform-card__title" style="margin-bottom: 1.25rem;">Account Actions</h2>
		<div class="actions-stack">
			<a href="/account/settings" class="platform-action-btn">
				<svg viewBox="0 0 24 24" class="action-icon" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
					<path d="M3 5h18v14H3V5zM3 5l9 7 9-7"/>
				</svg>
				Email Preferences
			</a>
			<a href="/account/settings" class="platform-action-btn">
				<svg viewBox="0 0 24 24" class="action-icon" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
					<path d="M15 17h5l-1.4-1.4A6 6 0 0018 11V8a6 6 0 00-12 0v3c0 1.3-.4 2.5-1.2 3.6L4 17h5m6 0v1a3 3 0 01-6 0v-1m6 0H9"/>
				</svg>
				Notification Settings
			</a>
			<a href="/account/settings" class="platform-action-btn">
				<svg viewBox="0 0 24 24" class="action-icon" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
					<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
				</svg>
				Theme Preferences
			</a>
			<button class="platform-action-btn platform-action-btn--danger">
				<svg viewBox="0 0 24 24" class="action-icon" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
					<path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
				</svg>
				Delete Account
			</button>
		</div>
	</div>
</div>

<style>
	.actions-stack {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.action-icon {
		width: 1.25rem;
		height: 1.25rem;
		flex-shrink: 0;
	}
</style>
