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
		<div class="mb-8">
			<h1 class="text-4xl font-display uppercase tracking-tight mb-2">My Profile</h1>
			<p class="text-lg text-base-content/70">Manage your account information and preferences</p>
		</div>

		<div class="grid md:grid-cols-3 gap-6">
			<!-- Sidebar Navigation -->
			<div class="card bg-base-100 shadow-md rounded-3xl border border-base-200/30 h-fit">
				<div class="card-body">
					<h3 class="card-title text-sm font-display uppercase tracking-tight">Account Menu</h3>
					<ul class="menu p-0">
						<li><a href="/account/profile" class="active">Profile</a></li>
						<li><a href="/account/orders">Orders</a></li>
						<li><a href="/account/wishlist">Wishlist</a></li>
						<li><a href="/account/addresses">Addresses</a></li>
						<li><a href="/account/payment-methods">Payment Methods</a></li>
						<li><a href="/account/settings">Settings</a></li>
					</ul>
				</div>
			</div>

			<!-- Main Content -->
			<div class="md:col-span-2 space-y-6">
				<!-- Personal Information -->
				<div class="card bg-base-100 shadow-md rounded-3xl border border-base-200/30">
					<div class="card-body">
						<div class="flex justify-between items-center mb-4">
							<h2 class="card-title font-display uppercase tracking-tight">Personal Information</h2>
							<button
								class="btn btn-sm btn-outline font-display uppercase tracking-wider"
								onclick={() => (editMode = !editMode)}
							>
								{editMode ? 'Cancel' : 'Edit'}
							</button>
						</div>

						<div class="grid md:grid-cols-2 gap-4">
							<div class="form-control">
								<label class="label" for="firstName">
									<span class="label-text">First Name</span>
								</label>
								<input
									id="firstName"
									type="text"
									class="input input-bordered"
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
									class="input input-bordered"
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
									class="input input-bordered"
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
									class="input input-bordered"
									bind:value={formData.phone}
									disabled={!editMode}
								/>
							</div>
						</div>

						{#if editMode}
							<div class="card-actions justify-end mt-4">
								<button class="btn btn-primary font-display uppercase tracking-wider">Save Changes</button>
							</div>
						{/if}
					</div>
				</div>

				<!-- Password Change -->
				<div class="card bg-base-100 shadow-md rounded-3xl border border-base-200/30">
					<div class="card-body">
						<h2 class="card-title font-display uppercase tracking-tight mb-4">Change Password</h2>
						<div class="space-y-4">
							<div class="form-control">
								<label class="label" for="currentPassword">
									<span class="label-text">Current Password</span>
								</label>
								<input
									id="currentPassword"
									type="password"
									class="input input-bordered"
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
									class="input input-bordered"
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
									class="input input-bordered"
									placeholder="Confirm new password"
								/>
							</div>
						</div>

						<div class="card-actions justify-end mt-4">
							<button class="btn btn-primary font-display uppercase tracking-wider">Update Password</button>
						</div>
					</div>
				</div>

				<!-- Account Stats -->
				<div class="card bg-base-100 shadow-md rounded-3xl border border-base-200/30">
					<div class="card-body">
						<h2 class="card-title font-display uppercase tracking-tight mb-4">Account Overview</h2>
						<div class="grid grid-cols-2 gap-4">
							<div class="stat bg-base-200 rounded-3xl">
								<div class="stat-title">Total Orders</div>
								<div class="stat-value text-primary">{data.stats?.totalOrders || 0}</div>
							</div>
							<div class="stat bg-base-200 rounded-3xl">
								<div class="stat-title">Wishlist Items</div>
								<div class="stat-value text-secondary">{data.stats?.wishlistItems || 0}</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Account Actions -->
				<div class="card bg-base-100 shadow-md rounded-3xl border border-base-200/30">
					<div class="card-body">
						<h2 class="card-title font-display uppercase tracking-tight mb-4">Account Actions</h2>
						<div class="space-y-2">
							<button class="btn btn-outline w-full justify-start font-display uppercase tracking-wider">
								<svg viewBox="0 0 24 24" class="w-5 h-5 mr-2" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
									<path d="M3 5h18v14H3V5zM3 5l9 7 9-7"/>
								</svg>
								Email Preferences
							</button>
							<button class="btn btn-outline w-full justify-start font-display uppercase tracking-wider">
								<svg viewBox="0 0 24 24" class="w-5 h-5 mr-2" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
									<path d="M15 17h5l-1.4-1.4A6 6 0 0118 11V8a6 6 0 00-12 0v3c0 1.3-.4 2.5-1.2 3.6L4 17h5m6 0v1a3 3 0 01-6 0v-1m6 0H9"/>
								</svg>
								Notification Settings
							</button>
							<button class="btn btn-outline w-full justify-start font-display uppercase tracking-wider">
								<svg viewBox="0 0 24 24" class="w-5 h-5 mr-2" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
									<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
								</svg>
								Theme Preferences
							</button>
							<button class="btn btn-outline btn-error w-full justify-start font-display uppercase tracking-wider">
								<svg viewBox="0 0 24 24" class="w-5 h-5 mr-2" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
									<path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
								</svg>
								Delete Account
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</Container>
</Section>
