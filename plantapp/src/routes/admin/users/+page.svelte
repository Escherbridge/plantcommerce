<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

<div class="space-y-6">
	<h1 class="text-3xl font-bold">User Management</h1>

	{#if data.users && data.users.length > 0}
		<div class="overflow-x-auto">
			<table class="table">
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
					{#each data.users as user}
						<tr>
							<td>{user.firstName} {user.lastName}</td>
							<td>{user.email}</td>
							<td><span class="badge badge-primary">{user.role}</span></td>
							<td>
								<span class="badge {user.isActive ? 'badge-success' : 'badge-error'}">
									{user.isActive ? 'Active' : 'Inactive'}
								</span>
							</td>
							<td>{new Date(user.createdAt).toLocaleDateString()}</td>
							<td>
								<a href="/admin/users/{user.id}" class="btn btn-xs btn-outline">Edit</a>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{:else}
		<p class="text-center py-8">No users found</p>
	{/if}
</div>
