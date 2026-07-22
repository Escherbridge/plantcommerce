<script lang="ts">
	interface Props {
		path: string;
		overrides?: Record<string, string>;
	}

	const { path, overrides = {} }: Props = $props();

	function toTitleCase(segment: string): string {
		return segment
			.split('-')
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ');
	}

	interface BreadcrumbItem {
		label: string;
		href: string | null;
	}

	const items: BreadcrumbItem[] = $derived.by(() => {
		const segments = path.split('/').filter(Boolean);
		return segments.map((segment, index) => {
			const label = overrides[segment] ?? toTitleCase(segment);
			const isLast = index === segments.length - 1;
			const href = isLast ? null : '/' + segments.slice(0, index + 1).join('/');
			return { label, href };
		});
	});
</script>

<nav aria-label="Breadcrumb" class="platform-breadcrumbs">
	<ol class="flex items-center gap-1.5 text-sm">
		{#each items as item, index}
			{#if index > 0}
				<li class="text-base-content/40" aria-hidden="true">
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 5l7 7-7 7"
						/>
					</svg>
				</li>
			{/if}
			<li>
				{#if item.href}
					<a
						href={item.href}
						class="text-base-content/70 transition-colors duration-200 hover:text-base-content"
					>
						{item.label}
					</a>
				{:else}
					<span aria-current="page" class="font-medium text-base-content">
						{item.label}
					</span>
				{/if}
			</li>
		{/each}
	</ol>
</nav>

<style>
	.platform-breadcrumbs {
		overflow-x: auto;
		scrollbar-width: none;
		-ms-overflow-style: none;
	}
	.platform-breadcrumbs::-webkit-scrollbar {
		display: none;
	}
	.platform-breadcrumbs ol {
		white-space: nowrap;
		min-width: max-content;
	}
</style>
