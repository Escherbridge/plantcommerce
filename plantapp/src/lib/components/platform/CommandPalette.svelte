<script lang="ts">
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

	interface Props {
		userRole: 'admin' | 'customer' | 'affiliate' | 'instructor';
	}

	interface PalettePage {
		label: string;
		href: string;
		section: string;
		roles?: string[];
	}

	let { userRole }: Props = $props();

	let open = $state(false);
	let query = $state('');
	let selectedIndex = $state(0);
	let inputRef = $state<HTMLInputElement | null>(null);

	const STORAGE_KEY = 'cmdpalette-recent';

	const allPages: PalettePage[] = [
		{ label: 'Account Overview', href: '/account', section: 'Account' },
		{ label: 'My Orders', href: '/account/orders', section: 'Account' },
		{ label: 'My Wishlist', href: '/account/wishlist', section: 'Account' },
		{ label: 'Profile Settings', href: '/account/profile', section: 'Account' },
		{ label: 'Account Settings', href: '/account/settings', section: 'Account' },
		{ label: 'Browse Products', href: '/products', section: 'Shop' },
		{ label: 'Affiliate Dashboard', href: '/affiliate/dashboard', section: 'Affiliate', roles: ['affiliate', 'admin'] },
		{ label: 'Affiliate Links', href: '/affiliate/links', section: 'Affiliate', roles: ['affiliate', 'admin'] },
		{ label: 'Affiliate Earnings', href: '/affiliate/earnings', section: 'Affiliate', roles: ['affiliate', 'admin'] },
		{ label: 'Admin Dashboard', href: '/admin', section: 'Admin', roles: ['admin'] },
		{ label: 'Manage Products', href: '/admin/products', section: 'Admin', roles: ['admin'] },
		{ label: 'Manage Orders', href: '/admin/orders', section: 'Admin', roles: ['admin'] },
		{ label: 'Manage Users', href: '/admin/users', section: 'Admin', roles: ['admin'] },
		{ label: 'Analytics', href: '/admin/analytics', section: 'Admin', roles: ['admin'] }
	];

	const availablePages = $derived(
		allPages.filter((p) => !p.roles || p.roles.includes(userRole))
	);

	const filteredPages = $derived(
		query.trim()
			? availablePages.filter((p) =>
					p.label.toLowerCase().includes(query.toLowerCase())
				)
			: availablePages.slice(0, 6) // Quick links when no query
	);

	const groupedResults = $derived.by(() => {
		const groups: Record<string, PalettePage[]> = {};
		for (const page of filteredPages) {
			if (!groups[page.section]) groups[page.section] = [];
			groups[page.section].push(page);
		}
		return groups;
	});

	const flatResults = $derived(filteredPages);

	function getRecent(): PalettePage[] {
		if (!browser) return [];
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			return raw ? JSON.parse(raw) : [];
		} catch {
			return [];
		}
	}

	function saveRecent(page: PalettePage) {
		if (!browser) return;
		try {
			let recent = getRecent();
			recent = recent.filter((r) => r.href !== page.href);
			recent.unshift(page);
			if (recent.length > 5) recent = recent.slice(0, 5);
			localStorage.setItem(STORAGE_KEY, JSON.stringify(recent));
		} catch {
			// localStorage may be unavailable
		}
	}

	function selectResult(page: PalettePage) {
		saveRecent(page);
		open = false;
		query = '';
		goto(page.href);
	}

	function handleGlobalKeydown(e: KeyboardEvent) {
		if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
			e.preventDefault();
			open = !open;
			if (!open) query = '';
		}
	}

	function handleDialogKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			e.preventDefault();
			open = false;
			query = '';
			return;
		}

		if (e.key === 'ArrowDown') {
			e.preventDefault();
			selectedIndex = Math.min(selectedIndex + 1, flatResults.length - 1);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			selectedIndex = Math.max(selectedIndex - 1, 0);
		} else if (e.key === 'Enter' && flatResults[selectedIndex]) {
			e.preventDefault();
			selectResult(flatResults[selectedIndex]);
		}
	}

	// Reset selected index when results change
	$effect(() => {
		// Access flatResults.length to track it
		void flatResults.length;
		selectedIndex = 0;
	});

	// Focus input when opened
	$effect(() => {
		if (open && inputRef) {
			// Use tick-like delay so the element is rendered
			requestAnimationFrame(() => inputRef?.focus());
		}
	});

	// Global listener
	$effect(() => {
		if (!browser) return;
		document.addEventListener('keydown', handleGlobalKeydown);
		return () => document.removeEventListener('keydown', handleGlobalKeydown);
	});

	// Lock body scroll when open
	$effect(() => {
		if (!browser) return;
		if (open) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}
		return () => {
			document.body.style.overflow = '';
		};
	});

	function sectionIcon(section: string): string {
		switch (section) {
			case 'Account':
				return 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z';
			case 'Shop':
				return 'M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0';
			case 'Affiliate':
				return 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75';
			case 'Admin':
				return 'M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2zm10-10V7a4 4 0 0 0-8 0v4h8z';
			default:
				return 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M9 5h6';
		}
	}

	let flatIndex = 0;
</script>

{#if open}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="palette-overlay" onkeydown={handleDialogKeydown} onclick={() => { open = false; query = ''; }}>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<!-- svelte-ignore a11y_interactive_supports_focus -->
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div class="palette-dialog" onclick={(e) => e.stopPropagation()} role="dialog" aria-label="Command palette">
			<div class="palette-input-wrap">
				<svg class="search-icon" viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
					<circle cx="11" cy="11" r="8" />
					<line x1="21" y1="21" x2="16.65" y2="16.65" />
				</svg>
				<input
					bind:this={inputRef}
					bind:value={query}
					type="text"
					class="palette-input"
					placeholder="Search pages, products, orders..."
					autocomplete="off"
					spellcheck="false"
				/>
			</div>

			<div class="palette-results">
				{#if !query.trim() && getRecent().length > 0}
					<div class="result-section">
						<div class="section-label">Recent</div>
						{#each getRecent() as page, i}
							{@const idx = i}
							<button
								class="result-item"
								class:result-item--selected={selectedIndex === idx}
								onclick={() => selectResult(page)}
								onmouseenter={() => (selectedIndex = idx)}
							>
								<svg class="result-icon" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
									<path d="{sectionIcon(page.section)}" />
								</svg>
								<span class="result-label">{page.label}</span>
								<span class="result-badge">{page.section}</span>
							</button>
						{/each}
					</div>
				{/if}

				{#each Object.entries(groupedResults) as [section, pages]}
					<div class="result-section">
						<div class="section-label">{query.trim() ? section : 'Quick Links'}</div>
						{#each pages as page}
							{@const currentFlatIndex = flatResults.indexOf(page)}
							<button
								class="result-item"
								class:result-item--selected={selectedIndex === currentFlatIndex}
								onclick={() => selectResult(page)}
								onmouseenter={() => (selectedIndex = currentFlatIndex)}
							>
								<svg class="result-icon" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
									<path d="{sectionIcon(section)}" />
								</svg>
								<span class="result-label">{page.label}</span>
								<span class="result-badge">{section}</span>
							</button>
						{/each}
					</div>
				{/each}

				{#if query.trim() && filteredPages.length === 0}
					<div class="empty-state">No results for "{query}"</div>
				{/if}
			</div>

			<div class="palette-footer">
				<span class="footer-hint">
					<kbd>Esc</kbd> to close
					<span class="footer-sep">|</span>
					<kbd>Up/Down</kbd> to navigate
					<span class="footer-sep">|</span>
					<kbd>Enter</kbd> to select
				</span>
			</div>
		</div>
	</div>
{/if}

<style>
	.palette-overlay {
		position: fixed;
		inset: 0;
		z-index: 100;
		display: flex;
		align-items: flex-start;
		justify-content: center;
		padding-top: 12vh;
		background: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(8px);
		animation: overlay-in 150ms ease;
	}

	@keyframes overlay-in {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	@media (prefers-reduced-motion: reduce) {
		.palette-overlay {
			animation: none;
		}
		.palette-dialog {
			animation: none;
		}
	}

	.palette-dialog {
		width: min(32rem, 90vw);
		background: oklch(var(--b1));
		border: 1.5px solid var(--input-border);
		border-radius: var(--radius-lg, 16px);
		box-shadow: var(--shadow-glow-lg);
		display: flex;
		flex-direction: column;
		max-height: 60vh;
		animation: dialog-in 150ms ease;
	}

	@keyframes dialog-in {
		from {
			opacity: 0;
			transform: scale(0.96) translateY(-8px);
		}
		to {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}

	.palette-input-wrap {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.875rem 1rem;
		border-bottom: 1px solid var(--input-border);
	}

	.search-icon {
		color: oklch(var(--bc) / 0.4);
		flex-shrink: 0;
	}

	.palette-input {
		flex: 1;
		border: none;
		outline: none;
		background: transparent;
		font-size: 1.125rem;
		color: oklch(var(--bc));
		font-family: inherit;
	}

	.palette-input::placeholder {
		color: oklch(var(--bc) / 0.35);
	}

	.palette-results {
		flex: 1;
		overflow-y: auto;
		padding: 0.5rem 0;
	}

	.result-section {
		padding: 0.25rem 0;
	}

	.section-label {
		padding: 0.375rem 1rem;
		font-size: 0.6875rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: oklch(var(--bc) / 0.4);
	}

	.result-item {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		width: 100%;
		padding: 0.5rem 1rem;
		border: none;
		background: transparent;
		color: oklch(var(--bc));
		font-size: 0.875rem;
		cursor: pointer;
		text-align: left;
		transition: background 100ms ease;
		font-family: inherit;
	}

	.result-item:hover,
	.result-item--selected {
		background: oklch(var(--p) / 0.06);
	}

	.result-item:focus-visible {
		outline: none;
		box-shadow: var(--shadow-glow-focus);
	}

	.result-icon {
		flex-shrink: 0;
		color: oklch(var(--bc) / 0.5);
	}

	.result-label {
		flex: 1;
	}

	.result-badge {
		font-size: 0.6875rem;
		font-weight: 500;
		padding: 0.125rem 0.5rem;
		border-radius: 9999px;
		background: oklch(var(--bc) / 0.06);
		color: oklch(var(--bc) / 0.5);
	}

	.empty-state {
		padding: 2rem 1rem;
		text-align: center;
		color: oklch(var(--bc) / 0.45);
		font-size: 0.875rem;
	}

	.palette-footer {
		padding: 0.5rem 1rem;
		border-top: 1px solid var(--input-border);
		text-align: center;
	}

	.footer-hint {
		font-size: 0.6875rem;
		color: oklch(var(--bc) / 0.4);
	}

	.footer-sep {
		margin: 0 0.375rem;
		color: oklch(var(--bc) / 0.2);
	}

	kbd {
		display: inline-block;
		padding: 0.0625rem 0.375rem;
		border: 1px solid oklch(var(--bc) / 0.15);
		border-radius: 4px;
		background: oklch(var(--bc) / 0.04);
		font-family: inherit;
		font-size: 0.625rem;
		font-weight: 500;
		color: oklch(var(--bc) / 0.55);
	}
</style>
