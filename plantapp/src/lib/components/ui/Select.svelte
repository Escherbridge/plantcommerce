<script lang="ts">
	interface Option {
		value: string;
		label: string;
	}

	interface Props {
		options: Option[];
		value?: string;
		placeholder?: string;
		class?: string;
		onchange?: (value: string) => void;
		disabled?: boolean;
		id?: string;
		name?: string;
	}

	let {
		options,
		value = $bindable(''),
		placeholder = 'Select...',
		class: className = '',
		onchange,
		disabled = false,
		id,
		name
	}: Props = $props();

	let open = $state(false);
	let wrapRef: HTMLDivElement;

	const selectedLabel = $derived(
		options.find((o) => o.value === value)?.label || placeholder
	);

	function toggle() {
		if (!disabled) open = !open;
	}

	function select(opt: Option) {
		value = opt.value;
		open = false;
		onchange?.(opt.value);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') open = false;
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			toggle();
		}
		if (e.key === 'ArrowDown' && open) {
			e.preventDefault();
			const idx = options.findIndex((o) => o.value === value);
			const next = options[Math.min(idx + 1, options.length - 1)];
			if (next) select(next);
		}
		if (e.key === 'ArrowUp' && open) {
			e.preventDefault();
			const idx = options.findIndex((o) => o.value === value);
			const prev = options[Math.max(idx - 1, 0)];
			if (prev) select(prev);
		}
	}

	function handleClickOutside(e: MouseEvent) {
		if (wrapRef && !wrapRef.contains(e.target as Node)) {
			open = false;
		}
	}
</script>

<svelte:window onclick={handleClickOutside} />

<!-- Hidden native select for form submission -->
{#if name}
	<select {name} {id} class="sr-only" tabindex="-1" aria-hidden="true">
		<option value="">{placeholder}</option>
		{#each options as opt}
			<option value={opt.value} selected={opt.value === value}>{opt.label}</option>
		{/each}
	</select>
{/if}

<div class="custom-select {className}" class:disabled bind:this={wrapRef}>
	<button
		type="button"
		class="custom-select__trigger"
		class:open
		class:has-value={!!value}
		onclick={toggle}
		onkeydown={handleKeydown}
		{disabled}
		aria-haspopup="listbox"
		aria-expanded={open}
		{id}
	>
		<span class="custom-select__label" class:placeholder={!value}>
			{selectedLabel}
		</span>
		<svg class="custom-select__chevron" class:open viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
			<polyline points="6 9 12 15 18 9"></polyline>
		</svg>
	</button>

	{#if open}
		<div class="custom-select__menu" role="listbox">
			{#each options as opt}
				<button
					type="button"
					class="custom-select__option"
					class:selected={opt.value === value}
					onclick={() => select(opt)}
					role="option"
					aria-selected={opt.value === value}
				>
					{opt.label}
					{#if opt.value === value}
						<svg class="custom-select__check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
							<polyline points="20 6 9 17 4 12"></polyline>
						</svg>
					{/if}
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.custom-select {
		position: relative;
		width: 100%;
	}

	.custom-select.disabled {
		opacity: 0.5;
		pointer-events: none;
	}

	/* ── Trigger button ── */
	.custom-select__trigger {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		min-height: 48px;
		padding: var(--input-padding-y, 0.75rem) var(--input-padding-x, 0.875rem);
		background: var(--input-bg);
		border: 1.5px solid var(--input-border);
		border-radius: var(--input-radius, 10px);
		font-family: var(--font-body);
		font-size: 1rem;
		color: oklch(var(--bc));
		cursor: pointer;
		backdrop-filter: blur(var(--glass-blur, 12px));
		-webkit-backdrop-filter: blur(var(--glass-blur, 12px));
		box-shadow: var(--shadow-glow-sm);
		transition:
			border-color 250ms var(--ease-out-expo),
			box-shadow 250ms var(--ease-out-expo),
			background 250ms ease;
		text-align: left;
	}

	.custom-select__trigger:hover {
		border-color: var(--input-border-hover);
		box-shadow: var(--shadow-glow-md);
	}

	.custom-select__trigger.open,
	.custom-select__trigger:focus-visible {
		border-color: var(--input-border-focus);
		box-shadow: var(--shadow-glow-focus);
		background: var(--glass-bg-strong);
		outline: none;
	}

	/* ── Label text ── */
	.custom-select__label {
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.custom-select__label.placeholder {
		color: oklch(var(--bc) / 0.4);
	}

	/* ── Chevron ── */
	.custom-select__chevron {
		width: 1rem;
		height: 1rem;
		flex-shrink: 0;
		margin-left: 0.5rem;
		color: oklch(var(--s));
		transition: transform 250ms var(--ease-out-expo);
	}

	.custom-select__chevron.open {
		transform: rotate(180deg);
	}

	/* ── Dropdown menu ── */
	.custom-select__menu {
		position: absolute;
		top: calc(100% + 6px);
		left: 0;
		right: 0;
		z-index: 50;
		background: var(--glass-bg-strong);
		backdrop-filter: blur(var(--glass-blur-strong, 20px));
		-webkit-backdrop-filter: blur(var(--glass-blur-strong, 20px));
		border: 1.5px solid var(--glass-border);
		border-radius: var(--input-radius, 10px);
		box-shadow: var(--shadow-glow-lg);
		padding: 0.375rem;
		max-height: 18rem;
		overflow-y: auto;
		overscroll-behavior: contain;

		/* Entry animation */
		animation: select-dropdown-in 200ms var(--ease-out-expo) both;
	}

	@keyframes select-dropdown-in {
		from {
			opacity: 0;
			transform: translateY(-6px) scale(0.97);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	/* ── Individual option ── */
	.custom-select__option {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		padding: 0.625rem 0.75rem;
		border: none;
		border-radius: calc(var(--input-radius, 10px) - 4px);
		background: transparent;
		font-family: var(--font-body);
		font-size: 0.9375rem;
		color: oklch(var(--bc));
		cursor: pointer;
		text-align: left;
		transition:
			background-color 150ms ease,
			color 150ms ease;
	}

	.custom-select__option:hover {
		background: oklch(var(--p) / 0.07);
	}

	.custom-select__option.selected {
		background: oklch(var(--p) / 0.1);
		color: oklch(var(--p));
		font-weight: 600;
	}

	.custom-select__option:focus-visible {
		outline: 2px solid oklch(var(--p) / 0.4);
		outline-offset: -2px;
	}

	/* ── Check icon ── */
	.custom-select__check {
		width: 1rem;
		height: 1rem;
		flex-shrink: 0;
		color: oklch(var(--p));
	}

	/* ── Scrollbar ── */
	.custom-select__menu::-webkit-scrollbar {
		width: 6px;
	}

	.custom-select__menu::-webkit-scrollbar-track {
		background: transparent;
	}

	.custom-select__menu::-webkit-scrollbar-thumb {
		background: oklch(var(--bc) / 0.15);
		border-radius: 3px;
	}

	.custom-select__menu::-webkit-scrollbar-thumb:hover {
		background: oklch(var(--bc) / 0.25);
	}
</style>
