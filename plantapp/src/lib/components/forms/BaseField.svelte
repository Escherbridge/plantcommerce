<script lang="ts">
  import type { FormFieldConfig } from './types.js';
  import FileUpload from './FileUpload.svelte';
  import RichTextEditor from './RichTextEditor.svelte';
  import DatePicker from './DatePicker.svelte';

  interface Props {
    config: FormFieldConfig;
    value?: any;
    error?: string;
    touched?: boolean;
    onInput?: (value: any) => void;
    onChange?: (value: any) => void;
  }

  let {
    config,
    value = $bindable(),
    error,
    touched = false,
    onInput,
    onChange
  }: Props = $props();

  function handleInput(event: Event) {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    let newValue: any;

    if (target.type === 'checkbox') {
      newValue = (target as HTMLInputElement).checked;
    } else if (target.type === 'number') {
      newValue = target.value ? Number(target.value) : null;
    } else {
      newValue = target.value;
    }

    value = newValue;
    onInput?.(newValue);
  }

  function handleChange(event: Event) {
    handleInput(event);
    onChange?.(value);
  }

  function handleRichTextChange(content: string) {
    value = content;
    onInput?.(content);
    onChange?.(content);
  }

  function handleFileChange(files: FileList) {
    if (config.fileHandler) {
      config.fileHandler(files);
    }
    value = files;
    onInput?.(files);
    onChange?.(files);
  }

  function handleDateChange(date: string) {
    value = date;
    onInput?.(date);
    onChange?.(date);
  }

  const hasError = $derived(touched && error);
  const inputClass = $derived(`input input-bordered w-full ${hasError ? 'input-error' : ''}`);
  const textareaClass = $derived(`textarea textarea-bordered w-full ${hasError ? 'textarea-error' : ''}`);
  const selectClass = $derived(`select select-bordered w-full ${hasError ? 'select-error' : ''}`);
</script>

<div class="form-control w-full {config.containerClassName || ''}">
  <label class="label" for={config.id}>
    <span class="label-text font-medium">
      {config.label}
      {#if config.required}
        <span class="text-error">*</span>
      {/if}
    </span>
  </label>

  {#if config.type === 'textarea'}
    <textarea
      id={config.id}
      name={config.name}
      class={textareaClass}
      placeholder={config.placeholder}
      required={config.required}
      disabled={config.disabled}
      bind:value
      oninput={handleInput}
      onchange={handleChange}
      minlength={config.validation?.minLength}
      maxlength={config.validation?.maxLength}
    ></textarea>

  {:else if config.type === 'select'}
    <select
      id={config.id}
      name={config.name}
      class={selectClass}
      required={config.required}
      disabled={config.disabled}
      bind:value
      onchange={handleChange}
    >
      {#if config.placeholder}
        <option value="" disabled selected={!value}>
          {config.placeholder}
        </option>
      {/if}
      {#each config.options || [] as option}
        <option value={option.value}>
          {option.label}
        </option>
      {/each}
    </select>

  {:else if config.type === 'checkbox'}
    <label class="label cursor-pointer justify-start gap-4">
      <input
        type="checkbox"
        id={config.id}
        name={config.name}
        class="checkbox {hasError ? 'checkbox-error' : ''}"
        required={config.required}
        disabled={config.disabled}
        checked={value}
        onchange={handleChange}
      />
      <span class="label-text">{config.placeholder}</span>
    </label>

  {:else if config.type === 'radio'}
    <div class="flex flex-col gap-2">
      {#each config.options || [] as option}
        <label class="label cursor-pointer justify-start gap-4">
          <input
            type="radio"
            name={config.name}
            value={option.value}
            class="radio {hasError ? 'radio-error' : ''}"
            required={config.required}
            disabled={config.disabled}
            checked={value === option.value}
            onchange={handleChange}
          />
          <span class="label-text">{option.label}</span>
        </label>
      {/each}
    </div>

  {:else if config.type === 'file' || config.type === 'multifile'}
    <FileUpload
      {config}
      onFileChange={handleFileChange}
      {error}
    />

  {:else if config.type === 'richtext'}
    <RichTextEditor
      {config}
      {value}
      onChange={handleRichTextChange}
      {error}
    />

  {:else if config.type === 'date' || config.type === 'datetime-local' || config.type === 'time'}
    <DatePicker
      {config}
      {value}
      onChange={handleDateChange}
      {error}
    />

  {:else}
    <input
      type={config.type}
      id={config.id}
      name={config.name}
      class={inputClass}
      placeholder={config.placeholder}
      required={config.required}
      disabled={config.disabled}
      bind:value
      oninput={handleInput}
      onchange={handleChange}
      min={config.validation?.min}
      max={config.validation?.max}
      minlength={config.validation?.minLength}
      maxlength={config.validation?.maxLength}
      pattern={config.validation?.pattern}
      accept={config.accept}
    />
  {/if}

  {#if hasError}
    <div class="label">
      <span class="label-text-alt text-error">{error}</span>
    </div>
  {/if}
</div>
