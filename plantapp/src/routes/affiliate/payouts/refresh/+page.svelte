<script lang="ts">
	let { form } = $props();
</script>

<svelte:head>
	<title>Payout setup | Aevani</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<main>
	<h1>Payout setup</h1>
	<p>Your setup link expired. Continue to get a new one.</p>
	<form method="POST" action="?/setup">
		<button type="submit">Continue payout setup</button>
	</form>
	{#if form?.notice}
		<p>{form.notice}</p>
	{/if}
</main>
