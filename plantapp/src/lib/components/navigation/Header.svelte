<script lang="ts">
	import { page } from '$app/stores';
	import { trpc } from '$lib/trpc/client';
	import { browser } from '$app/environment';
	import { cart } from '$lib/stores/cart';
	import { tick } from 'svelte';
	import LeafMark from '$lib/components/ui/LeafMark.svelte';

	interface Props {
		drawerOpen?: boolean;
		onOpenDrawer?: (trigger: HTMLButtonElement) => void;
	}

	let { drawerOpen = false, onOpenDrawer = () => {} }: Props = $props();

	// Get user from page data
	const user = $derived($page.data.user);

	// Logout function
	let isLoggingOut = $state(false);
	let userMenuOpen = $state(false);
	let userMenuButton = $state<HTMLButtonElement | null>(null);
	let userMenuPanel = $state<HTMLDivElement | null>(null);

	async function openUserMenuAndFocusFirst() {
		userMenuOpen = true;
		await tick();
		userMenuPanel?.querySelector<HTMLElement>('a[href], button:not([disabled])')?.focus();
	}

	async function closeUserMenu(restoreFocus = false) {
		userMenuOpen = false;
		await tick();
		if (restoreFocus) userMenuButton?.focus();
	}

	function handleUserMenuKeydown(event: KeyboardEvent) {
		if (event.key !== 'Escape' || !userMenuOpen) return;
		event.preventDefault();
		void closeUserMenu(true);
	}

	function handleUserMenuFocusout(event: FocusEvent) {
		const nextTarget = event.relatedTarget as Node | null;
		const menu = event.currentTarget as HTMLDivElement | null;
		if (!menu || !nextTarget || !menu.contains(nextTarget)) {
			userMenuOpen = false;
		}
	}

	$effect(() => {
		$page.url.pathname;
		userMenuOpen = false;
	});

	async function handleLogout() {
		if (isLoggingOut) return;
		isLoggingOut = true;

		try {
			await trpc.auth.logout.mutate();
			if (browser) {
				window.location.href = '/';
			}
		} catch (error) {
			console.error('Logout error:', error);
		} finally {
			isLoggingOut = false;
		}
	}

	// Primary navigation (Aevani IA)
	const mainNavigation = [
		{ label: 'Shop', href: '/products' },
		{ label: 'Learn', href: '/learn' },
		{ label: 'Growing systems', href: '/products' },
		{ label: 'About', href: '/about' }
	];

	const userNavigation = $derived.by(() => {
		const base = [
			{ label: 'Account', href: '/account' },
			{ label: 'Orders', href: '/account/orders' },
			{ label: 'Wishlist', href: '/account/wishlist' }
		];
		const role = user?.role;
		if (role === 'affiliate' || role === 'admin') {
			base.push({ label: 'Affiliate Status', href: '/affiliate/terms' });
		}
		if (role === 'admin') {
			base.push({ label: 'Admin Panel', href: '/admin' });
		}
		return base;
	});

	// Check if current path matches navigation item
	function isActive(href: string): boolean {
		if (href === '/') return $page.url.pathname === '/';
		return $page.url.pathname.startsWith(href);
	}

	// Scroll-aware background
	let scrolled = $state(false);

	$effect(() => {
		if (!browser) return;

		let ticking = false;
		function onScroll() {
			if (!ticking) {
				requestAnimationFrame(() => {
					scrolled = window.scrollY > 50;
					ticking = false;
				});
				ticking = true;
			}
		}

		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	});

	// Cart count — wired to real cart store
	const cartCount = $derived($cart.totalItems);
	let prevCartCount = $state(0);
	let cartPulse = $state(false);

	$effect(() => {
		if (cartCount !== prevCartCount) {
			cartPulse = true;
			const t = setTimeout(() => (cartPulse = false), 400);
			prevCartCount = cartCount;
			return () => clearTimeout(t);
		}
	});
</script>

<svelte:window onkeydown={handleUserMenuKeydown} />

<header class="aevani-header" class:scrolled>
	<div class="header-inner">
		<div class="glass-bar">
			<!-- Left: mobile hamburger + brand -->
			<div class="header-left">
				<button
					type="button"
					class="hamburger"
					aria-label="Open menu"
					aria-expanded={drawerOpen}
					aria-controls="mobile-navigation-drawer"
					onclick={(event) => onOpenDrawer(event.currentTarget)}
				>
					<span class="bar bar-1"></span>
					<span class="bar bar-2"></span>
					<span class="bar bar-3"></span>
				</button>

				<a href="/" class="brand" aria-label="Aevani home">
					<LeafMark size={36} />
					<span class="wordmark">AEVANI</span>
				</a>
			</div>

			<!-- Center navigation -->
			<nav class="desktop-nav" aria-label="Primary">
				{#each mainNavigation as item}
					<a href={item.href} class="nav-link" class:active={isActive(item.href)}>
						{item.label}
					</a>
				{/each}
			</nav>

			<!-- Right actions -->
			<div class="header-actions">
				<a
					href="/affiliate"
					class="affiliates-link"
					class:active={isActive('/affiliate')}
				>
					Affiliates
				</a>

				<!-- Cart primary pill -->
				<a href="/cart" class="cart-pill" aria-label="Cart">
					<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
						></path>
					</svg>
					<span class="cart-label">Cart</span>
					{#if cartCount > 0}
						<span class="cart-count" class:pulse={cartPulse}>{cartCount}</span>
					{/if}
				</a>

				<!-- User menu -->
				<div class="user-menu" class:open={userMenuOpen} onfocusout={handleUserMenuFocusout}>
					<button
						bind:this={userMenuButton}
						type="button"
						class="account-btn"
						aria-label="User menu"
						aria-expanded={userMenuOpen}
						aria-controls="user-navigation-menu"
						onclick={() => (userMenuOpen = !userMenuOpen)}
						onkeydown={(event) => {
							if (event.key === 'ArrowDown') {
								event.preventDefault();
								void openUserMenuAndFocusFirst();
							}
						}}
					>
						<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
							></path>
						</svg>
					</button>
					<div
						bind:this={userMenuPanel}
						id="user-navigation-menu"
						class="user-dropdown"
						hidden={!userMenuOpen}
					>
						{#if user}
							<div class="user-dropdown-header">
								<span class="user-dropdown-name">
									{user.firstName || user.username}
								</span>
								<span class="user-dropdown-email">{user.email}</span>
							</div>
							<hr class="dropdown-divider" />
							{#each userNavigation as item, j}
								<a
									href={item.href}
									class="user-dropdown-link"
									style="transition-delay: {j * 50}ms"
									onclick={() => void closeUserMenu()}
								>
									{item.label}
								</a>
							{/each}
							<hr class="dropdown-divider" />
							<button
								onclick={() => {
									void closeUserMenu(true);
									void handleLogout();
								}}
								class="user-dropdown-link logout-btn"
								disabled={isLoggingOut}
							>
								{isLoggingOut ? 'Logging out...' : 'Logout'}
							</button>
						{:else}
							<a href="/login" class="user-dropdown-link" onclick={() => void closeUserMenu()}
								>Login</a
							>
							<a
								href="/register"
								class="user-dropdown-link primary-link"
								onclick={() => void closeUserMenu()}>Register</a
							>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>
</header>

<style>
	/* ---- Sticky glass shell ---- */
	.aevani-header {
		position: sticky;
		top: 14px;
		z-index: 80;
		margin-top: 14px;
		padding: 0 24px;
	}

	@media (max-width: 767px) {
		.aevani-header {
			padding: 0 16px;
		}
	}

	.header-inner {
		max-width: 1240px;
		margin: 0 auto;
	}

	/* ---- Glass pill bar ---- */
	.glass-bar {
		display: flex;
		align-items: center;
		gap: 1.5rem;
		min-height: 64px;
		padding: 0.55rem 0.75rem 0.55rem 1.25rem;
		background: rgba(248, 245, 238, 0.72);
		backdrop-filter: blur(20px) saturate(1.3);
		-webkit-backdrop-filter: blur(20px) saturate(1.3);
		border: 1px solid rgba(255, 255, 255, 0.7);
		border-radius: 20px;
		box-shadow:
			0 10px 40px rgba(23, 48, 31, 0.12),
			inset 0 1px 0 rgba(255, 255, 255, 0.9);
		transition:
			box-shadow 0.35s var(--ease-out-expo, cubic-bezier(0.16, 1, 0.3, 1)),
			background-color 0.35s var(--ease-out-expo, cubic-bezier(0.16, 1, 0.3, 1));
	}

	.aevani-header.scrolled .glass-bar {
		background: rgba(248, 245, 238, 0.85);
		box-shadow:
			0 14px 48px rgba(23, 48, 31, 0.18),
			inset 0 1px 0 rgba(255, 255, 255, 0.95);
	}

	@media (max-width: 767px) {
		.glass-bar {
			min-height: 58px;
			padding: 0.45rem 0.65rem 0.45rem 0.85rem;
			gap: 0.75rem;
		}
	}

	/* ---- Left / brand ---- */
	.header-left {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex-shrink: 0;
	}

	.brand {
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		text-decoration: none;
		transition: opacity 0.2s;
	}

	.brand:hover {
		opacity: 0.85;
	}

	.wordmark {
		font-family: var(--font-display, sans-serif);
		font-size: 1.15rem;
		font-weight: 700;
		letter-spacing: 0.14em;
		color: #1c3527;
		line-height: 1;
	}

	@media (max-width: 400px) {
		.wordmark {
			display: none;
		}
	}

	/* ---- Center nav ---- */
	.desktop-nav {
		display: none;
		align-items: center;
		gap: 0.15rem;
		flex: 1;
		justify-content: center;
	}

	@media (min-width: 1024px) {
		.desktop-nav {
			display: flex;
		}
	}

	.nav-link {
		font-family: var(--font-body, sans-serif);
		font-size: 15px;
		font-weight: 500;
		color: #2c4335;
		padding: 0.5rem 0.9rem;
		border-radius: 999px;
		text-decoration: none;
		white-space: nowrap;
		transition:
			background-color 0.2s ease,
			color 0.2s ease;
	}

	.nav-link:hover,
	.nav-link:focus-visible {
		background-color: rgba(28, 53, 39, 0.08);
		color: #1c3527;
	}

	.nav-link.active {
		color: #1c3527;
		background-color: rgba(28, 53, 39, 0.06);
	}

	/* ---- Right actions ---- */
	.header-actions {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex-shrink: 0;
		margin-left: auto;
	}

	.affiliates-link {
		font-family: var(--font-body, sans-serif);
		font-size: 15px;
		font-weight: 500;
		color: #5a7263;
		text-decoration: none;
		padding: 0.35rem 0.25rem;
		transition: color 0.2s ease;
		white-space: nowrap;
	}

	.affiliates-link:hover,
	.affiliates-link:focus-visible,
	.affiliates-link.active {
		color: #1c3527;
	}

	@media (max-width: 767px) {
		.affiliates-link {
			display: none;
		}
	}

	/* ---- Cart primary pill ---- */
	.cart-pill {
		position: relative;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.6rem 1.1rem;
		border-radius: 999px;
		background: linear-gradient(180deg, #347a56, #1e4a36);
		color: #ffffff;
		font-family: var(--font-body, sans-serif);
		font-size: 14px;
		font-weight: 600;
		text-decoration: none;
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.25),
			0 6px 20px rgba(30, 74, 54, 0.3);
		transition:
			box-shadow 0.2s ease,
			transform 0.2s ease;
	}

	.cart-pill:hover,
	.cart-pill:focus-visible {
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.3),
			0 8px 26px rgba(30, 74, 54, 0.42);
		transform: translateY(-1px);
	}

	.cart-pill .icon {
		width: 1.15rem;
		height: 1.15rem;
	}

	.cart-count {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 1.2rem;
		height: 1.2rem;
		padding: 0 0.35rem;
		border-radius: 999px;
		background: #a8e6c8;
		color: #14261b;
		font-size: 0.7rem;
		font-weight: 700;
		line-height: 1;
	}

	.cart-count.pulse {
		animation: cart-pulse 0.4s ease-out;
	}

	@keyframes cart-pulse {
		0% {
			transform: scale(1);
		}
		40% {
			transform: scale(1.35);
		}
		100% {
			transform: scale(1);
		}
	}

	@media (max-width: 519px) {
		.cart-label {
			display: none;
		}
		.cart-pill {
			padding: 0.55rem 0.7rem;
		}
	}

	/* ---- Account button ---- */
	.user-menu {
		position: relative;
		flex-shrink: 0;
	}

	.account-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.6rem;
		height: 2.6rem;
		color: #1c3527;
		background: rgba(255, 255, 255, 0.5);
		border: 1px solid rgba(255, 255, 255, 0.7);
		border-radius: 999px;
		cursor: pointer;
		transition:
			background-color 0.2s ease,
			border-color 0.2s ease;
	}

	.account-btn:hover,
	.account-btn:focus-visible {
		background: rgba(255, 255, 255, 0.75);
		border-color: rgba(46, 107, 79, 0.35);
	}

	.account-btn .icon {
		width: 1.2rem;
		height: 1.2rem;
	}

	/* ---- User dropdown ---- */
	.user-dropdown {
		position: absolute;
		right: 0;
		top: calc(100% + 0.6rem);
		z-index: 90;
		min-width: 13rem;
		background: rgba(248, 245, 238, 0.96);
		backdrop-filter: blur(18px) saturate(1.2);
		-webkit-backdrop-filter: blur(18px) saturate(1.2);
		border: 1px solid rgba(255, 255, 255, 0.7);
		border-radius: 16px;
		box-shadow:
			0 18px 44px rgba(23, 48, 31, 0.18),
			inset 0 1px 0 rgba(255, 255, 255, 0.9);
		padding: 0.5rem;
		opacity: 0;
		visibility: hidden;
		transform: translateY(-8px);
		transition:
			opacity 0.22s ease,
			visibility 0.22s ease,
			transform 0.22s var(--ease-out-expo, cubic-bezier(0.16, 1, 0.3, 1));
	}

	.user-menu.open .user-dropdown {
		opacity: 1;
		visibility: visible;
		transform: translateY(0);
	}

	.user-dropdown-header {
		padding: 0.75rem 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}

	.user-dropdown-name {
		font-family: var(--font-display, sans-serif);
		font-size: 0.9rem;
		font-weight: 600;
		color: #1c3527;
	}

	.user-dropdown-email {
		font-size: 0.75rem;
		color: #5a7263;
	}

	.user-dropdown-link {
		display: block;
		padding: 0.625rem 1rem;
		font-family: var(--font-body, sans-serif);
		font-size: 0.85rem;
		font-weight: 500;
		color: #2c4335;
		text-decoration: none;
		border-radius: 10px;
		transition:
			background-color 0.15s ease,
			color 0.15s ease;
		opacity: 0;
		transform: translateX(-6px);
	}

	.user-menu.open .user-dropdown-link {
		opacity: 1;
		transform: translateX(0);
	}

	.user-dropdown-link:hover,
	.user-dropdown-link:focus-visible {
		background-color: rgba(46, 107, 79, 0.1);
		color: #1c3527;
	}

	.user-dropdown-link.primary-link {
		background: linear-gradient(180deg, #347a56, #1e4a36);
		color: #f4f1ea;
		font-weight: 600;
		margin-top: 0.25rem;
		opacity: 1;
		transform: none;
	}

	.user-dropdown-link.primary-link:hover {
		background: linear-gradient(180deg, #3d8862, #1e4a36);
		color: #ffffff;
	}

	.dropdown-divider {
		margin: 0.375rem 0;
		border: none;
		border-top: 1px solid rgba(28, 53, 39, 0.1);
	}

	.logout-btn {
		width: 100%;
		text-align: left;
		border: none;
		background: none;
		cursor: pointer;
		font-family: inherit;
	}

	.logout-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	/* ---- Hamburger (mobile) ---- */
	.hamburger {
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 5px;
		width: 2.4rem;
		height: 2.4rem;
		cursor: pointer;
		padding: 0.4rem;
		border: 0;
		background: none;
		flex-shrink: 0;
	}

	@media (min-width: 1024px) {
		.hamburger {
			display: none;
		}
	}

	.bar {
		display: block;
		height: 2px;
		background-color: #1c3527;
		border-radius: 9999px;
		transition:
			transform 0.25s var(--ease-out-expo, cubic-bezier(0.16, 1, 0.3, 1)),
			opacity 0.2s ease,
			width 0.2s ease;
		transform-origin: center;
	}

	.bar-1 {
		width: 100%;
	}
	.bar-2 {
		width: 70%;
	}
	.bar-3 {
		width: 100%;
	}
</style>
