<script lang="ts">
	import { goto } from '$app/navigation';
	import { trpc } from '$lib/trpc/client';
	import { toasts } from '$lib/stores/toast';
	import BaseForm from '$lib/components/forms/BaseForm.svelte';
	import type { FormFieldConfig } from '$lib/components/forms/types';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let formError = $state<string | null>(null);

	// ── Field configuration (BaseForm/BaseField primitives) ──
	const fields: FormFieldConfig[] = [
		{ id: 'name', name: 'name', type: 'text', label: 'Product Name', required: true },
		{ id: 'slug', name: 'slug', type: 'text', label: 'Slug', required: true },
		{ id: 'sku', name: 'sku', type: 'text', label: 'SKU', required: true },
		{
			id: 'price',
			name: 'price',
			type: 'text',
			label: 'Price',
			required: true,
			placeholder: '49.99',
			validation: { pattern: '^\\d+(\\.\\d{1,2})?$' }
		},
		{
			id: 'comparePrice',
			name: 'comparePrice',
			type: 'text',
			label: 'Compare-at Price',
			validation: { pattern: '^\\d+(\\.\\d{1,2})?$' }
		},
		{ id: 'currency', name: 'currency', type: 'text', label: 'Currency (e.g. USD)' },
		{
			id: 'categoryId',
			name: 'categoryId',
			type: 'select',
			label: 'Category',
			required: true,
			placeholder: 'Select a category',
			options: data.categories.map((c) => ({ value: String(c.id), label: c.name }))
		},
		{
			id: 'stockQuantity',
			name: 'stockQuantity',
			type: 'number',
			label: 'Stock Quantity',
			validation: { min: 0 }
		},
		{ id: 'shortDescription', name: 'shortDescription', type: 'textarea', label: 'Short Description' },
		{
			id: 'descriptionHtml',
			name: 'descriptionHtml',
			type: 'richtext',
			label: 'Long Description',
			placeholder: 'Write the full product story…'
		},
		{ id: 'keyFeatures', name: 'keyFeatures', type: 'textarea', label: 'Key Features (one per line)' },
		{ id: 'inTheBox', name: 'inTheBox', type: 'textarea', label: "What's in the Box (one per line)" },
		{ id: 'badges', name: 'badges', type: 'text', label: 'Badges (comma-separated)' },
		{ id: 'stats', name: 'stats', type: 'textarea', label: 'Stats — JSON' },
		{ id: 'specs', name: 'specs', type: 'textarea', label: 'Specs — JSON' },
		{ id: 'faqs', name: 'faqs', type: 'textarea', label: 'FAQs — JSON' },
		{ id: 'warranty', name: 'warranty', type: 'text', label: 'Warranty' },
		{ id: 'shippingNote', name: 'shippingNote', type: 'text', label: 'Shipping Note' },
		{ id: 'metaTitle', name: 'metaTitle', type: 'text', label: 'Meta Title' },
		{ id: 'metaDescription', name: 'metaDescription', type: 'textarea', label: 'Meta Description' },
		{
			id: 'isFeatured',
			name: 'isFeatured',
			type: 'checkbox',
			label: 'Featured',
			placeholder: 'Show in featured collections'
		},
		{
			id: 'isActive',
			name: 'isActive',
			type: 'checkbox',
			label: 'Active',
			placeholder: 'Visible in the storefront'
		}
	];

	const initialData: Record<string, unknown> = {
		name: '',
		slug: '',
		sku: '',
		price: '',
		comparePrice: '',
		currency: 'USD',
		categoryId: '',
		stockQuantity: 0,
		shortDescription: '',
		descriptionHtml: '',
		keyFeatures: '',
		inTheBox: '',
		badges: '',
		stats: '',
		specs: '',
		faqs: '',
		warranty: '',
		shippingNote: '',
		metaTitle: '',
		metaDescription: '',
		isFeatured: false,
		isActive: true
	};

	// ── Payload helpers (shared shape with the edit page) ──
	function toLines(v: unknown): string[] {
		return typeof v === 'string' ? v.split('\n').map((s) => s.trim()).filter(Boolean) : [];
	}
	function toCommaList(v: unknown): string[] {
		return typeof v === 'string' ? v.split(',').map((s) => s.trim()).filter(Boolean) : [];
	}
	function optText(v: unknown): string | undefined {
		const s = typeof v === 'string' ? v.trim() : '';
		return s ? s : undefined;
	}
	function normPrice(v: unknown, label: string): string {
		const n = Number(v);
		if (!Number.isFinite(n) || n < 0) throw new Error(`${label} must be a positive number`);
		return n.toFixed(2);
	}
	function parseJsonArray<T>(v: unknown, label: string, validate: (row: any) => T): T[] {
		const s = typeof v === 'string' ? v.trim() : '';
		if (!s) return [];
		let parsed: unknown;
		try {
			parsed = JSON.parse(s);
		} catch {
			throw new Error(`${label} must be valid JSON`);
		}
		if (!Array.isArray(parsed)) throw new Error(`${label} must be a JSON array`);
		return parsed.map((row) => validate(row));
	}

	function buildPayload(d: Record<string, unknown>): any {
		const categoryId = Number(d.categoryId);
		if (!Number.isFinite(categoryId)) throw new Error('Please select a category');

		const stats = parseJsonArray(d.stats, 'Stats', (r) => {
			if (!r || typeof r.value !== 'string' || typeof r.label !== 'string')
				throw new Error('Each stat needs "value" and "label" strings');
			return { value: r.value, label: r.label };
		});
		const specs = parseJsonArray(d.specs, 'Specs', (r) => {
			if (!r || typeof r.label !== 'string' || typeof r.value !== 'string')
				throw new Error('Each spec needs "label" and "value" strings');
			return { label: r.label, value: r.value };
		});
		const faqs = parseJsonArray(d.faqs, 'FAQs', (r) => {
			if (!r || typeof r.q !== 'string' || typeof r.a !== 'string')
				throw new Error('Each FAQ needs "q" and "a" strings');
			return { q: r.q, a: r.a };
		});

		return {
			name: String(d.name ?? '').trim(),
			slug: String(d.slug ?? '').trim(),
			sku: String(d.sku ?? '').trim(),
			price: normPrice(d.price, 'Price'),
			comparePrice: d.comparePrice ? normPrice(d.comparePrice, 'Compare-at price') : undefined,
			currency: optText(d.currency),
			categoryId,
			stockQuantity: d.stockQuantity != null && d.stockQuantity !== '' ? Number(d.stockQuantity) : 0,
			shortDescription: optText(d.shortDescription),
			descriptionHtml: optText(d.descriptionHtml),
			keyFeatures: toLines(d.keyFeatures),
			inTheBox: toLines(d.inTheBox),
			badges: toCommaList(d.badges),
			stats,
			specs,
			faqs,
			warranty: optText(d.warranty),
			shippingNote: optText(d.shippingNote),
			metaTitle: optText(d.metaTitle),
			metaDescription: optText(d.metaDescription),
			isFeatured: d.isFeatured === true
		};
	}

	async function handleSubmit(formData: Record<string, unknown>) {
		formError = null;

		let payload: any;
		try {
			payload = buildPayload(formData);
		} catch (err) {
			formError = err instanceof Error ? err.message : 'Please fix the highlighted fields';
			toasts.addToast({ message: formError, variant: 'error', duration: 4000 });
			return;
		}

		try {
			const created = (await trpc.products.createProduct.mutate(payload)) as { id: number };
			// createProduct always stores an active product; honour an unchecked "Active".
			if (formData.isActive === false && created?.id) {
				await trpc.products.updateProduct.mutate({ id: created.id, isActive: false });
			}
			toasts.addToast({ message: 'Product created', variant: 'success', duration: 3000 });
			await goto('/admin/products');
		} catch (err) {
			formError = err instanceof Error ? err.message : 'Failed to create product';
			toasts.addToast({ message: formError, variant: 'error', duration: 4000 });
		}
	}
</script>

<div class="platform-content">
	<div class="platform-header">
		<div class="product-form-header-row">
			<div>
				<h1 class="platform-header__title">New Product</h1>
				<p class="platform-header__subtitle">Add a product to your catalog</p>
			</div>
			<a href="/admin/products" class="btn btn-ghost btn-sm">Back to products</a>
		</div>
	</div>

	{#if formError}
		<div class="product-form-error" role="alert">{formError}</div>
	{/if}

	<div class="product-form-hint">
		<p class="product-form-hint__title">Structured fields use JSON</p>
		<ul>
			<li><code>Stats</code>: [&#123; "value": "5k+", "label": "Growers" &#125;]</li>
			<li><code>Specs</code>: [&#123; "label": "Weight", "value": "1.2 kg" &#125;]</li>
			<li><code>FAQs</code>: [&#123; "q": "Is it organic?", "a": "Yes." &#125;]</li>
		</ul>
	</div>

	<div class="platform-card">
		<BaseForm {fields} {initialData} onSubmit={handleSubmit} submitButtonText="Create Product" />
	</div>
</div>

<style>
	.product-form-header-row {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.product-form-error {
		padding: 0.75rem 1rem;
		border: 1px solid oklch(var(--er) / 0.4);
		background: oklch(var(--er) / 0.08);
		color: oklch(var(--er));
		border-radius: 8px;
		font-size: 0.875rem;
		margin-bottom: 1rem;
	}

	.product-form-hint {
		padding: 0.875rem 1rem;
		border: 1px solid var(--input-border);
		border-radius: 10px;
		background: oklch(var(--b2) / 0.5);
		margin-bottom: 1.25rem;
		font-size: 0.8125rem;
		color: oklch(var(--bc) / 0.75);
	}

	.product-form-hint__title {
		font-weight: 600;
		margin-bottom: 0.375rem;
		color: oklch(var(--bc));
	}

	.product-form-hint ul {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		margin: 0;
		padding-left: 1rem;
		list-style: disc;
	}

	.product-form-hint code {
		font-family: var(--font-mono, monospace);
		font-weight: 600;
		color: oklch(var(--p));
	}
</style>
