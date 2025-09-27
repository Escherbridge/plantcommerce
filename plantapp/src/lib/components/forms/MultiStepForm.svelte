<script lang="ts">
  import type { MultiFormConfig, FormState } from './types.js';
  import BaseForm from './BaseForm.svelte';

  interface Props {
    config: MultiFormConfig;
    initialData?: Record<string, any>;
    className?: string;
  }

  let {
    config,
    initialData = {},
    className = ''
  }: Props = $props();

  let formState: FormState = $state({
    data: { ...initialData },
    errors: {},
    touched: {},
    isSubmitting: false,
    currentStep: 0
  });

  function goToStep(stepIndex: number) {
    if (stepIndex >= 0 && stepIndex < config.steps.length) {
      formState.currentStep = stepIndex;
      config.onStepChange?.(stepIndex, formState.data);
    }
  }

  function goToNextStep() {
    const nextStep = formState.currentStep + 1;
    if (nextStep < config.steps.length) {
      goToStep(nextStep);
    }
  }

  function goToPrevStep() {
    if (config.allowBackNavigation !== false) {
      const prevStep = formState.currentStep - 1;
      if (prevStep >= 0) {
        goToStep(prevStep);
      }
    }
  }

  async function handleStepSubmit(stepData: Record<string, any>) {
    // Update form data with current step data
    formState.data = { ...formState.data, ...stepData };

    const currentStepConfig = config.steps[formState.currentStep];
    
    // Run step validation if provided
    if (currentStepConfig.validation) {
      const validationResult = currentStepConfig.validation(formState.data);
      if (!validationResult.isValid) {
        formState.errors = validationResult.errors;
        return;
      }
    }

    // Clear errors for current step
    formState.errors = {};

    // If this is the last step, submit the entire form
    if (formState.currentStep === config.steps.length - 1) {
      try {
        formState.isSubmitting = true;
        await config.onSubmit(formState.data);
      } catch (error) {
        console.error('Multi-step form submission error:', error);
      } finally {
        formState.isSubmitting = false;
      }
    } else {
      // Move to next step
      goToNextStep();
    }
  }

  const currentStepConfig = $derived(config.steps[formState.currentStep]);
  const isFirstStep = $derived(formState.currentStep === 0);
  const isLastStep = $derived(formState.currentStep === config.steps.length - 1);
  const canGoBack = $derived(config.allowBackNavigation !== false && !isFirstStep);
  const progressPercentage = $derived(((formState.currentStep + 1) / config.steps.length) * 100);
</script>

<div class="multi-step-form {className}">
  <!-- Progress Indicator -->
  {#if config.showProgress !== false}
    <div class="mb-8">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold">
          {currentStepConfig.title}
        </h2>
        <span class="text-sm text-base-content/70">
          Step {formState.currentStep + 1} of {config.steps.length}
        </span>
      </div>
      
      {#if currentStepConfig.description}
        <p class="text-base-content/70 mb-4">
          {currentStepConfig.description}
        </p>
      {/if}

      <!-- Progress Bar -->
      <div class="relative">
        <progress 
          class="progress progress-primary w-full" 
          value={progressPercentage} 
          max="100"
        ></progress>
        
        <!-- Step Indicators -->
        <div class="flex justify-between absolute top-0 left-0 right-0 -mt-1">
          {#each config.steps as step, index}
            <div class="flex flex-col items-center">
              <div 
                class="w-4 h-4 rounded-full border-2 transition-all duration-200
                  {index <= formState.currentStep ? 'bg-primary border-primary' : 'bg-base-100 border-base-300'}
                  {index === formState.currentStep ? 'ring-4 ring-primary/20' : ''}"
              ></div>
              <span class="text-xs mt-2 text-center max-w-20 leading-tight
                {index === formState.currentStep ? 'text-primary font-medium' : 'text-base-content/60'}">
                {step.title}
              </span>
            </div>
          {/each}
        </div>
      </div>
    </div>
  {/if}

  <!-- Current Step Form -->
  <div class="step-content">
    <BaseForm
      fields={currentStepConfig.fields}
      initialData={formState.data}
      onSubmit={handleStepSubmit}
      submitButtonText={isLastStep ? (config.submitButtonText || 'Submit') : (config.nextButtonText || 'Next')}
      showSubmitButton={false}
      className="mb-6"
    />
  </div>

  <!-- Navigation Buttons -->
  <div class="flex justify-between items-center pt-6 border-t border-base-200">
    <div>
      {#if canGoBack}
        <button
          type="button"
          class="btn btn-ghost"
          onclick={goToPrevStep}
          disabled={formState.isSubmitting}
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          {config.prevButtonText || 'Previous'}
        </button>
      {/if}
    </div>

    <div>
      <button
        type="submit"
        class="btn btn-primary {formState.isSubmitting ? 'loading' : ''}"
        disabled={formState.isSubmitting}
        onclick={() => {
          // Trigger form submission by dispatching submit event to the BaseForm
          const form = document.querySelector('.step-content form') as HTMLFormElement;
          if (form) {
            form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
          }
        }}
      >
        {#if formState.isSubmitting}
          <span class="loading loading-spinner loading-sm"></span>
          Processing...
        {:else if isLastStep}
          {config.submitButtonText || 'Submit'}
        {:else}
          {config.nextButtonText || 'Next'}
          <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        {/if}
      </button>
    </div>
  </div>
</div>

<style>
  .multi-step-form {
    max-width: 100%;
  }
  
  .step-content {
    min-height: 400px;
  }
</style>
