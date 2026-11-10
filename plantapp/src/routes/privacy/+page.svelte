<script lang="ts">
	import { Container, Section } from '$lib/components/layout';
	import { publicOperator } from '$lib/config/site';
</script>

<svelte:head>
	<title>Privacy | Aevani</title>
	<meta
		name="description"
		content="How Aevani handles information submitted for account and security features, and session storage."
	/>
</svelte:head>

<Section>
	<Container>
		<div class="mx-auto max-w-4xl space-y-10">
			<header class="space-y-4">
				<p class="font-mono text-xs font-semibold tracking-widest text-secondary uppercase">
					Privacy
				</p>
				<h1 class="font-display text-4xl tracking-tight uppercase md:text-5xl">Privacy</h1>
			</header>

			<section class="space-y-3">
				<h2 class="font-display text-2xl tracking-tight uppercase">Operator and requests</h2>
				<p class="text-base-content/70">
					The Aevani site is operated by {publicOperator.legalName}. Privacy questions and requests
					can be sent to
					<a class="link link-primary" href="mailto:{publicOperator.email}"
						>{publicOperator.email}</a
					>
					or mailed to {publicOperator.address}.
				</p>
			</section>

			<section class="space-y-3">
				<h2 class="font-display text-2xl tracking-tight uppercase">Account and security</h2>
				<p class="text-base-content/70">
					Account and security features necessarily process information submitted to use those
					features.
				</p>
			</section>

			<section class="space-y-3">
				<h2 class="font-display text-2xl tracking-tight uppercase">Sessions</h2>
				<p class="text-base-content/70">
					Browser storage and cookies may be required for authenticated sessions and security
					features. See the <a class="link link-primary" href="/cookies">cookie notice</a>.
				</p>
			</section>

			<p class="text-base-content/70">
				Questions about privacy? <a class="link link-primary" href="/contact">Contact us</a>.
			</p>
		</div>
	</Container>
</Section>
