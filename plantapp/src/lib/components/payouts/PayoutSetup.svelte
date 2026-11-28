<script lang="ts">
	let { notice = null }: { notice?: string | null } = $props();
</script>

<div class="platform-card">
	<p class="platform-empty__text">
		Payout setup sends you to Stripe to enter bank and tax details. Aevani does not store those
		details.
	</p>
	<form method="POST" action="?/setup">
		<button class="platform-action-btn" type="submit">Set up payouts</button>
	</form>
	<form method="POST" action="?/dashboard">
		<button class="platform-action-btn" type="submit">Open payout dashboard</button>
	</form>
	{#if notice}
		<p class="platform-empty__text">{notice}</p>
	{/if}
</div>
