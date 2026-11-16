<script lang="ts">
	import '$lib/components/platform/platform.css';

	let { form } = $props();
</script>

<div class="platform-content">
	<div class="platform-header">
		<h1 class="platform-header__title">Payouts</h1>
		<p class="platform-header__subtitle">Manual hold check. Nothing is transferred from this page.</p>
	</div>
	<div class="platform-card">
		<form method="POST">
			<button class="platform-action-btn" type="submit">Run hold check</button>
		</form>
		{#if form?.summary}
			<p>{form.summary}</p>
		{/if}
	</div>
</div>
