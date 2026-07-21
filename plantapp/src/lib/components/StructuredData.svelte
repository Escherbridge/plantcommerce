<script lang="ts">
	const {
		type = 'website',
		data = {}
	} = $props<{
		type?: 'product' | 'website' | 'article' | 'breadcrumb' | 'organization';
		data?: Record<string, unknown>;
	}>();

	const jsonLd = $derived.by(() => {
		const base = {
			...data,
			'@context': 'https://schema.org',
			'@type': getSchemaType(type)
		};

		if (type === 'breadcrumb') {
			return {
				...base,
				'@type': 'BreadcrumbList',
				itemListElement: data.itemListElement || []
			};
		}

		return base;
	});

	function getSchemaType(t: string): string {
		const map: Record<string, string> = {
			product: 'Product',
			website: 'WebSite',
			article: 'Article',
			breadcrumb: 'BreadcrumbList',
			organization: 'Organization'
		};
		return map[t] || map.website;
	}

	function serializeJsonLd(value: unknown): string {
		try {
			return JSON.stringify(value)
				.replaceAll('<', '\\u003c')
				.replaceAll('>', '\\u003e')
				.replaceAll('&', '\\u0026')
				.replaceAll('\u2028', '\\u2028')
				.replaceAll('\u2029', '\\u2029');
		} catch {
			return '{}';
		}
	}

	const jsonString = $derived(serializeJsonLd(jsonLd));
</script>

<svelte:head>
	<script type="application/ld+json">{jsonString}</script>
</svelte:head>
