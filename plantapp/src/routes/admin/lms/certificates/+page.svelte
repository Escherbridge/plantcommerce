<script lang="ts">
	import type { PageData } from './$types';
	import { trpc } from '$lib/trpc/client';
	import { invalidateAll } from '$app/navigation';

	let { data }: { data: PageData } = $props();

	const templates = $derived((data.templates as any[]) || []);

	let showForm = $state(false);
	let name = $state('');
	let htmlTemplate = $state('<div class="certificate">\n  <h1>{{learnerName}}</h1>\n  <p>has completed {{courseTitle}}</p>\n</div>');
	let cssStyles = $state('.certificate { text-align: center; padding: 4rem; font-family: serif; }');
	let isDefault = $state(false);
	let saving = $state(false);
	let error = $state<string | null>(null);

	async function createTemplate(e: Event) {
		e.preventDefault();
		if (saving) return;
		error = null;

		if (!name.trim()) {
			error = 'Name is required';
			return;
		}
		if (!htmlTemplate.trim()) {
			error = 'HTML template is required';
			return;
		}

		saving = true;
		try {
			await trpc.lms.certificate.createTemplate.mutate({
				name: name.trim(),
				htmlTemplate,
				cssStyles: cssStyles || undefined,
				isDefault
			});
			showForm = false;
			name = '';
			isDefault = false;
			await invalidateAll();
		} catch (err: any) {
			console.error('Create template error:', err);
			error = err?.message || 'Failed to create template';
		} finally {
			saving = false;
		}
	}
</script>

<div class="platform-content">
	<div class="platform-header">
		<div class="admin-header-row">
			<div>
				<h1 class="platform-header__title">Certificate Templates</h1>
				<p class="platform-header__subtitle">HTML/CSS templates used to generate learner certificates</p>
			</div>
			<button class="platform-action-btn admin-header-btn" onclick={() => (showForm = !showForm)}>
				<svg viewBox="0 0 24 24" class="w-5 h-5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
					<path d="M12 5v14M5 12h14" />
				</svg>
				New Template
			</button>
		</div>
	</div>

	{#if showForm}
		<form onsubmit={createTemplate} class="platform-card">
			<div class="platform-card__header">
				<h2 class="platform-card__title">Create Template</h2>
			</div>
			<div class="admin-form-grid">
				<label class="admin-field admin-field--full">
					<span class="admin-field__label">Name *</span>
					<input type="text" class="input input-bordered" bind:value={name} placeholder="Default Certificate" />
				</label>

				<label class="admin-field admin-field--full">
					<span class="admin-field__label">HTML Template *</span>
					<textarea class="textarea textarea-bordered admin-code-textarea" rows="8" bind:value={htmlTemplate}></textarea>
					<span class="admin-field__hint">Use Mustache-style placeholders like <code>&#123;&#123;learnerName&#125;&#125;</code></span>
				</label>

				<label class="admin-field admin-field--full">
					<span class="admin-field__label">CSS Styles</span>
					<textarea class="textarea textarea-bordered admin-code-textarea" rows="6" bind:value={cssStyles}></textarea>
				</label>

				<label class="admin-field">
					<span class="admin-field__label">Default Template</span>
					<label class="admin-checkbox">
						<input type="checkbox" bind:checked={isDefault} />
						<span>Use for all courses unless overridden</span>
					</label>
				</label>
			</div>

			{#if error}
				<div class="admin-error">{error}</div>
			{/if}

			<div class="admin-form-actions">
				<button type="button" class="btn btn-ghost" onclick={() => (showForm = false)}>Cancel</button>
				<button type="submit" class="btn btn-primary" disabled={saving}>
					{saving ? 'Saving...' : 'Save Template'}
				</button>
			</div>
		</form>

		<!-- Preview -->
		<div class="platform-card">
			<div class="platform-card__header">
				<h2 class="platform-card__title">Preview</h2>
			</div>
			<div class="admin-cert-preview">
				<iframe
					title="Certificate preview"
					srcdoc={`<html><head><style>${cssStyles}</style></head><body>${htmlTemplate
						.replace(/\{\{learnerName\}\}/g, 'Jane Doe')
						.replace(/\{\{courseTitle\}\}/g, 'Intro to Hydroponics')
						.replace(/\{\{date\}\}/g, new Date().toLocaleDateString())}</body></html>`}
				></iframe>
			</div>
		</div>
	{/if}

	<div class="platform-card">
		<div class="platform-card__header">
			<h2 class="platform-card__title">Templates</h2>
		</div>

		{#if templates.length > 0}
			<div class="platform-table-wrapper">
				<table class="platform-table">
					<thead>
						<tr>
							<th>Name</th>
							<th>Default</th>
							<th>Course</th>
							<th>Created</th>
						</tr>
					</thead>
					<tbody>
						{#each templates as template}
							<tr>
								<td class="font-semibold">{template.name}</td>
								<td>
									{#if template.isDefault}
										<span class="platform-badge platform-badge--success">Default</span>
									{:else}
										<span class="platform-badge platform-badge--ghost">—</span>
									{/if}
								</td>
								<td>{template.courseId || 'Global'}</td>
								<td>{template.createdAt ? new Date(template.createdAt).toLocaleDateString() : '—'}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:else}
			<div class="platform-empty">
				<p class="platform-empty__title">No Templates</p>
				<p class="platform-empty__text">Create your first certificate template to get started.</p>
			</div>
		{/if}
	</div>
</div>

<style>
	.admin-header-row {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.admin-header-btn {
		width: auto;
		white-space: nowrap;
	}

	.admin-form-grid {
		display: grid;
		grid-template-columns: repeat(1, 1fr);
		gap: 1rem;
	}

	@media (min-width: 640px) {
		.admin-form-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	.admin-field {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.admin-field--full {
		grid-column: 1 / -1;
	}

	.admin-field__label {
		font-size: 0.8125rem;
		font-weight: 500;
		color: oklch(var(--bc) / 0.7);
	}

	.admin-field__hint {
		font-size: 0.75rem;
		color: oklch(var(--bc) / 0.5);
	}

	.admin-code-textarea {
		font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
		font-size: 0.8125rem;
	}

	.admin-checkbox {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		padding-top: 0.375rem;
	}

	.admin-form-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.75rem;
		margin-top: 1rem;
	}

	.admin-error {
		margin-top: 1rem;
		padding: 0.75rem 1rem;
		border: 1px solid oklch(var(--er) / 0.4);
		background: oklch(var(--er) / 0.08);
		color: oklch(var(--er));
		border-radius: 8px;
		font-size: 0.875rem;
	}

	.admin-cert-preview {
		border: 1px solid oklch(var(--bc) / 0.1);
		border-radius: 8px;
		overflow: hidden;
		background: white;
	}

	.admin-cert-preview iframe {
		width: 100%;
		height: 360px;
		border: none;
	}
</style>
