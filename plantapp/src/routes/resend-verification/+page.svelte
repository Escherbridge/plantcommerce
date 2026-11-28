<script lang="ts">
	import {
		verificationResendPageCopy,
		verificationResendTransportError
	} from '$lib/copy/verificationEmail';
	import { trpc } from '$lib/trpc/client';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let loading = $state(false);
	let message = $state('');
	let unavailable = $state(Boolean(data.user) && data.verificationEmailAvailable === false);
	const signedIn = $derived(Boolean(data.user));
	const resendContactPhrase = 'contact us';
	const resendCopyParts = verificationResendPageCopy.split(resendContactPhrase);
	const resendCopyBefore = resendCopyParts[0] ?? '';
	const resendCopyAfter = resendCopyParts[1] ?? '';

	async function requestVerification() {
		loading = true;
		message = '';
		const returnPath = new URLSearchParams(window.location.search).get('redirect') ?? undefined;
		try {
			const result = await trpc.auth.requestEmailVerification.mutate({ returnPath });
			message = result.message;
			unavailable = !result.deliveryAvailable;
		} catch {
			message = verificationResendTransportError;
			unavailable = false;
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
			{#if unavailable}
				<p role="status">
					{resendCopyBefore}<a class="link link-primary" href="/contact">{resendContactPhrase}</a
					>{resendCopyAfter}
				</p>
			{:else if signedIn}
				<p>Request a new verification email for the address on your signed-in account.</p>
			{/if}
			{#if message && !unavailable}
				<p role="status">{message}</p>
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
			{#if unavailable}
				<a class="btn mt-2 btn-outline" href="/products">Browse catalogue</a>
				<a class="btn mt-2 btn-ghost" href="/account/profile">Go to your account</a>
			{/if}
			{#if !signedIn}
				<a class="btn mt-2 btn-ghost" href="/login">Back to login</a>
			{/if}
		</div>
	</section>
</section>
