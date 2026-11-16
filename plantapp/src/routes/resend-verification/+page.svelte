<script lang="ts">
	import { trpc } from '$lib/trpc/client';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let loading = $state(false);
	let message = $state('');
	let unavailable = $state(false);
	const signedIn = $derived(Boolean(data.user));

	async function requestVerification() {
		loading = true;
		message = '';
		unavailable = false;
		const returnPath = new URLSearchParams(window.location.search).get('redirect') ?? undefined;
		try {
			const result = await trpc.auth.requestEmailVerification.mutate({ returnPath });
			message = result.message;
			unavailable = !result.deliveryAvailable;
		} catch {
			message = 'Sign in to request a verification email.';
			unavailable = true;
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Verify your email — Aevani</title>
</svelte:head>

<section
	class="mx-auto flex min-h-screen max-w-md items-center px-4 py-12"
	aria-labelledby="resend-title"
>
	<section class="card w-full bg-base-100 shadow-xl">
		<div class="card-body">
			<h1 id="resend-title" class="card-title text-2xl">Verify your email</h1>
			{#if signedIn}
				<p>Request a new verification email for the address on your signed-in account.</p>
			{/if}
			{#if message}
				<p class={unavailable ? 'text-warning' : ''} role="status">{message}</p>
			{/if}
			{#if signedIn}
				<button
					class="btn mt-4 btn-primary"
					type="button"
					onclick={requestVerification}
					disabled={loading}
				>
					{loading ? 'Sending…' : 'Send verification email'}
				</button>
			{:else}
				<p>Sign in first, then come back here for a new link.</p>
				<a class="btn mt-4 btn-primary" href="/login?redirect=/resend-verification">Sign in</a>
			{/if}
			<a class="btn mt-2 btn-ghost" href="/login">Back to login</a>
		</div>
	</section>
</section>
