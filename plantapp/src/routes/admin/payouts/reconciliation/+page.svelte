<script lang="ts">
	import '$lib/components/platform/platform.css';

	let { data } = $props();
</script>

<div class="platform-content">
	<div class="platform-header">
		<h1 class="platform-header__title">Reconciliation</h1>
		<p class="platform-header__subtitle">
			Compares the earnings ledger with transfer rows stored here. This page does not call Stripe.
		</p>
	</div>
	<div class="platform-card">
		{#if data.ok}
			<p>No mismatches.</p>
		{:else}
			<ul>
				{#each data.mismatches as mismatch (mismatch)}
					<li>{mismatch}</li>
				{/each}
			</ul>
		{/if}
		<p><a href="/admin/payouts">Back to payouts</a></p>
	</div>
</div>
