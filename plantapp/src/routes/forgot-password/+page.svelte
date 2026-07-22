<script lang="ts">
	import { trpc } from '$lib/trpc/client';

	let email = '';
	let loading = false;
	let submitted = false;
	let deliveryAvailable = false;
	let error = '';

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		loading = true;
		error = '';
		try {
			const result = await trpc.auth.requestPasswordReset.mutate({ email });
			deliveryAvailable = result.deliveryAvailable;
			submitted = true;
		} catch {
			error = 'Something went wrong. Please try again later.';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Reset password - Aevani</title>
</svelte:head>

<main class="mx-auto flex min-h-screen max-w-md items-center px-4 py-12">
	<section class="card w-full bg-base-100 shadow-xl">
		<div class="card-body">
			<h1 class="card-title text-2xl">Reset your password</h1>
			{#if submitted}
				{#if deliveryAvailable}
					<p role="status">
						If an eligible account exists, password reset instructions will arrive shortly.
					</p>
				{:else}
					<p class="text-warning" role="status">
						Password recovery email is temporarily unavailable. Please contact support.
					</p>
				{/if}
				<a class="btn mt-4 btn-primary" href="/login">Back to login</a>
			{:else}
				<p>
					Enter your account email address. For security, this confirmation is the same whether or
					not an account exists.
				</p>
				<form class="mt-4 space-y-4" onsubmit={submit}>
					<label class="form-control" for="email">
						<span class="label-text">Email address</span>
						<input
							id="email"
							class="input-bordered input"
							type="email"
							bind:value={email}
							autocomplete="email"
							required
							disabled={loading}
						/>
					</label>
					{#if error}<p class="text-error" role="alert">{error}</p>{/if}
					<button class="btn w-full btn-primary" type="submit" disabled={loading}>
						{loading ? 'Sending…' : 'Send reset instructions'}
					</button>
				</form>
			{/if}
		</div>
	</section>
</main>
