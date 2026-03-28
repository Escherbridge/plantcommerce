<script lang="ts">
  import type { FormFieldConfig, FormState } from './types.js';
  import BaseField from './BaseField.svelte';

  interface Props {
    fields: FormFieldConfig[];
    initialData?: Record<string, any>;
    onSubmit: (data: Record<string, any>) => void | Promise<void>;
    submitButtonText?: string;
    showSubmitButton?: boolean;
    className?: string;
    resetOnSubmit?: boolean;
  }

  let {
    fields,
    initialData = {},
    onSubmit,
    submitButtonText = 'Submit',
    showSubmitButton = true,
    className = '',
    resetOnSubmit = false
  }: Props = $props();

  let formState: FormState = $state({
    data: { ...initialData },
    errors: {},
    touched: {},
    isSubmitting: false,
    currentStep: 0
  });

  function validateField(field: FormFieldConfig, value: any): string | null {
    // Required validation
    if (field.required && (!value || value === '')) {
      return `${field.label} is required`;
    }

    // Type specific validation
    if (value && field.validation) {
      const validation = field.validation;

      // Length validation
      if (typeof value === 'string') {
        if (validation.minLength && value.length < validation.minLength) {
          return `${field.label} must be at least ${validation.minLength} characters`;
        }
        if (validation.maxLength && value.length > validation.maxLength) {
          return `${field.label} must not exceed ${validation.maxLength} characters`;
        }
      }

      // Number validation
      if (typeof value === 'number') {
        if (validation.min !== undefined && value < validation.min) {
          return `${field.label} must be at least ${validation.min}`;
        }
        if (validation.max !== undefined && value > validation.max) {
          return `${field.label} must not exceed ${validation.max}`;
        }
      }

      // Pattern validation
      if (validation.pattern && typeof value === 'string') {
        const regex = new RegExp(validation.pattern);
        if (!regex.test(value)) {
          return `${field.label} format is invalid`;
        }
      }

      // Custom validation
      if (validation.customValidation) {
        return validation.customValidation(value);
      }
    }

    return null;
  }

  function validateAllFields(): boolean {
    const errors: Record<string, string> = {};
    let isValid = true;

    for (const field of fields) {
      // Skip validation for fields that should be hidden
      if (field.showWhen && !field.showWhen(formState.data)) {
        continue;
      }

      const error = validateField(field, formState.data[field.name]);
      if (error) {
        errors[field.name] = error;
        isValid = false;
      }
    }

    formState.errors = errors;
    return isValid;
  }

  function handleFieldInput(fieldName: string, value: any) {
    formState.data[fieldName] = value;
    
    // Clear error when user starts typing
    if (formState.errors[fieldName]) {
      const newErrors = { ...formState.errors };
      delete newErrors[fieldName];
      formState.errors = newErrors;
    }
  }

  function handleFieldChange(fieldName: string, value: any) {
    formState.data[fieldName] = value;
    formState.touched[fieldName] = true;

    // Validate field on change
    const field = fields.find(f => f.name === fieldName);
    if (field) {
      const error = validateField(field, value);
      if (error) {
        formState.errors[fieldName] = error;
      } else {
        const newErrors = { ...formState.errors };
        delete newErrors[fieldName];
        formState.errors = newErrors;
      }
    }
  }

  async function handleSubmit(event: Event) {
    event.preventDefault();
    
    if (formState.isSubmitting) return;

    // Mark all fields as touched
    const touched: Record<string, boolean> = {};
    fields.forEach(field => {
      touched[field.name] = true;
    });
    formState.touched = touched;

    // Validate all fields
    const isValid = validateAllFields();
    
    if (!isValid) return;

    try {
      formState.isSubmitting = true;
      await onSubmit(formState.data);
      
      if (resetOnSubmit) {
        formState.data = { ...initialData };
        formState.errors = {};
        formState.touched = {};
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      formState.isSubmitting = false;
    }
  }

  const visibleFields = $derived(fields.filter(field => 
    !field.showWhen || field.showWhen(formState.data)
  ));
</script>

<form
  class="space-y-7 {className}"
  onsubmit={handleSubmit}
  novalidate
>
  {#each visibleFields as field (field.id)}
    <BaseField
      config={field}
      bind:value={formState.data[field.name]}
      error={formState.errors[field.name]}
      touched={formState.touched[field.name]}
      onInput={(value) => handleFieldInput(field.name, value)}
      onChange={(value) => handleFieldChange(field.name, value)}
    />
  {/each}

  {#if showSubmitButton}
    <div class="flex justify-end pt-4">
      <button
        type="submit"
        class="btn btn-primary {formState.isSubmitting ? 'loading' : ''}"
        disabled={formState.isSubmitting}
      >
        {#if formState.isSubmitting}
          <span class="loading loading-spinner loading-sm"></span>
          Processing...
        {:else}
          {submitButtonText}
        {/if}
      </button>
    </div>
  {/if}
</form>
