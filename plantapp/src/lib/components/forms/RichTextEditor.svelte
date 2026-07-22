<script lang="ts">
	import type { FormFieldConfig } from './types.js';
	import { onMount } from 'svelte';

	interface Props {
		config: FormFieldConfig;
		value?: string;
		onChange: (content: string) => void;
		error?: string;
	}

	let { config, value = '', onChange, error }: Props = $props();

	let editorContainer: HTMLDivElement = $state()!;
	let toolbarContainer: HTMLDivElement = $state()!;
	let quillInstance: any = $state(null);

	// Fallback to a simple textarea if Quill is not available
	let useSimpleEditor = $state(false);
	let textareaValue = $state(value);

	onMount(async () => {
		try {
			// Try to load Quill dynamically
			// Note: Quill would need to be installed separately
			// const Quill = await import('quill');
			throw new Error('Quill not available');

			// Create toolbar configuration
			const toolbarOptions = config.richTextConfig?.modules?.toolbar || [
				[{ header: [1, 2, 3, false] }],
				['bold', 'italic', 'underline', 'strike'],
				[{ list: 'ordered' }, { list: 'bullet' }],
				[{ script: 'sub' }, { script: 'super' }],
				[{ indent: '-1' }, { indent: '+1' }],
				[{ direction: 'rtl' }],
				[{ color: [] }, { background: [] }],
				[{ align: [] }],
				['link', 'image'],
				['clean']
			];

			// quillInstance = new Quill.default(editorContainer, {
			//   theme: config.richTextConfig?.theme || 'snow',
			//   placeholder: config.richTextConfig?.placeholder || config.placeholder || 'Start writing...',
			//   modules: {
			//     toolbar: toolbarContainer,
			//     ...config.richTextConfig?.modules
			//   }
			// });

			// quillInstance.on('text-change', () => {
			//   const content = quillInstance.root.innerHTML;
			//   onChange(content);
			// });

			throw new Error('Quill not available');
		} catch (err) {
			console.warn('Quill editor not available, falling back to textarea:', err);
			useSimpleEditor = true;
		}
	});

	function handleTextareaChange(event: Event) {
		const target = event.target as HTMLTextAreaElement;
		textareaValue = target.value;
		onChange(textareaValue);
	}

	$effect(() => {
		if (useSimpleEditor && textareaValue !== value) {
			textareaValue = value;
		}
	});
</script>

<div class="rich-text-editor">
	{#if useSimpleEditor}
		<!-- Fallback Simple Editor -->
		<div class="overflow-hidden rounded-lg border border-base-300">
			<!-- Simple Toolbar -->
			<div class="border-b border-base-300 bg-base-200 p-2">
				<div class="flex gap-1 text-sm text-base-content/60">
					Rich text editor not available - using simple text area
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
		<!-- Quill Rich Text Editor -->
		<div class="overflow-hidden rounded-lg border border-base-300 {error ? 'border-error' : ''}">
			<!-- Toolbar -->
			<div bind:this={toolbarContainer} class="border-b border-base-300 bg-base-200">
				<!-- Toolbar will be populated by Quill -->
			</div>

			<!-- Editor -->
			<div bind:this={editorContainer} class="min-h-[200px] bg-base-100"></div>
		</div>
	{/if}
</div>

<style>
	:global(.ql-toolbar) {
		border: none !important;
		padding: 8px 12px !important;
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
