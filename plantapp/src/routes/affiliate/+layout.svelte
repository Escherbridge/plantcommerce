<script lang="ts">
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { PlatformShell, affiliateNavigation } from '$lib/components/platform';
	import type { PlatformUser } from '$lib/components/platform';
	import '$lib/components/platform/platform.css';
	import { trpc } from '$lib/trpc/client';

	let { children, data } = $props();

	const currentPath = $derived($page.url.pathname);

	// Pages that should NOT use PlatformShell
	const excludedPaths = ['/affiliate/join', '/affiliate', '/affiliate/terms'];
	const usePlatformShell = $derived(!excludedPaths.includes(currentPath));

	const platformUser: PlatformUser = $derived({
		name: data.user?.firstName
			? `${data.user.firstName}${data.user.lastName ? ' ' + data.user.lastName : ''}`
			: data.user?.email || 'Affiliate',
		email: data.user?.email || '',
		role: (data.user?.role || 'affiliate') as PlatformUser['role']
	});

	let isLoggingOut = $state(false);

	function handleLogout() {
		if (isLoggingOut || !browser) return;
		isLoggingOut = true;

		trpc.auth.logout
			.mutate()
			.then(() => {
				window.location.href = '/';
			})
			.catch((error: unknown) => {
				console.error('Logout error:', error);
				isLoggingOut = false;
			});
	}

	$effect(() => {
		if (!browser) return;
		const handler = () => handleLogout();
		document.addEventListener('platformlogout', handler);
		return () => document.removeEventListener('platformlogout', handler);
	});
</script>

{#if usePlatformShell}
	<PlatformShell navigation={affiliateNavigation} user={platformUser} {currentPath}>
		{@render children()}
	</PlatformShell>
{:else}
	{@render children()}
{/if}
