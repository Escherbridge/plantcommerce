<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let searchQuery = $state('');
	let selectedRole = $state('all');

	const users = $derived(data.users || []);

	const filteredUsers = $derived(() => {
		let filtered = users;
		if (searchQuery) {
			const q = searchQuery.toLowerCase();
			filtered = filtered.filter(
				(u: any) =>
					u.firstName?.toLowerCase().includes(q) ||
					u.lastName?.toLowerCase().includes(q) ||
					u.email?.toLowerCase().includes(q)
			);
		}
		if (selectedRole !== 'all') {
			filtered = filtered.filter((u: any) => u.role === selectedRole);
		}
		return filtered;
	});

	function getRoleBadgeClass(role: string): string {
		switch (role?.toLowerCase()) {
			case 'admin':
				return 'platform-badge platform-badge--primary';
			case 'affiliate':
				return 'platform-badge platform-badge--secondary';
			case 'customer':
				return 'platform-badge platform-badge--ghost';
			default:
				return 'platform-badge platform-badge--ghost';
		}
	}
</script>

<div class="platform-content">
	<div class="platform-header">
		<h1 class="platform-header__title">Users</h1>
		<p class="platform-header__subtitle">Manage registered users and roles</p>
	</div>

	<!-- Filters -->
	<div class="admin-filters">
		<input
			type="text"
			placeholder="Search users..."
			class="admin-search-input"
			bind:value={searchQuery}
		/>
		<select class="admin-filter-select" bind:value={selectedRole}>
			<option value="all">All Roles</option>
			<option value="admin">Admin</option>
			<option value="affiliate">Affiliate</option>
			<option value="customer">Customer</option>
		</select>
	</div>

	{#if filteredUsers().length > 0}
		<div class="platform-table-wrapper">
			<table class="platform-table">
				<thead>
					<tr>
						<th>Name</th>
						<th>Email</th>
						<th>Role</th>
						<th>Status</th>
						<th>Joined</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each filteredUsers() as user}
						<tr>
							<td class="font-semibold">{user.firstName} {user.lastName}</td>
							<td>{user.email}</td>
							<td>
								<span class={getRoleBadgeClass(user.role)}>{user.role}</span>
							</td>
							<td>
								<span
									class="platform-badge {user.isActive
										? 'platform-badge--success'
										: 'platform-badge--error'}"
								>
									{user.isActive ? 'Active' : 'Inactive'}
								</span>
							</td>
							<td>{new Date(user.createdAt).toLocaleDateString()}</td>
							<td>
								<div class="admin-action-group">
									<select
										class="admin-role-select"
										value={user.role}
										onclick={(e) => e.stopPropagation()}
									>
										<option value="customer">Customer</option>
										<option value="affiliate">Affiliate</option>
										<option value="admin">Admin</option>
									</select>
									<button class="platform-action-btn admin-table-btn">
										{user.isActive ? 'Deactivate' : 'Activate'}
									</button>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{:else}
		<div class="platform-empty">
			<p class="platform-empty__title">No Users Found</p>
			<p class="platform-empty__text">
				{searchQuery || selectedRole !== 'all'
					? 'Try adjusting your search or filter criteria.'
					: 'No registered users yet.'}
			</p>
		</div>
	{/if}
</div>

<style>
	.admin-filters {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.admin-search-input {
		flex: 1;
		min-width: 200px;
		padding: 0.625rem 1rem;
		border: 1.5px solid var(--input-border);
		border-radius: var(--input-radius, 10px);
		background: oklch(var(--b1));
		color: oklch(var(--bc));
		font-size: 0.875rem;
		transition: border-color 150ms ease;
	}

	.admin-search-input:focus {
		outline: none;
		border-color: oklch(var(--p));
		box-shadow: var(--shadow-glow-focus);
	}

	.admin-search-input::placeholder {
		color: oklch(var(--bc) / 0.4);
	}

	.admin-filter-select {
		padding: 0.625rem 2rem 0.625rem 1rem;
		border: 1.5px solid var(--input-border);
		border-radius: var(--input-radius, 10px);
		background: oklch(var(--b1));
		color: oklch(var(--bc));
		font-size: 0.875rem;
		cursor: pointer;
		appearance: auto;
	}

	.admin-action-group {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.admin-table-btn {
		width: auto;
		padding: 0.375rem 0.75rem;
		font-size: 0.75rem;
	}

	.admin-role-select {
		padding: 0.25rem 0.5rem;
		border: 1px solid var(--input-border);
		border-radius: 6px;
		background: oklch(var(--b1));
		color: oklch(var(--bc));
		font-size: 0.75rem;
		cursor: pointer;
	}
</style>
