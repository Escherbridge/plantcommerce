<script lang="ts">
	import type { FormFieldConfig } from './types.js';
	import { onMount, tick } from 'svelte';
	// Static CSS import so Vite bundles Quill's stylesheet into the page CSS at
	// build/SSR time (present before hydration). A dynamic `await import(...css)`
	// is fragile: on a cold dev server or a slow prod CSS chunk it can stall the
	// init chain, leaving neither the editor nor the fallback visible.
	// See src/lib/components/forms/AGENTS.md.
	import 'quill/dist/quill.snow.css';

	interface Props {
		config: FormFieldConfig;
		value?: string;
		onChange: (content: string) => void;
		error?: string;
	}

	let { config, value = '', onChange, error }: Props = $props();

	// Toolbar restricted to exactly the markup sanitizeRichText allows on render,
	// so nothing a user formats is silently stripped. See src/lib/utils/AGENTS.md.
	const toolbarOptions = [
		[{ header: [2, 3, 4, false] }],
		['bold', 'italic', 'underline'],
		['blockquote'],
		[{ list: 'ordered' }, { list: 'bullet' }],
		['link'],
		['clean']
	];

	// Quill renders an empty editor as this; treat it as an empty string.
	const EMPTY_HTML = '<p><br></p>';

	let editorContainer: HTMLDivElement | undefined = $state();
	let quill: any = $state(null);

	// Graceful fallback used only for SSR render or if the dynamic import fails.
	let useSimpleEditor = $state(false);
	let textareaValue = $state(value);

	// Last value reconciled with the editor; breaks prop<->onChange feedback loops.
	let lastValue = value ?? '';

	function normalize(html: string): string {
		return html === EMPTY_HTML ? '' : html;
	}

	onMount(async () => {
		try {
			const { default: Quill } = await import('quill');

			// The container lives in the {:else} branch; make sure the DOM is
			// flushed and the ref is bound before constructing Quill so a missing
			// container falls back to the textarea instead of throwing silently.
			await tick();
			if (!editorContainer) {
				throw new Error('Rich text editor container is unavailable');
			}

			quill = new Quill(editorContainer, {
				theme: 'snow',
				placeholder:
					config.richTextConfig?.placeholder || config.placeholder || 'Start writing...',
				modules: { toolbar: toolbarOptions }
			});

			if (value) {
				quill.root.innerHTML = value;
				lastValue = value;
			}

			quill.on('text-change', () => {
				const html = normalize(quill.root.innerHTML);
				if (html === lastValue) {
					return;
				}
				lastValue = html;
				onChange(html);
			});
		} catch (err) {
			console.warn('Quill editor unavailable, falling back to textarea:', err);
			useSimpleEditor = true;
		}
	});

	function handleTextareaChange(event: Event) {
		const target = event.target as HTMLTextAreaElement;
		textareaValue = target.value;
		lastValue = textareaValue;
		onChange(textareaValue);
	}

	// Sync external value changes into whichever editor is active.
	$effect(() => {
		const incoming = value ?? '';

		if (quill) {
			if (incoming !== lastValue) {
				lastValue = incoming;
				quill.root.innerHTML = incoming || EMPTY_HTML;
			}
		} else if (useSimpleEditor && textareaValue !== incoming) {
			textareaValue = incoming;
		}
	});
</script>

<div class="rich-text-editor">
	{#if useSimpleEditor}
		<!-- Fallback: plain textarea (SSR / Quill import failed) -->
		<div class="overflow-hidden rounded-lg border border-base-300 {error ? 'border-error' : ''}">
			<div class="border-b border-base-300 bg-base-200 p-2">
				<div class="flex gap-1 text-sm text-base-content/60">
					Rich text editor unavailable - using a plain text area
				</div>
			</div>

			<textarea
				class="textarea min-h-[200px] w-full resize-y rounded-none border-0 focus:outline-none
          {error ? 'textarea-error' : ''}"
				placeholder={config.placeholder}
				bind:value={textareaValue}
				oninput={handleTextareaChange}
			></textarea>
		</div>
	{:else}
		<!-- Quill Rich Text Editor (toolbar is injected by Quill into this container) -->
		<div class="overflow-hidden rounded-lg border border-base-300 {error ? 'border-error' : ''}">
			<div bind:this={editorContainer} class="min-h-[200px] bg-base-100"></div>
		</div>
	{/if}
</div>

<style>
	:global(.ql-toolbar) {
		border: none !important;
		border-bottom: 1px solid oklch(var(--b3, var(--bc) / 0.2)) !important;
		padding: 8px 12px !important;
		background: oklch(var(--b2)) !important;
	}

	:global(.ql-container) {
		border: none !important;
		font-family: inherit !important;
	}

	:global(.ql-editor) {
		padding: 12px !important;
		min-height: 200px !important;
	}

	:global(.ql-editor.ql-blank::before) {
		font-style: normal !important;
		opacity: 0.6 !important;
	}
</style>
