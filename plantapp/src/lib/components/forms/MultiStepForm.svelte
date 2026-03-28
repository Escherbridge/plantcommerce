<script lang="ts">
	import type { MultiFormConfig, FormState } from './types.js';
	import BaseForm from './BaseForm.svelte';

	interface Props {
		config: MultiFormConfig;
		initialData?: Record<string, any>;
		className?: string;
	}

	let { config, initialData = {}, className = '' }: Props = $props();

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
		<div class="mb-10">
			<div class="mb-6 flex items-end justify-between">
				<div>
					<h2 class="mb-2 text-3xl font-bold text-primary">
						{currentStepConfig.title}
					</h2>
					{#if currentStepConfig.description}
						<p class="text-lg text-secondary">
							{currentStepConfig.description}
						</p>
					{/if}
				</div>
				<div class="text-right">
					<span class="text-3xl font-bold text-accent">
						{formState.currentStep + 1}
					</span>
					<span class="text-lg font-medium text-secondary">
						/ {config.steps.length}
					</span>
				</div>
			</div>

			<!-- Custom Progress Tracker -->
			<div class="relative pb-2 pt-4">
				<!-- Background Line -->
				<div
					class="absolute left-0 top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-info/30"
				></div>

				<!-- Active Progress Line -->
				<div
					class="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-primary transition-all duration-500 ease-out"
					style="width: {progressPercentage}%"
				></div>

				<!-- Step Indicators -->
				<div class="relative flex w-full justify-between">
					{#each config.steps as step, index}
						{@const isActive = index <= formState.currentStep}
						{@const isCurrent = index === formState.currentStep}

						<div class="group flex cursor-default flex-col items-center">
							<!-- Circle Indicator -->
							<div
								class="z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 bg-white transition-all duration-300
                  {isActive ? 'border-primary' : 'border-info'}
                  {isCurrent ? 'scale-125 shadow-lg ring-4 ring-primary/10' : ''}
                  {isActive && !isCurrent ? 'bg-primary' : ''}"
							>
								{#if isActive && !isCurrent}
									<svg
										class="h-4 w-4 text-white"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="3"
											d="M5 13l4 4L19 7"
										/>
									</svg>
								{:else if isCurrent}
									<div class="h-2.5 w-2.5 rounded-full bg-accent"></div>
								{/if}
							</div>

							<!-- Step Title -->
							<span
								class="absolute top-10 whitespace-nowrap text-xs font-semibold tracking-wide transition-colors duration-300
                {isCurrent ? 'text-primary' : 'text-secondary/70'}"
							>
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
			submitButtonText={isLastStep
				? config.submitButtonText || 'Submit'
				: config.nextButtonText || 'Next'}
			showSubmitButton={false}
			className="mb-6"
		/>
	</div>

	<!-- Navigation Buttons -->
	<div class="border-base-200 flex items-center justify-between border-t pt-6">
		<div>
			{#if canGoBack}
				<button
					type="button"
					class="btn btn-ghost"
					onclick={goToPrevStep}
					disabled={formState.isSubmitting}
				>
					<svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M15 19l-7-7 7-7"
						/>
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
					<svg class="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 5l7 7-7 7"
						/>
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
