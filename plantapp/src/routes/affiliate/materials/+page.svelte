<script lang="ts">
	import '$lib/components/platform/platform.css';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let activeTab = $state<'banners' | 'social' | 'email' | 'brand'>('banners');

	const tabs = [
		{ key: 'banners' as const, label: 'Banners' },
		{ key: 'social' as const, label: 'Social Posts' },
		{ key: 'email' as const, label: 'Email Templates' },
		{ key: 'brand' as const, label: 'Brand Assets' }
	];

	let copiedId = $state<string | null>(null);
	function copyText(text: string, id: string) {
		navigator.clipboard.writeText(text);
		copiedId = id;
		setTimeout(() => (copiedId = null), 2000);
	}
</script>

<div class="platform-content">
	<div class="platform-header">
		<h1 class="platform-header__title">Marketing Materials</h1>
		<p class="platform-header__subtitle">
			Download banners, get social media templates, and access brand guidelines for promoting products.
		</p>
	</div>

	<!-- Tab Navigation -->
	<div class="tab-bar">
		{#each tabs as tab}
			<button
				class="tab-btn"
				class:tab-btn--active={activeTab === tab.key}
				onclick={() => (activeTab = tab.key)}
			>
				{tab.label}
			</button>
		{/each}
	</div>

	<!-- Banners Tab -->
	{#if activeTab === 'banners'}
		<div class="materials-grid">
			{#each data.banners as banner}
				<div class="platform-card">
					<div class="platform-card__header">
						<h3 class="platform-card__title">{banner.title}</h3>
					</div>
					<div class="banner-meta">
						<span class="platform-badge platform-badge--ghost">{banner.size}</span>
						<span class="platform-badge platform-badge--ghost">{banner.format}</span>
					</div>
					<div class="banner-preview">
						<div class="banner-placeholder">
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="placeholder-icon">
								<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
								<circle cx="8.5" cy="8.5" r="1.5"/>
								<polyline points="21 15 16 10 5 21"/>
							</svg>
							<span class="placeholder-text">{banner.size}</span>
						</div>
					</div>
					<div class="platform-card__actions">
						<button class="download-btn">
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="btn-icon">
								<path d="M12 3v12M7 14l5 5 5-5M3 19h18"/>
							</svg>
							Download
						</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}

	<!-- Social Posts Tab -->
	{#if activeTab === 'social'}
		<div class="materials-stack">
			{#each data.socialPosts as post}
				<div class="platform-card">
					<div class="platform-card__header">
						<h3 class="platform-card__title">{post.platform}</h3>
						<button
							class="copy-btn"
							onclick={() => copyText(`${post.text}\n\n${post.hashtags}`, `social-${post.id}`)}
						>
							{#if copiedId === `social-${post.id}`}
								Copied
							{:else}
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="btn-icon">
									<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
									<path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
								</svg>
								Copy
							{/if}
						</button>
					</div>
					<p class="social-text">{post.text}</p>
					<p class="social-hashtags">{post.hashtags}</p>
				</div>
			{/each}
		</div>
	{/if}

	<!-- Email Templates Tab -->
	{#if activeTab === 'email'}
		<div class="materials-stack">
			{#each data.emailTemplates as template}
				<div class="platform-card">
					<div class="platform-card__header">
						<h3 class="platform-card__title">{template.title}</h3>
						<button
							class="copy-btn"
							onclick={() =>
								copyText(
									`Subject: ${template.subject}\n\n${template.preview}`,
									`email-${template.id}`
								)}
						>
							{#if copiedId === `email-${template.id}`}
								Copied
							{:else}
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="btn-icon">
									<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
									<path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
								</svg>
								Copy
							{/if}
						</button>
					</div>
					<div class="email-subject">
						<span class="field-label">Subject</span>
						<p>{template.subject}</p>
					</div>
					<p class="email-preview">{template.preview}</p>
				</div>
			{/each}
		</div>
	{/if}

	<!-- Brand Assets Tab -->
	{#if activeTab === 'brand'}
		<div class="materials-grid">
			<!-- Colors -->
			<div class="platform-card">
				<div class="platform-card__header">
					<h3 class="platform-card__title">Brand Colors</h3>
				</div>
				<div class="color-list">
					<div class="color-item">
						<div class="color-swatch" style="background-color: {data.guidelines.colors.primary}"></div>
						<div>
							<p class="color-name">Primary</p>
							<p class="color-hex">{data.guidelines.colors.primary}</p>
						</div>
					</div>
					<div class="color-item">
						<div class="color-swatch" style="background-color: {data.guidelines.colors.secondary}"></div>
						<div>
							<p class="color-name">Secondary</p>
							<p class="color-hex">{data.guidelines.colors.secondary}</p>
						</div>
					</div>
					<div class="color-item">
						<div class="color-swatch" style="background-color: {data.guidelines.colors.accent}"></div>
						<div>
							<p class="color-name">Accent</p>
							<p class="color-hex">{data.guidelines.colors.accent}</p>
						</div>
					</div>
				</div>
			</div>

			<!-- Logo & Fonts -->
			<div class="platform-card">
				<div class="platform-card__header">
					<h3 class="platform-card__title">Typography</h3>
				</div>
				<div class="font-list">
					<div class="font-item">
						<span class="field-label">Heading Font</span>
						<p class="font-value">{data.guidelines.fonts.heading}</p>
					</div>
					<div class="font-item">
						<span class="field-label">Body Font</span>
						<p class="font-value">{data.guidelines.fonts.body}</p>
					</div>
				</div>
			</div>

			<!-- Guidelines -->
			<div class="platform-card">
				<div class="platform-card__header">
					<h3 class="platform-card__title">Best Practices</h3>
				</div>
				<div class="guidelines-section">
					<span class="guideline-heading guideline-heading--do">Do</span>
					<ul class="guideline-list">
						{#each data.guidelines.dos as item}
							<li>{item}</li>
						{/each}
					</ul>
				</div>
				<div class="guidelines-section">
					<span class="guideline-heading guideline-heading--dont">Do Not</span>
					<ul class="guideline-list">
						{#each data.guidelines.donts as item}
							<li>{item}</li>
						{/each}
					</ul>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.tab-bar {
		display: flex;
		gap: 0.125rem;
		background: oklch(var(--b2));
		border-radius: var(--input-radius, 10px);
		padding: 0.25rem;
		width: fit-content;
		overflow-x: auto;
	}

	.tab-btn {
		padding: 0.5rem 1rem;
		border: none;
		border-radius: calc(var(--input-radius, 10px) - 2px);
		background: transparent;
		font-family: var(--font-display);
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: oklch(var(--bc) / 0.5);
		cursor: pointer;
		transition: all 150ms ease;
		white-space: nowrap;
	}

	.tab-btn:hover {
		color: oklch(var(--bc) / 0.8);
	}

	.tab-btn--active {
		background: oklch(var(--p));
		color: oklch(var(--pc));
	}

	.materials-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1rem;
	}

	@media (min-width: 640px) {
		.materials-grid {
			grid-template-columns: 1fr 1fr;
		}
	}

	.materials-stack {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.banner-meta {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 0.75rem;
	}

	.banner-preview {
		margin-bottom: 0.75rem;
	}

	.banner-placeholder {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 2rem;
		background: oklch(var(--b2));
		border: 1.5px dashed var(--input-border);
		border-radius: calc(var(--input-radius, 10px) - 2px);
	}

	.placeholder-icon {
		width: 2rem;
		height: 2rem;
		color: oklch(var(--bc) / 0.3);
	}

	.placeholder-text {
		font-size: 0.75rem;
		color: oklch(var(--bc) / 0.4);
		font-family: var(--font-mono, monospace);
	}

	.download-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: oklch(var(--p));
		color: oklch(var(--pc));
		border: none;
		border-radius: var(--input-radius, 10px);
		font-family: var(--font-display);
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		cursor: pointer;
		transition: opacity 150ms ease;
	}

	.download-btn:hover {
		opacity: 0.9;
	}

	.copy-btn {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.375rem 0.75rem;
		border: 1.5px solid var(--input-border);
		border-radius: var(--input-radius, 10px);
		background: transparent;
		font-family: var(--font-display);
		font-size: 0.6875rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: oklch(var(--bc) / 0.6);
		cursor: pointer;
		transition: border-color 150ms ease, color 150ms ease;
	}

	.copy-btn:hover {
		border-color: oklch(var(--p));
		color: oklch(var(--p));
	}

	.btn-icon {
		width: 0.875rem;
		height: 0.875rem;
	}

	.social-text {
		font-size: 0.9375rem;
		color: oklch(var(--bc) / 0.85);
		line-height: 1.5;
		margin-bottom: 0.5rem;
	}

	.social-hashtags {
		font-size: 0.8125rem;
		color: oklch(var(--p));
	}

	.field-label {
		font-family: var(--font-display);
		font-size: 0.6875rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: oklch(var(--bc) / 0.5);
	}

	.email-subject {
		margin-bottom: 0.5rem;
	}

	.email-subject p {
		font-size: 0.875rem;
		color: oklch(var(--bc) / 0.8);
		margin-top: 0.125rem;
	}

	.email-preview {
		font-size: 0.875rem;
		color: oklch(var(--bc) / 0.6);
		line-height: 1.5;
	}

	.color-list {
		display: flex;
		flex-direction: column;
		gap: 0.875rem;
	}

	.color-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.color-swatch {
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 0.5rem;
		flex-shrink: 0;
		border: 1px solid var(--input-border);
	}

	.color-name {
		font-weight: 600;
		font-size: 0.875rem;
		color: oklch(var(--bc));
	}

	.color-hex {
		font-size: 0.75rem;
		color: oklch(var(--bc) / 0.5);
		font-family: var(--font-mono, monospace);
	}

	.font-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.font-item {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.font-value {
		font-size: 1.125rem;
		font-weight: 600;
		color: oklch(var(--bc));
	}

	.guidelines-section {
		margin-bottom: 1rem;
	}

	.guidelines-section:last-child {
		margin-bottom: 0;
	}

	.guideline-heading {
		font-family: var(--font-display);
		font-size: 0.6875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		display: block;
		margin-bottom: 0.5rem;
	}

	.guideline-heading--do {
		color: oklch(var(--su));
	}

	.guideline-heading--dont {
		color: oklch(var(--er));
	}

	.guideline-list {
		list-style: disc;
		padding-left: 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		font-size: 0.8125rem;
		color: oklch(var(--bc) / 0.7);
	}
</style>
