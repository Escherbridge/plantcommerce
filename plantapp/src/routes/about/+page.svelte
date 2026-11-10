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
				<h1 class="font-display text-4xl tracking-tight md:text-5xl">Evidence before claims.</h1>
				<div class="max-w-3xl space-y-4 text-lg text-base-content/70">
					<p>
						Aevani is a marketplace for growing tools and a free Learn hub, operated by
						Escherbridge, LLC in Boise, Idaho. We are onboarding the first growers and makers who
						will actually sell here. The catalogue you can browse today is a preview. Checkout is
						off. We do not publish product counts, harvest numbers, warranties, impact metrics,
						certifications, awards, or partner lists as facts, because we do not have them to stand
						behind.
					</p>
					<p>
						What is true today: applications to sell are open, at a flat 8% fee with card processing
						included and no other fees. The Learn hub is free to read without an account.
						<a href="https://plantgeo.aevani.com">PlantGeo, a related map for planning a site</a>
						does not sell the tools. A later referral program from that map is not open, and its share
						has not been set. Items picked for a plan are not for sale yet.
					</p>
				</div>
			</header>

			<section class="rounded-2xl border border-base-300 bg-base-200 p-6 md:p-8">
				<h2 class="font-display text-2xl tracking-tight">Evidence before claims</h2>
				<p class="mt-3 text-base-content/80">
					Aevani does not currently publish customer counts, product counts, impact metrics,
					certifications, awards, partner relationships, team biographies, or company-history
					milestones as verified facts.
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
