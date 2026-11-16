<script lang="ts">
	import '$lib/components/platform/platform.css';
	import PayoutSetup from '$lib/components/payouts/PayoutSetup.svelte';

	let { form } = $props();
</script>

<svelte:head>
	<title>Affiliate Settings | Aevani</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="platform-content">
	<div class="platform-header">
		<h1 class="platform-header__title">Affiliate Settings</h1>
		<p class="platform-header__subtitle">Manage your affiliate account preferences.</p>
	</div>
	<div class="platform-card">
		<div class="platform-empty">
			<p class="platform-empty__text">
				The referral program is not open. Direct sellers can apply now. Other account questions can
				go to support.
			</p>
			<a href="/affiliate/earnings" class="platform-action-btn">View earnings</a>
		</div>
	</div>
	<PayoutSetup notice={form?.notice ?? null} />
</div>
