<script lang="ts">
	import { Container, Section } from '$lib/components/layout';
	import { Accordion } from '$lib/components/ui';
	import type { PageData } from './$types';

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
			<h1 class="text-4xl font-display uppercase tracking-tight mb-4">Frequently Asked Questions</h1>
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
				class="tab font-mono text-xs uppercase tracking-widest {!data.selectedCategory ? 'tab-active' : ''}"
			>
				All Questions
			</a>
			{#each categories as category}
				<a
					href="/faq?category={category.slug}"
					role="tab"
					class="tab font-mono text-xs uppercase tracking-widest {data.selectedCategory === category.slug ? 'tab-active' : ''}"
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
				<div class="flex justify-center mb-4">
					<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" fill="none" class="w-16 h-16 text-base-content/30">
						<path d="M12 2a10 10 0 100 20 10 10 0 000-20zM9.1 9a3 3 0 015.8 1c0 2-3 3-3 3M12 17h0"/>
					</svg>
				</div>
				<p class="text-xl text-base-content/70">No FAQs available for this category.</p>
			</div>
		{/if}

		<!-- Contact CTA -->
		<div class="mt-12 p-8 bg-base-200 rounded-3xl border border-base-200/30 shadow-md text-center">
			<h2 class="text-2xl font-display uppercase tracking-tight mb-4">Still have questions?</h2>
			<p class="text-base-content/70 mb-6">
				Our support team is here to help you with any questions or concerns.
			</p>
			<a href="/contact" class="btn btn-primary font-display uppercase tracking-wider">Contact Support</a>
		</div>
	</Container>
</Section>
