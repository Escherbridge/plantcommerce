<script lang="ts">
	import '$lib/components/platform/platform.css';
	import { trpc } from '$lib/trpc/client';
	import { normalizeAffiliateLinkCode } from '$lib/affiliate/linkCode';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let productId = $state('');
	let customCode = $state('');
	let fieldError = $state('');
	let formError = $state('');
	let notice = $state('');
	let isSubmitting = $state(false);
	let links = $state(data.links ?? []);

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		fieldError = '';
		formError = '';
		notice = '';
		const selectedId = Number(productId);
		if (!Number.isInteger(selectedId) || selectedId <= 0) {
			fieldError = 'Choose a catalogue item';
			return;
		}
		let code: string | undefined;
		try {
			code = normalizeAffiliateLinkCode(customCode);
		} catch (error) {
			fieldError = error instanceof Error ? error.message : 'That link code is not usable';
			return;
		}

		const existingIds = new Set(links.map((link) => link.id));
		isSubmitting = true;
		try {
			const created = await trpc.affiliate.createLink.mutate({
				productId: selectedId,
				customCode: code
			});
			if (existingIds.has(created.id)) {
				notice = 'That catalogue item already has a tracked link.';
			} else {
				const product = data.products.find((item) => item.id === selectedId);
				links = [
					{
						...created,
						product: {
							id: selectedId,
							name: product?.name ?? 'Catalogue item',
							slug: '',
							price: '',
							stockQuantity: 0
						}
					},
					...links
				];
				notice = 'Tracked link created.';
				customCode = '';
			}
		} catch (error) {
			formError = error instanceof Error ? error.message : 'The link could not be created.';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<svelte:head>
	<title>Affiliate Links | Aevani</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="platform-content">
	<div class="platform-header">
		<h1 class="platform-header__title">Affiliate Links</h1>
		<p class="platform-header__subtitle">
			Create a tracked link for a catalogue item and share that URL.
		</p>
	</div>

	{#if !data.canCreate}
		<div class="platform-card">
			<div class="platform-empty">
				<p class="platform-empty__title">No affiliate account</p>
				<p class="platform-empty__text">
					This login cannot create tracked links until it has an active affiliate account.
				</p>
				<a href="/affiliate/join" class="platform-action-btn">Open the application</a>
			</div>
		</div>
	{:else}
		<div class="platform-card">
			<div class="platform-card__header">
				<h2 class="platform-card__title">New link</h2>
			</div>
			<form class="platform-form-stack" novalidate onsubmit={handleSubmit}>
				{#if formError || fieldError}
					<div class="alert alert-error" role="alert">{formError || fieldError}</div>
				{/if}
				{#if notice}
					<div class="alert" role="status">{notice}</div>
				{/if}
				<div class="form-control">
					<label class="label" for="productId">
						<span class="label-text">Catalogue item</span>
					</label>
					<select
						id="productId"
						name="productId"
						class="select-bordered select w-full"
						bind:value={productId}
						required
					>
						<option value="">Choose one</option>
						{#each data.products as product (product.id)}
							<option value={String(product.id)}>{product.name} ({product.categoryName})</option>
						{/each}
					</select>
				</div>
				<div class="form-control">
					<label class="label" for="customCode">
						<span class="label-text">Custom code (optional)</span>
					</label>
					<input
						id="customCode"
						name="customCode"
						class="input-bordered input w-full"
						bind:value={customCode}
						maxlength="64"
						autocomplete="off"
						aria-describedby="custom-code-hint"
					/>
					<p id="custom-code-hint" class="mt-1 text-sm">
						Leave this blank to generate a code. Codes are 4 to 64 letters, numbers, hyphens, or
						underscores, and each one can be used once.
					</p>
				</div>
				{#if data.products.length === 0}
					<p role="status">No catalogue items are available to link right now.</p>
				{/if}
				<button
					class="btn btn-primary"
					type="submit"
					disabled={isSubmitting || data.products.length === 0}
				>
					{isSubmitting ? 'Creating…' : 'Create tracked link'}
				</button>
			</form>
		</div>

		<div class="platform-card">
			<div class="platform-card__header">
				<h2 class="platform-card__title">Your links</h2>
			</div>
			{#if links.length === 0}
				<div class="platform-empty">
					<p class="platform-empty__title">No tracked links yet</p>
					<p class="platform-empty__text">A new link shows up here with its share URL.</p>
				</div>
			{:else}
				<div class="platform-table-wrapper">
					<table class="platform-table">
						<thead>
							<tr>
								<th>Item</th>
								<th>Code</th>
								<th>Share URL</th>
							</tr>
						</thead>
						<tbody>
							{#each links as link (link.id)}
								<tr>
									<td>{link.product?.name ?? 'Catalogue item'}</td>
									<td><code>{link.linkCode}</code></td>
									<td><a href={link.affiliateUrl}>{link.affiliateUrl}</a></td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>
	{/if}
</div>
