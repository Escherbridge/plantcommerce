<script lang="ts">
	import { Icon, type IconName } from '$lib/components/icons';

	interface Portal {
		label: string;
		href: string;
		icon: IconName;
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
			icon: 'user',
			roles: ['admin', 'customer', 'affiliate', 'instructor']
		},
		{
			label: 'Affiliate',
			href: '/affiliate/dashboard',
			icon: 'link',
			roles: ['admin', 'affiliate']
		},
		{
			label: 'Admin',
			href: '/admin',
			icon: 'shield-check',
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
					<Icon name={portal.icon} size={20} />
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

	.portal-switcher--collapsed .portal-switcher__label {
		display: none;
	}

	.portal-switcher--collapsed .portal-switcher__link {
		justify-content: center;
		gap: 0;
		padding: 0.5rem;
	}
</style>
