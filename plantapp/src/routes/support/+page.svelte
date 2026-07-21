<script lang="ts">
	import { Container, Section } from '$lib/components/layout';
</script>

<svelte:head>
	<title>Support | Aevani</title>
	<meta
		name="description"
		content="Find clear information about Aevani support, product details, account access, and current service availability."
	/>
</svelte:head>

<Section>
	<Container>
		<div class="mx-auto max-w-4xl space-y-10">
			<header class="space-y-4">
				<p class="font-mono text-xs font-semibold uppercase tracking-widest text-secondary">Support</p>
				<h1 class="font-display text-4xl uppercase tracking-tight md:text-5xl">How we can help</h1>
				<p class="max-w-3xl text-lg text-base-content/70">
					Use this page to find the right information before you buy or manage an account. Some support
					workflows are still being built, so we label what is and is not available.
				</p>
			</header>

			<div class="grid gap-6 md:grid-cols-2">
				<section class="card border border-base-200 bg-base-100 shadow-sm">
					<div class="card-body">
						<h2 class="card-title font-display uppercase tracking-tight">Product questions</h2>
						<p class="text-base-content/70">
							Check the product listing for dimensions, included parts, compatibility, and any product-specific
							documentation before placing an order.
						</p>
						<a class="link link-primary" href="/size-guide">Review sizing and fit guidance</a>
					</div>
				</section>

				<section class="card border border-base-200 bg-base-100 shadow-sm">
					<div class="card-body">
						<h2 class="card-title font-display uppercase tracking-tight">Policies</h2>
						<p class="text-base-content/70">
							Shipping, returns, and warranty coverage can differ by product. Only product-specific terms and
							documentation should be treated as a commitment.
						</p>
						<div class="flex flex-wrap gap-x-4 gap-y-2">
							<a class="link link-primary" href="/shipping">Shipping</a>
							<a class="link link-primary" href="/returns">Returns</a>
							<a class="link link-primary" href="/warranty">Warranty status</a>
						</div>
					</div>
				</section>

				<section class="card border border-base-200 bg-base-100 shadow-sm">
					<div class="card-body">
						<h2 class="card-title font-display uppercase tracking-tight">Account access</h2>
						<p class="text-base-content/70">
							Use password recovery for a lost password. If recovery email is unavailable, the page will say so
								rather than claim that a message was sent.
						</p>
						<a class="link link-primary" href="/forgot-password">Reset your password</a>
					</div>
				</section>

				<section class="card border border-base-200 bg-base-100 shadow-sm">
					<div class="card-body">
						<h2 class="card-title font-display uppercase tracking-tight">Contact status</h2>
						<p class="text-base-content/70">
							Live chat, self-service order tracking, and automated return requests are not available in this
								version. Do not send passwords, payment details, or other sensitive information through a contact
								form.
						</p>
						<a class="link link-primary" href="/contact">View contact information</a>
					</div>
				</section>
			</div>

			<section class="rounded-2xl bg-base-200 p-6 md:p-8">
				<h2 class="font-display text-2xl uppercase tracking-tight">Before you contact us</h2>
				<ul class="mt-4 list-disc space-y-2 pl-5 text-base-content/70">
					<li>Keep your order number and the exact product name handy when they are available.</li>
					<li>Check the relevant product listing and policy page first.</li>
					<li>Never include a password, full payment number, or authentication code in a support request.</li>
				</ul>
			</section>
		</div>
	</Container>
</Section>
