<script lang="ts">
	import '../app.css';
	import { Header } from '$lib/components/navigation';
	import { RootSystem } from '$lib/components/patterns';
	import Toast from '$lib/components/ui/Toast.svelte';
	import LeafMark from '$lib/components/ui/LeafMark.svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { trpc } from '$lib/trpc/client';
	import { browser } from '$app/environment';
	import { cart } from '$lib/stores/cart';
	import SEO from '$lib/components/SEO.svelte';
	import { isPublicIndexablePath, publicSite, publicSiteUrl } from '$lib/config/site';
	import { tick } from 'svelte';

	const currentYear = new Date().getFullYear();
	const currentUrl = $derived($page.url.pathname);
	const absoluteUrl = $derived(publicSiteUrl(currentUrl));
	const robotsDirective = $derived(
		isPublicIndexablePath(currentUrl) ? 'index, follow' : 'noindex, nofollow'
	);

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

	// Drawer state and focus handoff
	let drawerOpen = $state(false);
	let drawerTrigger = $state<HTMLButtonElement | null>(null);
	let drawerCloseButton = $state<HTMLButtonElement | null>(null);
	let mobileDrawer = $state<HTMLDivElement | null>(null);

	const focusableSelector =
		'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

	async function openDrawer(trigger: HTMLButtonElement) {
		drawerTrigger = trigger;
		drawerOpen = true;
		await tick();
		drawerCloseButton?.focus();
	}

	async function closeDrawer() {
		if (!drawerOpen) return;
		drawerOpen = false;
		await tick();
		if (drawerTrigger?.isConnected) drawerTrigger.focus();
	}

	function handleDrawerKeydown(event: KeyboardEvent) {
		if (!drawerOpen) return;
		if (event.key === 'Escape') {
			event.preventDefault();
			void closeDrawer();
			return;
		}

		if (event.key !== 'Tab' || !mobileDrawer) return;
		const focusable = Array.from(mobileDrawer.querySelectorAll<HTMLElement>(focusableSelector));
		const first = focusable[0];
		const last = focusable.at(-1);
		if (!first || !last) return;

		if (event.shiftKey && document.activeElement === first) {
			event.preventDefault();
			last.focus();
		} else if (!event.shiftKey && document.activeElement === last) {
			event.preventDefault();
			first.focus();
		}
	}

	// Close drawer on route change
	$effect(() => {
		currentUrl; // reactive dependency
		drawerOpen = false;
		drawerTrigger = null;
	});

	// Initialize cart on mount
	$effect(() => {
		if (browser) {
			cart.refresh();
		}
	});

	// Mobile navigation structure
	const mobileNavigation = [
		{
			label: 'Catalog',
			href: '/products',
			children: [{ label: 'Catalog Status', href: '/products' }]
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
			label: 'Affiliate Status',
			href: '/affiliate/terms',
			children: [
				{ label: 'Program Status', href: '/affiliate/terms' },
				{ label: 'Apply for Review', href: '/affiliate/join' }
			]
		},
		{
			label: 'Support',
			href: '/support',
			children: [
				{ label: 'Support Overview', href: '/support' },
				{ label: 'Contact', href: '/contact' },
				{ label: 'Help Center', href: '/help' },
				{ label: 'Shipping', href: '/shipping' },
				{ label: 'Returns', href: '/returns' },
				{ label: 'Warranty', href: '/warranty' },
				{ label: 'Size Guide', href: '/size-guide' }
			]
		}
	];

	const footerLinks = {
		shop: [
			{ label: 'All products', href: '/products' },
			{ label: 'Hydroponics', href: '/products/hydroponics' },
			{ label: 'Aquaponics', href: '/products/aquaponics' },
			{ label: 'Silvopasture', href: '/products/silvopasture' },
			{ label: 'Agroforestry', href: '/products/agroforestry' }
		],
		learn: [
			{ label: 'Guides', href: '/guides' },
			{ label: 'Field notes', href: '/blog' },
			{ label: 'FAQs', href: '/faq' },
			{ label: 'Resources', href: '/resources' }
		],
		company: [
			{ label: 'About', href: '/about' },
			{ label: 'Affiliate program', href: '/affiliate' },
			{ label: 'Contact', href: '/contact' },
			{ label: 'Press', href: '/press' }
		],
		support: [
			{ label: 'Help center', href: '/help' },
			{ label: 'Shipping', href: '/shipping' },
			{ label: 'Returns', href: '/returns' },
			{ label: 'Warranty', href: '/warranty' }
		]
	};

	// Newsletter — no dedicated endpoint yet; route interested growers to contact.
	let newsletterEmail = $state('');
	function handleNewsletterSubmit(event: SubmitEvent) {
		event.preventDefault();
		void goto('/contact');
	}

	function scrollToTop() {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}
</script>

<svelte:head>
	<SEO title={publicSite.defaultTitle} description={publicSite.description} url={absoluteUrl} />
	<meta name="robots" content={robotsDirective} />
</svelte:head>

<svelte:window onkeydown={handleDrawerKeydown} />

<div class="swiss-layout">
	<!-- Main content — scales/blurs when drawer is open -->
	<div
		class="layout-content"
		class:drawer-active={drawerOpen}
		inert={drawerOpen}
		aria-hidden={drawerOpen}
	>
		<a class="skip-link" href="#main-content">Skip to main content</a>
		<Header {drawerOpen} onOpenDrawer={openDrawer} />

		<main id="main-content" class="main-content" tabindex="-1">
			{@render children()}
		</main>

		<Toast />

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
							<svg
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="1.5"
								stroke-linecap="round"
								stroke-linejoin="round"
								><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle
									cx="12"
									cy="7"
									r="4"
								/></svg
							>
							Profile
						</a>
						<a href="/account/orders" class="user-bottom-bar__link">
							<svg
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="1.5"
								stroke-linecap="round"
								stroke-linejoin="round"
								><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line
									x1="3"
									y1="6"
									x2="21"
									y2="6"
								/><path d="M16 10a4 4 0 01-8 0" /></svg
							>
							Orders
						</a>
						<a href="/account/wishlist" class="user-bottom-bar__link">
							<svg
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="1.5"
								stroke-linecap="round"
								stroke-linejoin="round"
								><path
									d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.7l-1-1a5.5 5.5 0 00-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 000-7.8z"
								/></svg
							>
							Wishlist
						</a>
						<a href="/cart" class="user-bottom-bar__link">
							<svg
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="1.5"
								stroke-linecap="round"
								stroke-linejoin="round"
								><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path
									d="M1 1h4l2.7 13.4a2 2 0 002 1.6h9.7a2 2 0 002-1.6L23 6H6"
								/></svg
							>
							Cart
						</a>
					</nav>

					<div class="user-bottom-bar__actions">
						<a href="/affiliate/terms" class="user-bottom-bar__affiliate">
							<svg
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="1.5"
								stroke-linecap="round"
								stroke-linejoin="round"
								><path
									d="M12 2l3.1 6.3 7 1-5 4.9 1.2 6.8-6.3-3.3-6.3 3.3 1.2-6.8-5-4.9 7-1z"
								/></svg
							>
							Affiliate Status
						</a>
					</div>
				</div>
			</div>
		{/if}

		<!-- ===== FOOTER ===== -->
		<footer class="aevani-footer">
			<!-- Faint leaf/root texture overlay -->
			<div class="footer-pattern" aria-hidden="true">
				<RootSystem />
			</div>

			<div class="footer-inner">
				<!-- (a) Newsletter row -->
				<div class="newsletter-row">
					<div class="newsletter-copy">
						<h2 class="newsletter-title">Field notes, monthly</h2>
						<p class="newsletter-blurb">
							Growing experiments, honest results, and what we're planting next — sent once a month.
						</p>
					</div>
					<form class="newsletter-form" onsubmit={handleNewsletterSubmit}>
						<input
							type="email"
							class="newsletter-input"
							placeholder="you@example.com"
							aria-label="Email address"
							bind:value={newsletterEmail}
						/>
						<button type="submit" class="newsletter-submit">Subscribe</button>
					</form>
				</div>

				<!-- (b) 5-column grid -->
				<div class="footer-grid">
					<!-- Brand column -->
					<div class="footer-brand-col">
						<a href="/" class="footer-brand">
							<LeafMark size={40} variant="dark" />
							<span class="footer-wordmark">AEVANI</span>
						</a>
						<p class="footer-tagline">
							Tools and knowledge for growing systems that give back more than they take.
						</p>

						<div class="social-row">
							<a href="https://instagram.com/aevani" class="social-link" aria-label="Instagram">
								<svg
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="1.75"
									stroke-linecap="round"
									stroke-linejoin="round"
								>
									<rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
									<path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
									<line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
								</svg>
							</a>
							<a href="https://twitter.com/aevani" class="social-link" aria-label="X">
								<svg
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="1.75"
									stroke-linecap="round"
									stroke-linejoin="round"
								>
									<path d="M4 4l16 16M4 20 20 4" />
								</svg>
							</a>
							<a href="https://facebook.com/aevani" class="social-link" aria-label="Facebook">
								<svg
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="1.75"
									stroke-linecap="round"
									stroke-linejoin="round"
								>
									<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
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

				<!-- (c) Legal bar -->
				<div class="footer-bottom">
					<p class="copyright">&copy; {currentYear} Aevani. Grown with care.</p>
					<div class="footer-bottom-links">
						<a href="/privacy" class="footer-bottom-link">Privacy</a>
						<a href="/terms" class="footer-bottom-link">Terms</a>
						<a href="/cookies" class="footer-bottom-link">Cookies</a>
					</div>
					<button class="scroll-top-btn" onclick={scrollToTop} aria-label="Scroll to top">
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<polyline points="18 15 12 9 6 15"></polyline>
						</svg>
					</button>
				</div>
			</div>
		</footer>
	</div>

	<!-- ===== MOBILE DRAWER (full-screen overlay) ===== -->
	<div
		class="drawer-overlay"
		class:open={drawerOpen}
		onclick={() => void closeDrawer()}
		aria-hidden="true"
	></div>

	<div
		bind:this={mobileDrawer}
		id="mobile-navigation-drawer"
		class="mobile-drawer"
		class:open={drawerOpen}
		aria-hidden={!drawerOpen}
		aria-modal="true"
		aria-label="Site navigation"
		role="dialog"
		inert={!drawerOpen}
	>
		<!-- SVG pattern background -->
		<div class="drawer-pattern" aria-hidden="true">
			<RootSystem />
		</div>

		<!-- Close button -->
		<button
			bind:this={drawerCloseButton}
			type="button"
			class="drawer-close"
			onclick={() => void closeDrawer()}
			aria-label="Close menu"
		>
			<svg
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="1.75"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<line x1="18" y1="6" x2="6" y2="18" />
				<line x1="6" y1="6" x2="18" y2="18" />
			</svg>
		</button>

		<!-- Wordmark -->
		<a href="/" class="drawer-wordmark" onclick={() => void closeDrawer()}>
			<LeafMark size={34} />
			<span>AEVANI</span>
		</a>

		<!-- Primary nav -->
		<nav class="drawer-nav">
			{#each mobileNavigation as item, i}
				<div class="drawer-nav-item" style="transition-delay: {drawerOpen ? i * 50 : 0}ms">
					{#if item.children}
						<details class="drawer-group">
							<summary class="drawer-nav-link">{item.label}</summary>
							<div class="drawer-sub-links">
								{#each item.children as child, j}
									<a
										href={child.href}
										class="drawer-sub-link"
										style="transition-delay: {drawerOpen ? i * 50 + j * 30 : 0}ms"
										onclick={() => void closeDrawer()}
									>
										{child.label}
									</a>
								{/each}
							</div>
						</details>
					{:else}
						<a href={item.href} class="drawer-nav-link" onclick={() => void closeDrawer()}
							>{item.label}</a
						>
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
					<a href="/account" class="drawer-action-btn" onclick={() => void closeDrawer()}
						>My Account</a
					>
					<button
						onclick={() => {
							void closeDrawer();
							handleLogout();
						}}
						class="drawer-action-btn"
						disabled={isLoggingOut}
					>
						{isLoggingOut ? 'Logging out...' : 'Logout'}
					</button>
				{:else}
					<a href="/login" class="drawer-action-btn" onclick={() => void closeDrawer()}>Login</a>
					<a href="/register" class="drawer-action-btn primary" onclick={() => void closeDrawer()}
						>Register</a
					>
				{/if}
			</div>

			<!-- Newsletter -->
			<div class="drawer-newsletter">
				<p class="drawer-newsletter-unavailable">
					Newsletter sign-up is currently unavailable. Review <a
						href="/support"
						onclick={() => void closeDrawer()}>support status</a
					>.
				</p>
			</div>

			<!-- Social -->
			<div class="drawer-social">
				<a href="https://facebook.com/aevani" class="drawer-social-link" aria-label="Facebook">
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.75"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
					</svg>
				</a>
				<a href="https://twitter.com/aevani" class="drawer-social-link" aria-label="Twitter / X">
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.75"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M4 4l16 16M4 20 20 4" />
					</svg>
				</a>
				<a href="https://instagram.com/aevani" class="drawer-social-link" aria-label="Instagram">
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.75"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
						<path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
						<line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
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

	.layout-content {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		max-width: 100vw;
		overflow-x: clip;
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
	}

	.skip-link {
		position: fixed;
		top: 0.5rem;
		left: 0.5rem;
		z-index: 10001;
		padding: 0.625rem 1rem;
		border-radius: 0.375rem;
		background: oklch(var(--b1));
		color: oklch(var(--bc));
		box-shadow: 0 4px 12px oklch(0% 0 0 / 0.2);
		transform: translateY(calc(-100% - 1rem));
		transition: transform 0.15s ease;
	}

	.skip-link:focus {
		transform: translateY(0);
	}

	/* ===== FOOTER (Aevani dark forest) ===== */
	.aevani-footer {
		position: relative;
		margin-top: 96px;
		background-color: #14261b;
		background-image: radial-gradient(
			900px 500px at 85% -10%,
			rgba(143, 216, 180, 0.14) 0%,
			transparent 60%
		);
		color: #dce6dd;
		overflow: hidden;
	}

	.footer-pattern {
		position: absolute;
		inset: 0;
		opacity: 0.06;
		color: #8fd8b4;
		pointer-events: none;
	}

	.footer-inner {
		position: relative;
		z-index: 1;
		max-width: 1240px;
		margin: 0 auto;
		padding: 4rem 24px 2rem;
	}

	@media (max-width: 639px) {
		.footer-inner {
			padding: 3rem 16px 2rem;
		}
	}

	/* (a) Newsletter row */
	.newsletter-row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 1.5rem 2.5rem;
		padding: 2rem;
		margin-bottom: 3.5rem;
		border-radius: 22px;
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid rgba(255, 255, 255, 0.08);
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
	}

	@media (max-width: 639px) {
		.newsletter-row {
			padding: 1.5rem;
		}
	}

	.newsletter-copy {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		max-width: 30rem;
	}

	.newsletter-title {
		font-family: var(--font-display, sans-serif);
		font-size: 1.6rem;
		font-weight: 600;
		letter-spacing: -0.015em;
		color: #f4f1ea;
		line-height: 1.1;
	}

	.newsletter-blurb {
		font-family: var(--font-body, sans-serif);
		font-size: 0.95rem;
		color: #7c9585;
		line-height: 1.5;
	}

	.newsletter-form {
		display: flex;
		gap: 0.5rem;
		flex: 1 1 20rem;
		max-width: 26rem;
	}

	.newsletter-input {
		flex: 1;
		min-width: 0;
		padding: 0.8rem 1.1rem;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.06);
		border: 1px solid rgba(255, 255, 255, 0.14);
		color: #f4f1ea;
		font-family: var(--font-body, sans-serif);
		font-size: 0.9rem;
		transition:
			border-color 0.2s ease,
			background-color 0.2s ease;
	}

	.newsletter-input::placeholder {
		color: #5a7263;
	}

	.newsletter-input:focus {
		outline: none;
		border-color: rgba(143, 216, 180, 0.55);
		background: rgba(255, 255, 255, 0.09);
	}

	.newsletter-submit {
		flex-shrink: 0;
		padding: 0.8rem 1.5rem;
		border: none;
		border-radius: 999px;
		background: linear-gradient(180deg, #a8e6c8, #7cc9a2);
		color: #14261b;
		font-family: var(--font-body, sans-serif);
		font-size: 0.9rem;
		font-weight: 600;
		cursor: pointer;
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease;
	}

	.newsletter-submit:hover {
		transform: translateY(-1px);
		box-shadow: 0 8px 22px rgba(124, 201, 162, 0.35);
	}

	/* (b) Footer grid */
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
			grid-template-columns: 1.5fr repeat(4, 1fr);
		}
	}

	.footer-brand-col {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
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

	.footer-brand {
		display: inline-flex;
		align-items: center;
		gap: 0.65rem;
		text-decoration: none;
		width: fit-content;
	}

	.footer-wordmark {
		font-family: var(--font-display, sans-serif);
		font-size: 1.25rem;
		font-weight: 700;
		letter-spacing: 0.14em;
		color: #f4f1ea;
		line-height: 1;
	}

	.footer-tagline {
		font-family: var(--font-body, sans-serif);
		font-size: 0.9rem;
		color: #7c9585;
		line-height: 1.6;
		max-width: 20rem;
	}

	/* Social pills */
	.social-row {
		display: flex;
		gap: 0.65rem;
	}

	.social-link {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.4rem;
		height: 2.4rem;
		border-radius: 999px;
		color: #a8e6c8;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		transition:
			background-color 0.2s,
			color 0.2s,
			border-color 0.2s;
	}

	.social-link:hover {
		color: #14261b;
		background: #a8e6c8;
		border-color: #a8e6c8;
	}

	.social-link svg {
		width: 1.05rem;
		height: 1.05rem;
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
			border-bottom: 1px solid rgba(255, 255, 255, 0.08);
			padding-bottom: 0.5rem;
		}

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
			color: rgba(220, 230, 221, 0.5);
			font-weight: 300;
			transition: transform 0.2s;
		}

		.footer-section[open] summary::after {
			content: '−';
		}
	}

	.footer-title {
		font-family: var(--font-body, sans-serif);
		font-size: 0.72rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.14em;
		color: #8fd8b4;
		padding: 0.5rem 0;
	}

	.footer-links {
		display: flex;
		flex-direction: column;
		gap: 0.7rem;
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.footer-link {
		font-family: var(--font-body, sans-serif);
		font-size: 0.9rem;
		color: rgba(220, 230, 221, 0.72);
		text-decoration: none;
		transition: color 0.15s;
	}

	.footer-link:hover {
		color: #f4f1ea;
	}

	/* (c) Legal bar */
	.footer-bottom {
		border-top: 1px solid rgba(255, 255, 255, 0.1);
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
		font-family: var(--font-body, sans-serif);
		font-size: 0.82rem;
		color: #5a7263;
	}

	.footer-bottom-links {
		display: flex;
		gap: 1.5rem;
	}

	.footer-bottom-link {
		font-family: var(--font-body, sans-serif);
		font-size: 0.82rem;
		color: #7c9585;
		text-decoration: none;
		transition: color 0.15s;
	}

	.footer-bottom-link:hover {
		color: #f4f1ea;
	}

	/* Scroll to top */
	.scroll-top-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.2rem;
		height: 2.2rem;
		background-color: rgba(255, 255, 255, 0.06);
		border: 1px solid rgba(255, 255, 255, 0.14);
		border-radius: 999px;
		color: #a8e6c8;
		cursor: pointer;
		transition:
			background-color 0.2s,
			color 0.2s;
		flex-shrink: 0;
	}

	.scroll-top-btn:hover {
		background-color: #a8e6c8;
		color: #14261b;
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

	/* ===== MOBILE DRAWER (Aevani cream/forest) ===== */
	.mobile-drawer {
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background-color: #14261b;
		background-image: radial-gradient(
			700px 500px at 90% 0%,
			rgba(143, 216, 180, 0.12) 0%,
			transparent 60%
		);
		color: #dce6dd;
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
		opacity: 0.05;
		color: #8fd8b4;
		pointer-events: none;
	}

	.drawer-close {
		position: absolute;
		top: 1.25rem;
		right: 1.25rem;
		width: 2.75rem;
		height: 2.75rem;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.14);
		border-radius: 999px;
		color: rgba(220, 230, 221, 0.75);
		cursor: pointer;
		transition:
			color 0.2s,
			background-color 0.2s,
			border-color 0.2s;
		z-index: 1;
	}

	.drawer-close:hover {
		color: #14261b;
		background: #a8e6c8;
		border-color: #a8e6c8;
	}

	.drawer-close svg {
		width: 1.125rem;
		height: 1.125rem;
	}

	.drawer-wordmark {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		font-family: var(--font-display, sans-serif);
		font-size: 1.4rem;
		font-weight: 700;
		letter-spacing: 0.14em;
		color: #f4f1ea;
		text-decoration: none;
		margin-bottom: 3rem;
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
		font-family: var(--font-display, sans-serif);
		font-size: 1.6rem;
		font-weight: 600;
		letter-spacing: -0.01em;
		color: #f4f1ea;
		text-decoration: none;
		padding: 0.5rem 0;
		display: block;
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
		cursor: pointer;
		list-style: none;
		transition: color 0.15s;
	}

	.drawer-nav-link:hover {
		color: #8fd8b4;
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
		font-family: var(--font-body, sans-serif);
		font-size: 0.9375rem;
		color: rgba(220, 230, 221, 0.6);
		text-decoration: none;
		padding: 0.375rem 0;
		transition: color 0.15s;
	}

	.drawer-sub-link:hover {
		color: #f4f1ea;
	}

	/* Drawer bottom */
	.drawer-bottom {
		margin-top: 2rem;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		position: relative;
		z-index: 1;
		border-top: 1px solid rgba(255, 255, 255, 0.1);
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
		background-color: rgba(255, 255, 255, 0.05);
		border-radius: 12px;
	}

	.drawer-user-name {
		font-size: 0.875rem;
		font-weight: 600;
		color: #f4f1ea;
	}

	.drawer-user-email {
		font-size: 0.75rem;
		color: #7c9585;
	}

	.drawer-action-btn {
		display: block;
		width: 100%;
		padding: 0.7rem 1rem;
		text-align: center;
		font-family: var(--font-body, sans-serif);
		font-size: 0.9rem;
		font-weight: 500;
		border-radius: 999px;
		text-decoration: none;
		color: rgba(220, 230, 221, 0.85);
		background-color: rgba(255, 255, 255, 0.06);
		border: 1px solid rgba(255, 255, 255, 0.12);
		cursor: pointer;
		transition:
			background-color 0.2s,
			color 0.2s;
	}

	.drawer-action-btn:hover {
		background-color: rgba(255, 255, 255, 0.12);
		color: #f4f1ea;
	}

	.drawer-action-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.drawer-action-btn.primary {
		background: linear-gradient(180deg, #a8e6c8, #7cc9a2);
		color: #14261b;
		border-color: transparent;
		font-weight: 600;
	}

	.drawer-action-btn.primary:hover {
		background: linear-gradient(180deg, #b6ecd2, #7cc9a2);
		color: #14261b;
	}

	/* Drawer newsletter */
	.drawer-newsletter {
		font-family: var(--font-body, sans-serif);
		font-size: 0.8125rem;
		line-height: 1.5;
		color: #7c9585;
	}

	.drawer-newsletter-unavailable {
		margin: 0;
	}

	.drawer-newsletter-unavailable a {
		color: #a8e6c8;
		text-decoration: underline;
		text-underline-offset: 0.2em;
	}

	/* Drawer social */
	.drawer-social {
		display: flex;
		gap: 1rem;
	}

	.drawer-social-link {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.75rem;
		height: 2.75rem;
		border-radius: 999px;
		color: #a8e6c8;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		transition:
			color 0.2s,
			background-color 0.2s,
			border-color 0.2s;
	}

	.drawer-social-link:hover {
		color: #14261b;
		background: #a8e6c8;
		border-color: #a8e6c8;
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
		transition:
			background-color 150ms ease,
			color 150ms ease;
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
		transition:
			opacity 200ms ease,
			transform 200ms var(--ease-out-expo);
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
