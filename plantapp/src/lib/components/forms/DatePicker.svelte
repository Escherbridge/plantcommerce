<script lang="ts">
  import type { FormFieldConfig } from './types.js';
  import { onMount } from 'svelte';

  interface Props {
    config: FormFieldConfig;
    value?: string;
    onChange: (date: string) => void;
    error?: string;
  }

  let { config, value = '', onChange, error }: Props = $props();

  let inputElement: HTMLInputElement;
  let flatpickrInstance: any = null;
  let internalValue = $state(value);

  // Configuration based on input type
  const flatpickrConfig = $derived({
    enableTime: config.type === 'datetime-local' || config.type === 'time',
    noCalendar: config.type === 'time',
    dateFormat: getDateFormat(),
    time_24hr: true,
    allowInput: true,
    onChange: (selectedDates: Date[], dateStr: string) => {
      internalValue = dateStr;
      onChange(dateStr);
    }
  });

  function getDateFormat(): string {
    switch (config.type) {
      case 'datetime-local':
        return 'Y-m-d H:i';
      case 'time':
        return 'H:i';
      case 'date':
      default:
        return 'Y-m-d';
    }
  }

  onMount(async () => {
    try {
      // Try to load Flatpickr dynamically
      // Note: Flatpickr would need to be installed separately
      // const flatpickr = await import('flatpickr');
      throw new Error('Flatpickr not available');
      
      // flatpickrInstance = flatpickr.default(inputElement, flatpickrConfig);

      // Set initial value
      // if (value) {
      //   flatpickrInstance.setDate(value, false);
      // }

      return;
    } catch (err) {
      console.warn('Flatpickr not available, using native date input:', err);
    }
  });

  function handleNativeInput(event: Event) {
    const target = event.target as HTMLInputElement;
    internalValue = target.value;
    onChange(target.value);
  }

  // Update internal value when prop changes
  $effect(() => {
    if (value !== internalValue) {
      internalValue = value;
      if (flatpickrInstance) {
        flatpickrInstance.setDate(value, false);
      }
    }
  });
</script>

<div class="date-picker-container">
  <input
    bind:this={inputElement}
    type={config.type}
    id={config.id}
    name={config.name}
    class="input input-bordered w-full {error ? 'input-error' : ''}"
    placeholder={config.placeholder}
    required={config.required}
    disabled={config.disabled}
    value={internalValue}
    oninput={handleNativeInput}
    min={config.validation?.min?.toString()}
    max={config.validation?.max?.toString()}
  />
</div>

<style>
  :global(.flatpickr-calendar) {
    font-family: inherit !important;
    border-radius: 0.5rem !important;
    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1) !important;
  }
  
  :global(.flatpickr-day.selected) {
    background: hsl(var(--p)) !important;
    border-color: hsl(var(--p)) !important;
  }
  
  :global(.flatpickr-day.selected:hover) {
    background: hsl(var(--p)) !important;
    border-color: hsl(var(--p)) !important;
  }
  
  :global(.flatpickr-day:hover) {
    background: hsl(var(--b2)) !important;
  }
  
  :global(.flatpickr-current-month .flatpickr-monthDropdown-months) {
    background: hsl(var(--b1)) !important;
  }
  
  :global(.flatpickr-time input) {
    background: hsl(var(--b1)) !important;
    color: hsl(var(--bc)) !important;
  }
</style>
