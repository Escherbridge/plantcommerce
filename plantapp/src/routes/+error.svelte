<script lang="ts">
	import { page } from '$app/stores';

	const missing = $derived($page.status === 404);
</script>

<svelte:head>
	<title>{missing ? 'Page not found — Aevani' : 'Page error — Aevani'}</title>
	<meta
		name="description"
		content={missing ? 'That page is not on Aevani.' : 'This page did not load.'}
	/>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<section class="mx-auto w-full max-w-3xl px-4 py-24">
	<p class="font-mono text-xs font-bold tracking-[0.18em] uppercase">{$page.status}</p>
	<h1 class="font-display mt-3 text-4xl font-bold tracking-tight">
		{missing ? 'Page not found' : 'This page did not load'}
	</h1>
	<p class="mt-4 text-lg text-base-content/80">
		{missing ? 'That address is not on Aevani.' : 'Try again from the homepage.'}
	</p>
	<p class="mt-8">
		<a class="link link-primary" href="/">Home</a>
	</p>
</section>
