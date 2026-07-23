<script lang="ts">
	import { Container, Section } from '$lib/components/layout';
	import { Accordion } from '$lib/components/ui';
	import type { PageData } from './$types';
	import { Icon } from '$lib/components/icons';

	let { data }: { data: PageData } = $props();

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
			<h1 class="font-display mb-4 text-4xl tracking-tight uppercase">
				Frequently Asked Questions
			</h1>
			<p class="text-lg text-base-content/70">
				Find answers to common questions about our products, services, and sustainable agriculture
				practices.
			</p>
		</div>

		<!-- Category Tabs -->
		<div role="tablist" class="tabs-boxed mb-8 tabs">
			<a
				href="/faq"
				role="tab"
				class="tab font-mono text-xs tracking-widest uppercase {!data.selectedCategory
					? 'tab-active'
					: ''}"
			>
				All Questions
			</a>
			{#each categories as category}
				<a
					href="/faq?category={category.slug}"
					role="tab"
					class="tab font-mono text-xs tracking-widest uppercase {data.selectedCategory ===
					category.slug
						? 'tab-active'
						: ''}"
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
					title: faq.title,
					content: faq.excerpt ?? 'No answer summary is available yet.',
					defaultOpen: index === 0
				}))}
			/>
		{:else}
			<div class="py-12 text-center">
				<div class="mb-4 flex justify-center">
					<Icon name="help-circle" size={64} class="text-base-content/30" />
				</div>
				<p class="text-xl text-base-content/70">No FAQs available for this category.</p>
			</div>
		{/if}

		<!-- Contact CTA -->
		<div class="mt-12 rounded-3xl border border-base-200/30 bg-base-200 p-8 text-center shadow-md">
			<h2 class="font-display mb-4 text-2xl tracking-tight uppercase">Still have questions?</h2>
			<p class="mb-6 text-base-content/70">
				Our support team is here to help you with any questions or concerns.
			</p>
			<a href="/contact" class="font-display btn tracking-wider uppercase btn-primary"
				>Contact Support</a
			>
		</div>
	</Container>
</Section>
