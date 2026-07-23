<script lang="ts">
	import '$lib/components/platform/platform.css';
</script>

<svelte:head>
	<title>Affiliate Dashboard | Aevani</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="platform-content">
	<div class="platform-header">
		<h1 class="platform-header__title">Affiliate Dashboard</h1>
		<p class="platform-header__subtitle">
			Your affiliate account is active. Here's how your program works.
		</p>
	</div>

	<div class="platform-card">
		<div class="platform-card__header">
			<h2 class="platform-card__title">How you earn</h2>
		</div>
		<div class="platform-empty">
			<p class="platform-empty__text">
				You earn a tiered commission of up to 5% on the attributed sale subtotal — Sprout 2%, Grower
				3.5%, Steward 5% — and Aevani keeps a flat 2% platform fee. Attribution is last-click with a
				60-day cookie. Commission accrues when an order is paid, clears once it ships or is
				delivered, and reverses on refund. Cleared balances are paid monthly once you reach the $50
				minimum payout.
			</p>
			<a href="/affiliate/links" class="platform-action-btn">Create tracked links</a>
		</div>
	</div>
</div>
