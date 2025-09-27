<script lang="ts">
  import type { FormFieldConfig } from './types.js';

  interface Props {
    config: FormFieldConfig;
    onFileChange: (files: FileList) => void;
    error?: string;
  }

  let { config, onFileChange, error }: Props = $props();

  let dragOver = $state(false);
  let fileInput: HTMLInputElement = $state()!;
  let selectedFiles: FileList | null = $state(null);

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
    fileInput.click();
  }

  function removeFile(index: number) {
    if (!selectedFiles) return;
    
    const dt = new DataTransfer();
    for (let i = 0; i < selectedFiles.length; i++) {
      if (i !== index) {
        dt.items.add(selectedFiles[i]);
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
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  const isDragDrop = $derived(config.dragDrop ?? false);
  const isMultiple = $derived(config.multiple ?? false);
  const hasFiles = $derived(selectedFiles !== null && selectedFiles.length > 0);
</script>

<div class="w-full">
  {#if isDragDrop}
    <!-- Drag and Drop Interface -->
    <div
      class="border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer
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
          <svg class="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p class="text-primary font-medium">Drop files here</p>
        {:else}
          <svg class="w-12 h-12 text-base-content/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <div>
            <p class="text-lg font-medium mb-2">
              Drag and drop {isMultiple ? 'files' : 'a file'} here
            </p>
            <p class="text-base-content/60">
              or <span class="text-primary underline">browse to choose {isMultiple ? 'files' : 'a file'}</span>
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
      <button
        type="button"
        class="btn btn-outline btn-primary w-full"
        onclick={triggerFileInput}
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
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
        <p class="text-sm text-base-content/60 text-center">
          Accepted formats: {config.accept}
        </p>
      {/if}
    </div>
  {/if}

  <!-- Selected Files Display -->
  {#if hasFiles}
    <div class="mt-4">
      <h4 class="font-medium mb-2">
        Selected Files ({selectedFiles?.length})
      </h4>
      <div class="space-y-2">
        {#each Array.from(selectedFiles || []) as file, index}
          <div class="flex items-center justify-between p-3 bg-base-200 rounded-lg">
            <div class="flex items-center gap-3">
              <div class="w-2 h-2 bg-success rounded-full"></div>
              <div>
                <p class="font-medium text-sm">{file.name}</p>
                <p class="text-xs text-base-content/60">
                  {formatFileSize(file.size)} • {file.type || 'Unknown type'}
                </p>
              </div>
            </div>
            <button
              type="button"
              class="btn btn-ghost btn-sm btn-square"
              onclick={() => removeFile(index)}
              aria-label="Remove file {file.name}"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>
