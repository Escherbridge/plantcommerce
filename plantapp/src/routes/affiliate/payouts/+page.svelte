<script lang="ts">
	import '$lib/components/platform/platform.css';
</script>

<div class="platform-content">
	<div class="platform-header">
		<h1 class="platform-header__title">Payout History</h1>
		<p class="platform-header__subtitle">
			View your payout history and upcoming payment schedule.
		</p>
	</div>

	<div class="platform-empty">
		<p class="platform-empty__title">No payouts yet</p>
		<p class="platform-empty__text">
			Earn commissions to see your payout history here.
		</p>
	</div>

	<div class="platform-card">
		<div class="platform-card__header">
			<h2 class="platform-card__title">Payout Schedule</h2>
		</div>
		<div class="schedule-info">
			<p>Payouts are processed on the 15th of each month for commissions earned in the prior month. A minimum balance of $50 is required. Payments are sent via your configured payment method and typically arrive within 3-5 business days.</p>
		</div>
	</div>
</div>

<style>
	.schedule-info {
		font-size: 0.875rem;
		color: oklch(var(--bc) / 0.7);
		line-height: 1.6;
	}
</style>
