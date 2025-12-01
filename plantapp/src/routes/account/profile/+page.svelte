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
			<h1 class="text-4xl font-bold mb-2">My Profile</h1>
			<p class="text-lg text-base-content/70">Manage your account information and preferences</p>
		</div>

		<div class="grid md:grid-cols-3 gap-6">
			<!-- Sidebar Navigation -->
			<div class="card bg-base-100 shadow-xl h-fit">
				<div class="card-body">
					<h3 class="card-title text-sm">Account Menu</h3>
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
				<div class="card bg-base-100 shadow-xl">
					<div class="card-body">
						<div class="flex justify-between items-center mb-4">
							<h2 class="card-title">Personal Information</h2>
							<button
								class="btn btn-sm btn-outline"
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
								<button class="btn btn-primary">Save Changes</button>
							</div>
						{/if}
					</div>
				</div>

				<!-- Password Change -->
				<div class="card bg-base-100 shadow-xl">
					<div class="card-body">
						<h2 class="card-title mb-4">Change Password</h2>
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
							<button class="btn btn-primary">Update Password</button>
						</div>
					</div>
				</div>

				<!-- Account Stats -->
				<div class="card bg-base-100 shadow-xl">
					<div class="card-body">
						<h2 class="card-title mb-4">Account Overview</h2>
						<div class="grid grid-cols-2 gap-4">
							<div class="stat bg-base-200 rounded-lg">
								<div class="stat-title">Total Orders</div>
								<div class="stat-value text-primary">{data.stats?.totalOrders || 0}</div>
							</div>
							<div class="stat bg-base-200 rounded-lg">
								<div class="stat-title">Wishlist Items</div>
								<div class="stat-value text-secondary">{data.stats?.wishlistItems || 0}</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Account Actions -->
				<div class="card bg-base-100 shadow-xl">
					<div class="card-body">
						<h2 class="card-title mb-4">Account Actions</h2>
						<div class="space-y-2">
							<button class="btn btn-outline w-full justify-start">
								📧 Email Preferences
							</button>
							<button class="btn btn-outline w-full justify-start">
								🔔 Notification Settings
							</button>
							<button class="btn btn-outline w-full justify-start">
								🌙 Theme Preferences
							</button>
							<button class="btn btn-outline btn-error w-full justify-start">
								⚠️ Delete Account
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</Container>
</Section>
