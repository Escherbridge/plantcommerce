<script lang="ts">
	import '../app.css';
	import { Header } from '$lib/components/navigation';
	import { page } from '$app/stores';
	import { trpc } from '$lib/trpc/client';
	import { browser } from '$app/environment';

	let { children, data } = $props();

	$: user = data.user;

	// Logout function for mobile
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

	// Mobile navigation structure
	const mobileNavigation = [
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
</script>

<div class="swiss-layout">
	<input id="drawer-toggle" type="checkbox" class="drawer-toggle" />
	
	<div class="layout-content">
		<Header />
		
		<main class="main-content">
			{@render children()}
		</main>

		<footer class="swiss-footer">
			<div class="footer-container">
				<div class="footer-grid">
					<!-- Brand section -->
					<div class="footer-brand">
						<div class="brand">
							<span class="brand-icon">🌱</span>
							<span class="brand-text">Aevani</span>
						<p class="brand-description">
							Sustainable agriculture solutions for the future. 
							Hydroponics, aquaponics, and agroforestry products 
							to help you grow better.
						</p>
						<div class="social-links">
							<a href="https://facebook.com/aevani" class="social-link" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
								<i class="fab fa-facebook-f"></i>
							</a>
							<a href="https://twitter.com/aevani" class="social-link" aria-label="Twitter" target="_blank" rel="noopener noreferrer">
								<i class="fab fa-twitter"></i>
							</a>
							<a href="https://instagram.com/aevani" class="social-link" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
								<i class="fab fa-instagram"></i>
							</a>
						</div>
					</div>

					<!-- Shop links -->
					<div class="footer-section">
						<h3 class="footer-title">Shop</h3>
						<ul class="footer-links">
							{#each footerLinks.shop as link}
								<li><a href={link.href} class="footer-link">{link.label}</a></li>
							{/each}
						</ul>
					</div>

					<!-- Learn links -->
					<div class="footer-section">
						<h3 class="footer-title">Learn</h3>
						<ul class="footer-links">
							{#each footerLinks.learn as link}
								<li><a href={link.href} class="footer-link">{link.label}</a></li>
							{/each}
						</ul>
					</div>

					<!-- Company links -->
					<div class="footer-section">
						<h3 class="footer-title">Company</h3>
						<ul class="footer-links">
							{#each footerLinks.company as link}
								<li><a href={link.href} class="footer-link">{link.label}</a></li>
							{/each}
						</ul>
					</div>

					<!-- Support links -->
					<div class="footer-section">
						<h3 class="footer-title">Support</h3>
						<ul class="footer-links">
							{#each footerLinks.support as link}
								<li><a href={link.href} class="footer-link">{link.label}</a></li>
							{/each}
						</ul>
					</div>
				</div>

				<div class="footer-bottom">
					<div class="footer-bottom-content">
						<p class="copyright">&copy; 2024 Aevani. All rights reserved.</p>
						<div class="footer-bottom-links">
							<a href="/privacy" class="footer-bottom-link">Privacy Policy</a>
							<a href="/terms" class="footer-bottom-link">Terms of Service</a>
							<a href="/cookies" class="footer-bottom-link">Cookie Policy</a>
						</div>
					</div>
				</div>
			</div>
		</footer>
	</div>

	<!-- Mobile drawer -->
	<div class="drawer-side">
		<label for="drawer-toggle" class="drawer-overlay"></label>
		<div class="mobile-drawer">
			<div class="mobile-drawer-header">
				<div class="brand">
					<span class="brand-icon">🌱</span>
					<span class="brand-text">PlantCommerce</span>
				</div>
			</div>
			
			<nav class="mobile-nav">
				{#each mobileNavigation as item}
					<div class="mobile-nav-item">
						<a href={item.href} class="mobile-nav-link">
							{item.label}
						</a>
						{#if item.children}
							<div class="mobile-nav-children">
								{#each item.children as child}
									<a href={child.href} class="mobile-nav-child">
										{child.label}
									</a>
								{/each}
							</div>
						{/if}
					</div>
				{/each}
			</nav>

			<div class="mobile-drawer-footer">
				<div class="mobile-user-actions">
					{#if user}
						<div class="mobile-user-info">
							<span class="mobile-user-name">{user.firstName || user.username}</span>
							<span class="mobile-user-email">{user.email}</span>
						</div>
						<a href="/account" class="mobile-action-btn">My Account</a>
						<button on:click={handleLogout} class="mobile-action-btn" disabled={isLoggingOut}>
							{isLoggingOut ? 'Logging out...' : 'Logout'}
						</button>
					{:else}
						<a href="/login" class="mobile-action-btn">Login</a>
						<a href="/register" class="mobile-action-btn primary">Register</a>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.swiss-layout {
		min-height: 100vh;
		background-color: #f9fafb;
		font-family: 'Helvetica Neue', Arial, sans-serif;
		line-height: 1.6;
	}

	.layout-content {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		max-width: 100vw;
		overflow-x: hidden;
	}

	.main-content {
		flex: 1;
	}

	/* Swiss Footer */
	.swiss-footer {
		background-color: white;
		border-top: 1px solid #e5e7eb;
		margin-top: auto;
	}

	.footer-container {
		max-width: 80rem;
		margin: 0 auto;
		padding: 3rem 1rem;
	}

	@media (min-width: 640px) {
		.footer-container {
			padding: 3rem 1.5rem;
		}
	}

	@media (min-width: 1024px) {
		.footer-container {
			padding: 3rem 2rem;
		}
	}

	.footer-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 2rem;
	}

	@media (min-width: 768px) {
		.footer-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (min-width: 1024px) {
		.footer-grid {
			grid-template-columns: repeat(5, 1fr);
		}
	}

	.footer-brand {
		grid-column: span 1;
	}

	@media (min-width: 1024px) {
		.footer-brand {
			grid-column: span 2;
		}
	}

	.brand {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 1.25rem;
		font-weight: 700;
		color: #111827;
		margin-bottom: 1rem;
		letter-spacing: -0.025em;
	}

	.brand-icon {
		font-size: 1.5rem;
	}

	.brand-description {
		color: #4b5563;
		font-size: 0.875rem;
		line-height: 1.625;
		margin-bottom: 1.5rem;
		max-width: 24rem;
	}

	.social-links {
		display: flex;
		gap: 1rem;
	}

	.social-link {
		color: #9ca3af;
		transition: color 0.2s;
	}

	.social-link:hover {
		color: #4b5563;
	}

	.footer-section {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.footer-title {
		font-size: 0.875rem;
		font-weight: 600;
		color: #111827;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.footer-links {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.footer-link {
		font-size: 0.875rem;
		color: #4b5563;
		transition: color 0.2s;
		text-decoration: none;
	}

	.footer-link:hover {
		color: #111827;
	}

	.footer-bottom {
		border-top: 1px solid #e5e7eb;
		margin-top: 3rem;
		padding-top: 2rem;
	}

	.footer-bottom-content {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
	}

	@media (min-width: 640px) {
		.footer-bottom-content {
			flex-direction: row;
			gap: 0;
		}
	}

	.copyright {
		font-size: 0.875rem;
		color: #6b7280;
	}

	.footer-bottom-links {
		display: flex;
		gap: 1.5rem;
	}

	.footer-bottom-link {
		font-size: 0.875rem;
		color: #6b7280;
		transition: color 0.2s;
		text-decoration: none;
	}

	.footer-bottom-link:hover {
		color: #374151;
	}

	/* Mobile Drawer */
	.drawer-side {
		position: fixed;
		top: 0;
		bottom: 0;
		left: 0;
		z-index: 50;
		width: 20rem;
		transform: translateX(-100%);
		transition: transform 0.3s ease-in-out;
	}

	.drawer-toggle:checked ~ .drawer-side {
		transform: translateX(0);
	}

	.drawer-overlay {
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 40;
	}

	.mobile-drawer {
		width: 100%;
		height: 100%;
		background-color: white;
		display: flex;
		flex-direction: column;
	}

	.mobile-drawer-header {
		padding: 1.5rem;
		border-bottom: 1px solid #e5e7eb;
	}

	.mobile-nav {
		flex: 1;
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.mobile-nav-item {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.mobile-nav-link {
		display: block;
		padding: 0.5rem 0.75rem;
		font-size: 1rem;
		font-weight: 500;
		color: #111827;
		transition: all 0.2s;
		border-radius: 0.375rem;
		text-decoration: none;
	}

	.mobile-nav-link:hover {
		background-color: #f3f4f6;
	}

	.mobile-nav-children {
		margin-left: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.mobile-nav-child {
		display: block;
		padding: 0.5rem 0.75rem;
		font-size: 0.875rem;
		color: #4b5563;
		transition: all 0.2s;
		border-radius: 0.375rem;
		text-decoration: none;
	}

	.mobile-nav-child:hover {
		background-color: #f3f4f6;
	}

	.mobile-drawer-footer {
		padding: 1.5rem;
		border-top: 1px solid #e5e7eb;
	}

	.mobile-user-actions {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.mobile-user-info {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		padding: 0.75rem;
		background-color: #f3f4f6;
		border-radius: 0.375rem;
		margin-bottom: 0.5rem;
	}

	.mobile-user-name {
		font-size: 0.875rem;
		font-weight: 600;
		color: #111827;
	}

	.mobile-user-email {
		font-size: 0.75rem;
		color: #6b7280;
	}

	.mobile-action-btn {
		display: block;
		width: 100%;
		padding: 0.5rem 1rem;
		text-align: center;
		font-size: 0.875rem;
		font-weight: 500;
		border-radius: 0.375rem;
		transition: all 0.2s;
		text-decoration: none;
		color: #374151;
		background-color: #f3f4f6;
		border: none;
		cursor: pointer;
		font-family: inherit;
	}

	.mobile-action-btn:hover {
		background-color: #e5e7eb;
	}

	.mobile-action-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.mobile-action-btn.primary {
		color: white;
		background-color: #059669;
	}

	.mobile-action-btn.primary:hover {
		background-color: #047857;
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		.footer-grid {
			grid-template-columns: 1fr;
			gap: 1.5rem;
		}
		
		.footer-brand {
			text-align: center;
		}
		
		.brand-description {
			max-width: none;
		}
	}

	/* Clean spacing and typography */
	.footer-container > * + * {
		margin-top: 2rem;
	}

	.footer-section > * + * {
		margin-top: 1rem;
	}
</style>
