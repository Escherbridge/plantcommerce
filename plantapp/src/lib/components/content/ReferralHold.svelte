<script lang="ts">
	import { Container, Section } from '$lib/components/layout';

	const plantGeoHref = 'https://plantgeo.aevani.com';
</script>

<svelte:head>
	<meta
		name="description"
		content="The Aevani referral program is not open. Applications are not being accepted."
	/>
</svelte:head>

<Section>
	<Container>
		<div class="mx-auto max-w-4xl space-y-8">
			<header class="space-y-4">
				<p class="font-mono text-xs font-semibold tracking-widest text-secondary uppercase">
					Affiliate referrals
				</p>
				<h1 class="font-display text-4xl tracking-tight md:text-5xl">
					The referral program is not open.
				</h1>
				<p class="max-w-3xl text-lg text-base-content/70">
					Direct sellers are the core of Aevani, and they can apply now, at a flat 8%. A later path
					will let PlantGeo affiliates send shoppers to Aevani. Aevani would pay that referral from
					its own margin, only on completed retail sales, and never for recruiting. Affiliates would
					not be sub-affiliates on third-party retail links. Applications are not being accepted.
				</p>
			</header>
			<div class="flex flex-wrap items-center gap-6">
				<a href="/sell" class="font-display btn tracking-wider uppercase btn-primary"
					>Sell on Aevani</a
				>
				<a class="link font-semibold link-primary" href={plantGeoHref}>Plan a site on PlantGeo</a>
			</div>
		</div>
	</Container>
</Section>
