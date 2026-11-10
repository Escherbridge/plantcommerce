<script lang="ts">
	import { Container, Section } from '$lib/components/layout';
	import GuideCopy from '$lib/components/content/GuideCopy.svelte';
	import StructuredData from '$lib/components/StructuredData.svelte';
	import { guidesBreadcrumbData, guidesCollectionData, guidesIndex } from '$lib/content/research';
</script>

<Section>
	<Container>
		<article class="max-w-3xl">
			<GuideCopy blocks={guidesIndex.blocks} />
		</article>
	</Container>
</Section>

<StructuredData type="collection" data={guidesCollectionData()} />
<StructuredData type="breadcrumb" data={guidesBreadcrumbData()} />
