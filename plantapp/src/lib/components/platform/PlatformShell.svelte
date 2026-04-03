<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { NavigationConfig, PlatformUser } from './types';
	import PlatformSidebar from './PlatformSidebar.svelte';
	import PlatformBreadcrumbs from './PlatformBreadcrumbs.svelte';
	import NotificationBell from './NotificationBell.svelte';
	import CommandPalette from './CommandPalette.svelte';

	interface Props {
		navigation: NavigationConfig;
		user: PlatformUser;
		currentPath: string;
		breadcrumbOverrides?: Record<string, string>;
		children: Snippet;
	}

	let {
		navigation,
		user,
		currentPath,
		breadcrumbOverrides = {},
		children
	}: Props = $props();

	let sidebarCollapsed = $state(false);
	let mobileOpen = $state(false);

	function handleLogout() {
		// Dispatched to parent — layout handles the actual logout
		const event = new CustomEvent('platformlogout', { bubbles: true });
		document.dispatchEvent(event);
	}
</script>

<div class="platform-shell" class:platform-shell--collapsed={sidebarCollapsed}>
	<!-- Desktop Sidebar -->
	<PlatformSidebar
		{navigation}
		{user}
		{currentPath}
		bind:collapsed={sidebarCollapsed}
		bind:mobileOpen
		onlogout={handleLogout}
	/>

	<!-- Main Content Area -->
	<main class="platform-main">
		<!-- Top bar: mobile toggle + breadcrumbs -->
		<header class="platform-topbar">
			<button
				class="platform-mobile-toggle"
				onclick={() => (mobileOpen = true)}
				aria-label="Open navigation menu"
			>
				<svg viewBox="0 0 24 24" class="w-5 h-5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
					<path d="M4 6h16M4 12h16M4 18h16" />
				</svg>
			</button>

			<PlatformBreadcrumbs path={currentPath} overrides={breadcrumbOverrides} />

			<div class="topbar-actions">
				<span class="kbd-hint">Ctrl+K</span>
				<NotificationBell />
			</div>
		</header>

		<!-- Page content -->
		<div class="platform-page">
			{@render children()}
		</div>
	</main>

	<CommandPalette userRole={user.role} />
</div>

<style>
	.platform-shell {
		display: flex;
		min-height: 100vh;
		background: oklch(var(--b1));
	}

	.platform-main {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-width: 0;
		overflow-y: auto;
	}

	.platform-topbar {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.875rem 1.5rem;
		border-bottom: 1px solid var(--input-border);
		background: oklch(var(--b1));
		position: sticky;
		top: 0;
		z-index: 10;
	}

	.platform-mobile-toggle {
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
		transition: border-color 150ms ease, color 150ms ease, background-color 150ms ease;
	}

	.platform-mobile-toggle:hover {
		border-color: var(--input-border-hover);
		color: oklch(var(--bc));
		background: oklch(var(--p) / 0.04);
	}

	.platform-mobile-toggle:focus-visible {
		outline: none;
		box-shadow: var(--shadow-glow-focus);
	}

	.topbar-actions {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		margin-left: auto;
	}

	.kbd-hint {
		display: none;
		font-size: 0.6875rem;
		font-weight: 500;
		padding: 0.125rem 0.5rem;
		border: 1px solid oklch(var(--bc) / 0.15);
		border-radius: 6px;
		background: oklch(var(--bc) / 0.04);
		color: oklch(var(--bc) / 0.4);
		white-space: nowrap;
	}

	@media (min-width: 768px) {
		.kbd-hint {
			display: inline-block;
		}
	}

	/* Hide mobile toggle on desktop */
	@media (min-width: 1024px) {
		.platform-mobile-toggle {
			display: none;
		}
	}

	.platform-page {
		flex: 1;
		padding: 1.5rem;
		max-width: 80rem;
		width: 100%;
	}

	@media (min-width: 1024px) {
		.platform-page {
			padding: 2rem 2.5rem;
		}
	}
</style>
