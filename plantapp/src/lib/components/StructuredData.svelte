<script lang="ts">
	// Define props using $props() for Svelte 5 runes
	const {
		type = 'website',
		data = {}
	} = $props<{
		type?: 'product' | 'website' | 'article' | 'breadcrumb' | 'organization';
		data?: any;
	}>();

	// Generate the JSON-LD object
	const jsonLd = $derived(() => {
		const base = {
			'@context': 'https://schema.org',
			'@type': getSchemaType(type),
			...data
		};

		// Special handling for breadcrumbs
		if (type === 'breadcrumb') {
			return {
				...base,
				'@type': 'BreadcrumbList',
				itemListElement: data.itemListElement || []
			};
		}

		return base;
	});

	// Helper function to get proper schema type
	function getSchemaType(t: string): string {
		const map: Record<string, string> = {
			product: 'Product',
			website: 'WebSite',
			article: 'Article',
			breadcrumb: 'BreadcrumbList',
			organization: 'Organization'
		};
		return map[t] || t.charAt(0).toUpperCase() + t.slice(1);
	}

	// Create the JSON string for the script tag
	const jsonString = $derived(JSON.stringify(jsonLd, null, 2));
</script>

<!-- Use {@html} to render the script tag -->
{@html `<script type="application/ld+json">${jsonString}</script>`}
