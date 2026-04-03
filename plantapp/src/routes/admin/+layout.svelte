<script lang="ts">
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { PlatformShell, adminNavigation } from '$lib/components/platform';
	import type { PlatformUser } from '$lib/components/platform';
	import '$lib/components/platform/platform.css';
	import { trpc } from '$lib/trpc/client';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: any } = $props();

	const currentPath = $derived($page.url.pathname);

	const platformUser: PlatformUser = $derived({
		name: `${data.user?.firstName || ''} ${data.user?.lastName || ''}`.trim() || 'Admin',
		email: data.user?.email || '',
		role: (data.user?.role || 'admin') as PlatformUser['role'],
		avatarUrl: undefined
	});

	let isLoggingOut = $state(false);

	async function handleLogout() {
		if (isLoggingOut) return;
		isLoggingOut = true;

		try {
			await trpc.auth.logout.mutate();
			if (browser) {
				window.location.href = '/';
			}
		} catch (error) {
			console.error('Logout error:', error);
		} finally {
			isLoggingOut = false;
		}
	}

	$effect(() => {
		if (!browser) return;

		function onPlatformLogout() {
			handleLogout();
		}

		document.addEventListener('platformlogout', onPlatformLogout);

		return () => {
			document.removeEventListener('platformlogout', onPlatformLogout);
		};
	});
</script>

<PlatformShell navigation={adminNavigation} user={platformUser} {currentPath}>
	{@render children()}
</PlatformShell>
