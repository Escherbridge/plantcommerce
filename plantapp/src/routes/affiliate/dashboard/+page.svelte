<script lang="ts">
	import '$lib/components/platform/platform.css';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const links = $derived(data.links ?? []);
	let codeCopied = $state(false);

	async function copyCode() {
		const code = data.affiliate?.affiliateCode;
		if (!code || !navigator.clipboard) return;
		await navigator.clipboard.writeText(code);
		codeCopied = true;
		setTimeout(() => {
			codeCopied = false;
		}, 2000);
	}
</script>

<svelte:head>
	<title>Affiliate Dashboard | Aevani</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="platform-content">
	<div class="platform-header">
		<h1 class="platform-header__title">Affiliate Dashboard</h1>
		<p class="platform-header__subtitle">
			{#if data.isAdmin && !data.affiliate}
				Admin view. This login has no affiliate account of its own.
			{:else}
				Status: {data.affiliate?.status ?? 'active'}. Activity for your tracked links.
			{/if}
		</p>
	</div>

	<section data-slot="manager-invites" aria-label="Manager invites"></section>

	{#if data.isAdmin && !data.affiliate}
		<div class="platform-card">
			<div class="platform-empty">
				<p class="platform-empty__title">No affiliate account</p>
				<p class="platform-empty__text">
					Apply with this login if you want to create tracked links. Admin tools for other accounts
					stay under the admin panel.
				</p>
				<a href="/affiliate/join" class="platform-action-btn">Open the application</a>
			</div>
		</div>
	{:else}
		<div class="platform-stats">
			<div class="platform-stat">
				<span class="platform-stat__label">Clicks</span>
				<span class="platform-stat__value">{data.stats.totalClicks}</span>
			</div>
			<div class="platform-stat">
				<span class="platform-stat__label">Attributed orders</span>
				<span class="platform-stat__value">{data.stats.totalConversions}</span>
			</div>
			<div class="platform-stat">
				<span class="platform-stat__label">Links</span>
				<span class="platform-stat__value">{links.length}</span>
			</div>
		</div>

		{#if data.affiliate?.affiliateCode}
			<div class="platform-card">
				<div class="platform-card__header">
					<h2 class="platform-card__title">Your code</h2>
				</div>
				<p>
					<code>{data.affiliate.affiliateCode}</code>
				</p>
				<button type="button" class="platform-action-btn" onclick={copyCode}>
					{codeCopied ? 'Copied' : 'Copy code'}
				</button>
			</div>
		{/if}

		<div class="platform-card">
			<div class="platform-card__header">
				<h2 class="platform-card__title">Tracked links</h2>
			</div>
			{#if links.length === 0}
				<div class="platform-empty">
					<p class="platform-empty__title">No tracked links yet</p>
					<p class="platform-empty__text">
						Create a link for a catalogue item. Visits use that link, and an empty list stays here
						until the first one exists.
					</p>
					<a href="/affiliate/links" class="platform-action-btn">Create a tracked link</a>
				</div>
			{:else}
				<div class="platform-table-wrapper">
					<table class="platform-table">
						<thead>
							<tr>
								<th>Item</th>
								<th>Clicks</th>
								<th>Share URL</th>
							</tr>
						</thead>
						<tbody>
							{#each links as link (link.id)}
								<tr>
									<td>{link.product?.name ?? 'Catalogue item'}</td>
									<td>{link.clicks}</td>
									<td><code>{link.affiliateUrl}</code></td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>
	{/if}
</div>
