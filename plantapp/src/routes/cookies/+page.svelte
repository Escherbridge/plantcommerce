<script lang="ts">
	import { Container, Section } from '$lib/components/layout';
</script>

<svelte:head>
	<title>Cookies | Aevani</title>
	<meta
		name="description"
		content="Aevani uses browser storage and cookies for authenticated sessions and security features."
	/>
</svelte:head>

<Section>
	<Container>
		<div class="mx-auto max-w-4xl space-y-10">
			<header class="space-y-4">
				<p class="font-mono text-xs font-semibold tracking-widest text-secondary uppercase">
					Cookies
				</p>
				<h1 class="font-display text-4xl tracking-tight uppercase md:text-5xl">Cookies</h1>
			</header>

			<section class="space-y-3">
				<h2 class="font-display text-2xl tracking-tight uppercase">Sessions and security</h2>
				<p class="text-base-content/70">
					Browser storage and cookies may be required for authenticated sessions and security
					features.
				</p>
			</section>

			<p class="text-base-content/70">
				See the <a class="link link-primary" href="/privacy">privacy notice</a> for the related account
				and security statement.
			</p>

			<p class="text-base-content/70">
				Questions about cookies? <a class="link link-primary" href="/contact">Contact us</a>.
			</p>
		</div>
	</Container>
</Section>
