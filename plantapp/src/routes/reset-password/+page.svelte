<script lang="ts">
	import { page } from '$app/stores';
	import { trpc } from '$lib/trpc/client';

	let password = '';
	let confirmation = '';
	let loading = false;
	let complete = false;
	let error = '';

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		const token = $page.url.searchParams.get('token');
		if (!token) {
			error = 'This password reset link is invalid or expired.';
			return;
		}
		if (password.length < 8) {
			error = 'Password must be at least 8 characters.';
			return;
		}
		if (password !== confirmation) {
			error = 'Passwords do not match.';
			return;
		}

		loading = true;
		error = '';
		try {
			await trpc.auth.resetPassword.mutate({ token, password });
			complete = true;
		} catch (caught) {
			error = caught instanceof Error ? caught.message : 'Unable to reset password.';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Choose a new password - Aevani</title>
</svelte:head>

<main class="mx-auto flex min-h-screen max-w-md items-center px-4 py-12">
	<section class="card w-full bg-base-100 shadow-xl">
		<div class="card-body">
			<h1 class="card-title text-2xl">Choose a new password</h1>
			{#if complete}
				<p role="status">Your password has been reset. All existing sessions were signed out.</p>
				<a class="btn btn-primary mt-4" href="/login">Log in</a>
			{:else if !$page.url.searchParams.get('token')}
				<p class="text-error" role="alert">This password reset link is invalid or expired.</p>
				<a class="btn btn-outline mt-4" href="/forgot-password">Request a new link</a>
			{:else}
				<form class="mt-4 space-y-4" onsubmit={submit}>
					<label class="form-control" for="password">
						<span class="label-text">New password</span>
						<input id="password" class="input input-bordered" type="password" bind:value={password} autocomplete="new-password" minlength="8" required disabled={loading} />
					</label>
					<label class="form-control" for="confirmation">
						<span class="label-text">Confirm new password</span>
						<input id="confirmation" class="input input-bordered" type="password" bind:value={confirmation} autocomplete="new-password" minlength="8" required disabled={loading} />
					</label>
					{#if error}<p class="text-error" role="alert">{error}</p>{/if}
					<button class="btn btn-primary w-full" type="submit" disabled={loading}>
						{loading ? 'Resetting…' : 'Reset password'}
					</button>
				</form>
			{/if}
		</div>
	</section>
</main>
