<script lang="ts">
	import type { PageData } from './$types';
	import { trpc } from '$lib/trpc/client';
	import { invalidateAll } from '$app/navigation';

	let { data }: { data: PageData } = $props();

	let searchQuery = $state('');
	let selectedStatus = $state('all');
	let busyId = $state<string | null>(null);

	const courses = $derived((data.courses as any[]) || []);

	const filteredCourses = $derived(() => {
		let filtered = courses;
		if (searchQuery) {
			const q = searchQuery.toLowerCase();
			filtered = filtered.filter(
				(c: any) => c.title?.toLowerCase().includes(q) || c.slug?.toLowerCase().includes(q)
			);
		}
		if (selectedStatus !== 'all') {
			filtered = filtered.filter((c: any) => (c.status || 'draft') === selectedStatus);
		}
		return filtered;
	});

	function getStatusBadgeClass(status: string): string {
		switch (status?.toLowerCase()) {
			case 'published':
				return 'platform-badge platform-badge--success';
			case 'draft':
				return 'platform-badge platform-badge--ghost';
			case 'archived':
				return 'platform-badge platform-badge--error';
			default:
				return 'platform-badge platform-badge--ghost';
		}
	}

	async function handlePublish(id: string) {
		if (busyId) return;
		busyId = id;
		try {
			await trpc.lms.course.publish.mutate({ id });
			await invalidateAll();
		} catch (err) {
			console.error('Publish error:', err);
			alert('Failed to publish course');
		} finally {
			busyId = null;
		}
	}

	async function handleDelete(id: string, title: string) {
		if (busyId) return;
		if (!confirm(`Delete course "${title}"? This cannot be undone.`)) return;
		busyId = id;
		try {
			await trpc.lms.course.delete.mutate({ id });
			await invalidateAll();
		} catch (err) {
			console.error('Delete error:', err);
			alert('Failed to delete course');
		} finally {
			busyId = null;
		}
	}
</script>

<div class="platform-content">
	<div class="platform-header">
		<div class="admin-header-row">
			<div>
				<h1 class="platform-header__title">Courses</h1>
				<p class="platform-header__subtitle">Manage your LMS course catalog</p>
			</div>
			<a href="/admin/lms/courses/new" class="platform-action-btn admin-header-btn">
				<svg
					viewBox="0 0 24 24"
					class="h-5 w-5"
					stroke="currentColor"
					stroke-width="1.5"
					fill="none"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M12 5v14M5 12h14" />
				</svg>
				Create Course
			</a>
		</div>
	</div>

	<div class="admin-filters">
		<input
			type="text"
			placeholder="Search courses..."
			class="admin-search-input"
			bind:value={searchQuery}
		/>
		<select class="admin-filter-select" bind:value={selectedStatus}>
			<option value="all">All Status</option>
			<option value="draft">Draft</option>
			<option value="published">Published</option>
			<option value="archived">Archived</option>
		</select>
	</div>

	{#if filteredCourses().length > 0}
		<div class="platform-table-wrapper">
			<table class="platform-table">
				<thead>
					<tr>
						<th>Title</th>
						<th>Type</th>
						<th>Difficulty</th>
						<th>Status</th>
						<th>Price</th>
						<th>Enrollments</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each filteredCourses() as course}
						<tr>
							<td class="font-semibold">
								<a href="/admin/lms/courses/{course.id}">{course.title}</a>
								<div class="admin-meta-text">{course.slug}</div>
							</td>
							<td>{course.courseType || '—'}</td>
							<td>{course.difficulty || '—'}</td>
							<td>
								<span class={getStatusBadgeClass(course.status || 'draft')}>
									{course.status || 'draft'}
								</span>
							</td>
							<td>
								{course.pricingType === 'free' ? 'Free' : course.price ? `$${course.price}` : '—'}
							</td>
							<td>{course.enrollmentCount ?? 0}</td>
							<td>
								<div class="admin-action-group">
									<a
										href="/admin/lms/courses/{course.id}"
										class="platform-action-btn admin-table-btn"
									>
										Edit
									</a>
									{#if course.status !== 'published'}
										<button
											class="platform-action-btn admin-table-btn"
											disabled={busyId === course.id}
											onclick={() => handlePublish(course.id)}
										>
											Publish
										</button>
									{/if}
									<button
										class="btn btn-ghost btn-sm"
										disabled={busyId === course.id}
										onclick={() => handleDelete(course.id, course.title)}
									>
										Delete
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
			<p class="platform-empty__title">No Courses Found</p>
			<p class="platform-empty__text">
				{searchQuery || selectedStatus !== 'all'
					? 'Try adjusting your search or filters.'
					: 'Create your first course to get started.'}
			</p>
		</div>
	{/if}
</div>

<style>
	.admin-header-row {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.admin-header-btn {
		width: auto;
		white-space: nowrap;
	}

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
	}

	.admin-search-input:focus {
		outline: none;
		border-color: oklch(var(--p));
	}

	.admin-filter-select {
		padding: 0.625rem 2rem 0.625rem 1rem;
		border: 1.5px solid var(--input-border);
		border-radius: var(--input-radius, 10px);
		background: oklch(var(--b1));
		color: oklch(var(--bc));
		font-size: 0.875rem;
	}

	.admin-action-group {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.admin-table-btn {
		width: auto;
		padding: 0.375rem 0.75rem;
		font-size: 0.75rem;
	}

	.admin-meta-text {
		font-size: 0.75rem;
		color: oklch(var(--bc) / 0.5);
		font-family: monospace;
	}
</style>
