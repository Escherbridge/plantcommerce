<script lang="ts">
	import { page } from '$app/stores';
	import { trpc } from '$lib/trpc/client';
	import type { ActionData } from './$types';
	import CredentialErrorSummary from '$lib/components/forms/CredentialErrorSummary.svelte';
	import { describedByFor } from '$lib/auth/credentialFieldErrors';
	import {
		RESET_LINK_INVALID,
		RESET_PASSWORDS_DO_NOT_MATCH,
		RESET_PASSWORD_TOO_SHORT,
		resetPasswordFieldErrors
	} from './validation';

	export let form: ActionData = null;

	let password = '';
	let confirmation = '';
	let loading = false;
	let complete = false;
	let error = '';
	let passwordInvalid: 'true' | undefined = undefined;
	let confirmationInvalid: 'true' | undefined = undefined;
	let passwordDescribedBy: string | undefined = undefined;
	let confirmationDescribedBy: string | undefined = undefined;

	$: passwordErrorIds = describedByFor(form?.fieldErrors, 'password');
	$: confirmationErrorIds = describedByFor(form?.fieldErrors, 'confirmation');
	$: passwordInvalid = (
		passwordErrorIds || error === RESET_PASSWORD_TOO_SHORT ? 'true' : undefined
	) as 'true' | undefined;
	$: confirmationInvalid = (
		confirmationErrorIds || error === RESET_PASSWORDS_DO_NOT_MATCH ? 'true' : undefined
	) as 'true' | undefined;
	$: passwordDescribedBy =
		[passwordErrorIds, passwordInvalid && !passwordErrorIds ? 'reset-form-error' : undefined]
			.filter(Boolean)
			.join(' ') || undefined;
	$: confirmationDescribedBy =
		[
			confirmationErrorIds,
			confirmationInvalid && !confirmationErrorIds ? 'reset-form-error' : undefined
		]
			.filter(Boolean)
			.join(' ') || undefined;

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		const token = $page.url.searchParams.get('token') ?? '';
		const fieldError = resetPasswordFieldErrors({ token, password, confirmation })[0];
		if (fieldError) {
			error = fieldError.message;
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

<div class="mx-auto flex min-h-screen max-w-md items-center px-4 py-12">
	<section class="card w-full bg-base-100 shadow-xl">
		<div class="card-body">
			<h1 class="card-title text-2xl">Choose a new password</h1>
			{#if complete}
				<p role="status">Your password has been reset. All existing sessions were signed out.</p>
				<a class="btn mt-4 btn-primary" href="/login">Log in</a>
			{:else if !$page.url.searchParams.get('token')}
				<p class="text-error" role="alert">{RESET_LINK_INVALID}</p>
				<a class="btn mt-4 btn-outline" href="/forgot-password">Request a new link</a>
			{:else}
				<form method="post" class="mt-4 space-y-4" onsubmit={submit} novalidate>
					{#if form?.fieldErrors?.length}
						<CredentialErrorSummary
							errors={form.fieldErrors}
							fieldIds={{ password: 'password', confirmation: 'confirmation' }}
						/>
					{/if}
					<label class="form-control" for="password">
						<span class="label-text">New password</span>
						<input
							id="password"
							name="password"
							class="input-bordered input"
							type="password"
							bind:value={password}
							autocomplete="new-password"
							disabled={loading}
							aria-invalid={passwordInvalid}
							aria-describedby={passwordDescribedBy}
						/>
					</label>
					<label class="form-control" for="confirmation">
						<span class="label-text">Confirm new password</span>
						<input
							id="confirmation"
							name="confirmation"
							class="input-bordered input"
							type="password"
							bind:value={confirmation}
							autocomplete="new-password"
							disabled={loading}
							aria-invalid={confirmationInvalid}
							aria-describedby={confirmationDescribedBy}
						/>
					</label>
					{#if error || form?.message}<p id="reset-form-error" class="text-error" role="alert">
							{error || form?.message}
						</p>{/if}
					<button class="btn w-full btn-primary" type="submit" disabled={loading}>
						{loading ? 'Resetting…' : 'Reset password'}
					</button>
				</form>
			{/if}
		</div>
	</section>
</div>
