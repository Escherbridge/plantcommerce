<script lang="ts">
	import { onMount } from 'svelte';
	import { trpc } from '$lib/trpc/client';
	import { formatRelativeTime } from '$lib/utils/relativeTime';

	interface Notification {
		id: string;
		title: string;
		message: string;
		link?: string | null;
		isRead: boolean;
		createdAt: string;
		userId?: string;
		type?: string;
	}

	let open = $state(false);
	let notifications = $state<Notification[]>([]);
	let unreadCount = $state(0);
	let bellRef = $state<HTMLDivElement | null>(null);
	let refreshInterval: ReturnType<typeof setInterval> | undefined;

	async function fetchNotifications() {
		try {
			const [items, count] = await Promise.all([
				trpc.notification.getUnread.query(),
				trpc.notification.getUnreadCount.query()
			]);
			notifications = items as Notification[];
			unreadCount = count as number;
		} catch {
			// tRPC router may not be wired up yet — degrade gracefully
			notifications = [];
			unreadCount = 0;
		}
	}

	async function markRead(id: string) {
		// Optimistic update
		notifications = notifications.filter((n) => n.id !== id);
		unreadCount = Math.max(0, unreadCount - 1);
		try {
			await trpc.notification.markRead.mutate({ id });
		} catch {
			// Silently fail if router missing
		}
	}

	async function markAllRead() {
		notifications = [];
		unreadCount = 0;
		try {
			await trpc.notification.markAllRead.mutate();
		} catch {
			// Silently fail if router missing
		}
	}

	function truncate(text: string, max: number): string {
		return text.length > max ? text.slice(0, max) + '...' : text;
	}

	function handleClickOutside(e: MouseEvent) {
		if (bellRef && !bellRef.contains(e.target as Node)) {
			open = false;
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && open) {
			open = false;
		}
	}

	onMount(() => {
		fetchNotifications();
		refreshInterval = setInterval(fetchNotifications, 60_000);
		return () => {
			if (refreshInterval) clearInterval(refreshInterval);
		};
	});

	$effect(() => {
		if (open) {
			document.addEventListener('click', handleClickOutside, true);
			document.addEventListener('keydown', handleKeydown);
		} else {
			document.removeEventListener('click', handleClickOutside, true);
			document.removeEventListener('keydown', handleKeydown);
		}
		return () => {
			document.removeEventListener('click', handleClickOutside, true);
			document.removeEventListener('keydown', handleKeydown);
		};
	});
</script>

<div class="notification-bell" bind:this={bellRef}>
	<button
		class="bell-btn"
		onclick={() => (open = !open)}
		aria-label="Notifications{unreadCount > 0 ? ` (${unreadCount} unread)` : ''}"
		aria-expanded={open}
	>
		<svg
			viewBox="0 0 24 24"
			width="24"
			height="24"
			stroke="currentColor"
			stroke-width="1.5"
			fill="none"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
			<path d="M13.73 21a2 2 0 0 1-3.46 0" />
		</svg>
		{#if unreadCount > 0}
			<span class="badge" aria-hidden="true">{unreadCount > 99 ? '99+' : unreadCount}</span>
		{/if}
	</button>

	{#if open}
		<div class="dropdown" role="dialog" aria-label="Notifications">
			<div class="dropdown-header">
				<span class="dropdown-title">Notifications</span>
				{#if notifications.length > 0}
					<button class="mark-all-btn" onclick={markAllRead}>Mark all read</button>
				{/if}
			</div>

			{#if notifications.length === 0}
				<div class="empty-state">No notifications</div>
			{:else}
				<ul class="notification-list">
					{#each notifications as notif (notif.id)}
						<li class="notification-item" class:unread={!notif.isRead}>
							<div class="notif-content">
								{#if notif.link}
									<a href={notif.link} class="notif-link" onclick={() => markRead(notif.id)}>
										<span class="notif-title">{notif.title}</span>
										<span class="notif-message">{truncate(notif.message, 80)}</span>
									</a>
								{:else}
									<div class="notif-text">
										<span class="notif-title">{notif.title}</span>
										<span class="notif-message">{truncate(notif.message, 80)}</span>
									</div>
								{/if}
								<div class="notif-meta">
									<span class="notif-time">{formatRelativeTime(notif.createdAt)}</span>
									<button
										class="notif-dismiss"
										onclick={() => markRead(notif.id)}
										aria-label="Mark as read"
									>
										<svg
											viewBox="0 0 24 24"
											width="14"
											height="14"
											stroke="currentColor"
											stroke-width="2"
											fill="none"
											stroke-linecap="round"
											stroke-linejoin="round"
										>
											<polyline points="20 6 9 17 4 12" />
										</svg>
									</button>
								</div>
							</div>
						</li>
					{/each}
				</ul>
			{/if}

			<div class="dropdown-footer">
				<a href="/account/notifications" class="view-all-link">View all notifications</a>
			</div>
		</div>
	{/if}
</div>

<style>
	.notification-bell {
		position: relative;
	}

	.bell-btn {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.25rem;
		height: 2.25rem;
		border: 1.5px solid var(--input-border);
		border-radius: calc(var(--input-radius, 10px) - 2px);
		background: transparent;
		color: oklch(var(--bc) / 0.7);
		cursor: pointer;
		transition:
			border-color 150ms ease,
			color 150ms ease,
			background-color 150ms ease;
	}

	.bell-btn:hover {
		border-color: var(--input-border-hover);
		color: oklch(var(--bc));
		background: oklch(var(--p) / 0.04);
	}

	.bell-btn:focus-visible {
		outline: none;
		box-shadow: var(--shadow-glow-focus);
	}

	.badge {
		position: absolute;
		top: -4px;
		right: -4px;
		min-width: 1.125rem;
		height: 1.125rem;
		padding: 0 0.3rem;
		border-radius: 9999px;
		background: oklch(var(--a));
		color: oklch(var(--ac, 1 0 0));
		font-size: 0.625rem;
		font-weight: 700;
		line-height: 1.125rem;
		text-align: center;
		pointer-events: none;
	}

	/* Dropdown */
	.dropdown {
		position: absolute;
		top: calc(100% + 0.5rem);
		right: 0;
		width: 20rem;
		max-height: 24rem;
		display: flex;
		flex-direction: column;
		background: oklch(var(--b1));
		border: 1.5px solid var(--input-border);
		border-radius: var(--radius-lg, 16px);
		box-shadow: var(--shadow-glow-lg);
		z-index: 50;
		animation: dropdown-in 150ms ease;
	}

	@keyframes dropdown-in {
		from {
			opacity: 0;
			transform: translateY(4px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.dropdown {
			animation: none;
		}
	}

	.dropdown-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1rem;
		border-bottom: 1px solid var(--input-border);
	}

	.dropdown-title {
		font-weight: 600;
		font-size: 0.875rem;
		color: oklch(var(--bc));
	}

	.mark-all-btn {
		background: none;
		border: none;
		color: oklch(var(--p));
		font-size: 0.75rem;
		font-weight: 500;
		cursor: pointer;
		padding: 0.25rem 0.5rem;
		border-radius: 6px;
		transition: background 150ms ease;
	}

	.mark-all-btn:hover {
		background: oklch(var(--p) / 0.08);
	}

	.mark-all-btn:focus-visible {
		outline: none;
		box-shadow: var(--shadow-glow-focus);
	}

	/* List */
	.notification-list {
		list-style: none;
		margin: 0;
		padding: 0;
		overflow-y: auto;
		flex: 1;
	}

	.notification-item {
		border-bottom: 1px solid oklch(var(--bc) / 0.06);
	}

	.notification-item.unread {
		border-left: 3px solid oklch(var(--p));
	}

	.notif-content {
		padding: 0.625rem 1rem;
	}

	.notif-link,
	.notif-text {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		text-decoration: none;
		color: inherit;
	}

	.notif-link:hover {
		background: oklch(var(--p) / 0.03);
	}

	.notif-link:focus-visible {
		outline: none;
		box-shadow: var(--shadow-glow-focus);
		border-radius: 4px;
	}

	.notif-title {
		font-weight: 600;
		font-size: 0.8125rem;
		color: oklch(var(--bc));
	}

	.notif-message {
		font-size: 0.75rem;
		color: oklch(var(--bc) / 0.6);
		line-height: 1.4;
	}

	.notif-meta {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: 0.375rem;
	}

	.notif-time {
		font-size: 0.6875rem;
		color: oklch(var(--bc) / 0.45);
	}

	.notif-dismiss {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.5rem;
		height: 1.5rem;
		border: none;
		border-radius: 4px;
		background: transparent;
		color: oklch(var(--bc) / 0.4);
		cursor: pointer;
		transition:
			background 150ms ease,
			color 150ms ease;
	}

	.notif-dismiss:hover {
		background: oklch(var(--p) / 0.08);
		color: oklch(var(--p));
	}

	.notif-dismiss:focus-visible {
		outline: none;
		box-shadow: var(--shadow-glow-focus);
	}

	/* Empty state */
	.empty-state {
		padding: 2rem 1rem;
		text-align: center;
		color: oklch(var(--bc) / 0.45);
		font-size: 0.8125rem;
	}

	/* Footer */
	.dropdown-footer {
		padding: 0.5rem 1rem;
		border-top: 1px solid var(--input-border);
		text-align: center;
	}

	.view-all-link {
		font-size: 0.75rem;
		color: oklch(var(--p));
		text-decoration: none;
		font-weight: 500;
	}

	.view-all-link:hover {
		text-decoration: underline;
	}

	.view-all-link:focus-visible {
		outline: none;
		box-shadow: var(--shadow-glow-focus);
		border-radius: 4px;
	}
</style>
