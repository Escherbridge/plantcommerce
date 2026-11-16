<script lang="ts">
	import '$lib/components/platform/platform.css';
	import PayoutSetup from '$lib/components/payouts/PayoutSetup.svelte';

	let { form } = $props();
</script>

<svelte:head>
	<title>Seller payouts | Aevani</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="platform-content">
	<div class="platform-header">
		<h1 class="platform-header__title">Payouts</h1>
		<p class="platform-header__subtitle">Set up the account that can receive transfers.</p>
	</div>
	<PayoutSetup notice={form?.notice ?? null} />
</div>
