<script lang="ts">
	import { Container, Section } from '$lib/components/layout';
	import { Select } from '$lib/components/ui';
	import type { PageData } from './$types';
	import { trpc } from '$lib/trpc/client';
	import { toasts } from '$lib/stores/toast';

	let { data }: { data: PageData } = $props();

	// Application form state
	let step = $state(1);
	let isSubmitting = $state(false);
	let showTermsModal = $state(false);
	let termsScrolled = $state(false);
	let termsModalElement: HTMLDivElement;

	let formData = $state({
		website: '',
		socialMedia: '',
		audience: '',
		promotionMethod: '',
		monthlyTraffic: '',
		whyJoin: '',
		agreeTerms: false
	});

	function openTermsModal() {
		showTermsModal = true;
		termsScrolled = false;
	}

	function closeTermsModal() {
		showTermsModal = false;
	}

	function handleTermsScroll(e: Event) {
		const el = e.target as HTMLDivElement;
		const isAtBottom = Math.abs(el.scrollHeight - el.clientHeight - el.scrollTop) < 10;
		if (isAtBottom) {
			termsScrolled = true;
		}
	}

	function acceptTerms() {
		if (termsScrolled) {
			formData.agreeTerms = true;
			closeTermsModal();
		}
	}

	const benefits = [
		{
			title: 'Competitive Commissions',
			description: 'Earn up to 15% commission on all referred sales with our tiered structure.',
			icon: 'M12 2a10 10 0 100 20 10 10 0 000-20zM8 14l2 2 4-4'
		},
		{
			title: 'Marketing Materials',
			description: 'Professional banners, social templates, and branded content ready to use.',
			icon: 'M4 4h16v12H4zM8 20h8M12 16v4'
		},
		{
			title: 'Real-time Analytics',
			description: 'Track clicks, conversions, and earnings with a comprehensive dashboard.',
			icon: 'M3 20h18M6 16v4M10 12v8M14 8v12M18 4v16'
		},
		{
			title: '30-Day Cookie Window',
			description: 'Long attribution window ensures you get credit for referred customers.',
			icon: 'M12 2a10 10 0 100 20 10 10 0 000-20zM12 6v6l4 2'
		},
		{
			title: 'Monthly Payouts',
			description: 'Timely payments via PayPal, bank transfer, or check. $50 minimum.',
			icon: 'M2 7h20v12a2 2 0 01-2 2H4a2 2 0 01-2-2V7zM22 7l-2-4H4L2 7M8 12h8'
		},
		{
			title: 'Dedicated Support',
			description: 'A partner team that helps you maximize conversions and earnings.',
			icon: 'M17 8a5 5 0 00-10 0c0 4 5 8 5 12 0-4 5-8 5-12zM12 20v2M8 22h8'
		}
	];

	const commissionTiers = [
		{ sales: '$0 - $1,000', rate: '5%', earnings: 'Up to $50', highlight: false },
		{ sales: '$1,001 - $5,000', rate: '8%', earnings: 'Up to $400', highlight: false },
		{ sales: '$5,001 - $10,000', rate: '10%', earnings: 'Up to $1,000', highlight: true },
		{ sales: '$10,001+', rate: '15%', earnings: 'Unlimited', highlight: false }
	];

	const steps = [
		{ num: 1, label: 'Apply' },
		{ num: 2, label: 'Get Approved' },
		{ num: 3, label: 'Promote' },
		{ num: 4, label: 'Earn' }
	];

	async function handleSubmit() {
		if (!formData.agreeTerms) return;
		isSubmitting = true;

		try {
			await trpc.affiliate.submitApplication.mutate({
				website: formData.website || undefined,
				socialMedia: formData.socialMedia || undefined,
				audience: formData.audience,
				promotionMethod: formData.promotionMethod,
				monthlyTraffic: formData.monthlyTraffic,
				whyJoin: formData.whyJoin
			});

			toasts.addToast({
				message: 'Application submitted! We\'ll review it within 24-48 hours.',
				variant: 'success',
				duration: 5000
			});

			step = 3; // Show success state
		} catch (err: any) {
			toasts.addToast({
				message: err?.message || 'Something went wrong. Please try again.',
				variant: 'error',
				duration: 5000
			});
		} finally {
			isSubmitting = false;
		}
	}
</script>

<svelte:head>
	<title>Affiliate Program - Aevani</title>
</svelte:head>

<!-- Hero -->
<section class="aff-hero">
	<div class="aff-hero__bg" aria-hidden="true"></div>
	<Container>
		<div class="aff-hero__content">
			<span class="aff-hero__tag">Partner with us</span>
			<h1 class="aff-hero__title">Grow With Aevani</h1>
			<p class="aff-hero__subtitle">
				Join our affiliate program and earn up to 15% commission promoting sustainable agriculture products to your audience.
			</p>
			{#if data.user && data.isAffiliate}
				<a href="/affiliate/dashboard" class="aff-hero__cta">Go to Dashboard</a>
			{:else if data.user}
				<button class="aff-hero__cta" onclick={() => { document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth' }) }}>
					Apply Now
				</button>
			{:else}
				<a href="/login?redirect=/affiliate/join" class="aff-hero__cta">Sign In to Apply</a>
			{/if}
		</div>
	</Container>
</section>

<!-- Benefits -->
<Section>
	<Container>
		<div class="aff-section-header">
			<h2 class="aff-section-title">Why Partner With Us</h2>
			<p class="aff-section-desc">Everything you need to succeed as an Aevani affiliate.</p>
		</div>

		<div class="aff-benefits-grid">
			{#each benefits as benefit}
				<div class="aff-benefit">
					<div class="aff-benefit__icon">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
							<path d={benefit.icon} />
						</svg>
					</div>
					<h3 class="aff-benefit__title">{benefit.title}</h3>
					<p class="aff-benefit__desc">{benefit.description}</p>
				</div>
			{/each}
		</div>
	</Container>
</Section>

<!-- Commission Structure -->
<section class="aff-commission">
	<Container>
		<div class="aff-section-header">
			<h2 class="aff-section-title">Commission Structure</h2>
			<p class="aff-section-desc">Earn more as your referrals grow. Tiered rates that reward performance.</p>
		</div>

		<div class="aff-tiers">
			{#each commissionTiers as tier}
				<div class="aff-tier" class:aff-tier--highlight={tier.highlight}>
					{#if tier.highlight}
						<span class="aff-tier__badge">Most Popular</span>
					{/if}
					<span class="aff-tier__rate">{tier.rate}</span>
					<span class="aff-tier__sales">{tier.sales}</span>
					<span class="aff-tier__label">monthly sales</span>
					<div class="aff-tier__divider"></div>
					<span class="aff-tier__earnings">{tier.earnings}</span>
					<span class="aff-tier__label">potential earnings</span>
				</div>
			{/each}
		</div>
	</Container>
</section>

<!-- How It Works -->
<Section>
	<Container>
		<div class="aff-section-header">
			<h2 class="aff-section-title">How It Works</h2>
		</div>

		<div class="aff-steps">
			{#each steps as s, i}
				<div class="aff-step">
					<div class="aff-step__num">{s.num}</div>
					{#if i < steps.length - 1}
						<div class="aff-step__connector"></div>
					{/if}
					<span class="aff-step__label">{s.label}</span>
					<span class="aff-step__desc">
						{#if s.num === 1}Fill out the quick application below
						{:else if s.num === 2}We review within 24-48 hours
						{:else if s.num === 3}Share your unique affiliate links
						{:else}Get paid monthly for referrals
						{/if}
					</span>
				</div>
			{/each}
		</div>
	</Container>
</Section>

<!-- Application / CTA -->
<section class="aff-apply" id="apply">
	<Container>
		{#if data.user && data.isAffiliate}
			<!-- Already an affiliate -->
			<div class="aff-apply__card">
				<div class="aff-apply__icon-wrap aff-apply__icon-wrap--success">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
						<polyline points="22 4 12 14.01 9 11.01"/>
					</svg>
				</div>
				<h2 class="aff-apply__title">You're an Affiliate</h2>
				<p class="aff-apply__desc">Head to your dashboard to manage links, track performance, and view earnings.</p>
				<a href="/affiliate/dashboard" class="aff-hero__cta">Go to Dashboard</a>
			</div>

		{:else if data.user && step === 3}
			<!-- Application submitted -->
			<div class="aff-apply__card">
				<div class="aff-apply__icon-wrap aff-apply__icon-wrap--success">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
						<polyline points="22 4 12 14.01 9 11.01"/>
					</svg>
				</div>
				<h2 class="aff-apply__title">Application Submitted</h2>
				<p class="aff-apply__desc">We'll review your application and get back to you within 24-48 hours. Check your email for updates.</p>
				<a href="/account/profile" class="aff-hero__cta">Back to Account</a>
			</div>

		{:else if data.user}
			<!-- Onboarding application form -->
			<div class="aff-section-header">
				<h2 class="aff-section-title">Apply Now</h2>
				<p class="aff-section-desc">Tell us about yourself and how you plan to promote Aevani products.</p>
			</div>

			<div class="aff-form-card">
				{#if step === 1}
					<div class="aff-form-step">
						<h3 class="aff-form__heading">Your Online Presence</h3>
						<div class="aff-form__fields">
							<div class="form-control">
								<label class="label" for="website">
									<span class="label-text">Website or Blog URL</span>
								</label>
								<input
									id="website"
									type="url"
									class="input input-bordered w-full"
									placeholder="https://yoursite.com"
									bind:value={formData.website}
								/>
							</div>

							<div class="form-control">
								<label class="label" for="social">
									<span class="label-text">Primary Social Media Profile</span>
								</label>
								<input
									id="social"
									type="url"
									class="input input-bordered w-full"
									placeholder="https://instagram.com/yourhandle"
									bind:value={formData.socialMedia}
								/>
							</div>

							<div class="form-control">
								<label class="label" for="audience">
									<span class="label-text">Describe Your Audience</span>
								</label>
								<Select
									id="audience"
									name="audience"
									bind:value={formData.audience}
									placeholder="Select your primary audience..."
									options={[
										{ value: 'gardeners', label: 'Home Gardeners & Hobbyists' },
										{ value: 'farmers', label: 'Small-Scale Farmers' },
										{ value: 'sustainability', label: 'Sustainability Enthusiasts' },
										{ value: 'educators', label: 'Educators & Students' },
										{ value: 'commercial', label: 'Commercial Agriculture' },
										{ value: 'other', label: 'Other' }
									]}
								/>
							</div>

							<div class="form-control">
								<label class="label" for="traffic">
									<span class="label-text">Estimated Monthly Traffic / Reach</span>
								</label>
								<Select
									id="traffic"
									name="monthlyTraffic"
									bind:value={formData.monthlyTraffic}
									placeholder="Select range..."
									options={[
										{ value: 'under-1k', label: 'Under 1,000' },
										{ value: '1k-5k', label: '1,000 - 5,000' },
										{ value: '5k-25k', label: '5,000 - 25,000' },
										{ value: '25k-100k', label: '25,000 - 100,000' },
										{ value: '100k+', label: '100,000+' }
									]}
								/>
							</div>
						</div>

						<div class="aff-form__actions">
							<button
								class="btn btn-primary font-display uppercase tracking-wider"
								onclick={() => step = 2}
								disabled={!formData.audience || !formData.monthlyTraffic}
							>
								Continue
							</button>
						</div>
					</div>

				{:else if step === 2}
					<div class="aff-form-step">
						<h3 class="aff-form__heading">Promotion Details</h3>
						<div class="aff-form__fields">
							<div class="form-control">
								<label class="label" for="method">
									<span class="label-text">How Will You Promote Aevani?</span>
								</label>
								<Select
									id="method"
									name="promotionMethod"
									bind:value={formData.promotionMethod}
									placeholder="Select your primary method..."
									options={[
										{ value: 'blog', label: 'Blog / Content Marketing' },
										{ value: 'social', label: 'Social Media' },
										{ value: 'email', label: 'Email Newsletter' },
										{ value: 'youtube', label: 'YouTube / Video Content' },
										{ value: 'podcast', label: 'Podcast' },
										{ value: 'community', label: 'Online Communities / Forums' },
										{ value: 'other', label: 'Other' }
									]}
								/>
							</div>

							<div class="form-control">
								<label class="label" for="why">
									<span class="label-text">Why Do You Want to Partner With Aevani?</span>
								</label>
								<textarea
									id="why"
									class="textarea textarea-bordered w-full"
									rows="4"
									placeholder="Tell us why you're excited about sustainable agriculture and how Aevani fits your audience..."
									bind:value={formData.whyJoin}
								></textarea>
							</div>

							<label class="aff-form__agree">
								<input
									type="checkbox"
									class="checkbox checkbox-primary"
									bind:checked={formData.agreeTerms}
								/>
								<span>
									I agree to the
									<button
										type="button"
										class="terms-link"
										onclick={openTermsModal}
									>
										Affiliate Terms & Conditions
									</button>
								</span>
							</label>
						</div>

						<div class="aff-form__actions aff-form__actions--split">
							<button
								class="btn btn-outline font-display uppercase tracking-wider"
								onclick={() => step = 1}
							>
								Back
							</button>
							<button
								class="btn btn-primary font-display uppercase tracking-wider"
								onclick={handleSubmit}
								disabled={isSubmitting || !formData.promotionMethod || !formData.whyJoin || !formData.agreeTerms}
							>
								{#if isSubmitting}
									<span class="loading loading-spinner loading-sm"></span>
									Submitting...
								{:else}
									Submit Application
								{/if}
							</button>
						</div>
					</div>
				{/if}

				<!-- Step indicator -->
				<div class="aff-form__progress">
					<div class="aff-form__progress-dot" class:active={step >= 1}></div>
					<div class="aff-form__progress-line" class:active={step >= 2}></div>
					<div class="aff-form__progress-dot" class:active={step >= 2}></div>
				</div>
			</div>

		{:else}
			<!-- Not logged in -->
			<div class="aff-apply__card">
				<h2 class="aff-apply__title">Ready to Get Started?</h2>
				<p class="aff-apply__desc">Sign in or create an account to apply for the affiliate program and start earning commissions.</p>
				<div class="aff-apply__buttons">
					<a href="/login?redirect=/affiliate/join" class="aff-hero__cta">Sign In to Apply</a>
					<a href="/register" class="aff-apply__secondary">Create an Account</a>
				</div>
			</div>
		{/if}

		<p class="aff-terms-note">
			By applying, you agree to our
			<a href="/affiliate/terms" class="link link-primary">Affiliate Terms & Conditions</a>
		</p>
	</Container>
</section>

<!-- Terms & Conditions Modal -->
{#if showTermsModal}
	<div class="terms-modal-overlay" onclick={(e) => {
		if (e.target === e.currentTarget) {
			closeTermsModal();
		}
	}}>
		<div class="terms-modal-card">
			<div class="terms-modal__header">
				<h2 class="terms-modal__title">Affiliate Terms & Conditions</h2>
				<button
					type="button"
					class="terms-modal__close"
					onclick={closeTermsModal}
					aria-label="Close modal"
				>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<line x1="18" y1="6" x2="6" y2="18"/>
						<line x1="6" y1="6" x2="18" y2="18"/>
					</svg>
				</button>
			</div>

			<div
				class="terms-modal__content"
				bind:this={termsModalElement}
				onscroll={handleTermsScroll}
			>
				<section class="terms-section">
					<h3 class="terms-heading">1. Program Overview</h3>
					<p>
						The Aevani Affiliate Program allows partners to earn competitive commissions by promoting our sustainable agriculture products. As an affiliate, you will receive a unique referral code and links to use in your promotional materials.
					</p>
				</section>

				<section class="terms-section">
					<h3 class="terms-heading">2. Commission Structure</h3>
					<p>
						Affiliates earn commissions based on a tiered structure:
					</p>
					<ul class="terms-list">
						<li>Base Tier: 5% on sales up to $1,000/month</li>
						<li>Silver Tier: 8% on sales $1,001-$5,000/month</li>
						<li>Gold Tier: 10% on sales $5,001-$10,000/month</li>
						<li>Platinum Tier: 15% on sales $10,001+/month</li>
					</ul>
					<p>
						Commission rates are calculated on the net sale amount (excluding taxes and shipping) and are paid monthly.
					</p>
				</section>

				<section class="terms-section">
					<h3 class="terms-heading">3. Cookie Policy and Attribution</h3>
					<p>
						We use a 30-day cookie window for affiliate attribution. If a customer clicks your affiliate link and makes a purchase within 30 days, the order is attributed to your account. Only one affiliate per order will receive credit. If multiple affiliate links are used, the last click takes precedence.
					</p>
				</section>

				<section class="terms-section">
					<h3 class="terms-heading">4. Prohibited Practices</h3>
					<p>
						Affiliates agree not to engage in the following:
					</p>
					<ul class="terms-list">
						<li>Bidding on Aevani brand keywords or trademarked terms in paid advertising</li>
						<li>Misleading claims about products or commission structure</li>
						<li>Spam, unsolicited emails, or aggressive sales tactics</li>
						<li>Creating fake reviews or testimonials</li>
						<li>Promoting products in illegal or inappropriate contexts</li>
						<li>Direct email to customer lists without prior permission</li>
						<li>Using deceptive link cloaking or obfuscation techniques</li>
					</ul>
				</section>

				<section class="terms-section">
					<h3 class="terms-heading">5. Payment Terms</h3>
					<p>
						Commissions are calculated and paid monthly via your preferred payment method (PayPal, bank transfer, or check). Minimum payout threshold is $50. Payments are processed within 10 business days of the month's close. Affiliates must provide accurate payment information.
					</p>
				</section>

				<section class="terms-section">
					<h3 class="terms-heading">6. Term and Termination</h3>
					<p>
						This agreement is effective upon approval and continues on a month-to-month basis. Either party may terminate with 30 days' notice. Aevani reserves the right to terminate immediately if you violate these terms or engage in fraudulent activity. Upon termination, all commissions earned through the last day of activity will be paid within 60 days.
					</p>
				</section>

				<section class="terms-section">
					<h3 class="terms-heading">7. Intellectual Property</h3>
					<p>
						All marketing materials, logos, and brand assets provided by Aevani remain our property. You may use them solely for promoting Aevani products. You may not modify, copy, or redistribute these materials without written permission.
					</p>
				</section>

				<section class="terms-section">
					<h3 class="terms-heading">8. Confidentiality</h3>
					<p>
						Affiliate commission rates, promotional strategies, and unpublished product information are confidential. You agree not to disclose this information to competitors or the public.
					</p>
				</section>

				<section class="terms-section">
					<h3 class="terms-heading">9. Liability and Indemnification</h3>
					<p>
						Aevani is not liable for lost earnings or indirect damages. You indemnify Aevani against claims, damages, or costs arising from your use of affiliate links or promotional materials.
					</p>
				</section>

				<section class="terms-section">
					<h3 class="terms-heading">10. Changes to Terms</h3>
					<p>
						Aevani reserves the right to modify these terms at any time. Changes are effective immediately upon posting. Continued participation in the program constitutes acceptance of updated terms.
					</p>
				</section>
			</div>

			<div class="terms-modal__footer">
				{#if !termsScrolled}
					<p class="terms-scroll-hint">Scroll to the bottom to accept</p>
				{/if}
				<button
					type="button"
					class="btn btn-primary font-display uppercase tracking-wider"
					onclick={acceptTerms}
					disabled={!termsScrolled}
				>
					I've Read & Accept
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	/* ===== HERO ===== */
	.aff-hero {
		position: relative;
		padding: 5rem 0 4rem;
		overflow: hidden;
	}

	.aff-hero__bg {
		position: absolute;
		inset: 0;
		background:
			linear-gradient(160deg,
				oklch(var(--p) / 0.06) 0%,
				oklch(var(--s) / 0.04) 40%,
				oklch(var(--su) / 0.03) 80%,
				transparent 100%
			);
		z-index: 0;
	}

	.aff-hero__content {
		position: relative;
		z-index: 1;
		max-width: 42rem;
	}

	.aff-hero__tag {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: oklch(var(--s));
	}

	.aff-hero__title {
		font-family: var(--font-display);
		font-size: clamp(2.5rem, 6vw, 5rem);
		font-weight: 800;
		line-height: 0.95;
		text-transform: uppercase;
		letter-spacing: -0.02em;
		color: oklch(var(--bc));
		margin: 0.75rem 0 1.25rem;
	}

	.aff-hero__subtitle {
		font-size: 1.125rem;
		color: oklch(var(--bc) / 0.6);
		line-height: 1.65;
		max-width: 34rem;
		margin-bottom: 2rem;
	}

	.aff-hero__cta {
		display: inline-flex;
		align-items: center;
		padding: 0.75rem 2rem;
		font-family: var(--font-display);
		font-size: 0.875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: oklch(var(--pc));
		background: linear-gradient(135deg, oklch(var(--s)) 0%, oklch(var(--p)) 100%);
		border-radius: var(--input-radius, 10px);
		text-decoration: none;
		border: none;
		cursor: pointer;
		box-shadow: 0 4px 16px oklch(var(--p) / 0.25);
		transition: opacity 200ms ease, transform 200ms var(--ease-out-expo), box-shadow 200ms ease;
	}

	.aff-hero__cta:hover {
		opacity: 0.92;
		transform: translateY(-1px);
		box-shadow: 0 6px 24px oklch(var(--p) / 0.3);
	}

	/* ===== SECTION HEADERS ===== */
	.aff-section-header {
		text-align: center;
		margin-bottom: 3rem;
	}

	.aff-section-title {
		font-family: var(--font-display);
		font-size: clamp(1.5rem, 3vw, 2.25rem);
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: -0.01em;
		color: oklch(var(--bc));
		margin-bottom: 0.75rem;
	}

	.aff-section-desc {
		font-size: 1rem;
		color: oklch(var(--bc) / 0.55);
		max-width: 32rem;
		margin: 0 auto;
	}

	/* ===== BENEFITS ===== */
	.aff-benefits-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
		gap: 1.25rem;
	}

	.aff-benefit {
		background: oklch(var(--b1));
		border: 1.5px solid var(--input-border);
		border-radius: var(--radius-lg, 16px);
		padding: 1.75rem;
		transition: transform 250ms var(--ease-out-expo), box-shadow 250ms var(--ease-out-expo), border-color 250ms ease;
	}

	.aff-benefit:hover {
		transform: translateY(-3px);
		box-shadow: var(--shadow-glow-md);
		border-color: var(--input-border-hover);
	}

	.aff-benefit__icon {
		width: 2.5rem;
		height: 2.5rem;
		color: oklch(var(--p));
		margin-bottom: 1rem;
	}

	.aff-benefit__icon svg {
		width: 100%;
		height: 100%;
	}

	.aff-benefit__title {
		font-family: var(--font-display);
		font-size: 1rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.02em;
		color: oklch(var(--bc));
		margin-bottom: 0.5rem;
	}

	.aff-benefit__desc {
		font-size: 0.8125rem;
		color: oklch(var(--bc) / 0.55);
		line-height: 1.6;
	}

	/* ===== COMMISSION TIERS ===== */
	.aff-commission {
		padding: 4rem 0;
		background: oklch(var(--b2));
	}

	.aff-tiers {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
		gap: 1rem;
		max-width: 56rem;
		margin: 0 auto;
	}

	.aff-tier {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: 2rem 1.5rem;
		background: oklch(var(--b1));
		border: 1.5px solid var(--input-border);
		border-radius: var(--radius-lg, 16px);
		transition: transform 250ms var(--ease-out-expo), box-shadow 250ms ease;
	}

	.aff-tier:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-glow-md);
	}

	.aff-tier--highlight {
		border-color: oklch(var(--p) / 0.4);
		box-shadow: var(--shadow-glow-md);
		background: oklch(var(--p) / 0.03);
	}

	.aff-tier__badge {
		position: absolute;
		top: -0.75rem;
		left: 50%;
		transform: translateX(-50%);
		padding: 0.25rem 0.75rem;
		font-family: var(--font-display);
		font-size: 0.625rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: oklch(var(--pc));
		background: oklch(var(--p));
		border-radius: var(--radius-full);
		white-space: nowrap;
	}

	.aff-tier__rate {
		font-family: var(--font-display);
		font-size: 2.5rem;
		font-weight: 800;
		color: oklch(var(--p));
		line-height: 1;
	}

	.aff-tier__sales {
		font-size: 0.875rem;
		font-weight: 600;
		color: oklch(var(--bc));
		margin-top: 0.5rem;
	}

	.aff-tier__label {
		font-size: 0.6875rem;
		color: oklch(var(--bc) / 0.4);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.aff-tier__divider {
		width: 2rem;
		height: 1px;
		background: oklch(var(--bc) / 0.1);
		margin: 1rem 0;
	}

	.aff-tier__earnings {
		font-size: 1rem;
		font-weight: 700;
		color: oklch(var(--su));
	}

	/* ===== STEPS ===== */
	.aff-steps {
		display: flex;
		justify-content: center;
		gap: 0;
		max-width: 48rem;
		margin: 0 auto;
	}

	.aff-step {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		flex: 1;
		padding: 0 0.5rem;
	}

	.aff-step__num {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 3rem;
		height: 3rem;
		border-radius: 50%;
		background: linear-gradient(135deg, oklch(var(--s)) 0%, oklch(var(--p)) 100%);
		color: oklch(var(--pc));
		font-family: var(--font-display);
		font-size: 1.25rem;
		font-weight: 800;
		position: relative;
		z-index: 1;
		box-shadow: 0 2px 8px oklch(var(--p) / 0.2);
	}

	.aff-step__connector {
		position: absolute;
		top: 1.5rem;
		left: calc(50% + 1.5rem);
		right: calc(-50% + 1.5rem);
		height: 2px;
		background: oklch(var(--bc) / 0.1);
		z-index: 0;
	}

	.aff-step__label {
		font-family: var(--font-display);
		font-size: 0.875rem;
		font-weight: 700;
		text-transform: uppercase;
		color: oklch(var(--bc));
		margin-top: 0.75rem;
	}

	.aff-step__desc {
		font-size: 0.75rem;
		color: oklch(var(--bc) / 0.5);
		margin-top: 0.25rem;
		line-height: 1.4;
	}

	@media (max-width: 639px) {
		.aff-steps {
			flex-direction: column;
			gap: 1.5rem;
		}

		.aff-step {
			flex-direction: row;
			text-align: left;
			gap: 1rem;
		}

		.aff-step__connector {
			display: none;
		}
	}

	/* ===== APPLICATION SECTION ===== */
	.aff-apply {
		padding: 4rem 0 3rem;
	}

	.aff-apply__card {
		max-width: 32rem;
		margin: 0 auto;
		text-align: center;
		background: oklch(var(--b1));
		border: 1.5px solid var(--input-border);
		border-radius: var(--radius-lg, 16px);
		padding: 3rem 2rem;
		box-shadow: var(--shadow-glow-sm);
	}

	.aff-apply__icon-wrap {
		width: 3.5rem;
		height: 3.5rem;
		margin: 0 auto 1.5rem;
		color: oklch(var(--su));
	}

	.aff-apply__icon-wrap svg {
		width: 100%;
		height: 100%;
	}

	.aff-apply__title {
		font-family: var(--font-display);
		font-size: 1.5rem;
		font-weight: 700;
		text-transform: uppercase;
		color: oklch(var(--bc));
		margin-bottom: 0.75rem;
	}

	.aff-apply__desc {
		font-size: 0.9375rem;
		color: oklch(var(--bc) / 0.55);
		line-height: 1.6;
		margin-bottom: 1.5rem;
	}

	.aff-apply__buttons {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}

	.aff-apply__secondary {
		font-size: 0.875rem;
		color: oklch(var(--bc) / 0.6);
		text-decoration: none;
		transition: color 200ms ease;
	}

	.aff-apply__secondary:hover {
		color: oklch(var(--p));
	}

	/* ===== FORM ===== */
	.aff-form-card {
		max-width: 36rem;
		margin: 0 auto;
		background: oklch(var(--b1));
		border: 1.5px solid var(--input-border);
		border-radius: var(--radius-lg, 16px);
		padding: 2.5rem 2rem;
		box-shadow: var(--shadow-glow-sm);
	}

	.aff-form__heading {
		font-family: var(--font-display);
		font-size: 1.125rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.02em;
		color: oklch(var(--bc));
		margin-bottom: 1.5rem;
	}

	.aff-form__fields {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.aff-form__actions {
		display: flex;
		justify-content: flex-end;
		margin-top: 1.75rem;
	}

	.aff-form__actions--split {
		justify-content: space-between;
	}

	.aff-form__agree {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		font-size: 0.8125rem;
		color: oklch(var(--bc) / 0.65);
		cursor: pointer;
		padding-top: 0.25rem;
	}

	.aff-form__progress {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0;
		margin-top: 2rem;
	}

	.aff-form__progress-dot {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 50%;
		background: oklch(var(--bc) / 0.15);
		transition: background 300ms ease;
	}

	.aff-form__progress-dot.active {
		background: oklch(var(--p));
	}

	.aff-form__progress-line {
		width: 2rem;
		height: 2px;
		background: oklch(var(--bc) / 0.1);
		transition: background 300ms ease;
	}

	.aff-form__progress-line.active {
		background: oklch(var(--p));
	}

	/* ===== TERMS NOTE ===== */
	.aff-terms-note {
		text-align: center;
		margin-top: 2rem;
		font-size: 0.75rem;
		color: oklch(var(--bc) / 0.4);
	}

	/* ===== TERMS MODAL ===== */
	.terms-modal-overlay {
		position: fixed;
		inset: 0;
		background: oklch(var(--bc) / 0.4);
		backdrop-filter: blur(2px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 50;
		padding: 1rem;
		animation: fadeIn 200ms ease;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.terms-modal-card {
		width: 100%;
		max-width: 36rem;
		max-height: 85vh;
		background: oklch(var(--b1));
		border: 1.5px solid var(--input-border);
		border-radius: var(--radius-lg, 16px);
		display: flex;
		flex-direction: column;
		box-shadow: 0 20px 60px oklch(var(--bc) / 0.15);
		animation: slideUp 200ms ease;
	}

	@keyframes slideUp {
		from {
			transform: translateY(20px);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	.terms-modal__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1.5rem;
		border-bottom: 1px solid var(--input-border);
		flex-shrink: 0;
	}

	.terms-modal__title {
		font-family: var(--font-display);
		font-size: 1.25rem;
		font-weight: 700;
		text-transform: uppercase;
		color: oklch(var(--bc));
		margin: 0;
	}

	.terms-modal__close {
		width: 2rem;
		height: 2rem;
		padding: 0;
		border: none;
		background: oklch(var(--b2));
		border-radius: 0.5rem;
		color: oklch(var(--bc) / 0.6);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: background 200ms ease, color 200ms ease;
	}

	.terms-modal__close:hover {
		background: oklch(var(--b3));
		color: oklch(var(--bc));
	}

	.terms-modal__close svg {
		width: 1.25rem;
		height: 1.25rem;
	}

	.terms-modal__content {
		flex: 1;
		overflow-y: auto;
		padding: 1.5rem;
		font-size: 0.875rem;
		color: oklch(var(--bc) / 0.65);
		line-height: 1.6;
	}

	.terms-section {
		margin-bottom: 1.5rem;
	}

	.terms-section:last-child {
		margin-bottom: 0.5rem;
	}

	.terms-heading {
		font-family: var(--font-display);
		font-size: 0.95rem;
		font-weight: 700;
		color: oklch(var(--bc));
		margin: 0 0 0.625rem;
		text-transform: uppercase;
		letter-spacing: 0.02em;
	}

	.terms-section p {
		margin: 0 0 0.75rem;
	}

	.terms-section p:last-child {
		margin-bottom: 0;
	}

	.terms-list {
		margin: 0.625rem 0 0.75rem;
		padding-left: 1.5rem;
	}

	.terms-list li {
		margin-bottom: 0.375rem;
	}

	.terms-list li:last-child {
		margin-bottom: 0;
	}

	.terms-modal__footer {
		padding: 1.25rem 1.5rem;
		border-top: 1px solid var(--input-border);
		flex-shrink: 0;
		background: oklch(var(--b2));
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		align-items: flex-end;
	}

	.terms-scroll-hint {
		font-size: 0.75rem;
		color: oklch(var(--bc) / 0.4);
		margin: 0;
		text-align: center;
		width: 100%;
	}

	.terms-link {
		background: none;
		border: none;
		color: oklch(var(--p));
		cursor: pointer;
		text-decoration: underline;
		font-size: inherit;
		font-family: inherit;
		padding: 0;
		transition: color 200ms ease;
	}

	.terms-link:hover {
		color: oklch(var(--p) / 0.8);
	}

	.terms-link:active {
		color: oklch(var(--p));
	}
</style>
