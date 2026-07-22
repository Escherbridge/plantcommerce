<script lang="ts">
	import { Container, Section } from '$lib/components/layout';
</script>

<svelte:head>
	<title>Affiliate Program Status | Aevani</title>
	<meta name="robots" content="noindex, nofollow" />
	<meta
		name="description"
		content="Read the current availability and participation status of the Aevani affiliate program."
	/>
</svelte:head>

<Section>
	<Container>
		<div class="mx-auto max-w-4xl space-y-10">
			<header class="space-y-4">
				<p class="font-mono text-xs font-semibold tracking-widest text-secondary uppercase">
					Affiliate program
				</p>
				<h1 class="font-display text-4xl tracking-tight uppercase md:text-5xl">
					Affiliate program status
				</h1>
				<p class="max-w-3xl text-lg text-base-content/70">
					Aevani has not yet published a finalized affiliate agreement, commission schedule, payout
					policy, or fully automated affiliate workflow. This page is a status notice, not a legal
					agreement.
				</p>
			</header>

			<section class="rounded-2xl border border-warning/30 bg-warning/10 p-6 md:p-8">
				<h2 class="font-display text-2xl tracking-tight uppercase">Do not promote yet</h2>
				<p class="mt-3 text-base-content/80">
					Submitting an application, seeing a dashboard, or creating an account does not create a
					right to a commission or payout. Do not publish Aevani affiliate links or make program
					claims until you have an explicit active approval and finalized written terms.
				</p>
			</section>

			<section class="grid gap-6 md:grid-cols-2">
				<div class="card border border-base-200 bg-base-100 shadow-sm">
					<div class="card-body">
						<h2 class="font-display card-title tracking-tight uppercase">
							What is not available yet
						</h2>
						<ul class="list-disc space-y-2 pl-5 text-base-content/70">
							<li>A published commission schedule</li>
							<li>A payout timetable or payment workflow</li>
							<li>Finalized disclosure and promotional terms</li>
							<li>A legally binding program agreement</li>
						</ul>
					</div>
				</div>

				<div class="card border border-base-200 bg-base-100 shadow-sm">
					<div class="card-body">
						<h2 class="font-display card-title tracking-tight uppercase">
							Current participation boundary
						</h2>
						<p class="text-base-content/70">
							No operational affiliate tools are currently available. An application remains
							non-operational until Aevani publishes written terms and explicitly activates the
							program.
						</p>
						<a class="link link-primary" href="/affiliate/join"
							>Review affiliate application status</a
						>
					</div>
				</div>
			</section>

			<p class="text-sm text-base-content/60">
				For general website terms, see the <a class="link link-primary" href="/terms"
					>Terms of Service</a
				>.
			</p>
		</div>
	</Container>
</Section>
