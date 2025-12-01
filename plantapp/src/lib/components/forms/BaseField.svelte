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
</script>

<div class="form-control w-full {config.containerClassName || ''}">
	<label class="label" for={config.id}>
		<span class="label-text text-base font-semibold text-[#1D3557]">
			{config.label}
			{#if config.required}
				<span class="ml-1 text-[#E63946]">*</span>
			{/if}
		</span>
	</label>

	{#if config.type === 'textarea'}
		<textarea
			id={config.id}
			name={config.name}
			class="textarea w-full rounded-lg border-2 bg-white px-4 py-3 text-base transition-all duration-300
             {hasError
				? 'border-[#E63946] focus:border-[#E63946] focus:ring-2 focus:ring-[#E63946]/20'
				: 'border-[#A8DADC] hover:border-[#457B9D] focus:border-[#457B9D] focus:ring-2 focus:ring-[#457B9D]/20'}
             shadow-sm focus:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
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
			class="select w-full rounded-lg border-2 bg-white px-4 py-3 text-base transition-all duration-300
             {hasError
				? 'border-[#E63946] focus:border-[#E63946] focus:ring-2 focus:ring-[#E63946]/20'
				: 'border-[#A8DADC] hover:border-[#457B9D] focus:border-[#457B9D] focus:ring-2 focus:ring-[#457B9D]/20'}
             cursor-pointer shadow-sm focus:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
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
		<label
			class="label hover:bg-base-200/50 cursor-pointer justify-start gap-4 rounded-lg px-2 py-3 transition-colors"
		>
			<input
				type="checkbox"
				id={config.id}
				name={config.name}
				class="checkbox checkbox-lg border-2 transition-all duration-300
               {hasError
					? 'checkbox-error border-[#E63946]'
					: 'border-[#457B9D] checked:border-[#457B9D]'}
               hover:scale-110"
				required={config.required}
				disabled={config.disabled}
				checked={value}
				onchange={handleChange}
			/>
			<span class="label-text text-base font-medium text-[#1D3557]">{config.placeholder}</span>
		</label>
	{:else if config.type === 'radio'}
		<div class="flex flex-col gap-3">
			{#each config.options || [] as option}
				<label
					class="label hover:bg-base-200/50 cursor-pointer justify-start gap-4 rounded-lg px-2 py-3 transition-colors"
				>
					<input
						type="radio"
						name={config.name}
						value={option.value}
						class="radio radio-lg border-2 transition-all duration-300
                   {hasError
							? 'radio-error border-[#E63946]'
							: 'border-[#457B9D] checked:border-[#457B9D]'}
                   hover:scale-110"
						required={config.required}
						disabled={config.disabled}
						checked={value === option.value}
						onchange={handleChange}
					/>
					<span class="label-text text-base font-medium text-[#1D3557]">{option.label}</span>
				</label>
			{/each}
		</div>
	{:else if config.type === 'file' || config.type === 'multifile'}
		<FileUpload {config} onFileChange={handleFileChange} {error} />
	{:else if config.type === 'richtext'}
		<RichTextEditor {config} {value} onChange={handleRichTextChange} {error} />
	{:else if config.type === 'date' || config.type === 'datetime-local' || config.type === 'time'}
		<DatePicker {config} {value} onChange={handleDateChange} {error} />
	{:else}
		<input
			type={config.type}
			id={config.id}
			name={config.name}
			class="input w-full rounded-lg border-2 bg-white px-4 py-3 text-base transition-all duration-300
             {hasError
				? 'border-[#E63946] focus:border-[#E63946] focus:ring-2 focus:ring-[#E63946]/20'
				: 'border-[#A8DADC] hover:border-[#457B9D] focus:border-[#457B9D] focus:ring-2 focus:ring-[#457B9D]/20'}
             shadow-sm placeholder:text-gray-400 focus:shadow-md disabled:cursor-not-allowed
             disabled:opacity-50"
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
			<span class="label-text-alt mt-1 flex items-center gap-1 font-medium text-[#E63946]">
				<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
					<path
						fill-rule="evenodd"
						d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
						clip-rule="evenodd"
					/>
				</svg>
				{error}
			</span>
		</div>
	{/if}
</div>
