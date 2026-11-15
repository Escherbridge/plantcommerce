<script lang="ts">
	import { Container, Section } from '$lib/components/layout';
</script>

<Section>
	<Container>
		<div class="mx-auto max-w-4xl space-y-10 py-10">
			<header class="space-y-4">
				<p class="font-mono text-xs font-semibold tracking-widest text-secondary uppercase">
					About
				</p>
				<h1 class="font-display text-4xl tracking-tight md:text-5xl">
					Practical guides for growers, plain-math terms for sellers.
				</h1>
				<div class="max-w-3xl space-y-4 text-lg text-base-content/70">
					<p>
						Aevani is a growing-tools marketplace and free grower library, operated by Escherbridge,
						LLC in Boise, Idaho. We publish practical field guides for hydroponics, raised beds,
						high tunnels, aquaponics, and agroforestry while welcoming independent seed houses,
						nurseries, and equipment makers to open storefronts here.
					</p>
					<p>
						What is live right now: seller applications are open at a flat 8% commission with card
						processing included and zero listing, monthly, or ad fees. The
						<a class="link link-primary" href="/learn">Learn hub</a> and
						<a class="link link-primary" href="/guides">growing guides</a> are free to read without
						an account, and
						<a class="link link-primary" href="https://plantgeo.aevani.com">PlantGeo</a> lets you map
						sun, water, and layout across a site before buying gear.
					</p>
				</div>
			</header>

			<section class="rounded-2xl border border-base-300 bg-base-200 p-6 md:p-8">
				<h2 class="font-display text-2xl tracking-tight">How we keep claims honest</h2>
				<p class="mt-3 text-base-content/80">
					Our growing guides rely on verifiable extension research, USDA, NOAA, and FAO data with
					real source links at the bottom of every page—no made-up harvest counts or inflated yield
					promises. When independent sellers go live on a listing, their own shipping, return, and
					warranty policies sit right on the product page.
				</p>
			</section>

			<div class="flex flex-wrap gap-3">
				<a href="/sell" class="font-display btn tracking-wider uppercase btn-primary"
					>Sell on Aevani</a
				>
				<a href="/learn" class="font-display btn tracking-wider uppercase btn-outline"
					>Open the Learn hub</a
				>
				<a href="/contact" class="font-display btn tracking-wider uppercase btn-outline">Contact</a>
			</div>
		</div>
	</Container>
</Section>
