<script lang="ts">
	import { page } from '$app/stores';
	import { Container, Section } from '$lib/components/layout';
	import { trpc } from '$lib/trpc/client';
	import {
		affiliateApplicationErrors,
		affiliateApplicationPayload,
		affiliatePortalStatus,
		affiliatePromotionMethods,
		affiliateSignInHref,
		affiliateSignupHref,
		affiliateTrafficBands,
		emptyAffiliateApplication,
		type AffiliateApplicationDraft
	} from '$lib/affiliate/application';
	import { verificationEmailUnavailableCopy } from '$lib/copy/verificationEmail';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let draft = $state<AffiliateApplicationDraft>(emptyAffiliateApplication());
	let fieldErrors = $state<Record<string, string>>({});
	let formError = $state('');
	let isSubmitting = $state(false);

	const portalStatus = $derived(affiliatePortalStatus(data.affiliate));
	const signupHref = $derived(affiliateSignupHref($page.url.origin));
	const signInHref = $derived(affiliateSignInHref($page.url.origin));
	const resendHref = '/resend-verification?redirect=%2Faffiliate%2Fjoin';

	function describedBy(field: string, hintId?: string): string | undefined {
		const ids = [fieldErrors[field] ? `${field}-error` : undefined, hintId].filter(Boolean);
		return ids.length ? ids.join(' ') : undefined;
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		formError = '';
		const errors = affiliateApplicationErrors(draft);
		fieldErrors = errors;
		if (Object.keys(errors).length > 0) return;

		const payload = affiliateApplicationPayload(draft);
		if (!payload || !data.user) return;
		if (!data.user.emailVerified) return;

		isSubmitting = true;
		try {
			await trpc.affiliate.submitApplication.mutate(payload);
			window.location.href = '/affiliate/dashboard';
		} catch (error) {
			formError = error instanceof Error ? error.message : 'The application could not be saved.';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<Section>
	<Container>
		<div class="mx-auto max-w-2xl space-y-8">
			<header class="space-y-3">
				<p class="font-mono text-xs font-semibold tracking-widest text-secondary uppercase">
					Affiliate account
				</p>
				<h1 class="font-display text-4xl tracking-tight">Affiliate application</h1>
				<p class="text-base-content/70">
					An affiliate account lets you create tracked links for catalogue items after you sign in
					and verify your email.
				</p>
			</header>

			{#if !data.user}
				<div class="space-y-4">
					<p>Sign in with an existing account, or create one, then come back to this form.</p>
					<div class="flex flex-wrap gap-3">
						<a class="btn btn-primary" href={signInHref}>Sign in</a>
						<a class="btn btn-outline" href={signupHref}>Create an account</a>
					</div>
				</div>
			{:else if !data.user.emailVerified && data.verificationEmailAvailable === false}
				<div class="space-y-4 rounded-box border border-base-300 p-6" role="status">
					<h2 class="font-display text-2xl">Verify your email first</h2>
					<p>{verificationEmailUnavailableCopy}</p>
					<p>
						<a class="link link-primary" href={resendHref}>Resend verification email</a>
					</p>
					<p><a class="link link-primary" href="/contact">Contact us</a> if you need help.</p>
					<div class="flex flex-wrap gap-3">
						<a class="btn btn-primary" href="/products">Browse catalogue</a>
						<a class="btn btn-outline" href="/account/profile">Go to your account</a>
					</div>
				</div>
			{:else if !data.user.emailVerified}
				<div class="space-y-4 rounded-box border border-base-300 p-6" role="status">
					<h2 class="font-display text-2xl">Verify your email first</h2>
					<p>This account cannot join or open the affiliate pages until the email is verified.</p>
					<a class="btn btn-primary" href={resendHref}>Resend verification email</a>
				</div>
			{:else if portalStatus === 'active'}
				<div class="space-y-4 rounded-box border border-base-300 p-6">
					<h2 class="font-display text-2xl">Your affiliate account is active</h2>
					<p>Open the dashboard to review activity and create tracked links.</p>
					<a href="/affiliate/dashboard" class="btn btn-primary">Go to dashboard</a>
				</div>
			{:else if portalStatus === 'pending'}
				<div class="space-y-3 rounded-box border border-base-300 p-6" role="status">
					<h2 class="font-display text-2xl">Your application is waiting for review</h2>
					<p>The dashboard stays closed until this application is approved.</p>
				</div>
			{:else if portalStatus === 'rejected'}
				<div class="space-y-3 rounded-box border border-base-300 p-6" role="status">
					<h2 class="font-display text-2xl">This application was not approved</h2>
					<p>This login already has an affiliate record, so the form cannot be sent again.</p>
				</div>
			{:else if portalStatus === 'suspended'}
				<div class="space-y-3 rounded-box border border-base-300 p-6" role="status">
					<h2 class="font-display text-2xl">This affiliate account is suspended</h2>
					<p>Tracked links stay unavailable while the account is suspended.</p>
				</div>
			{:else}
				<form class="space-y-5" novalidate onsubmit={handleSubmit}>
					{#if formError || Object.keys(fieldErrors).length > 0}
						<div id="affiliate-form-error" class="alert alert-error" role="alert">
							{formError || 'Check the highlighted fields and try again.'}
						</div>
					{/if}

					<div class="form-control">
						<label class="label" for="website">
							<span class="label-text">Website (optional)</span>
						</label>
						<input
							id="website"
							name="website"
							class="input-bordered input w-full"
							bind:value={draft.website}
							maxlength="200"
							aria-invalid={fieldErrors.website ? 'true' : undefined}
							aria-describedby={describedBy('website')}
						/>
						{#if fieldErrors.website}
							<p id="website-error" class="mt-1 text-sm text-error">{fieldErrors.website}</p>
						{/if}
					</div>

					<div class="form-control">
						<label class="label" for="socialMedia">
							<span class="label-text">Social profile (optional)</span>
						</label>
						<input
							id="socialMedia"
							name="socialMedia"
							class="input-bordered input w-full"
							bind:value={draft.socialMedia}
							maxlength="200"
							aria-invalid={fieldErrors.socialMedia ? 'true' : undefined}
							aria-describedby={describedBy('socialMedia')}
						/>
						{#if fieldErrors.socialMedia}
							<p id="socialMedia-error" class="mt-1 text-sm text-error">
								{fieldErrors.socialMedia}
							</p>
						{/if}
					</div>

					<div class="form-control">
						<label class="label" for="audience">
							<span class="label-text">Who do you reach?</span>
						</label>
						<textarea
							id="audience"
							name="audience"
							class="textarea-bordered textarea w-full"
							rows="3"
							required
							bind:value={draft.audience}
							maxlength="2000"
							aria-invalid={fieldErrors.audience ? 'true' : undefined}
							aria-describedby={describedBy('audience')}
						></textarea>
						{#if fieldErrors.audience}
							<p id="audience-error" class="mt-1 text-sm text-error">{fieldErrors.audience}</p>
						{/if}
					</div>

					<div class="form-control">
						<label class="label" for="promotionMethod">
							<span class="label-text">How will you share links?</span>
						</label>
						<select
							id="promotionMethod"
							name="promotionMethod"
							class="select-bordered select w-full"
							required
							bind:value={draft.promotionMethod}
							aria-invalid={fieldErrors.promotionMethod ? 'true' : undefined}
							aria-describedby={describedBy('promotionMethod')}
						>
							<option value="">Choose one</option>
							{#each affiliatePromotionMethods as method (method.value)}
								<option value={method.value}>{method.label}</option>
							{/each}
						</select>
						{#if fieldErrors.promotionMethod}
							<p id="promotionMethod-error" class="mt-1 text-sm text-error">
								{fieldErrors.promotionMethod}
							</p>
						{/if}
					</div>

					<div class="form-control">
						<label class="label" for="monthlyTraffic">
							<span class="label-text">Audience size</span>
						</label>
						<select
							id="monthlyTraffic"
							name="monthlyTraffic"
							class="select-bordered select w-full"
							required
							bind:value={draft.monthlyTraffic}
							aria-invalid={fieldErrors.monthlyTraffic ? 'true' : undefined}
							aria-describedby={describedBy('monthlyTraffic')}
						>
							<option value="">Choose one</option>
							{#each affiliateTrafficBands as band (band.value)}
								<option value={band.value}>{band.label}</option>
							{/each}
						</select>
						{#if fieldErrors.monthlyTraffic}
							<p id="monthlyTraffic-error" class="mt-1 text-sm text-error">
								{fieldErrors.monthlyTraffic}
							</p>
						{/if}
					</div>

					<div class="form-control">
						<label class="label" for="whyJoin">
							<span class="label-text">How will you send shoppers to Aevani?</span>
						</label>
						<textarea
							id="whyJoin"
							name="whyJoin"
							class="textarea-bordered textarea w-full"
							rows="4"
							required
							bind:value={draft.whyJoin}
							maxlength="2000"
							aria-invalid={fieldErrors.whyJoin ? 'true' : undefined}
							aria-describedby={describedBy('whyJoin')}
						></textarea>
						{#if fieldErrors.whyJoin}
							<p id="whyJoin-error" class="mt-1 text-sm text-error">{fieldErrors.whyJoin}</p>
						{/if}
					</div>

					<div class="form-control">
						<label class="label cursor-pointer justify-start gap-3" for="agreeTerms">
							<input
								id="agreeTerms"
								name="agreeTerms"
								type="checkbox"
								class="checkbox"
								bind:checked={draft.agreeTerms}
								aria-invalid={fieldErrors.agreeTerms ? 'true' : undefined}
								aria-describedby={describedBy('agreeTerms')}
							/>
							<span>I will disclose the affiliate relationship when I share tracked links.</span>
						</label>
						{#if fieldErrors.agreeTerms}
							<p id="agreeTerms-error" class="mt-1 text-sm text-error">{fieldErrors.agreeTerms}</p>
						{/if}
					</div>

					<button
						class="btn btn-primary"
						type="submit"
						disabled={isSubmitting}
						aria-busy={isSubmitting}
					>
						{isSubmitting ? 'Submitting…' : 'Submit application'}
					</button>
				</form>
			{/if}
		</div>
	</Container>
</Section>
