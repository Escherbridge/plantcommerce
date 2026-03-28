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

	let { config, value = $bindable(), error, touched = false, onInput, onChange }: Props = $props();

	let focused = $state(false);

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
	const hasValue = $derived(value !== undefined && value !== null && value !== '');
	const labelFloat = $derived(focused || hasValue);
</script>

<style>
	/* ── Base field wrapper ── */
	.field-wrap {
		position: relative;
		width: 100%;
	}

	/* ── Floating label ── */
	.field-label {
		position: absolute;
		left: 0;
		top: 50%;
		transform: translateY(-50%);
		font-family: var(--font-sans, 'Inter', sans-serif);
		font-size: 1rem;
		font-weight: 600;
		color: oklch(var(--p));
		pointer-events: none;
		transition:
			transform 200ms var(--ease-out-expo, cubic-bezier(0.19, 1, 0.22, 1)),
			font-size 200ms var(--ease-out-expo, cubic-bezier(0.19, 1, 0.22, 1)),
			color 200ms ease;
	}

	.field-label--float {
		transform: translateY(-2rem) scale(0.8);
		transform-origin: left top;
		font-size: 0.875rem;
		color: oklch(var(--p) / 0.7);
	}

	.field-label--error {
		color: oklch(var(--er));
	}

	/* Textarea label starts at top, not middle */
	.field-label--textarea {
		top: 1rem;
		transform: translateY(0);
	}

	.field-label--textarea.field-label--float {
		transform: translateY(-1.5rem) scale(0.8);
	}

	/* ── Bottom-border input ── */
	.field-input {
		display: block;
		width: 100%;
		min-height: 44px;
		background: transparent;
		border: none;
		border-bottom: 2px solid oklch(var(--b3));
		border-radius: 0;
		padding: 0.5rem 0 0.375rem 0;
		font-family: var(--font-sans, 'Inter', sans-serif);
		font-size: 1rem;
		color: oklch(var(--bc));
		outline: none;
		transition: border-color 200ms ease;
	}

	.field-input:focus {
		border-bottom-color: oklch(var(--p));
	}

	.field-input--error {
		border-bottom-color: oklch(var(--er));
		animation: field-shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
	}

	.field-input:disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}

	/* Textarea specifics */
	.field-input--textarea {
		resize: vertical;
		min-height: 96px;
		padding-top: 0.75rem;
	}

	/* ── Select ── */
	.field-select {
		appearance: none;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 0.25rem center;
		padding-right: 1.75rem;
		cursor: pointer;
	}

	/* ── Checkbox / Radio ── */
	.field-check-wrap {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.625rem 0;
		min-height: 44px;
		cursor: pointer;
	}

	.field-check {
		appearance: none;
		width: 1.25rem;
		height: 1.25rem;
		min-width: 1.25rem;
		border: 2px solid oklch(var(--p) / 0.5);
		border-radius: var(--radius-sm, 0.25rem);
		background: transparent;
		cursor: pointer;
		position: relative;
		transition:
			border-color 200ms ease,
			background-color 200ms ease;
	}

	.field-radio {
		border-radius: 50%;
	}

	.field-check:checked {
		background-color: oklch(var(--p));
		border-color: oklch(var(--p));
	}

	/* Checkmark SVG via pseudo */
	.field-check:not(.field-radio):checked::after {
		content: '';
		position: absolute;
		inset: 0;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 10' fill='none'%3E%3Cpath d='M1 5l3.5 3.5L11 1' stroke='%23fff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: center;
		background-size: 70%;
	}

	/* Radio dot */
	.field-radio:checked::after {
		content: '';
		position: absolute;
		inset: 3px;
		background-color: oklch(var(--pc));
		border-radius: 50%;
	}

	.field-check--error {
		border-color: oklch(var(--er));
	}

	.field-check:focus-visible {
		outline: 2px solid oklch(var(--a));
		outline-offset: 2px;
	}

	.field-check-label {
		font-family: var(--font-sans, 'Inter', sans-serif);
		font-size: 1rem;
		font-weight: 500;
		color: oklch(var(--p));
	}

	/* ── Error message ── */
	.field-error {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		margin-top: 0.375rem;
		font-family: var(--font-sans, 'Inter', sans-serif);
		font-size: 0.75rem;
		font-weight: 500;
		color: oklch(var(--er));
	}

	/* ── Required asterisk ── */
	.field-required {
		color: oklch(var(--er));
		margin-left: 0.25rem;
	}

	/* ── Shake animation ── */
	@keyframes field-shake {
		0%, 100% { transform: translateX(0); }
		15% { transform: translateX(-6px); }
		30% { transform: translateX(5px); }
		45% { transform: translateX(-4px); }
		60% { transform: translateX(3px); }
		75% { transform: translateX(-2px); }
		90% { transform: translateX(1px); }
	}

	/* ── Outer container spacing for float label ── */
	.field-outer {
		padding-top: 1.5rem;
		width: 100%;
	}

	.field-outer--inline {
		padding-top: 0;
	}
</style>

<div class="form-control w-full {config.containerClassName || ''}">
	{#if config.type === 'textarea'}
		<div class="field-outer">
			<div class="field-wrap">
				<textarea
					id={config.id}
					name={config.name}
					class="field-input field-input--textarea {hasError ? 'field-input--error' : ''}"
					placeholder=" "
					required={config.required}
					disabled={config.disabled}
					bind:value
					oninput={handleInput}
					onchange={handleChange}
					onfocus={() => (focused = true)}
					onblur={() => (focused = false)}
					minlength={config.validation?.minLength}
					maxlength={config.validation?.maxLength}
				></textarea>
				<label
					class="field-label field-label--textarea {labelFloat ? 'field-label--float' : ''} {hasError ? 'field-label--error' : ''}"
					for={config.id}
				>
					{config.label}{#if config.required}<span class="field-required">*</span>{/if}
				</label>
			</div>
		</div>

	{:else if config.type === 'select'}
		<div class="field-outer">
			<div class="field-wrap">
				<select
					id={config.id}
					name={config.name}
					class="field-input field-select {hasError ? 'field-input--error' : ''}"
					required={config.required}
					disabled={config.disabled}
					bind:value
					onchange={handleChange}
					onfocus={() => (focused = true)}
					onblur={() => (focused = false)}
				>
					{#if config.placeholder}
						<option value="" disabled selected={!value}> </option>
					{/if}
					{#each config.options || [] as option}
						<option value={option.value}>{option.label}</option>
					{/each}
				</select>
				<label
					class="field-label {labelFloat ? 'field-label--float' : ''} {hasError ? 'field-label--error' : ''}"
					for={config.id}
				>
					{config.label}{#if config.required}<span class="field-required">*</span>{/if}
				</label>
			</div>
		</div>

	{:else if config.type === 'checkbox'}
		<div class="field-outer--inline">
			<label class="field-check-wrap">
				<input
					type="checkbox"
					id={config.id}
					name={config.name}
					class="field-check {hasError ? 'field-check--error' : ''}"
					required={config.required}
					disabled={config.disabled}
					checked={value}
					onchange={handleChange}
				/>
				<span class="field-check-label">
					{config.placeholder || config.label}
					{#if config.required}<span class="field-required">*</span>{/if}
				</span>
			</label>
		</div>

	{:else if config.type === 'radio'}
		<div class="field-outer">
			<p class="font-sans text-base font-semibold text-primary mb-2">
				{config.label}{#if config.required}<span class="field-required">*</span>{/if}
			</p>
			<div class="flex flex-col gap-1">
				{#each config.options || [] as option}
					<label class="field-check-wrap">
						<input
							type="radio"
							name={config.name}
							value={option.value}
							class="field-check field-radio {hasError ? 'field-check--error' : ''}"
							required={config.required}
							disabled={config.disabled}
							checked={value === option.value}
							onchange={handleChange}
						/>
						<span class="field-check-label">{option.label}</span>
					</label>
				{/each}
			</div>
		</div>

	{:else if config.type === 'file' || config.type === 'multifile'}
		<FileUpload {config} onFileChange={handleFileChange} {error} />

	{:else if config.type === 'richtext'}
		<RichTextEditor {config} {value} onChange={handleRichTextChange} {error} />

	{:else if config.type === 'date' || config.type === 'datetime-local' || config.type === 'time'}
		<DatePicker {config} {value} onChange={handleDateChange} {error} />

	{:else}
		<div class="field-outer">
			<div class="field-wrap">
				<input
					type={config.type}
					id={config.id}
					name={config.name}
					class="field-input {hasError ? 'field-input--error' : ''}"
					placeholder=" "
					required={config.required}
					disabled={config.disabled}
					bind:value
					oninput={handleInput}
					onchange={handleChange}
					onfocus={() => (focused = true)}
					onblur={() => (focused = false)}
					min={config.validation?.min}
					max={config.validation?.max}
					minlength={config.validation?.minLength}
					maxlength={config.validation?.maxLength}
					pattern={config.validation?.pattern}
					accept={config.accept}
				/>
				<label
					class="field-label {labelFloat ? 'field-label--float' : ''} {hasError ? 'field-label--error' : ''}"
					for={config.id}
				>
					{config.label}{#if config.required}<span class="field-required">*</span>{/if}
				</label>
			</div>
		</div>
	{/if}

	{#if hasError}
		<div class="field-error">
			<svg class="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
				<path
					fill-rule="evenodd"
					d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
					clip-rule="evenodd"
				/>
			</svg>
			{error}
		</div>
	{/if}
</div>
