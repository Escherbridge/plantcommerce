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
</script>

<header class="enhanced-header">
	<div class="header-container">
		<!-- Mobile menu button -->
		<label for="drawer-toggle" class="mobile-menu-btn">
			<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2.5"
					d="M4 6h16M4 12h16M4 18h16"
				></path>
			</svg>
		</label>

		<!-- Logo/Brand -->
		<a href="/" class="brand">
			<span class="brand-icon">🌱</span>
			<div class="brand-text-container">
				<span class="brand-text">AEVANI</span>
				<span class="brand-tagline">Marketplace</span>
			</div>
		</a>

		<!-- Desktop navigation -->
		<nav class="desktop-nav">
			{#each mainNavigation as item}
				<div class="nav-item">
					<a href={item.href} class="nav-link" class:active={isActive(item.href)}>
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
			<!-- Cart -->
			<a href="/cart" class="action-btn cart-btn">
				<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
					></path>
				</svg>
				<span class="cart-count">0</span>
			</a>

			<!-- User menu -->
			<div class="user-menu">
				<button class="action-btn user-btn" aria-label="User menu">
					<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
						<button
							onclick={handleLogout}
							class="user-dropdown-link logout-btn"
							disabled={isLoggingOut}
						>
							{isLoggingOut ? 'Logging out...' : 'Logout'}
						</button>
					{:else}
						<!-- Guest user menu -->
						<a href="/login" class="user-dropdown-link">Login</a>
						<a href="/register" class="user-dropdown-link primary-link">Register</a>
					{/if}
				</div>
			</div>
		</div>
	</div>
</header>

<style>
	.enhanced-header {
		background: linear-gradient(to bottom, #ffffff 0%, #fafbfc 100%);
		border-bottom: 2px solid #e5e7eb;
		position: sticky;
		top: 0;
		z-index: 50;
		box-shadow:
			0 4px 6px -1px rgba(0, 0, 0, 0.05),
			0 2px 4px -1px rgba(0, 0, 0, 0.03);
		font-family: 'Helvetica Neue', Arial, sans-serif;
	}

	.header-container {
		max-width: 1600px;
		margin: 0 auto;
		padding: 0 2rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 5rem;
		gap: 3rem;
	}

	@media (max-width: 1024px) {
		.header-container {
			padding: 0 1.5rem;
			height: 4.5rem;
			gap: 1.5rem;
		}
	}

	.mobile-menu-btn {
		display: block;
		padding: 0.75rem;
		border-radius: 0.5rem;
		color: #1d3557;
		transition: all 0.3s;
		cursor: pointer;
	}

	.mobile-menu-btn:hover {
		background-color: #f3f4f6;
		transform: scale(1.05);
	}

	@media (min-width: 1024px) {
		.mobile-menu-btn {
			display: none;
		}
	}

	.brand {
		display: flex;
		align-items: center;
		gap: 1rem;
		text-decoration: none;
		transition: transform 0.3s;
	}

	.brand:hover {
		transform: translateY(-2px);
	}

	.brand-icon {
		font-size: 2.5rem;
	}

	.brand-text-container {
		display: none;
		flex-direction: column;
		gap: 0;
		line-height: 1.1;
	}

	@media (min-width: 640px) {
		.brand-text-container {
			display: flex;
		}
	}

	.brand-text {
		font-size: 1.75rem;
		font-weight: 800;
		color: #1d3557;
		letter-spacing: -0.05em;
		font-family: 'Helvetica Neue', Arial, sans-serif;
	}

	.brand-tagline {
		font-size: 0.75rem;
		font-weight: 500;
		color: #457b9d;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}

	.desktop-nav {
		display: none;
		align-items: center;
		gap: 0.5rem;
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
		font-size: 1rem;
		font-weight: 600;
		color: #1d3557;
		padding: 0.875rem 1.5rem;
		border-radius: 0.5rem;
		transition: all 0.3s;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		text-decoration: none;
		display: block;
	}

	.nav-link:hover {
		color: #e63946;
		background-color: #f8f9fa;
		transform: translateY(-2px);
	}

	.nav-link.active {
		color: #e63946;
		background-color: #fef2f2;
	}

	.nav-dropdown {
		position: absolute;
		top: 100%;
		left: 0;
		margin-top: 0.5rem;
		min-width: 14rem;
		background-color: white;
		border-radius: 0.75rem;
		box-shadow:
			0 20px 25px -5px rgba(0, 0, 0, 0.1),
			0 10px 10px -5px rgba(0, 0, 0, 0.04);
		border: 2px solid #e5e7eb;
		opacity: 0;
		visibility: hidden;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		transform: translateY(-10px);
		padding: 0.5rem;
	}

	.nav-item:hover .nav-dropdown {
		opacity: 1;
		visibility: visible;
		transform: translateY(0);
	}

	.nav-dropdown-link {
		display: block;
		padding: 0.875rem 1.25rem;
		font-size: 0.9375rem;
		font-weight: 500;
		color: #374151;
		transition: all 0.2s;
		border-radius: 0.5rem;
		text-decoration: none;
	}

	.nav-dropdown-link:hover {
		background-color: #f3f4f6;
		color: #1d3557;
		transform: translateX(4px);
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.action-btn {
		position: relative;
		padding: 0.75rem;
		color: #1d3557;
		transition: all 0.3s;
		border-radius: 0.5rem;
		background: none;
		border: none;
		cursor: pointer;
	}

	.action-btn:hover {
		color: #e63946;
		background-color: #f8f9fa;
		transform: translateY(-2px);
	}

	.cart-btn {
		display: flex;
		align-items: center;
	}

	.cart-count {
		position: absolute;
		top: 0.25rem;
		right: 0.25rem;
		background: linear-gradient(135deg, #e63946 0%, #d62839 100%);
		color: white;
		font-size: 0.6875rem;
		font-weight: 700;
		border-radius: 9999px;
		height: 1.125rem;
		min-width: 1.125rem;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0 0.25rem;
		box-shadow: 0 2px 4px rgba(230, 57, 70, 0.3);
	}

	.user-menu {
		position: relative;
	}

	.user-dropdown {
		position: absolute;
		right: 0;
		top: 100%;
		margin-top: 0.5rem;
		min-width: 14rem;
		background-color: white;
		border-radius: 0.75rem;
		box-shadow:
			0 20px 25px -5px rgba(0, 0, 0, 0.1),
			0 10px 10px -5px rgba(0, 0, 0, 0.04);
		border: 2px solid #e5e7eb;
		opacity: 0;
		visibility: hidden;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		transform: translateY(-10px);
		padding: 0.5rem;
	}

	.user-menu:hover .user-dropdown {
		opacity: 1;
		visibility: visible;
		transform: translateY(0);
	}

	.user-dropdown-header {
		padding: 1rem 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.user-dropdown-name {
		font-size: 0.9375rem;
		font-weight: 700;
		color: #1d3557;
	}

	.user-dropdown-email {
		font-size: 0.8125rem;
		color: #6b7280;
	}

	.user-dropdown-link {
		display: block;
		padding: 0.875rem 1.25rem;
		font-size: 0.9375rem;
		font-weight: 500;
		color: #374151;
		transition: all 0.2s;
		text-decoration: none;
		border-radius: 0.5rem;
	}

	.user-dropdown-link:hover {
		background-color: #f3f4f6;
		color: #1d3557;
		transform: translateX(4px);
	}

	.user-dropdown-link.primary-link {
		background: linear-gradient(135deg, #e63946 0%, #d62839 100%);
		color: white;
		font-weight: 600;
		margin-top: 0.5rem;
	}

	.user-dropdown-link.primary-link:hover {
		transform: translateX(0) scale(1.02);
		box-shadow: 0 4px 6px rgba(230, 57, 70, 0.2);
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
		margin: 0.5rem 0;
		border-color: #e5e7eb;
	}
</style>
