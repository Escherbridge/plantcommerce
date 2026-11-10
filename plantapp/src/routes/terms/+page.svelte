<script lang="ts">
	import { Container, Section } from '$lib/components/layout';
</script>

<svelte:head>
	<title>Terms of Service | Aevani</title>
	<meta
		name="description"
		content="Terms for using Aevani, including orders, stated shipping and return promises, and accounts."
	/>
</svelte:head>

<Section>
	<Container>
		<div class="mx-auto max-w-4xl space-y-10">
			<header class="space-y-4">
				<p class="font-mono text-xs font-semibold tracking-widest text-secondary uppercase">
					Terms
				</p>
				<h1 class="font-display text-4xl tracking-tight uppercase md:text-5xl">Terms of Service</h1>
				<p class="max-w-3xl text-lg text-base-content/70">
					By creating an account, you agree to our Terms of Service and
					<a class="link link-primary" href="/privacy">Privacy Policy</a>.
				</p>
			</header>

			<section class="space-y-3">
				<h2 class="font-display text-2xl tracking-tight uppercase">Orders</h2>
				<p class="text-base-content/70">
					Catalogue listings, prices, and availability come from the active commerce provider.
					Checkout is offered only when secure payment is enabled, and an order is not accepted
					until its confirmation is displayed.
				</p>
			</section>

			<section class="space-y-3">
				<h2 class="font-display text-2xl tracking-tight uppercase">
					Shipping, returns, and warranty
				</h2>
				<p class="text-base-content/70">
					Shipping, returns, warranty, and affiliate terms apply only when they are explicitly
					stated for the relevant offer. Product pages state free shipping on qualifying orders, and
					30-day returns with a no-fuss guarantee. Read the
					<a class="link link-primary" href="/shipping">shipping</a>,
					<a class="link link-primary" href="/returns">returns</a>, and
					<a class="link link-primary" href="/warranty">warranty</a> pages for the wording listings use.
				</p>
			</section>

			<section class="space-y-3">
				<h2 class="font-display text-2xl tracking-tight uppercase">Accounts</h2>
				<p class="text-base-content/70">
					An account, application, saved item, cart, or dashboard state does not create a
					commercial, affiliate, or payout right.
				</p>
			</section>

			<section class="space-y-3">
				<h2 class="font-display text-2xl tracking-tight uppercase">Affiliate program</h2>
				<p class="text-base-content/70">
					Affiliate participation is covered by the
					<a class="link link-primary" href="/affiliate/terms">affiliate program terms</a>.
				</p>
			</section>

			<p class="text-base-content/70">
				Questions about these terms? <a class="link link-primary" href="/contact">Contact us</a>.
			</p>
		</div>
	</Container>
</Section>
