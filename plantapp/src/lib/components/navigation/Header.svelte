<script lang="ts">
	import { page } from '$app/stores';
	import { trpc } from '$lib/trpc/client';
	import { browser } from '$app/environment';

	// Theme switcher functionality
	let currentTheme = 'light';

	function toggleTheme() {
		const themes = ['light', 'dark', 'cupcake', 'forest', 'luxury', 'business'];
		const currentIndex = themes.indexOf(currentTheme);
		currentTheme = themes[(currentIndex + 1) % themes.length];
		document.documentElement.setAttribute('data-theme', currentTheme);
	}

	// Get user from page data
	$: user = $page.data.user;

	// Logout function
	let isLoggingOut = false;
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

	// Navigation structure based on app features
	const mainNavigation = [
		{ label: 'Shop', href: '/products', children: [
			{ label: 'Hydroponics', href: '/products/hydroponics' },
			{ label: 'Aquaponics', href: '/products/aquaponics' },
			{ label: 'Silvopasture', href: '/products/silvopasture' },
			{ label: 'Agroforestry', href: '/products/agroforestry' }
		]},
		{ label: 'Learn', href: '/learn', children: [
			{ label: 'Guides', href: '/guides' },
			{ label: 'Blog', href: '/blog' },
			{ label: 'FAQs', href: '/faq' },
			{ label: 'Resources', href: '/resources' }
		]},
		{ label: 'Affiliate', href: '/affiliate', children: [
			{ label: 'Join Program', href: '/affiliate/join' },
			{ label: 'Dashboard', href: '/affiliate/dashboard' },
			{ label: 'Earnings', href: '/affiliate/earnings' },
			{ label: 'Links', href: '/affiliate/links' }
		]},
		{ label: 'Support', href: '/support', children: [
			{ label: 'Contact', href: '/contact' },
			{ label: 'Help Center', href: '/help' },
			{ label: 'Shipping', href: '/shipping' },
			{ label: 'Returns', href: '/returns' }
		]}
	];

	const userNavigation = [
		{ label: 'Account', href: '/account' },
		{ label: 'Orders', href: '/orders' },
		{ label: 'Cart', href: '/cart' },
		{ label: 'Wishlist', href: '/wishlist' }
	];

	const adminNavigation = [
		{ label: 'Admin', href: '/admin', children: [
			{ label: 'Products', href: '/admin/products' },
			{ label: 'Orders', href: '/admin/orders' },
			{ label: 'Users', href: '/admin/users' },
			{ label: 'Content', href: '/admin/content' },
			{ label: 'Analytics', href: '/admin/analytics' }
		]}
	];

	// Check if current path matches navigation item
	function isActive(href: string): boolean {
		if (href === '/') return $page.url.pathname === '/';
		return $page.url.pathname.startsWith(href);
	}
</script>

<header class="swiss-header">
	<div class="header-container">
		<!-- Mobile menu button -->
		<label for="drawer-toggle" class="mobile-menu-btn">
			<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
			</svg>
		</label>
		
		<!-- Logo/Brand -->
		<a href="/" class="brand">
			<span class="brand-icon">🌱</span>
			<span class="brand-text">Aevani</span>
		</a>
		
		<!-- Desktop navigation -->
		<nav class="desktop-nav">
			{#each mainNavigation as item}
				<div class="nav-item">
					<a 
						href={item.href} 
						class="nav-link" 
						class:active={isActive(item.href)}
					>
						{item.label}
					</a>
					{#if item.children}
						<div class="nav-dropdown">
							{#each item.children as child}
								<a href={child.href} class="nav-dropdown-link">
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
			<!-- Search -->
			<div class="search-container">
				<input type="text" placeholder="Search products..." class="search-input" />
				<button class="search-btn" aria-label="Search">
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
					</svg>
				</button>
			</div>
			
			<!-- Cart -->
			<a href="/cart" class="action-btn cart-btn">
				<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"></path>
				</svg>
				<span class="cart-count">0</span>
			</a>
			
			<!-- User menu -->
			<div class="user-menu">
				<button class="action-btn user-btn" aria-label="User menu">
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
					</svg>
				</button>
				<div class="user-dropdown">
					{#if user}
						<!-- Logged in user menu -->
						<div class="user-dropdown-header">
							<span class="user-dropdown-name">
								{user.firstName || user.username}
							</span>
							<span class="user-dropdown-email">{user.email}</span>
						</div>
						<hr class="dropdown-divider" />
						{#each userNavigation as item}
							<a href={item.href} class="user-dropdown-link">
								{item.label}
							</a>
						{/each}
						{#if user.role === 'admin'}
							<hr class="dropdown-divider" />
							<a href="/admin" class="user-dropdown-link">Admin Dashboard</a>
						{/if}
						<hr class="dropdown-divider" />
						<button on:click={handleLogout} class="user-dropdown-link logout-btn" disabled={isLoggingOut}>
							{isLoggingOut ? 'Logging out...' : 'Logout'}
						</button>
					{:else}
						<!-- Guest user menu -->
						<a href="/login" class="user-dropdown-link">Login</a>
						<a href="/register" class="user-dropdown-link">Register</a>
					{/if}
				</div>
			</div>
			
			<!-- Theme selector -->
			<div class="theme-selector">
				<button class="action-btn theme-btn" aria-label="Theme selector">
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
					</svg>
				</button>
				<div class="theme-dropdown">
					<button on:click={() => { currentTheme = 'light'; document.documentElement.setAttribute('data-theme', 'light'); }}>Light</button>
					<button on:click={() => { currentTheme = 'dark'; document.documentElement.setAttribute('data-theme', 'dark'); }}>Dark</button>
					<button on:click={() => { currentTheme = 'forest'; document.documentElement.setAttribute('data-theme', 'forest'); }}>Forest</button>
					<button on:click={() => { currentTheme = 'business'; document.documentElement.setAttribute('data-theme', 'business'); }}>Business</button>
				</div>
			</div>
		</div>
	</div>
</header>

<style>
	.swiss-header {
		background-color: white;
		border-bottom: 1px solid #e5e7eb;
		position: sticky;
		top: 0;
		z-index: 50;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		font-family: 'Helvetica Neue', Arial, sans-serif;
	}

	.header-container {
		max-width: 80rem;
		margin: 0 auto;
		padding: 0 1rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 4rem;
	}

	@media (min-width: 640px) {
		.header-container {
			padding: 0 1.5rem;
		}
	}

	@media (min-width: 1024px) {
		.header-container {
			padding: 0 2rem;
		}
	}

	.mobile-menu-btn {
		display: block;
		padding: 0.5rem;
		border-radius: 0.375rem;
		color: #4b5563;
		transition: all 0.2s;
	}

	.mobile-menu-btn:hover {
		color: #111827;
		background-color: #f3f4f6;
	}

	@media (min-width: 1024px) {
		.mobile-menu-btn {
			display: none;
		}
	}

	.brand {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 1.25rem;
		font-weight: 700;
		color: #111827;
		text-decoration: none;
		font-family: 'Helvetica Neue', Arial, sans-serif;
		letter-spacing: -0.025em;
	}

	.brand-icon {
		font-size: 1.5rem;
	}

	.brand-text {
		display: none;
	}

	@media (min-width: 640px) {
		.brand-text {
			display: block;
		}
	}

	.desktop-nav {
		display: none;
		align-items: center;
		gap: 2rem;
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
		font-size: 0.875rem;
		font-weight: 500;
		color: #374151;
		padding: 0.5rem 0.75rem;
		border-radius: 0.375rem;
		transition: all 0.2s;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.nav-link:hover {
		color: #111827;
		transform: translateY(-1px);
	}

	.nav-link.active {
		color: #111827;
		background-color: #f3f4f6;
	}

	.nav-dropdown {
		position: absolute;
		top: 100%;
		left: 0;
		margin-top: 0.25rem;
		width: 12rem;
		background-color: white;
		border-radius: 0.375rem;
		box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
		border: 1px solid #e5e7eb;
		opacity: 0;
		visibility: hidden;
		transition: all 0.2s;
		transform: translateY(-10px);
	}

	.nav-item:hover .nav-dropdown {
		opacity: 1;
		visibility: visible;
		transform: translateY(0);
	}

	.nav-dropdown-link {
		display: block;
		padding: 0.5rem 1rem;
		font-size: 0.875rem;
		color: #374151;
		transition: all 0.15s;
	}

	.nav-dropdown-link:hover {
		background-color: #f3f4f6;
		color: #111827;
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.search-container {
		display: none;
		align-items: center;
		position: relative;
	}

	@media (min-width: 768px) {
		.search-container {
			display: flex;
		}
	}

	.search-input {
		width: 16rem;
		padding: 0.5rem 1rem;
		font-size: 0.875rem;
		border: 1px solid #d1d5db;
		border-radius: 0.375rem;
		outline: none;
		transition: all 0.2s;
	}

	.search-input:focus {
		ring: 2px solid #10b981;
		border-color: transparent;
	}

	.search-btn {
		position: absolute;
		right: 0.5rem;
		padding: 0.25rem;
		color: #9ca3af;
		transition: color 0.2s;
	}

	.search-btn:hover {
		color: #4b5563;
	}

	.action-btn {
		position: relative;
		padding: 0.5rem;
		color: #4b5563;
		transition: all 0.2s;
		border-radius: 0.375rem;
	}

	.action-btn:hover {
		color: #111827;
		background-color: #f3f4f6;
		transform: translateY(-1px);
	}

	.cart-btn {
		display: flex;
		align-items: center;
	}

	.cart-count {
		position: absolute;
		top: -0.25rem;
		right: -0.25rem;
		background-color: #059669;
		color: white;
		font-size: 0.75rem;
		border-radius: 9999px;
		height: 1.25rem;
		width: 1.25rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.user-menu, .theme-selector {
		position: relative;
	}

	.user-dropdown, .theme-dropdown {
		position: absolute;
		right: 0;
		top: 100%;
		margin-top: 0.25rem;
		width: 12rem;
		background-color: white;
		border-radius: 0.375rem;
		box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
		border: 1px solid #e5e7eb;
		opacity: 0;
		visibility: hidden;
		transition: all 0.2s;
		transform: translateY(-10px);
	}

	.user-menu:hover .user-dropdown,
	.theme-selector:hover .theme-dropdown {
		opacity: 1;
		visibility: visible;
		transform: translateY(0);
	}

	.user-dropdown-header {
		padding: 0.75rem 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.user-dropdown-name {
		font-size: 0.875rem;
		font-weight: 600;
		color: #111827;
	}

	.user-dropdown-email {
		font-size: 0.75rem;
		color: #6b7280;
	}

	.user-dropdown-link {
		display: block;
		padding: 0.5rem 1rem;
		font-size: 0.875rem;
		color: #374151;
		transition: all 0.15s;
		text-decoration: none;
	}

	.user-dropdown-link:hover {
		background-color: #f3f4f6;
		color: #111827;
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
		opacity: 0.5;
		cursor: not-allowed;
	}

	.dropdown-divider {
		margin: 0.25rem 0;
		border-color: #e5e7eb;
	}

	.theme-dropdown button {
		display: block;
		width: 100%;
		text-align: left;
		padding: 0.5rem 1rem;
		font-size: 0.875rem;
		color: #374151;
		transition: all 0.15s;
		border: none;
		background: none;
		cursor: pointer;
	}

	.theme-dropdown button:hover {
		background-color: #f3f4f6;
		color: #111827;
	}

	/* Mobile responsive adjustments */
	@media (max-width: 640px) {
		.header-container {
			padding: 0 0.75rem;
		}
		
		.brand-text {
			font-size: 1.125rem;
		}
	}

	/* Swiss design principles */
	.nav-link, .brand-text {
		font-weight: 500;
	}

	/* Clean, minimal spacing */
	.header-container > * + * {
		margin-left: 1rem;
	}
</style>
