<script lang="ts">
	import { Container, Section } from '$lib/components/layout';
	import { Accordion } from '$lib/components/ui';
	import type { PageData } from './$types';

	export let data: PageData;

	const categories = [
		{ name: 'General', slug: 'general' },
		{ name: 'Technical Support', slug: 'technical' },
		{ name: 'Shipping & Returns', slug: 'shipping' },
		{ name: 'Product Information', slug: 'products' },
		{ name: 'System Troubleshooting', slug: 'troubleshooting' }
	];
</script>

<Section>
	<Container>
		<div class="mb-8">
			<h1 class="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
			<p class="text-lg text-base-content/70">
				Find answers to common questions about our products, services, and sustainable agriculture
				practices.
			</p>
		</div>

		<!-- Category Tabs -->
		<div role="tablist" class="tabs tabs-boxed mb-8">
			<a
				href="/faq"
				role="tab"
				class="tab {!data.selectedCategory ? 'tab-active' : ''}"
			>
				All Questions
			</a>
			{#each categories as category}
				<a
					href="/faq?category={category.slug}"
					role="tab"
					class="tab {data.selectedCategory === category.slug ? 'tab-active' : ''}"
				>
					{category.name}
				</a>
			{/each}
		</div>

		<!-- FAQ Accordion -->
		{#if data.faqs && data.faqs.length > 0}
			<Accordion
				items={data.faqs.map((faq, index) => ({
					id: `faq-${index}`,
					title: faq.question,
					content: faq.answer,
					defaultOpen: index === 0
				}))}
			/>
		{:else}
			<div class="text-center py-12">
				<p class="text-xl text-base-content/70">No FAQs available for this category.</p>
			</div>
		{/if}

		<!-- Contact CTA -->
		<div class="mt-12 p-8 bg-base-200 rounded-lg text-center">
			<h2 class="text-2xl font-bold mb-4">Still have questions?</h2>
			<p class="text-base-content/70 mb-6">
				Our support team is here to help you with any questions or concerns.
			</p>
			<a href="/contact" class="btn btn-primary">Contact Support</a>
		</div>
	</Container>
</Section>
