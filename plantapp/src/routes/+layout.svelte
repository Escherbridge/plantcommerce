<script lang="ts">
	import '../app.css';
	import { Header } from '$lib/components/navigation';
	import { RootSystem } from '$lib/components/patterns';
	import MarqueeBar from '$lib/components/ui/MarqueeBar.svelte';
	import { page } from '$app/stores';
	import { trpc } from '$lib/trpc/client';
	import { browser } from '$app/environment';
	import SEO from '$lib/components/SEO.svelte';

	const currentUrl = $derived($page.url.pathname);
	const absoluteUrl = $derived(`https://plantcommerce.com${currentUrl}`);

	let { children, data } = $props();
	const user = $derived(data.user);

	// Logout function for mobile
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

	// Drawer open state (mirrors the checkbox)
	let drawerOpen = $state(false);

	function closeDrawer() { drawerOpen = false; }

	// Close drawer on route change
	$effect(() => {
		currentUrl; // reactive dependency
		drawerOpen = false;
	});

	// Mobile navigation structure
	const mobileNavigation = [
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
		{
			label: 'Affiliate',
			href: '/affiliate',
			children: [
				{ label: 'Join Program', href: '/affiliate/join' },
				{ label: 'Dashboard', href: '/affiliate/dashboard' },
				{ label: 'Earnings', href: '/affiliate/earnings' },
				{ label: 'Links', href: '/affiliate/links' }
			]
		},
		{
			label: 'Support',
			href: '/support',
			children: [
				{ label: 'Contact', href: '/contact' },
				{ label: 'Help Center', href: '/help' },
				{ label: 'Shipping', href: '/shipping' },
				{ label: 'Returns', href: '/returns' }
			]
		}
	];

	const footerLinks = {
		shop: [
			{ label: 'Hydroponics', href: '/products/hydroponics' },
			{ label: 'Aquaponics', href: '/products/aquaponics' },
			{ label: 'Silvopasture', href: '/products/silvopasture' },
			{ label: 'Agroforestry', href: '/products/agroforestry' }
		],
		learn: [
			{ label: 'Guides', href: '/guides' },
			{ label: 'Blog', href: '/blog' },
			{ label: 'FAQs', href: '/faq' },
			{ label: 'Resources', href: '/resources' }
		],
		company: [
			{ label: 'About', href: '/about' },
			{ label: 'Contact', href: '/contact' },
			{ label: 'Careers', href: '/careers' },
			{ label: 'Press', href: '/press' }
		],
		support: [
			{ label: 'Help Center', href: '/help' },
			{ label: 'Shipping', href: '/shipping' },
			{ label: 'Returns', href: '/returns' },
			{ label: 'Size Guide', href: '/size-guide' }
		]
	};

	function scrollToTop() {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}
</script>

<svelte:head>
	<SEO
		title="PlantCommerce | Sustainable Growing Tools & Supplies"
		description="Discover sustainable growing tools, hydroponic systems, and educational resources for modern growers."
		image="/images/AI-MockAssets/MAINHERO.png"
		url={absoluteUrl}
	/>
</svelte:head>

<div class="swiss-layout">
	<!-- Hidden checkbox for CSS-driven drawer fallback -->
	<input
		id="drawer-toggle"
		type="checkbox"
		class="drawer-toggle"
		bind:checked={drawerOpen}
	/>

	<!-- Main content — scales/blurs when drawer is open -->
	<div class="layout-content" class:drawer-active={drawerOpen}>
		<MarqueeBar messages={["Free shipping on orders over $75", "New: Polyculture Starter Kits", "Join 10,000+ sustainable growers"]} />
		<Header />

		<main class="main-content">
			{@render children()}
		</main>

		<!-- ===== LOGGED-IN USER BOTTOM BAR ===== -->
		{#if user}
			<div class="user-bottom-bar">
				<div class="user-bottom-bar__inner">
					<div class="user-bottom-bar__greeting">
						<span class="user-bottom-bar__avatar">
							{(user.firstName || user.username || 'U').charAt(0).toUpperCase()}
						</span>
						<span class="user-bottom-bar__name">{user.firstName || user.username}</span>
					</div>

					<nav class="user-bottom-bar__nav">
						<a href="/account/profile" class="user-bottom-bar__link">
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
							Profile
						</a>
						<a href="/account/orders" class="user-bottom-bar__link">
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
							Orders
						</a>
						<a href="/account/wishlist" class="user-bottom-bar__link">
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.7l-1-1a5.5 5.5 0 00-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 000-7.8z"/></svg>
							Wishlist
						</a>
						<a href="/cart" class="user-bottom-bar__link">
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 002 1.6h9.7a2 2 0 002-1.6L23 6H6"/></svg>
							Cart
						</a>
					</nav>

					<div class="user-bottom-bar__actions">
						<a href="/affiliate/join" class="user-bottom-bar__affiliate">
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.1 6.3 7 1-5 4.9 1.2 6.8-6.3-3.3-6.3 3.3 1.2-6.8-5-4.9 7-1z"/></svg>
							Become an Affiliate
						</a>
					</div>
				</div>
			</div>
		{/if}

		<!-- ===== FOOTER ===== -->
		<footer class="editorial-footer">
			<!-- Root system SVG pattern overlay -->
			<div class="footer-pattern" aria-hidden="true">
				<RootSystem />
			</div>

			<div class="footer-inner">
				<!-- Large wordmark -->
				<div class="footer-wordmark-row">
					<span class="footer-wordmark">AEVANI</span>
				</div>

				<!-- Grid: brand col + link cols -->
				<div class="footer-grid">
					<!-- Brand & newsletter -->
					<div class="footer-brand-col">
						<p class="footer-tagline">
							Sustainable hydroponics, aquaponics, and agroforestry products to help you grow
							better.
						</p>

						<div class="newsletter-block">
							<h4 class="newsletter-label">Join our community</h4>
							<div class="newsletter-form">
								<input
									type="email"
									placeholder="your@email.com"
									class="newsletter-input"
								/>
								<button class="newsletter-btn">Subscribe</button>
							</div>
						</div>

						<!-- Social icons (inline SVG) -->
						<div class="social-row">
							<a href="https://facebook.com/aevani" class="social-link" aria-label="Facebook">
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
									<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
								</svg>
							</a>
							<a href="https://twitter.com/aevani" class="social-link" aria-label="Twitter / X">
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
									<path d="M4 4l16 16M4 20 20 4"/>
								</svg>
							</a>
							<a href="https://instagram.com/aevani" class="social-link" aria-label="Instagram">
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
									<rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
									<path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
									<line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
								</svg>
							</a>
						</div>
					</div>

					<!-- Link columns — mobile accordion via details/summary -->
					<details class="footer-section" open>
						<summary class="footer-title">Shop</summary>
						<ul class="footer-links">
							{#each footerLinks.shop as link}
								<li><a href={link.href} class="footer-link">{link.label}</a></li>
							{/each}
						</ul>
					</details>

					<details class="footer-section" open>
						<summary class="footer-title">Learn</summary>
						<ul class="footer-links">
							{#each footerLinks.learn as link}
								<li><a href={link.href} class="footer-link">{link.label}</a></li>
							{/each}
						</ul>
					</details>

					<details class="footer-section" open>
						<summary class="footer-title">Company</summary>
						<ul class="footer-links">
							{#each footerLinks.company as link}
								<li><a href={link.href} class="footer-link">{link.label}</a></li>
							{/each}
						</ul>
					</details>

					<details class="footer-section" open>
						<summary class="footer-title">Support</summary>
						<ul class="footer-links">
							{#each footerLinks.support as link}
								<li><a href={link.href} class="footer-link">{link.label}</a></li>
							{/each}
						</ul>
					</details>
				</div>

				<!-- Footer bottom bar -->
				<div class="footer-bottom">
					<p class="copyright">&copy; 2024 Aevani. All rights reserved.</p>
					<div class="footer-bottom-links">
						<a href="/privacy" class="footer-bottom-link">Privacy Policy</a>
						<a href="/terms" class="footer-bottom-link">Terms of Service</a>
						<a href="/cookies" class="footer-bottom-link">Cookie Policy</a>
					</div>
					<button class="scroll-top-btn" onclick={scrollToTop} aria-label="Scroll to top">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<polyline points="18 15 12 9 6 15"></polyline>
						</svg>
					</button>
				</div>
			</div>
		</footer>
	</div>

	<!-- ===== MOBILE DRAWER (full-screen overlay) ===== -->
	<div class="drawer-overlay" class:open={drawerOpen} onclick={closeDrawer} aria-hidden="true"></div>

	<div class="mobile-drawer" class:open={drawerOpen} aria-modal="true" role="dialog">
		<!-- SVG pattern background -->
		<div class="drawer-pattern" aria-hidden="true">
			<RootSystem />
		</div>

		<!-- Close button -->
		<button class="drawer-close" onclick={closeDrawer} aria-label="Close menu">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
				<line x1="18" y1="6" x2="6" y2="18"/>
				<line x1="6" y1="6" x2="18" y2="18"/>
			</svg>
		</button>

		<!-- Wordmark -->
		<a href="/" class="drawer-wordmark" onclick={closeDrawer}>AEVANI</a>

		<!-- Primary nav -->
		<nav class="drawer-nav">
			{#each mobileNavigation as item, i}
				<div
					class="drawer-nav-item"
					style="transition-delay: {drawerOpen ? i * 50 : 0}ms"
				>
					{#if item.children}
						<details class="drawer-group">
							<summary class="drawer-nav-link">{item.label}</summary>
							<div class="drawer-sub-links">
								{#each item.children as child, j}
									<a
										href={child.href}
										class="drawer-sub-link"
										style="transition-delay: {drawerOpen ? (i * 50 + j * 30) : 0}ms"
										onclick={closeDrawer}
									>
										{child.label}
									</a>
								{/each}
							</div>
						</details>
					{:else}
						<a href={item.href} class="drawer-nav-link" onclick={closeDrawer}>{item.label}</a>
					{/if}
				</div>
			{/each}
		</nav>

		<!-- Drawer bottom: auth + social + newsletter -->
		<div class="drawer-bottom">
			<!-- User actions -->
			<div class="drawer-user">
				{#if user}
					<div class="drawer-user-info">
						<span class="drawer-user-name">{user.firstName || user.username}</span>
						<span class="drawer-user-email">{user.email}</span>
					</div>
					<a href="/account" class="drawer-action-btn" onclick={closeDrawer}>My Account</a>
					<button
						onclick={() => { closeDrawer(); handleLogout(); }}
						class="drawer-action-btn"
						disabled={isLoggingOut}
					>
						{isLoggingOut ? 'Logging out...' : 'Logout'}
					</button>
				{:else}
					<a href="/login" class="drawer-action-btn" onclick={closeDrawer}>Login</a>
					<a href="/register" class="drawer-action-btn primary" onclick={closeDrawer}>Register</a>
				{/if}
			</div>

			<!-- Newsletter -->
			<div class="drawer-newsletter">
				<input type="email" placeholder="your@email.com" class="drawer-email-input" />
				<button class="drawer-subscribe-btn">Subscribe</button>
			</div>

			<!-- Social -->
			<div class="drawer-social">
				<a href="https://facebook.com/aevani" class="drawer-social-link" aria-label="Facebook">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
						<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
					</svg>
				</a>
				<a href="https://twitter.com/aevani" class="drawer-social-link" aria-label="Twitter / X">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
						<path d="M4 4l16 16M4 20 20 4"/>
					</svg>
				</a>
				<a href="https://instagram.com/aevani" class="drawer-social-link" aria-label="Instagram">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
						<rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
						<path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
						<line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
					</svg>
				</a>
			</div>
		</div>
	</div>
</div>

<style>
	/* ===== Layout shell ===== */
	.swiss-layout {
		min-height: 100vh;
		background-color: oklch(var(--b1));
		font-family: var(--font-body);
		line-height: 1.6;
	}

	.drawer-toggle {
		display: none;
	}

	.layout-content {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		max-width: 100vw;
		overflow-x: hidden;
		transition:
			transform 0.4s var(--ease-out-expo, cubic-bezier(0.16, 1, 0.3, 1)),
			filter 0.4s ease;
	}

	.layout-content.drawer-active {
		transform: scale(0.95);
		filter: blur(4px);
		pointer-events: none;
	}

	.main-content {
		flex: 1;
		/* push content below fixed header */
		padding-top: 4.5rem;
	}

	@media (max-width: 767px) {
		.main-content {
			padding-top: 3.5rem;
		}
	}

	/* ===== FOOTER ===== */
	.editorial-footer {
		background-color: oklch(var(--n));
		color: oklch(var(--nc));
		position: relative;
		overflow: hidden;
	}

	.footer-pattern {
		position: absolute;
		inset: 0;
		opacity: 0.05;
		pointer-events: none;
	}

	.footer-inner {
		position: relative;
		z-index: 1;
		max-width: 80rem;
		margin: 0 auto;
		padding: 4rem 2rem 2rem;
	}

	@media (max-width: 639px) {
		.footer-inner {
			padding: 3rem 1rem 2rem;
		}
	}

	/* Large wordmark */
	.footer-wordmark-row {
		margin-bottom: 3rem;
		border-bottom: 1px solid oklch(var(--nc) / 0.1);
		padding-bottom: 2rem;
	}

	.footer-wordmark {
		font-family: var(--font-display, 'Barlow Condensed', sans-serif);
		font-size: 3rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: oklch(var(--nc));
		line-height: 1;
	}

	@media (min-width: 1024px) {
		.footer-wordmark {
			font-size: 5rem;
		}
	}

	/* Footer grid */
	.footer-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 2.5rem;
		margin-bottom: 3rem;
	}

	@media (min-width: 640px) {
		.footer-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (min-width: 1024px) {
		.footer-grid {
			grid-template-columns: 2fr repeat(4, 1fr);
		}
	}

	.footer-brand-col {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	@media (min-width: 640px) {
		.footer-brand-col {
			grid-column: span 2;
		}
	}

	@media (min-width: 1024px) {
		.footer-brand-col {
			grid-column: span 1;
		}
	}

	.footer-tagline {
		font-family: var(--font-sans, 'Inter', sans-serif);
		font-size: 0.875rem;
		color: oklch(var(--nc) / 0.6);
		line-height: 1.65;
		max-width: 22rem;
	}

	/* Newsletter */
	.newsletter-block {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.newsletter-label {
		font-family: var(--font-sans, 'Inter', sans-serif);
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: oklch(var(--nc) / 0.5);
	}

	.newsletter-form {
		display: flex;
		gap: 0.75rem;
		max-width: 22rem;
	}

	.newsletter-input {
		flex: 1;
		background: transparent;
		border: none;
		border-bottom: 2px solid oklch(var(--nc) / 0.3);
		color: oklch(var(--nc));
		font-family: var(--font-sans, 'Inter', sans-serif);
		font-size: 0.875rem;
		padding: 0.5rem 0;
		outline: none;
		transition: border-color 0.2s;
	}

	.newsletter-input::placeholder {
		color: oklch(var(--nc) / 0.35);
	}

	.newsletter-input:focus {
		border-bottom-color: oklch(var(--nc));
	}

	.newsletter-btn {
		font-family: var(--font-sans, 'Inter', sans-serif);
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		padding: 0.5rem 1rem;
		background-color: oklch(var(--nc));
		color: oklch(var(--n));
		border: none;
		border-radius: 0.25rem;
		cursor: pointer;
		transition: opacity 0.2s;
		flex-shrink: 0;
	}

	.newsletter-btn:hover {
		opacity: 0.8;
	}

	/* Social icons */
	.social-row {
		display: flex;
		gap: 1rem;
	}

	.social-link {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		color: oklch(var(--nc) / 0.4);
		transition: color 0.2s;
	}

	.social-link:hover {
		color: oklch(var(--nc));
	}

	.social-link svg {
		width: 1.125rem;
		height: 1.125rem;
	}

	/* Footer link columns */
	.footer-section {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	/* Remove details/summary default arrow on desktop */
	@media (min-width: 768px) {
		.footer-section summary {
			list-style: none;
			cursor: default;
			pointer-events: none;
		}

		.footer-section summary::-webkit-details-marker {
			display: none;
		}
	}

	/* On mobile, collapse by default, allow expand */
	@media (max-width: 767px) {
		.footer-section {
			border-bottom: 1px solid oklch(var(--nc) / 0.08);
			padding-bottom: 0.5rem;
		}

		/* Close sections by default on mobile */
		.footer-section:not([open]) .footer-links {
			display: none;
		}

		.footer-section summary {
			cursor: pointer;
			display: flex;
			justify-content: space-between;
			align-items: center;
		}

		.footer-section summary::after {
			content: '+';
			font-size: 1rem;
			color: oklch(var(--nc) / 0.4);
			font-weight: 300;
			transition: transform 0.2s;
		}

		.footer-section[open] summary::after {
			content: '−';
		}
	}

	.footer-title {
		font-family: var(--font-sans, 'Inter', sans-serif);
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: oklch(var(--nc) / 0.5);
		padding: 0.5rem 0;
	}

	.footer-links {
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.footer-link {
		font-family: var(--font-mono, 'JetBrains Mono', monospace);
		font-size: 0.8125rem;
		color: oklch(var(--nc) / 0.55);
		text-decoration: none;
		transition: color 0.15s;
	}

	.footer-link:hover {
		color: oklch(var(--nc));
	}

	/* Footer bottom */
	.footer-bottom {
		border-top: 1px solid oklch(var(--nc) / 0.1);
		padding-top: 1.5rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}

	@media (min-width: 640px) {
		.footer-bottom {
			flex-direction: row;
			justify-content: space-between;
		}
	}

	.copyright {
		font-family: var(--font-mono, 'JetBrains Mono', monospace);
		font-size: 0.75rem;
		color: oklch(var(--nc) / 0.35);
	}

	.footer-bottom-links {
		display: flex;
		gap: 1.5rem;
	}

	.footer-bottom-link {
		font-family: var(--font-mono, 'JetBrains Mono', monospace);
		font-size: 0.75rem;
		color: oklch(var(--nc) / 0.35);
		text-decoration: none;
		transition: color 0.15s;
	}

	.footer-bottom-link:hover {
		color: oklch(var(--nc) / 0.7);
	}

	/* Scroll to top */
	.scroll-top-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		background-color: oklch(var(--nc) / 0.08);
		border: 1px solid oklch(var(--nc) / 0.15);
		border-radius: 0.25rem;
		color: oklch(var(--nc) / 0.5);
		cursor: pointer;
		transition:
			background-color 0.2s,
			color 0.2s;
		flex-shrink: 0;
	}

	.scroll-top-btn:hover {
		background-color: oklch(var(--nc) / 0.15);
		color: oklch(var(--nc));
	}

	.scroll-top-btn svg {
		width: 1rem;
		height: 1rem;
	}

	/* ===== DRAWER OVERLAY ===== */
	.drawer-overlay {
		position: fixed;
		inset: 0;
		background-color: oklch(0% 0 0 / 0.6);
		z-index: 90;
		opacity: 0;
		visibility: hidden;
		transition:
			opacity 0.35s ease,
			visibility 0.35s ease;
	}

	.drawer-overlay.open {
		opacity: 1;
		visibility: visible;
	}

	/* ===== MOBILE DRAWER ===== */
	.mobile-drawer {
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background-color: oklch(var(--n));
		color: oklch(var(--nc));
		z-index: 100;
		display: flex;
		flex-direction: column;
		padding: 2rem 1.5rem;
		overflow-y: auto;
		transform: translateX(100%);
		transition: transform 0.4s var(--ease-out-expo, cubic-bezier(0.16, 1, 0.3, 1));
	}

	.mobile-drawer.open {
		transform: translateX(0);
	}

	.drawer-pattern {
		position: absolute;
		inset: 0;
		opacity: 0.04;
		pointer-events: none;
	}

	.drawer-close {
		position: absolute;
		top: 1.25rem;
		right: 1.25rem;
		width: 2.5rem;
		height: 2.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		background: none;
		border: 1px solid oklch(var(--nc) / 0.15);
		border-radius: 0.375rem;
		color: oklch(var(--nc) / 0.7);
		cursor: pointer;
		transition: color 0.2s, border-color 0.2s;
		z-index: 1;
	}

	.drawer-close:hover {
		color: oklch(var(--nc));
		border-color: oklch(var(--nc) / 0.35);
	}

	.drawer-close svg {
		width: 1.125rem;
		height: 1.125rem;
	}

	.drawer-wordmark {
		font-family: var(--font-display, 'Barlow Condensed', sans-serif);
		font-size: 1.5rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: oklch(var(--nc));
		text-decoration: none;
		margin-bottom: 3rem;
		display: block;
		position: relative;
		z-index: 1;
	}

	/* Drawer nav */
	.drawer-nav {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		position: relative;
		z-index: 1;
	}

	.drawer-nav-item {
		transform: translateX(30px);
		opacity: 0;
		transition:
			transform 0.35s var(--ease-out-expo, cubic-bezier(0.16, 1, 0.3, 1)),
			opacity 0.3s ease;
	}

	.mobile-drawer.open .drawer-nav-item {
		transform: translateX(0);
		opacity: 1;
	}

	.drawer-group {
		display: flex;
		flex-direction: column;
	}

	.drawer-nav-link {
		font-family: var(--font-display, 'Barlow Condensed', sans-serif);
		font-size: 1.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: oklch(var(--nc));
		text-decoration: none;
		padding: 0.5rem 0;
		display: block;
		border-bottom: 1px solid oklch(var(--nc) / 0.06);
		cursor: pointer;
		list-style: none;
		transition: color 0.15s;
	}

	.drawer-nav-link:hover {
		color: oklch(var(--nc) / 0.7);
	}

	.drawer-nav-link::-webkit-details-marker {
		display: none;
	}

	.drawer-sub-links {
		display: flex;
		flex-direction: column;
		gap: 0;
		padding-left: 1rem;
		padding-bottom: 0.5rem;
	}

	.drawer-sub-link {
		font-family: var(--font-sans, 'Inter', sans-serif);
		font-size: 0.9375rem;
		color: oklch(var(--nc) / 0.55);
		text-decoration: none;
		padding: 0.375rem 0;
		transition: color 0.15s;
	}

	.drawer-sub-link:hover {
		color: oklch(var(--nc));
	}

	/* Drawer bottom */
	.drawer-bottom {
		margin-top: 2rem;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		position: relative;
		z-index: 1;
		border-top: 1px solid oklch(var(--nc) / 0.1);
		padding-top: 1.5rem;
	}

	.drawer-user {
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
	}

	.drawer-user-info {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		padding: 0.75rem;
		background-color: oklch(var(--nc) / 0.06);
		border-radius: 0.375rem;
	}

	.drawer-user-name {
		font-size: 0.875rem;
		font-weight: 600;
		color: oklch(var(--nc));
	}

	.drawer-user-email {
		font-size: 0.75rem;
		color: oklch(var(--nc) / 0.45);
	}

	.drawer-action-btn {
		display: block;
		width: 100%;
		padding: 0.625rem 1rem;
		text-align: center;
		font-family: var(--font-sans, 'Inter', sans-serif);
		font-size: 0.875rem;
		font-weight: 500;
		border-radius: 0.375rem;
		text-decoration: none;
		color: oklch(var(--nc) / 0.75);
		background-color: oklch(var(--nc) / 0.07);
		border: none;
		cursor: pointer;
		transition: background-color 0.2s, color 0.2s;
	}

	.drawer-action-btn:hover {
		background-color: oklch(var(--nc) / 0.12);
		color: oklch(var(--nc));
	}

	.drawer-action-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.drawer-action-btn.primary {
		background-color: oklch(var(--a));
		color: oklch(var(--ac));
	}

	.drawer-action-btn.primary:hover {
		background-color: oklch(var(--a) / 0.85);
	}

	/* Drawer newsletter */
	.drawer-newsletter {
		display: flex;
		gap: 0.75rem;
	}

	.drawer-email-input {
		flex: 1;
		background: transparent;
		border: none;
		border-bottom: 2px solid oklch(var(--nc) / 0.25);
		color: oklch(var(--nc));
		font-family: var(--font-sans, 'Inter', sans-serif);
		font-size: 0.875rem;
		padding: 0.375rem 0;
		outline: none;
		transition: border-color 0.2s;
	}

	.drawer-email-input::placeholder {
		color: oklch(var(--nc) / 0.3);
	}

	.drawer-email-input:focus {
		border-bottom-color: oklch(var(--nc));
	}

	.drawer-subscribe-btn {
		font-family: var(--font-sans, 'Inter', sans-serif);
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		padding: 0.5rem 1rem;
		background-color: oklch(var(--nc));
		color: oklch(var(--n));
		border: none;
		border-radius: 0.25rem;
		cursor: pointer;
		transition: opacity 0.2s;
		flex-shrink: 0;
	}

	.drawer-subscribe-btn:hover {
		opacity: 0.8;
	}

	/* Drawer social */
	.drawer-social {
		display: flex;
		gap: 1.25rem;
	}

	.drawer-social-link {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		color: oklch(var(--nc) / 0.35);
		transition: color 0.2s;
	}

	.drawer-social-link:hover {
		color: oklch(var(--nc));
	}

	.drawer-social-link svg {
		width: 1.125rem;
		height: 1.125rem;
	}

	/* ===== USER BOTTOM BAR ===== */
	.user-bottom-bar {
		background: oklch(var(--b1));
		border-top: 1.5px solid var(--input-border, rgba(27, 45, 74, 0.12));
		box-shadow: 0 -2px 12px rgba(27, 45, 74, 0.06);
		position: sticky;
		bottom: 0;
		z-index: 40;
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
	}

	.user-bottom-bar__inner {
		max-width: 80rem;
		margin: 0 auto;
		padding: 0.625rem 1.5rem;
		display: flex;
		align-items: center;
		gap: 1.5rem;
	}

	@media (max-width: 767px) {
		.user-bottom-bar__inner {
			padding: 0.5rem 1rem;
			gap: 0.5rem;
		}
	}

	/* Greeting / avatar */
	.user-bottom-bar__greeting {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		flex-shrink: 0;
	}

	.user-bottom-bar__avatar {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		border-radius: 50%;
		background: oklch(var(--p));
		color: oklch(var(--pc));
		font-family: var(--font-display);
		font-size: 0.8125rem;
		font-weight: 700;
		text-transform: uppercase;
	}

	.user-bottom-bar__name {
		font-size: 0.8125rem;
		font-weight: 600;
		color: oklch(var(--bc));
	}

	@media (max-width: 639px) {
		.user-bottom-bar__name {
			display: none;
		}
	}

	/* Nav links */
	.user-bottom-bar__nav {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		flex: 1;
		justify-content: center;
	}

	.user-bottom-bar__link {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.5rem 0.75rem;
		font-size: 0.8125rem;
		font-weight: 500;
		color: oklch(var(--bc) / 0.6);
		text-decoration: none;
		border-radius: var(--input-radius, 10px);
		transition: background-color 150ms ease, color 150ms ease;
	}

	.user-bottom-bar__link:hover {
		background: oklch(var(--p) / 0.06);
		color: oklch(var(--bc));
	}

	.user-bottom-bar__link svg {
		width: 1.125rem;
		height: 1.125rem;
		flex-shrink: 0;
	}

	@media (max-width: 639px) {
		.user-bottom-bar__link {
			flex-direction: column;
			gap: 0.125rem;
			padding: 0.375rem 0.5rem;
			font-size: 0.625rem;
		}

		.user-bottom-bar__link svg {
			width: 1.25rem;
			height: 1.25rem;
		}
	}

	/* Affiliate CTA */
	.user-bottom-bar__actions {
		flex-shrink: 0;
	}

	.user-bottom-bar__affiliate {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		font-family: var(--font-display);
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: oklch(var(--pc));
		background: linear-gradient(135deg, oklch(var(--s)) 0%, oklch(var(--p)) 100%);
		border-radius: var(--input-radius, 10px);
		text-decoration: none;
		transition: opacity 200ms ease, transform 200ms var(--ease-out-expo);
		box-shadow: 0 2px 8px rgba(69, 123, 157, 0.2);
	}

	.user-bottom-bar__affiliate:hover {
		opacity: 0.9;
		transform: scale(1.02);
	}

	.user-bottom-bar__affiliate svg {
		width: 1rem;
		height: 1rem;
		flex-shrink: 0;
	}

	@media (max-width: 639px) {
		.user-bottom-bar__affiliate {
			padding: 0.5rem;
			font-size: 0;
		}

		.user-bottom-bar__affiliate svg {
			width: 1.25rem;
			height: 1.25rem;
		}
	}
</style>
