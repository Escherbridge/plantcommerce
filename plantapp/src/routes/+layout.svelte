<script lang="ts">
	import '../app.css';
	import { Header } from '$lib/components/navigation';
	import { page } from '$app/stores';

	let { children } = $props();

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
							<span class="brand-text">PlantCommerce</span>
						</div>
						<p class="brand-description">
							Sustainable agriculture solutions for the future. 
							Hydroponics, aquaponics, and agroforestry products 
							to help you grow better.
						</p>
						<div class="social-links">
							<a href="https://facebook.com/plantcommerce" class="social-link" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
								<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
									<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
								</svg>
							</a>
							<a href="https://twitter.com/plantcommerce" class="social-link" aria-label="Twitter" target="_blank" rel="noopener noreferrer">
								<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
									<path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
								</svg>
							</a>
							<a href="https://instagram.com/plantcommerce" class="social-link" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
								<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
									<path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.83-9.281h-1.563v-1.563h1.563v1.563zm-3.262 0c-2.026 0-3.662 1.636-3.662 3.662s1.636 3.662 3.662 3.662 3.662-1.636 3.662-3.662-1.636-3.662-3.662-3.662z"/>
								</svg>
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
						<p class="copyright">&copy; 2024 PlantCommerce. All rights reserved.</p>
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
					<a href="/login" class="mobile-action-btn">Login</a>
					<a href="/register" class="mobile-action-btn primary">Register</a>
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
	}

	.mobile-action-btn:hover {
		background-color: #e5e7eb;
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
