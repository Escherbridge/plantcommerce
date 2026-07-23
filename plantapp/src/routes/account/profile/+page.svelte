<script lang="ts">
	import '$lib/components/platform/platform.css';
	import Icon from '$lib/components/icons/Icon.svelte';
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
				class="font-display btn tracking-wider uppercase btn-outline btn-sm"
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
					class="input-bordered input w-full"
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
					class="input-bordered input w-full"
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
					class="input-bordered input w-full"
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
					class="input-bordered input w-full"
					bind:value={formData.phone}
					disabled={!editMode}
				/>
			</div>
		</div>

		{#if editMode}
			<div class="platform-card__actions">
				<button class="font-display btn tracking-wider uppercase btn-primary">Save Changes</button>
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
					class="input-bordered input w-full"
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
					class="input-bordered input w-full"
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
					class="input-bordered input w-full"
					placeholder="Confirm new password"
				/>
			</div>
		</div>

		<div class="platform-card__actions">
			<button class="font-display btn tracking-wider uppercase btn-primary">Update Password</button>
		</div>
	</div>

	<!-- Account Stats -->
	<div class="platform-card">
		<h2 class="platform-card__title" style="margin-bottom: 1.25rem;">Account Overview</h2>
		<div class="platform-stats">
			<div class="platform-stat">
				<span class="platform-stat__label">Total Orders</span>
				<span class="platform-stat__value" style="color: oklch(var(--p));"
					>{data.stats?.totalOrders || 0}</span
				>
			</div>
			<div class="platform-stat">
				<span class="platform-stat__label">Wishlist Items</span>
				<span class="platform-stat__value" style="color: oklch(var(--s));"
					>{data.stats?.wishlistItems || 0}</span
				>
			</div>
		</div>
	</div>

	<!-- Account Actions -->
	<div class="platform-card">
		<h2 class="platform-card__title" style="margin-bottom: 1.25rem;">Account Actions</h2>
		<div class="actions-stack">
			<a href="/account/settings" class="platform-action-btn">
				<Icon name="mail" size={20} />
				Email Preferences
			</a>
			<a href="/account/settings" class="platform-action-btn">
				<Icon name="bell" size={20} />
				Notification Settings
			</a>
			<a href="/account/settings" class="platform-action-btn">
				<Icon name="moon" size={20} />
				Theme Preferences
			</a>
			<button class="platform-action-btn platform-action-btn--danger">
				<Icon name="alert-triangle" size={20} />
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
</style>
