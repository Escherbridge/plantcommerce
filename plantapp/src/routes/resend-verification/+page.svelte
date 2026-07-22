<script lang="ts">
	import { trpc } from '$lib/trpc/client';

	let loading = false;
	let message = '';
	let unavailable = false;

	async function requestVerification() {
		loading = true;
		message = '';
		unavailable = false;
		try {
			const result = await trpc.auth.requestEmailVerification.mutate();
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
	<title>Resend verification email - Aevani</title>
</svelte:head>

<main class="mx-auto flex min-h-screen max-w-md items-center px-4 py-12">
	<section class="card w-full bg-base-100 shadow-xl">
		<div class="card-body">
			<h1 class="card-title text-2xl">Verify your email</h1>
			<p>Request a new verification email for the address on your signed-in account.</p>
			{#if message}
				<p class={unavailable ? 'text-warning' : ''} role="status">{message}</p>
			{/if}
			<button
				class="btn mt-4 btn-primary"
				type="button"
				onclick={requestVerification}
				disabled={loading}
			>
				{loading ? 'Sending…' : 'Send verification email'}
			</button>
			<a class="btn mt-2 btn-ghost" href="/login">Back to login</a>
		</div>
	</section>
</main>
