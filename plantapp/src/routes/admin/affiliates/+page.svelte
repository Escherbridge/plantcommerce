<script lang="ts">
	import { trpc } from '$lib/trpc/client';
	import { toasts } from '$lib/stores/toast';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let selectedTab = $state<'pending' | 'all'>('pending');
	let searchQuery = $state('');
	let selectedStatus = $state('all');
	let isProcessing = $state(false);

	const affiliates = $derived(selectedTab === 'pending' ? data.pending : data.all);

	const filteredAffiliates = $derived(() => {
		let filtered = affiliates;

		if (searchQuery) {
			const q = searchQuery.toLowerCase();
			filtered = filtered.filter(
				(a: any) =>
					a.user?.firstName?.toLowerCase().includes(q) ||
					a.user?.lastName?.toLowerCase().includes(q) ||
					a.user?.email?.toLowerCase().includes(q) ||
					a.affiliateCode?.toLowerCase().includes(q)
			);
		}

		if (selectedStatus !== 'all') {
			filtered = filtered.filter((a: any) => a.status === selectedStatus);
		}

		return filtered;
	});

	function getStatusBadgeClass(status: string): string {
		switch (status?.toLowerCase()) {
			case 'active':
				return 'platform-badge platform-badge--success';
			case 'pending':
				return 'platform-badge platform-badge--warning';
			case 'rejected':
				return 'platform-badge platform-badge--error';
			case 'suspended':
				return 'platform-badge platform-badge--ghost';
			default:
				return 'platform-badge platform-badge--ghost';
		}
	}

	function getTrafficLabel(traffic: string | null): string {
		if (!traffic) return 'N/A';
		switch (traffic) {
			case 'under-1k':
				return 'Under 1K';
			case '1k-5k':
				return '1K-5K';
			case '5k-25k':
				return '5K-25K';
			case '25k-100k':
				return '25K-100K';
			case '100k+':
				return '100K+';
			default:
				return traffic;
		}
	}

	function getAudienceLabel(audience: string | null): string {
		if (!audience) return 'N/A';
		switch (audience) {
			case 'gardeners':
				return 'Home Gardeners';
			case 'farmers':
				return 'Farmers';
			case 'sustainability':
				return 'Sustainability';
			case 'educators':
				return 'Educators';
			case 'commercial':
				return 'Commercial';
			default:
				return audience;
		}
	}

	async function approveAffiliate(affiliateId: number) {
		if (isProcessing) return;
		isProcessing = true;

		try {
			await trpc.admin.approveAffiliate.mutate({ affiliateId });
			toasts.addToast({
				message: 'Affiliate approved successfully',
				variant: 'success',
				duration: 3000
			});

			// Reload data
			data.pending = await trpc.admin.getPendingAffiliates.query({ limit: 100 });
			data.all = await trpc.admin.getAllAffiliates.query({ limit: 100 });
		} catch (error: any) {
			toasts.addToast({
				message: error?.message || 'Failed to approve affiliate',
				variant: 'error',
				duration: 3000
			});
		} finally {
			isProcessing = false;
		}
	}

	async function rejectAffiliate(affiliateId: number) {
		if (isProcessing) return;
		if (!confirm('Are you sure you want to reject this affiliate application?')) return;

		isProcessing = true;

		try {
			await trpc.admin.rejectAffiliate.mutate({ affiliateId });
			toasts.addToast({
				message: 'Affiliate rejected',
				variant: 'success',
				duration: 3000
			});

			// Reload data
			data.pending = await trpc.admin.getPendingAffiliates.query({ limit: 100 });
			data.all = await trpc.admin.getAllAffiliates.query({ limit: 100 });
		} catch (error: any) {
			toasts.addToast({
				message: error?.message || 'Failed to reject affiliate',
				variant: 'error',
				duration: 3000
			});
		} finally {
			isProcessing = false;
		}
	}
</script>

<div class="platform-content">
	<div class="platform-header">
		<h1 class="platform-header__title">Affiliate Management</h1>
		<p class="platform-header__subtitle">Review and manage affiliate applications and accounts</p>
	</div>

	<!-- Tab Navigation -->
	<div class="admin-tabs">
		<button
			class="admin-tab"
			class:admin-tab--active={selectedTab === 'pending'}
			onclick={() => {
				selectedTab = 'pending';
			}}
		>
			Pending Applications ({data.pending?.length || 0})
		</button>
		<button
			class="admin-tab"
			class:admin-tab--active={selectedTab === 'all'}
			onclick={() => {
				selectedTab = 'all';
			}}
		>
			All Affiliates ({data.all?.length || 0})
		</button>
	</div>

	<!-- Filters -->
	<div class="admin-filters">
		<input
			type="text"
			placeholder="Search by name, email, or code..."
			class="admin-search-input"
			bind:value={searchQuery}
		/>
		{#if selectedTab === 'all'}
			<select class="admin-filter-select" bind:value={selectedStatus}>
				<option value="all">All Statuses</option>
				<option value="pending">Pending</option>
				<option value="active">Active</option>
				<option value="rejected">Rejected</option>
				<option value="suspended">Suspended</option>
			</select>
		{/if}
	</div>

	<!-- Affiliates Table -->
	{#if filteredAffiliates().length > 0}
		<div class="platform-table-wrapper">
			<table class="platform-table">
				<thead>
					<tr>
						<th>Name</th>
						<th>Email</th>
						<th>Website</th>
						<th>Social Media</th>
						<th>Audience</th>
						<th>Monthly Traffic</th>
						<th>Why Join</th>
						<th>Status</th>
						<th>Joined</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each filteredAffiliates() as aff}
						<tr>
							<td class="font-semibold">{aff.user?.firstName || ''} {aff.user?.lastName || ''}</td>
							<td>
								<a href="mailto:{aff.user?.email}" class="link link-primary">
									{aff.user?.email}
								</a>
							</td>
							<td>
								{#if aff.website}
									<a href={aff.website} target="_blank" class="link text-xs link-primary">
										{new URL(aff.website).hostname}
									</a>
								{:else}
									<span class="text-gray-400">N/A</span>
								{/if}
							</td>
							<td>
								{#if aff.socialMedia}
									<a href={aff.socialMedia} target="_blank" class="link text-xs link-primary">
										Profile
									</a>
								{:else}
									<span class="text-gray-400">N/A</span>
								{/if}
							</td>
							<td>{getAudienceLabel(aff.audience)}</td>
							<td>{getTrafficLabel(aff.monthlyTraffic)}</td>
							<td>
								<span class="truncate-text" title={aff.whyJoin || ''}>
									{aff.whyJoin ? aff.whyJoin.substring(0, 30) + '...' : 'N/A'}
								</span>
							</td>
							<td>
								<span class={getStatusBadgeClass(aff.status)}>{aff.status}</span>
							</td>
							<td>{new Date(aff.createdAt).toLocaleDateString()}</td>
							<td>
								<div class="admin-action-group">
									{#if aff.status === 'pending'}
										<button
											class="platform-action-btn admin-table-btn admin-table-btn--approve"
											onclick={() => approveAffiliate(aff.id)}
											disabled={isProcessing}
										>
											Approve
										</button>
										<button
											class="platform-action-btn admin-table-btn admin-table-btn--reject"
											onclick={() => rejectAffiliate(aff.id)}
											disabled={isProcessing}
										>
											Reject
										</button>
									{:else if aff.status === 'active'}
										<span class="text-xs text-gray-500">Active</span>
									{:else}
										<span class="text-xs text-gray-500">{aff.status}</span>
									{/if}
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{:else}
		<div class="platform-empty">
			<p class="platform-empty__title">No affiliates found</p>
			<p class="platform-empty__text">
				{#if selectedTab === 'pending'}
					No pending affiliate applications at this time.
				{:else}
					No affiliates match your filters.
				{/if}
			</p>
		</div>
	{/if}
</div>

<style>
	.admin-tabs {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
		border-bottom: 1px solid var(--input-border);
	}

	.admin-tab {
		padding: 0.75rem 1.25rem;
		border: none;
		background: none;
		color: oklch(var(--bc) / 0.6);
		font-family: var(--font-display);
		font-size: 0.875rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		cursor: pointer;
		border-bottom: 2px solid transparent;
		transition: all 200ms ease;
	}

	.admin-tab:hover {
		color: oklch(var(--bc));
	}

	.admin-tab--active {
		color: oklch(var(--p));
		border-bottom-color: oklch(var(--p));
	}

	.truncate-text {
		display: block;
		max-width: 150px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.admin-table-btn--approve {
		background: oklch(var(--su));
		color: oklch(var(--suc));
	}

	.admin-table-btn--approve:hover:not(:disabled) {
		opacity: 0.9;
	}

	.admin-table-btn--reject {
		background: oklch(var(--er));
		color: oklch(var(--erc));
	}

	.admin-table-btn--reject:hover:not(:disabled) {
		opacity: 0.9;
	}

	.admin-table-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
