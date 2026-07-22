<script lang="ts">
	import { CommerceCatalogue } from '$lib/components/commerce';
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{data.context.isMock ? 'Test catalogue' : 'Catalogue'} | Aevani</title>
	{#if data.context.isMock}<meta name="robots" content="noindex,nofollow" />{/if}
</svelte:head>

<CommerceCatalogue {...data} />
