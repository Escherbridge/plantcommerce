<script lang="ts">
	import { onMount } from 'svelte';
	import type { NavigationConfig, PlatformUser } from './types';
	import PortalSwitcher from './PortalSwitcher.svelte';
	import { Icon } from '$lib/components/icons';

	interface Props {
		navigation: NavigationConfig;
		user: PlatformUser;
		currentPath: string;
		collapsed?: boolean;
		mobileOpen?: boolean;
		onlogout?: () => void;
	}

	let {
		navigation,
		user,
		currentPath,
		collapsed = $bindable(false),
		mobileOpen = $bindable(false),
		onlogout
	}: Props = $props();

	// Derived values
	const initials = $derived(
		user.name
			.split(' ')
			.map((n) => n[0])
			.slice(0, 2)
			.join('')
			.toUpperCase()
	);

	const roleBadgeClass = $derived(
		user.role === 'admin'
			? 'badge-primary'
			: user.role === 'affiliate'
				? 'badge-secondary'
				: 'badge-base'
	);

	function isActive(href: string): boolean {
		if (href === currentPath) return true;
		// Prefix match but not for short paths that would over-match
		if (href.length > 1 && currentPath.startsWith(href + '/')) return true;
		return false;
	}

	function closeMobile() {
		mobileOpen = false;
	}

	function toggleCollapsed() {
		collapsed = !collapsed;
		try {
			localStorage.setItem('aevani-sidebar-collapsed', String(collapsed));
		} catch {
			// ignore storage errors
		}
	}

	// Focus trap elements
	let sidebarEl: HTMLElement | undefined = $state();

	$effect(() => {
		if (mobileOpen && sidebarEl) {
			// Focus first focusable element
			const focusable = sidebarEl.querySelectorAll<HTMLElement>(
				'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
			);
			if (focusable.length > 0) {
				focusable[0].focus();
			}
		}
	});

	$effect(() => {
		function handleKeydown(e: KeyboardEvent) {
			if (!mobileOpen) return;
			if (e.key === 'Escape') {
				closeMobile();
				return;
			}
			// Focus trap
			if (e.key === 'Tab' && sidebarEl) {
				const focusable = Array.from(
					sidebarEl.querySelectorAll<HTMLElement>(
						'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
					)
				);
				if (focusable.length === 0) return;
				const first = focusable[0];
				const last = focusable[focusable.length - 1];
				if (e.shiftKey) {
					if (document.activeElement === first) {
						e.preventDefault();
						last.focus();
					}
				} else {
					if (document.activeElement === last) {
						e.preventDefault();
						first.focus();
					}
				}
			}
		}

		document.addEventListener('keydown', handleKeydown);
		return () => document.removeEventListener('keydown', handleKeydown);
	});

	onMount(() => {
		try {
			const stored = localStorage.getItem('aevani-sidebar-collapsed');
			if (stored !== null) {
				collapsed = stored === 'true';
			}
		} catch {
			// ignore storage errors
		}
	});
</script>

<!-- Desktop Sidebar -->
<aside class="platform-sidebar" class:collapsed aria-label="Platform navigation">
	<!-- User Profile Widget -->
	<div class="sidebar-profile">
		<div class="sidebar-avatar">
			{initials}
		</div>
		{#if !collapsed}
			<div class="sidebar-user-info">
				<span class="sidebar-user-name">{user.name}</span>
				<span class="sidebar-role-badge {roleBadgeClass}">{user.role}</span>
			</div>
		{/if}
	</div>

	<div class="sidebar-divider"></div>

	<!-- Navigation Groups -->
	<nav aria-label="Platform navigation" class="sidebar-nav">
		{#each navigation as group}
			<div class="sidebar-nav-group">
				{#if !collapsed}
					<span class="sidebar-group-title">{group.title}</span>
				{/if}
				<ul>
					{#each group.items as item}
						{@const active = isActive(item.href)}
						<li>
							<a
								href={item.href}
								class="sidebar-nav-item"
								class:active
								aria-current={active ? 'page' : undefined}
								title={collapsed ? item.label : undefined}
							>
								<Icon name={item.icon} class="nav-icon" />
								{#if !collapsed}
									<span class="nav-label">{item.label}</span>
									{#if item.badge !== undefined}
										<span class="nav-badge">{item.badge}</span>
									{/if}
								{/if}
							</a>
						</li>
					{/each}
				</ul>
			</div>
		{/each}
	</nav>

	<!-- Footer -->
	<div class="sidebar-footer">
		<PortalSwitcher role={user.role} {currentPath} {collapsed} />
		<div class="sidebar-divider"></div>
		<a href="/" class="sidebar-footer-item" title={collapsed ? 'Back to Store' : undefined}>
			<Icon name="home" class="nav-icon" />
			{#if !collapsed}
				<span class="nav-label">Back to Store</span>
			{/if}
		</a>

		{#if onlogout}
			<button
				class="sidebar-footer-item sidebar-logout"
				onclick={onlogout}
				title={collapsed ? 'Logout' : undefined}
			>
				<Icon name="log-out" class="nav-icon" />
				{#if !collapsed}
					<span class="nav-label">Logout</span>
				{/if}
			</button>
		{/if}

		<!-- Collapse Toggle -->
		<button
			class="sidebar-collapse-btn"
			onclick={toggleCollapsed}
			aria-expanded={!collapsed}
			aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
			title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
		>
			<Icon name="chevron-left" class="nav-icon collapse-chevron {collapsed ? 'rotated' : ''}" />
		</button>
	</div>
</aside>

<!-- Mobile Overlay -->
{#if mobileOpen}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<div class="mobile-backdrop" onclick={closeMobile} aria-hidden="true"></div>
{/if}

<aside
	class="mobile-sidebar"
	class:open={mobileOpen}
	aria-label="Platform navigation"
	bind:this={sidebarEl}
>
	<!-- User Profile Widget -->
	<div class="sidebar-profile">
		<div class="sidebar-avatar">
			{initials}
		</div>
		<div class="sidebar-user-info">
			<span class="sidebar-user-name">{user.name}</span>
			<span class="sidebar-role-badge {roleBadgeClass}">{user.role}</span>
		</div>
		<button class="mobile-close-btn" onclick={closeMobile} aria-label="Close sidebar">
			<Icon name="x" class="nav-icon" />
		</button>
	</div>

	<div class="sidebar-divider"></div>

	<!-- Navigation Groups -->
	<nav aria-label="Platform navigation" class="sidebar-nav">
		{#each navigation as group}
			<div class="sidebar-nav-group">
				<span class="sidebar-group-title">{group.title}</span>
				<ul>
					{#each group.items as item}
						{@const active = isActive(item.href)}
						<li>
							<a
								href={item.href}
								class="sidebar-nav-item"
								class:active
								aria-current={active ? 'page' : undefined}
								onclick={closeMobile}
							>
								<Icon name={item.icon} class="nav-icon" />
								<span class="nav-label">{item.label}</span>
								{#if item.badge !== undefined}
									<span class="nav-badge">{item.badge}</span>
								{/if}
							</a>
						</li>
					{/each}
				</ul>
			</div>
		{/each}
	</nav>

	<!-- Footer -->
	<div class="sidebar-footer">
		<PortalSwitcher role={user.role} {currentPath} collapsed={false} />
		<div class="sidebar-divider"></div>
		<a href="/" class="sidebar-footer-item" onclick={closeMobile}>
			<Icon name="home" class="nav-icon" />
			<span class="nav-label">Back to Store</span>
		</a>

		{#if onlogout}
			<button
				class="sidebar-footer-item sidebar-logout"
				onclick={() => {
					onlogout?.();
					closeMobile();
				}}
			>
				<Icon name="log-out" class="nav-icon" />
				<span class="nav-label">Logout</span>
			</button>
		{/if}
	</div>
</aside>

<style>
	/* ===== Desktop Sidebar ===== */
	.platform-sidebar {
		display: none;
		flex-direction: column;
		position: relative;
		height: 100vh;
		width: 16rem;
		background: oklch(var(--b2));
		border-right: 1.5px solid var(--input-border, oklch(var(--bc) / 0.15));
		overflow: hidden;
		transition: width 300ms ease-out;
		flex-shrink: 0;
	}

	@media (min-width: 1024px) {
		.platform-sidebar {
			display: flex;
		}
	}

	.platform-sidebar.collapsed {
		width: 4rem;
	}

	/* ===== Mobile Sidebar ===== */
	.mobile-backdrop {
		display: block;
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		z-index: 40;
	}

	@media (min-width: 1024px) {
		.mobile-backdrop {
			display: none;
		}
	}

	.mobile-sidebar {
		display: flex;
		flex-direction: column;
		position: fixed;
		top: 0;
		left: 0;
		height: 100vh;
		width: 16rem;
		background: oklch(var(--b2));
		border-right: 1.5px solid var(--input-border, oklch(var(--bc) / 0.15));
		z-index: 50;
		transform: translateX(-100%);
		transition: transform 300ms ease-out;
		overflow: hidden;
	}

	.mobile-sidebar.open {
		transform: translateX(0);
	}

	@media (min-width: 1024px) {
		.mobile-sidebar {
			display: none;
		}
	}

	/* ===== Profile Widget ===== */
	.sidebar-profile {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 1.25rem 1rem;
		min-height: 4.5rem;
		flex-shrink: 0;
	}

	.sidebar-avatar {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.25rem;
		height: 2.25rem;
		border-radius: 50%;
		background: oklch(var(--p) / 0.15);
		color: oklch(var(--p));
		font-family: var(--font-display, inherit);
		font-size: 0.875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: -0.025em;
		flex-shrink: 0;
	}

	.sidebar-user-info {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		overflow: hidden;
		min-width: 0;
	}

	.sidebar-user-name {
		font-family: var(--font-display, inherit);
		font-size: 0.875rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: -0.025em;
		color: oklch(var(--bc));
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.sidebar-role-badge {
		display: inline-flex;
		align-items: center;
		padding: 0.1rem 0.4rem;
		border-radius: 9999px;
		font-size: 0.625rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		width: fit-content;
	}

	.badge-primary {
		background: oklch(var(--p) / 0.15);
		color: oklch(var(--p));
	}

	.badge-secondary {
		background: oklch(var(--s) / 0.15);
		color: oklch(var(--s));
	}

	.badge-base {
		background: oklch(var(--bc) / 0.1);
		color: oklch(var(--bc) / 0.7);
	}

	.mobile-close-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		margin-left: auto;
		padding: 0.375rem;
		border: none;
		background: transparent;
		color: oklch(var(--bc) / 0.5);
		cursor: pointer;
		border-radius: calc(var(--input-radius, 10px) - 2px);
		transition:
			color 150ms ease,
			background 150ms ease;
		flex-shrink: 0;
	}

	.mobile-close-btn:hover {
		color: oklch(var(--bc));
		background: oklch(var(--p) / 0.06);
	}

	.mobile-close-btn:focus-visible {
		outline: none;
		box-shadow: var(--shadow-glow-focus, 0 0 0 3px oklch(var(--p) / 0.3));
	}

	/* ===== Divider ===== */
	.sidebar-divider {
		height: 1px;
		background: var(--input-border, oklch(var(--bc) / 0.12));
		margin: 0;
		flex-shrink: 0;
	}

	/* ===== Navigation ===== */
	.sidebar-nav {
		flex: 1;
		overflow-y: auto;
		overflow-x: hidden;
		padding: 0.75rem 0.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.sidebar-nav-group {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.sidebar-group-title {
		display: block;
		padding: 0.5rem 0.5rem 0.25rem;
		font-size: 0.625rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: oklch(var(--bc) / 0.4);
		white-space: nowrap;
		overflow: hidden;
	}

	.sidebar-nav ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.sidebar-nav-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.5rem 0.625rem;
		border-radius: calc(var(--input-radius, 10px) - 2px);
		color: oklch(var(--bc) / 0.7);
		text-decoration: none;
		font-size: 0.875rem;
		font-weight: 500;
		white-space: nowrap;
		overflow: hidden;
		transition:
			background 150ms ease,
			color 150ms ease;
		cursor: pointer;
		border: none;
		background: transparent;
		width: 100%;
		text-align: left;
	}

	.sidebar-nav-item:hover {
		background: oklch(var(--p) / 0.06);
		color: oklch(var(--bc));
	}

	.sidebar-nav-item.active {
		background: oklch(var(--p) / 0.1);
		color: oklch(var(--p));
		font-weight: 600;
	}

	.sidebar-nav-item:focus-visible {
		outline: none;
		box-shadow: var(--shadow-glow-focus, 0 0 0 3px oklch(var(--p) / 0.3));
	}

	/* ===== Icons ===== */
	.nav-icon {
		width: 1.25rem;
		height: 1.25rem;
		flex-shrink: 0;
	}

	.collapse-chevron {
		transition: transform 300ms ease-out;
	}

	.collapse-chevron.rotated {
		transform: rotate(180deg);
	}

	/* ===== Nav Labels & Badges ===== */
	.nav-label {
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.nav-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 1.25rem;
		height: 1.25rem;
		padding: 0 0.375rem;
		border-radius: 9999px;
		font-size: 0.625rem;
		font-weight: 700;
		background: oklch(var(--p));
		color: white;
		flex-shrink: 0;
	}

	/* ===== Footer ===== */
	.sidebar-footer {
		display: flex;
		flex-direction: column;
		gap: 0;
		padding: 0.5rem 0.5rem 0.75rem;
		flex-shrink: 0;
	}

	.sidebar-footer .sidebar-divider {
		margin-bottom: 0.5rem;
	}

	.sidebar-footer-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.5rem 0.625rem;
		border-radius: calc(var(--input-radius, 10px) - 2px);
		color: oklch(var(--bc) / 0.6);
		text-decoration: none;
		font-size: 0.875rem;
		font-weight: 500;
		white-space: nowrap;
		overflow: hidden;
		transition:
			background 150ms ease,
			color 150ms ease;
		cursor: pointer;
		border: none;
		background: transparent;
		width: 100%;
		text-align: left;
	}

	.sidebar-footer-item:hover {
		background: oklch(var(--p) / 0.06);
		color: oklch(var(--bc));
	}

	.sidebar-footer-item:focus-visible {
		outline: none;
		box-shadow: var(--shadow-glow-focus, 0 0 0 3px oklch(var(--p) / 0.3));
	}

	.sidebar-logout:hover {
		background: oklch(var(--er, var(--p)) / 0.08);
		color: oklch(var(--er, var(--p)));
	}

	/* ===== Collapse Toggle ===== */
	.sidebar-collapse-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.5rem;
		margin-top: 0.25rem;
		border-radius: calc(var(--input-radius, 10px) - 2px);
		color: oklch(var(--bc) / 0.4);
		border: none;
		background: transparent;
		cursor: pointer;
		width: 100%;
		transition:
			background 150ms ease,
			color 150ms ease;
	}

	.sidebar-collapse-btn:hover {
		background: oklch(var(--p) / 0.06);
		color: oklch(var(--bc));
	}

	.sidebar-collapse-btn:focus-visible {
		outline: none;
		box-shadow: var(--shadow-glow-focus, 0 0 0 3px oklch(var(--p) / 0.3));
	}
</style>
