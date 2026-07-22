<script lang="ts">
	import type { FormFieldConfig } from './types.js';
	import { Icon } from '$lib/components/icons';

	interface Props {
		config: FormFieldConfig;
		onFileChange: (files: FileList) => void;
		error?: string;
	}

	let { config, onFileChange, error }: Props = $props();

	let dragOver = $state(false);
	let fileInput = $state<HTMLInputElement | null>(null);
	let selectedFiles = $state<FileList | null>(null);

	function handleDragEnter(e: DragEvent) {
		e.preventDefault();
		dragOver = true;
	}

	function handleDragLeave(e: DragEvent) {
		e.preventDefault();
		dragOver = false;
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		dragOver = false;

		const files = e.dataTransfer?.files;
		if (files && files.length > 0) {
			handleFiles(files);
		}
	}

	function handleFileInputChange(e: Event) {
		const target = e.target as HTMLInputElement;
		const files = target.files;
		if (files) {
			handleFiles(files);
		}
	}

	function handleFiles(files: FileList) {
		selectedFiles = files;
		onFileChange(files);
	}

	function triggerFileInput() {
		fileInput?.click();
	}

	function removeFile(index: number) {
		if (!selectedFiles) return;

		const dt = new DataTransfer();
		for (let i = 0; i < selectedFiles.length; i++) {
			const file = selectedFiles.item(i);
			if (i !== index && file) {
				dt.items.add(file);
			}
		}
		selectedFiles = dt.files;
		onFileChange(selectedFiles);
	}

	function formatFileSize(bytes: number): string {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + (sizes[i] ?? 'Bytes');
	}

	const isDragDrop = $derived(config.dragDrop ?? false);
	const isMultiple = $derived(config.multiple ?? false);
	const hasFiles = $derived((selectedFiles?.length ?? 0) > 0);
</script>

<div class="w-full">
	{#if isDragDrop}
		<!-- Drag and Drop Interface -->
		<div
			class="cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-all duration-200
        {dragOver ? 'border-primary bg-primary/10' : 'border-base-300 hover:border-primary/50'}
        {error ? 'border-error' : ''}"
			role="button"
			tabindex="0"
			ondragenter={handleDragEnter}
			ondragleave={handleDragLeave}
			ondragover={handleDragOver}
			ondrop={handleDrop}
			onclick={triggerFileInput}
			onkeydown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					triggerFileInput();
				}
			}}
		>
			<div class="flex flex-col items-center gap-4">
				{#if dragOver}
					<Icon name="upload-cloud" size={48} class="text-primary" />
					<p class="font-medium text-primary">Drop files here</p>
				{:else}
					<Icon name="upload-cloud" size={48} class="text-base-content/60" />
					<div>
						<p class="mb-2 text-lg font-medium">
							Drag and drop {isMultiple ? 'files' : 'a file'} here
						</p>
						<p class="text-base-content/60">
							or <span class="text-primary underline"
								>browse to choose {isMultiple ? 'files' : 'a file'}</span
							>
						</p>
					</div>
				{/if}

				{#if config.accept}
					<p class="text-sm text-base-content/60">
						Accepted formats: {config.accept}
					</p>
				{/if}
			</div>
		</div>

		<input
			bind:this={fileInput}
			type="file"
			class="hidden"
			accept={config.accept}
			multiple={isMultiple}
			onchange={handleFileInputChange}
		/>
	{:else}
		<!-- Button Interface -->
		<div class="flex flex-col gap-2">
			<button type="button" class="btn w-full btn-outline btn-primary" onclick={triggerFileInput}>
				<Icon name="upload-cloud" size={20} />
				Choose {isMultiple ? 'Files' : 'File'}
			</button>

			<input
				bind:this={fileInput}
				type="file"
				class="hidden"
				accept={config.accept}
				multiple={isMultiple}
				onchange={handleFileInputChange}
			/>

			{#if config.accept}
				<p class="text-center text-sm text-base-content/60">
					Accepted formats: {config.accept}
				</p>
			{/if}
		</div>
	{/if}

	<!-- Selected Files Display -->
	{#if hasFiles}
		<div class="mt-4">
			<h4 class="mb-2 font-medium">
				Selected Files ({selectedFiles?.length})
			</h4>
			<div class="space-y-2">
				{#each Array.from(selectedFiles || []) as file, index}
					<div class="flex items-center justify-between rounded-lg bg-base-200 p-3">
						<div class="flex items-center gap-3">
							<div class="h-2 w-2 rounded-full bg-success"></div>
							<div>
								<p class="text-sm font-medium">{file.name}</p>
								<p class="text-xs text-base-content/60">
									{formatFileSize(file.size)} • {file.type || 'Unknown type'}
								</p>
							</div>
						</div>
						<button
							type="button"
							class="btn btn-square btn-ghost btn-sm"
							onclick={() => removeFile(index)}
							aria-label="Remove file {file.name}"
						>
							<Icon name="x" size={16} />
						</button>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
