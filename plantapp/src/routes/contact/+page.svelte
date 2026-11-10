<script lang="ts">
	import { Container, Section } from '$lib/components/layout';
	import { publicOperator } from '$lib/config/site';
</script>

<svelte:head>
	<title>Contact Aevani</title>
	<meta
		name="description"
		content="Aevani is operated by Escherbridge, LLC. Write or call about selling, a guide, or a question the site does not answer."
	/>
</svelte:head>

<Section>
	<Container>
		<div class="mx-auto max-w-4xl space-y-10">
			<header class="space-y-4">
				<p class="font-mono text-xs font-semibold tracking-widest text-secondary uppercase">
					Contact
				</p>
				<h1 class="font-display text-4xl tracking-tight md:text-5xl">Contact Aevani.</h1>
				<p class="max-w-3xl text-lg text-base-content/70">
					Aevani is operated by {publicOperator.legalName}. Write or call if you want to sell, if a
					guide is wrong, or if you have a question the site does not answer. There are no orders to
					look up, because nothing is for sale yet.
				</p>
			</header>

			<section class="rounded-2xl border border-base-200 bg-base-100 p-6 shadow-sm md:p-8">
				<h2 class="font-display text-2xl tracking-tight">Aevani contact</h2>
				<ul class="mt-4 space-y-2 text-base-content/80">
					<li>
						<strong>Email:</strong>
						<a class="link link-primary" href="mailto:{publicOperator.email}"
							>{publicOperator.email}</a
						>
					</li>
					<li>
						<strong>Phone:</strong>
						<a class="link link-primary" href={publicOperator.phoneHref}>{publicOperator.phone}</a>
					</li>
					<li><strong>Mail:</strong> {publicOperator.address}</li>
				</ul>
			</section>

			<section class="rounded-2xl border border-base-200 bg-base-100 p-6 shadow-sm md:p-8">
				<h2 class="font-display text-2xl tracking-tight">Shipping, returns, and warranties</h2>
				<p class="mt-3 text-base-content/80">
					Shipping, returns, and warranties will be written by the seller and shown on a real
					listing. They are not offered site-wide today. Terms are set per seller and confirmed at
					checkout.
				</p>
				<p class="mt-3 text-base-content/70">
					<a class="link link-primary" href="/shipping">Shipping</a>,
					<a class="link link-primary" href="/returns">returns</a>, and
					<a class="link link-primary" href="/warranty">warranty</a>.
				</p>
			</section>

			<section class="rounded-2xl bg-base-200 p-6 md:p-8">
				<h2 class="font-display text-2xl tracking-tight">Also on the site</h2>
				<ul class="mt-4 list-disc space-y-2 pl-5 text-base-content/70">
					<li><a class="link link-primary" href="/faq">Frequently asked questions</a></li>
					<li><a class="link link-primary" href="/sell">Sell on Aevani</a></li>
					<li>
						<a class="link link-primary" href="/accessibility">Accessibility feedback</a>
					</li>
					<li>
						<a class="link link-primary" href="/forgot-password">Reset your password</a>
					</li>
				</ul>
			</section>
		</div>
	</Container>
</Section>
