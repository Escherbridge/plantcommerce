<script lang="ts">
	import '$lib/components/platform/platform.css';

	let { data } = $props();
</script>

<svelte:head>
	<title>Seller earnings | Aevani</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="platform-content">
	<div class="platform-header">
		<h1 class="platform-header__title">Earnings</h1>
	</div>
	<div class="platform-card">
		<ul>
			{#each data.lines as line (line.label)}
				<li>{line.label}: {line.amount}</li>
			{/each}
		</ul>
		<p class="platform-empty__text">This page lists recorded amounts only.</p>
		<p><a href="/seller/payouts">Open payout setup</a></p>
	</div>
</div>
