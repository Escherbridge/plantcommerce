<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { trpc } from '$lib/trpc/client';
	
	interface UploadedFile {
		id: string;
		filename: string;
		originalFilename: string;
		mimeType: string;
		fileSize: number;
		publicUrl: string;
		signedUrl?: string;
	}

	export let entityType: 'user' | 'product' | 'content' | 'general' = 'general';
	export let entityId: string | undefined = undefined;
	export let isPublic: boolean = false;
	export let accept: string = 'image/*,application/pdf,.doc,.docx';
	export let multiple: boolean = false;
	export let maxFiles: number = 5;
	export let maxSizeBytes: number = 10 * 1024 * 1024; // 10MB

	const dispatch = createEventDispatcher<{
		upload: UploadedFile[];
		error: string;
	}>();

	let fileInput: HTMLInputElement;
	let uploading = false;
	let uploadProgress = 0;

	async function handleFileUpload(event: Event) {
		const target = event.target as HTMLInputElement;
		const files = target.files;
		
		if (!files || files.length === 0) return;

		// Validate file count
		if (files.length > maxFiles) {
			dispatch('error', `Maximum ${maxFiles} files allowed`);
			return;
		}

		// Validate file sizes
		for (const file of Array.from(files)) {
			if (file.size > maxSizeBytes) {
				dispatch('error', `File "${file.name}" is too large. Maximum ${Math.round(maxSizeBytes / 1024 / 1024)}MB allowed`);
				return;
			}
		}

		uploading = true;
		uploadProgress = 0;

		try {
			const formData = new FormData();
			
			// Add files
			for (const file of Array.from(files)) {
				formData.append('files', file);
			}

			// Add metadata
			formData.append('entityType', entityType);
			if (entityId) formData.append('entityId', entityId);
			formData.append('isPublic', isPublic.toString());

			const response = await fetch('/api/files/upload', {
				method: 'POST',
				body: formData
			});

			if (!response.ok) {
				const error = await response.text();
				throw new Error(error);
			}

			const result = await response.json();
			dispatch('upload', result.files);

			// Clear the input
			if (fileInput) fileInput.value = '';

		} catch (error) {
			console.error('Upload failed:', error);
			dispatch('error', error instanceof Error ? error.message : 'Upload failed');
		} finally {
			uploading = false;
			uploadProgress = 0;
		}
	}

	function formatFileSize(bytes: number): string {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	}
</script>

<div class="file-upload">
	<div class="upload-area" class:uploading>
		<input
			bind:this={fileInput}
			type="file"
			{accept}
			{multiple}
			on:change={handleFileUpload}
			disabled={uploading}
			class="file-input"
		/>
		
		<div class="upload-content">
			{#if uploading}
				<div class="upload-progress">
					<div class="spinner"></div>
					<p>Uploading files...</p>
					{#if uploadProgress > 0}
						<div class="progress-bar">
							<div class="progress-fill" style="width: {uploadProgress}%"></div>
						</div>
					{/if}
				</div>
			{:else}
				<div class="upload-prompt">
					<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
					</svg>
					<p>Click to upload or drag and drop</p>
					<p class="upload-info">
						{#if multiple}Up to {maxFiles} files,{/if} 
						max {formatFileSize(maxSizeBytes)} each
					</p>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.file-upload {
		width: 100%;
	}

	.upload-area {
		position: relative;
		border: 2px dashed #cbd5e0;
		border-radius: 8px;
		padding: 2rem;
		text-align: center;
		background-color: #f8fafc;
		transition: all 0.2s ease-in-out;
		cursor: pointer;
	}

	.upload-area:hover {
		border-color: #4299e1;
		background-color: #ebf8ff;
	}

	.upload-area.uploading {
		border-color: #4299e1;
		background-color: #ebf8ff;
		cursor: not-allowed;
	}

	.file-input {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		opacity: 0;
		cursor: pointer;
	}

	.file-input:disabled {
		cursor: not-allowed;
	}

	.upload-content {
		pointer-events: none;
	}

	.upload-prompt svg {
		margin: 0 auto 1rem;
		color: #a0aec0;
	}

	.upload-prompt p {
		margin: 0.5rem 0;
		color: #4a5568;
	}

	.upload-info {
		font-size: 0.875rem;
		color: #718096;
	}

	.upload-progress {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}

	.spinner {
		width: 32px;
		height: 32px;
		border: 3px solid #e2e8f0;
		border-top: 3px solid #4299e1;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	.progress-bar {
		width: 200px;
		height: 4px;
		background-color: #e2e8f0;
		border-radius: 2px;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background-color: #4299e1;
		transition: width 0.3s ease;
	}
</style>
