<script lang="ts">
	import { Container, Section } from '$lib/components/layout';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();

	const values = $derived(form && 'values' in form ? form.values : undefined);
	const fieldErrors = $derived(
		(form && 'fieldErrors' in form && form.fieldErrors ? form.fieldErrors : {}) as Record<
			string,
			string
		>
	);
	const errorMessage = $derived(form && 'error' in form ? form.error : undefined);
	const succeeded = $derived(form && 'success' in form && form.success === true);
</script>

<Section>
	<Container>
		<div class="mx-auto max-w-3xl space-y-8 py-10">
			<header class="space-y-4">
				<p class="font-mono text-xs font-semibold tracking-widest text-secondary uppercase">
					Sell on Aevani
				</p>
				<h1 class="font-display text-4xl tracking-tight md:text-5xl">A flat 8%. That's the fee.</h1>
				<p class="max-w-2xl text-lg text-base-content/80">
					Sell seeds, hand tools, and growing systems without paying listing fees, monthly
					subscriptions, or ad surcharges. Aevani charges one flat 8% commission when an order
					sells, and card processing is included in that 8%.
				</p>
				<p class="max-w-2xl text-lg text-base-content/70">
					Whether you run a regional seed house, weld Dutch-bucket frames, build aquaponic filters,
					or stock orchard and raised-bed hardware, tell us what you grow or make below. We follow
					up directly by email.
				</p>
				<div class="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-4">
					<div class="rounded-xl border border-base-300 bg-base-200/50 p-3">
						<p class="font-display text-xl font-bold">8% flat</p>
						<p class="text-xs text-base-content/70">Commission per sale</p>
					</div>
					<div class="rounded-xl border border-base-300 bg-base-200/50 p-3">
						<p class="font-display text-xl font-bold">Included</p>
						<p class="text-xs text-base-content/70">Card processing</p>
					</div>
					<div class="rounded-xl border border-base-300 bg-base-200/50 p-3">
						<p class="font-display text-xl font-bold">$0</p>
						<p class="text-xs text-base-content/70">Listing & monthly fees</p>
					</div>
					<div class="rounded-xl border border-base-300 bg-base-200/50 p-3">
						<p class="font-display text-xl font-bold">$0</p>
						<p class="text-xs text-base-content/70">Mandatory ad fees</p>
					</div>
				</div>
				<p class="max-w-2xl text-sm text-base-content/70">
					Curious how buyers sketch layouts first? Explore
					<a class="link link-primary" href="https://plantgeo.aevani.com">PlantGeo site planning</a>
					or browse <a class="link link-primary" href="/guides">our growing guides</a>.
				</p>
			</header>

			{#if succeeded}
				<div class="rounded-2xl border border-success/30 bg-success/10 p-6" role="status">
					<h2 class="font-display text-2xl tracking-tight">Application received</h2>
					<p class="mt-3 text-base-content/80">
						Thanks. We saved your application and will reply to the email you entered. If we list
						you, nothing is charged unless you sell something, and then the fee is a flat 8%. Card
						processing is included. There are no other fees.
					</p>
				</div>
			{:else}
				{#if errorMessage}
					<p
						class="rounded-2xl border border-error/30 bg-error/10 p-4 text-base-content/80"
						role="alert"
					>
						{errorMessage}
					</p>
				{/if}

				<p class="max-w-2xl text-lg text-base-content/80">
					You don't need an Aevani account to apply. We read each application and reply by email.
				</p>

				<form method="POST" class="space-y-5" novalidate>
					<div class="company-fax" aria-hidden="true">
						<label for="company_fax">Fax</label>
						<input
							id="company_fax"
							name="company_fax"
							type="text"
							tabindex="-1"
							autocomplete="off"
						/>
					</div>

					<div class="space-y-2">
						<h2 class="font-display text-2xl tracking-tight">Application</h2>
						<p class="text-base-content/80">All fields are required except Website or social.</p>
					</div>

					<div class="space-y-2">
						<label class="font-medium" for="name">Name</label>
						<input
							id="name"
							name="name"
							class="input-bordered input w-full"
							type="text"
							required
							maxlength="120"
							autocomplete="name"
							value={values?.name ?? ''}
							aria-invalid={fieldErrors.name ? 'true' : undefined}
							aria-describedby={fieldErrors.name ? 'name-error' : undefined}
						/>
						{#if fieldErrors.name}
							<p id="name-error" class="text-sm text-error">{fieldErrors.name}</p>
						{/if}
					</div>

					<div class="space-y-2">
						<label class="font-medium" for="email">Email</label>
						<input
							id="email"
							name="email"
							class="input-bordered input w-full"
							type="email"
							required
							maxlength="320"
							autocomplete="email"
							value={values?.email ?? ''}
							aria-invalid={fieldErrors.email ? 'true' : undefined}
							aria-describedby={fieldErrors.email ? 'email-error' : undefined}
						/>
						{#if fieldErrors.email}
							<p id="email-error" class="text-sm text-error">{fieldErrors.email}</p>
						{/if}
					</div>

					<div class="space-y-2">
						<label class="font-medium" for="businessName">Business or farm name</label>
						<input
							id="businessName"
							name="businessName"
							class="input-bordered input w-full"
							type="text"
							required
							maxlength="160"
							autocomplete="organization"
							value={values?.businessName ?? ''}
							aria-invalid={fieldErrors.businessName ? 'true' : undefined}
							aria-describedby={fieldErrors.businessName ? 'business-error' : undefined}
						/>
						{#if fieldErrors.businessName}
							<p id="business-error" class="text-sm text-error">{fieldErrors.businessName}</p>
						{/if}
					</div>

					<div class="space-y-2">
						<label class="font-medium" for="websiteOrSocial">Website or social</label>
						<input
							id="websiteOrSocial"
							name="websiteOrSocial"
							class="input-bordered input w-full"
							type="text"
							maxlength="300"
							value={values?.websiteOrSocial ?? ''}
							aria-invalid={fieldErrors.websiteOrSocial ? 'true' : undefined}
							aria-describedby={fieldErrors.websiteOrSocial ? 'website-error' : undefined}
						/>
						{#if fieldErrors.websiteOrSocial}
							<p id="website-error" class="text-sm text-error">{fieldErrors.websiteOrSocial}</p>
						{/if}
					</div>

					<div class="space-y-2">
						<label class="font-medium" for="offerings">What you grow or make</label>
						<textarea
							id="offerings"
							name="offerings"
							class="textarea-bordered textarea w-full"
							required
							maxlength="2000"
							rows="4">{values?.offerings ?? ''}</textarea
						>
						{#if fieldErrors.offerings}
							<p class="text-sm text-error">{fieldErrors.offerings}</p>
						{/if}
					</div>

					<div class="space-y-2">
						<label class="font-medium" for="location">Location</label>
						<input
							id="location"
							name="location"
							class="input-bordered input w-full"
							type="text"
							required
							maxlength="160"
							autocomplete="address-level2"
							value={values?.location ?? ''}
							aria-invalid={fieldErrors.location ? 'true' : undefined}
							aria-describedby={fieldErrors.location ? 'location-error' : undefined}
						/>
						{#if fieldErrors.location}
							<p id="location-error" class="text-sm text-error">{fieldErrors.location}</p>
						{/if}
					</div>

					<div class="space-y-2">
						<label class="font-medium" for="message">Message</label>
						<textarea
							id="message"
							name="message"
							class="textarea-bordered textarea w-full"
							required
							maxlength="4000"
							rows="5">{values?.message ?? ''}</textarea
						>
						{#if fieldErrors.message}
							<p class="text-sm text-error">{fieldErrors.message}</p>
						{/if}
					</div>

					<div class="space-y-2 rounded-2xl border border-base-300 p-5">
						<h2 class="font-display text-xl tracking-tight uppercase">Seller fees</h2>
						<p class="text-base-content/80">
							Aevani charges a flat 8% commission on each sale. Card processing is included, and
							Aevani absorbs it. There are no listing fees, monthly fees, or ad fees.
						</p>
					</div>

					<button class="font-display btn tracking-wider uppercase btn-primary" type="submit">
						Submit application
					</button>
				</form>
			{/if}
		</div>
	</Container>
</Section>

<style>
	.company-fax {
		position: absolute;
		left: -10000px;
		height: 0;
		overflow: hidden;
	}
</style>
