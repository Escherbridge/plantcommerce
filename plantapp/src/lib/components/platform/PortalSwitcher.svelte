<script lang="ts">
	interface Portal {
		label: string;
		href: string;
		icon: string;
		roles: string[];
	}

	interface Props {
		role: 'admin' | 'customer' | 'affiliate' | 'instructor';
		currentPath: string;
		collapsed?: boolean;
	}

	let { role, currentPath, collapsed = false }: Props = $props();

	const portals: Portal[] = [
		{
			label: 'Account',
			href: '/account',
			// User circle icon
			icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
			roles: ['admin', 'customer', 'affiliate', 'instructor']
		},
		{
			label: 'Affiliate',
			href: '/affiliate/dashboard',
			// Link icon
			icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1',
			roles: ['admin', 'affiliate']
		},
		{
			label: 'Admin',
			href: '/admin',
			// Shield icon
			icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
			roles: ['admin']
		}
	];

	const visiblePortals = $derived(portals.filter((p) => p.roles.includes(role)));

	function isActivePortal(href: string): boolean {
		return currentPath.startsWith(href);
	}
</script>

{#if visiblePortals.length > 1}
	<div class="portal-switcher" class:portal-switcher--collapsed={collapsed}>
		{#if !collapsed}
			<span class="portal-switcher__title">Portals</span>
		{/if}
		<div class="portal-switcher__list">
			{#each visiblePortals as portal}
				{@const active = isActivePortal(portal.href)}
				<a
					href={portal.href}
					class="portal-switcher__link"
					class:portal-switcher__link--active={active}
					aria-current={active ? 'page' : undefined}
					title={collapsed ? portal.label : undefined}
				>
					<svg
						viewBox="0 0 24 24"
						class="portal-switcher__icon"
						stroke="currentColor"
						stroke-width="1.5"
						fill="none"
						aria-hidden="true"
					>
						<path d={portal.icon} stroke-linecap="round" stroke-linejoin="round" />
					</svg>
					<span class="portal-switcher__label">{portal.label}</span>
				</a>
			{/each}
		</div>
	</div>
{/if}

<style>
	.portal-switcher {
		padding: 0.625rem 0.5rem 0.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.portal-switcher__title {
		display: block;
		padding: 0 0.25rem 0.25rem;
		font-size: 0.625rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: oklch(var(--bc) / 0.4);
		white-space: nowrap;
		overflow: hidden;
	}

	.portal-switcher__list {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.portal-switcher__link {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.5rem 0.625rem;
		border-radius: calc(var(--input-radius, 10px) - 2px);
		color: oklch(var(--bc) / 0.65);
		transition:
			background-color 150ms ease,
			color 150ms ease;
		text-decoration: none;
		font-size: 0.875rem;
		font-weight: 500;
		white-space: nowrap;
		overflow: hidden;
	}

	.portal-switcher__link:hover {
		background: oklch(var(--s) / 0.06);
		color: oklch(var(--bc));
	}

	.portal-switcher__link--active {
		background: oklch(var(--s) / 0.1);
		color: oklch(var(--s));
		font-weight: 600;
	}

	.portal-switcher__link:focus-visible {
		outline: none;
		box-shadow: var(--shadow-glow-focus, 0 0 0 3px oklch(var(--s) / 0.3));
	}

	.portal-switcher__icon {
		width: 1.25rem;
		height: 1.25rem;
		flex-shrink: 0;
	}

	.portal-switcher--collapsed .portal-switcher__label {
		display: none;
	}

	.portal-switcher--collapsed .portal-switcher__link {
		justify-content: center;
		gap: 0;
		padding: 0.5rem;
	}
</style>
