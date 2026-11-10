<script lang="ts">
	import { Container, Section } from '$lib/components/layout';
</script>

<svelte:head>
	<title>Returns | Aevani</title>
	<meta
		name="description"
		content="Aevani product pages state a 30-day returns promise and a no-fuss guarantee."
	/>
</svelte:head>

<Section>
	<Container>
		<div class="mx-auto max-w-4xl space-y-10">
			<header class="space-y-4">
				<p class="font-mono text-xs font-semibold tracking-widest text-secondary uppercase">
					Returns
				</p>
				<h1 class="font-display text-4xl tracking-tight uppercase md:text-5xl">Returns</h1>
				<p class="max-w-3xl text-lg text-base-content/70">
					Product pages state the return promise below. Warranty lines on some listings repeat it.
				</p>
			</header>

			<section class="rounded-2xl border border-base-200 bg-base-100 p-6 shadow-sm md:p-8">
				<h2 class="font-display text-2xl tracking-tight uppercase">On the product page</h2>
				<p class="mt-3 text-base-content/80">30-day returns. No-fuss guarantee.</p>
			</section>

			<section class="space-y-3">
				<h2 class="font-display text-2xl tracking-tight uppercase">Also on some listings</h2>
				<ul class="list-disc space-y-2 pl-5 text-base-content/70">
					<li>lifetime warranty · 30-day returns</li>
					<li>1-yr warranty · 30-day returns</li>
				</ul>
			</section>

			<p class="text-base-content/70">
				Return eligibility and warranty coverage are separate. See the
				<a class="link link-primary" href="/warranty">warranty page</a>.
			</p>

			<p class="text-base-content/70">
				Questions about returns? <a class="link link-primary" href="/contact">Contact us</a>.
			</p>
		</div>
	</Container>
</Section>
