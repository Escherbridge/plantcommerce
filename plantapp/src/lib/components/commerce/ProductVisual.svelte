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
	<img
		class="h-full w-full object-cover"
		src={product.images[0].url}
		alt={product.images[0].altText}
	/>
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
