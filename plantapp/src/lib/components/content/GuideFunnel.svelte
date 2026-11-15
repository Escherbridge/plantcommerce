<script lang="ts">
	let {
		eyebrow = 'From bench to setup',
		title = 'Put this guide to work',
		body = 'Compare equipment across categories, look up site climate in PlantGeo, or list seeds, starts, and tools you grow or build at a flat 8% commission with card processing included and zero listing, monthly, or ad fees.'
	}: {
		eyebrow?: string;
		title?: string;
		body?: string;
	} = $props();
</script>

<aside
	class="mt-12 rounded-2xl border border-base-300 bg-base-200/50 p-6 sm:p-7"
	aria-label="Aevani marketplace and planning links"
>
	<p class="font-mono text-xs font-semibold tracking-widest text-secondary uppercase">{eyebrow}</p>
	<h2 class="font-display mt-2 text-xl tracking-tight">{title}</h2>
	<p class="mt-2 max-w-2xl text-sm leading-relaxed text-base-content/75">{body}</p>
	<div class="mt-5 flex flex-wrap gap-3">
		<a class="btn btn-outline btn-sm" href="/products">Browse gear</a>
		<a class="btn btn-outline btn-sm" href="https://plantgeo.aevani.com" rel="noopener noreferrer"
			>Check PlantGeo</a
		>
		<a class="btn btn-sm btn-primary" href="/sell">Sell at 8% flat</a>
	</div>
</aside>
