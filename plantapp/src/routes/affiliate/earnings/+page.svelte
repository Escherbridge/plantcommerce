<script lang="ts">
	import '$lib/components/platform/platform.css';

	let { data } = $props();
</script>

<svelte:head>
	<title>Payouts | Aevani</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="platform-content">
	<div class="platform-header">
		<h1 class="platform-header__title">Payouts</h1>
	</div>
	<div class="platform-card">
		{#if data.lines.length === 0}
			<p class="platform-empty__text">No earnings are recorded.</p>
		{:else}
			<ul>
				{#each data.lines as line (line.label)}
					<li>{line.label}: {line.amount}</li>
				{/each}
			</ul>
		{/if}
		<p class="platform-empty__text">
			This page does not quote a commission. Payout setup is separate.
		</p>
		<p><a href="/affiliate/settings">Open payout setup</a></p>
	</div>
</div>
