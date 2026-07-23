<script lang="ts">
	import type { CommerceProduct } from '$lib/commerce/contracts';
	import { Icon, type IconName } from '$lib/components/icons';

	const {
		product,
		isMock,
		compact = false
	}: { product: CommerceProduct; isMock: boolean; compact?: boolean } = $props();

	function categoryIcon(slug: string): IconName {
		if (slug === 'aquaponics') return 'maintenance';
		if (slug === 'silvopasture-agroforestry') return 'calendar';
		if (slug === 'growing-guides') return 'book-open';
		if (slug === 'sustainable-agriculture-education') return 'graduation-cap';
		return 'sprout';
	}
</script>

{#if product.images[0]}
	<div class="relative h-full w-full">
		<img
			class="h-full w-full object-cover"
			src={product.images[0].url}
			alt={product.images[0].altText || `${product.name} catalogue image`}
		/>
		{#if product.images[0].isMock || product.catalogDataClass === 'mock_test'}
			<span
				class="absolute bottom-3 left-3 rounded-sm bg-base-100/95 px-2 py-1 font-mono text-[0.65rem] font-bold tracking-wide text-base-content uppercase shadow-sm"
			>
				Illustrative mock image
			</span>
		{/if}
	</div>
{:else}
	<div
		class="flex h-full w-full flex-col items-center justify-center gap-3 bg-base-200 p-5 text-center text-base-content/75"
	>
		<Icon name={categoryIcon(product.category.slug)} size={compact ? 32 : 48} />
		<span class="font-mono text-xs font-bold tracking-wider uppercase">
			{isMock ? 'Mock/test listing · No product image' : 'Product image unavailable'}
		</span>
	</div>
{/if}
