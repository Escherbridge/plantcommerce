<script lang="ts">
	import { Container, Section } from '$lib/components/layout';
</script>

<svelte:head>
	<title>Contact status | Aevani</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<Section>
	<Container>
		<div class="mx-auto max-w-3xl space-y-6 py-10">
			<p class="font-mono text-xs font-semibold tracking-widest text-secondary uppercase">
				Contact
			</p>
			<h1 class="font-display text-4xl tracking-tight uppercase md:text-5xl">
				Contact channels in review
			</h1>
			<p class="text-lg text-base-content/70">
				Aevani does not currently publish a verified support email, phone number, live-chat service,
				office address, business hours, response-time commitment, or message-delivery workflow.
			</p>
			<div class="rounded-2xl border border-warning/30 bg-warning/10 p-6 text-base-content/80">
				The previous form and contact details were template content and are not a service
				commitment. Contact details will be published after the operational workflow and privacy
				handling are verified.
			</div>
			<a href="/support" class="font-display btn tracking-wider uppercase btn-primary"
				>Review support status</a
			>
		</div>
	</Container>
</Section>
