<script lang="ts">
	import { page } from '$app/stores';
	import { trpc } from '$lib/trpc/client';
	import { browser } from '$app/environment';

	// Get user from page data
	const user = $derived($page.data.user);

	// Logout function
	let isLoggingOut = $state(false);
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

	// Navigation structure
	const mainNavigation = [
		{
			label: 'Shop',
			href: '/products',
			children: [
				{ label: 'Hydroponics', href: '/products/hydroponics' },
				{ label: 'Aquaponics', href: '/products/aquaponics' },
				{ label: 'Silvopasture', href: '/products/silvopasture' },
				{ label: 'Agroforestry', href: '/products/agroforestry' }
			]
		},
		{
			label: 'Learn',
			href: '/learn',
			children: [
				{ label: 'Guides', href: '/guides' },
				{ label: 'Blog', href: '/blog' },
				{ label: 'FAQs', href: '/faq' },
				{ label: 'Resources', href: '/resources' }
			]
		},
		{ label: 'Affiliate', href: '/affiliate' },
		{ label: 'Support', href: '/support' }
	];

	const userNavigation = [
		{ label: 'Account', href: '/account' },
		{ label: 'Orders', href: '/orders' },
		{ label: 'Wishlist', href: '/wishlist' }
	];

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

	// Cart count (placeholder — wire to real store when available)
	let cartCount = $state(0);
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

<header class="editorial-header" class:scrolled>
	<div class="header-container">
		<!-- Mobile hamburger -->
		<label for="drawer-toggle" class="hamburger" aria-label="Open menu">
			<span class="bar bar-1"></span>
			<span class="bar bar-2"></span>
			<span class="bar bar-3"></span>
		</label>

		<!-- Wordmark -->
		<a href="/" class="wordmark">AEVANI</a>

		<!-- Desktop navigation -->
		<nav class="desktop-nav">
			{#each mainNavigation as item, i}
				<div class="nav-item">
					<a
						href={item.href}
						class="nav-link"
						class:active={isActive(item.href)}
						style="--stagger: {i}"
					>
						{item.label}
						<span class="nav-underline"></span>
					</a>
					{#if item.children}
						<div class="nav-dropdown">
							{#each item.children as child, j}
								<a
									href={child.href}
									class="nav-dropdown-link"
									style="transition-delay: {j * 50}ms"
								>
									{child.label}
								</a>
							{/each}
						</div>
					{/if}
				</div>
			{/each}
		</nav>

		<!-- Right side actions -->
		<div class="header-actions">
			<!-- Cart -->
			<a href="/cart" class="action-btn cart-btn" aria-label="Cart">
				<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
					></path>
				</svg>
				{#if cartCount > 0}
					<span class="cart-badge" class:pulse={cartPulse}>{cartCount}</span>
				{/if}
			</a>

			<!-- User menu -->
			<div class="user-menu">
				<button class="action-btn" aria-label="User menu">
					<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
						></path>
					</svg>
				</button>
				<div class="user-dropdown">
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
							>
								{item.label}
							</a>
						{/each}
						{#if user.role === 'admin'}
							<hr class="dropdown-divider" />
							<a href="/admin" class="user-dropdown-link">Admin Dashboard</a>
						{/if}
						<hr class="dropdown-divider" />
						<button
							onclick={handleLogout}
							class="user-dropdown-link logout-btn"
							disabled={isLoggingOut}
						>
							{isLoggingOut ? 'Logging out...' : 'Logout'}
						</button>
					{:else}
						<a href="/login" class="user-dropdown-link">Login</a>
						<a href="/register" class="user-dropdown-link primary-link">Register</a>
					{/if}
				</div>
			</div>
		</div>
	</div>
</header>

<style>
	/* ---- Base header ---- */
	.editorial-header {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 9999;
		background-color: transparent;
		border-bottom: 1px solid transparent;
		transition:
			background-color 0.35s var(--ease-out-expo, cubic-bezier(0.16, 1, 0.3, 1)),
			border-color 0.35s var(--ease-out-expo, cubic-bezier(0.16, 1, 0.3, 1)),
			backdrop-filter 0.35s var(--ease-out-expo, cubic-bezier(0.16, 1, 0.3, 1));
	}

	.editorial-header.scrolled {
		background-color: oklch(var(--n));
		border-bottom-color: oklch(var(--nc) / 0.1);
		backdrop-filter: blur(12px);
	}

	.header-container {
		max-width: 1600px;
		margin: 0 auto;
		padding: 0 2rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 4.5rem;
		gap: 2rem;
	}

	@media (max-width: 767px) {
		.header-container {
			padding: 0 1rem;
			height: 3.5rem;
		}
	}

	/* ---- Wordmark ---- */
	.wordmark {
		font-family: var(--font-display, 'Barlow Condensed', sans-serif);
		font-size: 1.25rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: oklch(var(--nc));
		text-decoration: none;
		transition: opacity 0.2s;
		flex-shrink: 0;
	}

	.wordmark:hover {
		opacity: 0.75;
	}

	/* ---- Desktop nav ---- */
	.desktop-nav {
		display: none;
		align-items: center;
		gap: 0.25rem;
		flex: 1;
		justify-content: center;
	}

	@media (min-width: 1024px) {
		.desktop-nav {
			display: flex;
		}
	}

	.nav-item {
		position: relative;
	}

	.nav-link {
		font-family: var(--font-sans, 'Inter', sans-serif);
		font-size: 0.8125rem;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: oklch(var(--nc) / 0.8);
		padding: 0.75rem 1rem;
		text-decoration: none;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0;
		transition: color 0.2s;
		position: relative;
	}

	.nav-link:hover,
	.nav-link.active {
		color: oklch(var(--nc));
	}

	/* Underline slide-in */
	.nav-underline {
		display: block;
		height: 1px;
		width: 100%;
		background-color: oklch(var(--nc));
		transform: scaleX(0);
		transform-origin: left;
		transition: transform 0.25s var(--ease-out-expo, cubic-bezier(0.16, 1, 0.3, 1));
		margin-top: 2px;
	}

	.nav-link:hover .nav-underline,
	.nav-link.active .nav-underline {
		transform: scaleX(1);
	}

	/* ---- Dropdown ---- */
	.nav-dropdown {
		position: absolute;
		top: calc(100% + 0.5rem);
		left: 0;
		z-index: 10000;
		min-width: 13rem;
		background: white;
		border: 1px solid #e5e5e5;
		border-radius: 0.75rem;
		box-shadow:
			0 20px 40px -8px oklch(0% 0 0 / 0.12),
			0 8px 16px -4px oklch(0% 0 0 / 0.06);
		padding: 0.5rem;
		opacity: 0;
		visibility: hidden;
		transform: translateY(-8px);
		transition:
			opacity 0.22s ease,
			visibility 0.22s ease,
			transform 0.22s var(--ease-out-expo, cubic-bezier(0.16, 1, 0.3, 1));
	}

	.nav-item:hover .nav-dropdown {
		opacity: 1;
		visibility: visible;
		transform: translateY(0);
	}

	.nav-dropdown-link {
		display: block;
		padding: 0.625rem 1rem;
		font-family: var(--font-sans, 'Inter', sans-serif);
		font-size: 0.8125rem;
		font-weight: 400;
		color: #555;
		text-decoration: none;
		border-radius: 0.375rem;
		opacity: 0;
		transform: translateX(-6px);
		transition:
			background-color 0.15s ease,
			color 0.15s ease,
			opacity 0.18s ease,
			transform 0.18s ease;
	}

	.nav-item:hover .nav-dropdown-link {
		opacity: 1;
		transform: translateX(0);
	}

	.nav-dropdown-link:hover {
		background-color: #f5f5f5;
		color: #1a1a1a;
	}

	/* ---- Actions ---- */
	.header-actions {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-shrink: 0;
	}

	.action-btn {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.5rem;
		color: oklch(var(--nc) / 0.8);
		background: none;
		border: none;
		border-radius: 0.375rem;
		cursor: pointer;
		transition:
			color 0.2s,
			background-color 0.2s;
	}

	.action-btn:hover {
		color: oklch(var(--nc));
		background-color: oklch(var(--nc) / 0.08);
	}

	.icon {
		width: 1.25rem;
		height: 1.25rem;
	}

	/* ---- Cart badge ---- */
	.cart-badge {
		position: absolute;
		top: 0.125rem;
		right: 0.125rem;
		background-color: oklch(var(--a));
		color: oklch(var(--ac));
		font-size: 0.625rem;
		font-weight: 700;
		border-radius: 9999px;
		height: 1rem;
		min-width: 1rem;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0 0.2rem;
	}

	.cart-badge.pulse {
		animation: badge-pulse 0.4s ease-out;
	}

	@keyframes badge-pulse {
		0% { transform: scale(1); }
		40% { transform: scale(1.35); }
		100% { transform: scale(1); }
	}

	/* ---- User dropdown ---- */
	.user-menu {
		position: relative;
	}

	.user-dropdown {
		position: absolute;
		right: 0;
		top: calc(100% + 0.5rem);
		z-index: 10000;
		min-width: 13rem;
		background-color: oklch(var(--b1));
		border: 1px solid oklch(var(--b3));
		border-radius: 0.75rem;
		box-shadow:
			0 20px 40px -8px oklch(0% 0 0 / 0.12),
			0 8px 16px -4px oklch(0% 0 0 / 0.06);
		padding: 0.5rem;
		opacity: 0;
		visibility: hidden;
		transform: translateY(-8px);
		transition:
			opacity 0.22s ease,
			visibility 0.22s ease,
			transform 0.22s var(--ease-out-expo, cubic-bezier(0.16, 1, 0.3, 1));
	}

	.user-menu:hover .user-dropdown {
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
		font-size: 0.875rem;
		font-weight: 600;
		color: oklch(var(--nc));
	}

	.user-dropdown-email {
		font-size: 0.75rem;
		color: oklch(var(--nc) / 0.45);
	}

	.user-dropdown-link {
		display: block;
		padding: 0.625rem 1rem;
		font-size: 0.8125rem;
		font-weight: 400;
		color: oklch(var(--nc) / 0.65);
		text-decoration: none;
		border-radius: 0.375rem;
		transition:
			background-color 0.15s ease,
			color 0.15s ease,
			opacity 0.18s ease,
			transform 0.18s ease;
		opacity: 0;
		transform: translateX(-6px);
	}

	.user-menu:hover .user-dropdown-link {
		opacity: 1;
		transform: translateX(0);
	}

	.user-dropdown-link:hover {
		background-color: oklch(var(--nc) / 0.08);
		color: oklch(var(--nc));
	}

	.user-dropdown-link.primary-link {
		background-color: oklch(var(--a));
		color: oklch(var(--ac));
		font-weight: 600;
		margin-top: 0.25rem;
		opacity: 1;
		transform: none;
	}

	.user-dropdown-link.primary-link:hover {
		background-color: oklch(var(--a) / 0.85);
	}

	.dropdown-divider {
		margin: 0.375rem 0;
		border: none;
		border-top: 1px solid oklch(var(--nc) / 0.1);
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

	/* ---- Hamburger ---- */
	.hamburger {
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 5px;
		width: 2rem;
		height: 2rem;
		cursor: pointer;
		padding: 0.25rem;
		flex-shrink: 0;
	}

	@media (min-width: 1024px) {
		.hamburger {
			display: none;
		}
	}

	.bar {
		display: block;
		height: 1.5px;
		background-color: oklch(var(--nc));
		border-radius: 9999px;
		transition: transform 0.25s var(--ease-out-expo, cubic-bezier(0.16, 1, 0.3, 1)), opacity 0.2s ease, width 0.2s ease;
		transform-origin: center;
	}

	.bar-1 { width: 100%; }
	.bar-2 { width: 75%; }
	.bar-3 { width: 100%; }
</style>
