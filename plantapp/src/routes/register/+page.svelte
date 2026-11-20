<script lang="ts">
	import { get } from 'svelte/store';
	import { page } from '$app/stores';
	import Icon from '$lib/components/icons/Icon.svelte';
	import CredentialErrorSummary from '$lib/components/forms/CredentialErrorSummary.svelte';
	import { describedByFor } from '$lib/auth/credentialFieldErrors';
	import { authHandoffHref, safeRedirectPath } from '$lib/auth/safeRedirect';
	import { trpc } from '$lib/trpc/client';
	import { tick } from 'svelte';
	import type { ActionData } from './$types';
	import {
		PASSWORD_TOO_SHORT,
		PASSWORDS_DO_NOT_MATCH,
		firstRegistrationError,
		focusRegistrationField,
		type RegisterField
	} from './validation';

	let {
		form,
		data = { redirectTo: '', invite: '' }
	}: {
		form: ActionData;
		data?: { redirectTo: string; invite: string };
	} = $props();

	const hiddenRedirect = $derived(
		(form && 'returnPath' in form && form.returnPath) || data.redirectTo || ''
	);
	const hiddenInvite = $derived((form && 'invite' in form && form.invite) || data.invite || '');

	function pageRedirect(): { origin: string; redirect: string | null } | null {
		try {
			const current = get(page);
			return {
				origin: current.url.origin,
				redirect: current.url.searchParams.get('redirect')
			};
		} catch {
			if (typeof window === 'undefined') return null;
			return {
				origin: window.location.origin,
				redirect: new URLSearchParams(window.location.search).get('redirect')
			};
		}
	}

	const continuePath = $derived.by(() => {
		const current = pageRedirect();
		return current ? safeRedirectPath(current.redirect, current.origin) : '/account/profile';
	});
	const signInHref = $derived.by(() => {
		const current = pageRedirect();
		return current ? authHandoffHref('login', continuePath, current.origin) : '/login';
	});

	let username = $state('');
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let firstName = $state('');
	let lastName = $state('');
	let errorMessage = $state('');
	let invalidField = $state<RegisterField | null>(null);
	let isLoading = $state(false);
	let registrationComplete = $state(false);
	let registeredEmail = $state('');
	let verificationEmailSent = $state(false);
	let usernameInput = $state<HTMLInputElement | null>(null);
	let emailInput = $state<HTMLInputElement | null>(null);
	let passwordInput = $state<HTMLInputElement | null>(null);
	let confirmPasswordInput = $state<HTMLInputElement | null>(null);

	const passwordErrors = $derived(() => {
		const errors: string[] = [];
		if (password) {
			if (password.length < 8) {
				errors.push(PASSWORD_TOO_SHORT);
			}
			if (confirmPassword && password !== confirmPassword) {
				errors.push(PASSWORDS_DO_NOT_MATCH);
			}
		}
		return errors;
	});

	function fieldInvalid(field: RegisterField): 'true' | undefined {
		if (invalidField === field) return 'true';
		if (field === 'password' && password && passwordErrors().length > 0) return 'true';
		return undefined;
	}

	function fieldDescribedBy(field: RegisterField): string | undefined {
		const ids: string[] = [];
		if (invalidField === field && errorMessage) ids.push('register-form-error');
		if (field === 'password' && password && passwordErrors().length > 0) {
			ids.push('register-password-errors');
		}
		return ids.length > 0 ? ids.join(' ') : undefined;
	}

	function described(field: RegisterField): string | undefined {
		const ids = [fieldDescribedBy(field), describedByFor(form?.fieldErrors, field)].filter(
			(id): id is string => Boolean(id)
		);
		if (field === 'username') ids.push('username-hint');
		if (field === 'password' && !(password && passwordErrors().length > 0)) {
			ids.push('password-hint');
		}
		return ids.length > 0 ? ids.join(' ') : undefined;
	}

	const usernameInvalid = $derived(
		describedByFor(form?.fieldErrors, 'username') || fieldInvalid('username') ? 'true' : undefined
	);
	const emailInvalid = $derived(
		describedByFor(form?.fieldErrors, 'email') || fieldInvalid('email') ? 'true' : undefined
	);
	const passwordInvalid = $derived(
		describedByFor(form?.fieldErrors, 'password') || fieldInvalid('password') ? 'true' : undefined
	);
	const confirmInvalid = $derived(
		describedByFor(form?.fieldErrors, 'confirmPassword') || fieldInvalid('confirmPassword')
			? 'true'
			: undefined
	);
	const firstNameInvalid = $derived(
		describedByFor(form?.fieldErrors, 'firstName') || fieldInvalid('firstName') ? 'true' : undefined
	);
	const lastNameInvalid = $derived(
		describedByFor(form?.fieldErrors, 'lastName') || fieldInvalid('lastName') ? 'true' : undefined
	);
	const usernameDescribedBy = $derived(described('username'));
	const emailDescribedBy = $derived(described('email'));
	const passwordDescribedBy = $derived(described('password'));
	const confirmDescribedBy = $derived(described('confirmPassword'));
	const firstNameDescribedBy = $derived(described('firstName'));
	const lastNameDescribedBy = $derived(described('lastName'));

	async function handleSubmit(e: Event) {
		e.preventDefault();
		errorMessage = '';
		invalidField = null;

		const failure = firstRegistrationError({ username, email, password, confirmPassword });
		if (failure) {
			errorMessage = failure.message;
			invalidField = failure.field;
			await tick();
			focusRegistrationField(failure.field, {
				username: usernameInput,
				email: emailInput,
				password: passwordInput,
				confirmPassword: confirmPasswordInput
			});
			return;
		}

		const normalizedUsername = username.trim();
		const normalizedEmail = email.trim();

		isLoading = true;

		try {
			const result = await trpc.auth.register.mutate({
				username: normalizedUsername,
				email: normalizedEmail,
				password,
				firstName: firstName.trim() || undefined,
				lastName: lastName.trim() || undefined,
				returnPath: hiddenRedirect || continuePath
			});

			if (result.user) {
				registeredEmail = normalizedEmail;
				verificationEmailSent = result.verificationEmailSent;
				registrationComplete = true;
			} else {
				errorMessage =
					'We could not complete account creation. Please try signing in or contact support.';
			}
		} catch {
			errorMessage =
				'We could not create an account with those details. Please review them and try again.';
		} finally {
			isLoading = false;
		}
	}
</script>

<svelte:head>
	<title>Create an account — Aevani</title>
</svelte:head>

<div class="register-page">
	<div class="register-container">
		<div class="register-card glass-card-strong">
			{#if registrationComplete}
				<!-- Success State -->
				<div class="register-header">
					<a href="/" class="register-wordmark">AEVANI</a>
					<div class="register-success-icon">
						<Icon name="check-circle" size={48} />
					</div>
					<h1 class="register-title">Account Created</h1>
					<p class="register-subtitle">Welcome to Aevani!</p>
					<p class="register-email-highlight">{registeredEmail}</p>
				</div>

				<div class="register-next-steps">
					{#if verificationEmailSent}
						<p class="register-step-text">
							Check your inbox and confirm the verification request. Once verified, you can browse
							the catalogue; checkout availability is shown before payment.
						</p>
					{:else}
						<p class="register-step-text">
							Your account was created, but verification email delivery is not available yet. Please
							contact support before relying on email verification.
						</p>
					{/if}
					<div class="register-success-actions">
						<a
							href={continuePath}
							class="font-display btn w-full tracking-wider uppercase btn-primary"
						>
							{continuePath === '/account/profile' ? 'Go to My Account' : 'Continue'}
						</a>
						<a
							href="/products"
							class="font-display btn w-full tracking-wider uppercase btn-outline"
						>
							Browse catalogue
						</a>
					</div>
				</div>

				{#if verificationEmailSent}
					<div class="register-footer">
						<p class="register-legal">
							Didn't receive the email? Check your spam folder or contact support.
						</p>
					</div>
				{/if}
			{:else}
				<!-- Header -->
				<div class="register-header">
					<a href="/" class="register-wordmark">AEVANI</a>
					<h1 class="register-title">Create an account</h1>
					<p class="register-subtitle">
						An account saves your course progress and, once something is for sale, your orders.
					</p>
				</div>

				<!-- Error -->
				{#if errorMessage || form?.message}
					<div id="register-form-error" class="register-error" role="alert" aria-live="assertive">
						<Icon name="alert-circle" size={16} class="h-4 w-4 shrink-0" />
						<span>{errorMessage || form?.message}</span>
					</div>
				{/if}

				<!-- Form -->
				<form
					method="post"
					onsubmit={handleSubmit}
					class="register-form"
					novalidate
					aria-busy={isLoading}
				>
					{#if form?.fieldErrors?.length}
						<CredentialErrorSummary
							errors={form.fieldErrors}
							fieldIds={{
								firstName: 'firstName',
								lastName: 'lastName',
								username: 'username',
								email: 'email',
								password: 'password',
								confirmPassword: 'confirmPassword'
							}}
						/>
					{/if}
					<input type="hidden" name="redirect" value={hiddenRedirect} />
					<input type="hidden" name="invite" value={hiddenInvite} />
					<div class="register-row">
						<div class="form-control">
							<label class="label" for="firstName">
								<span class="label-text">First name (optional)</span>
							</label>
							<input
								id="firstName"
								name="firstName"
								type="text"
								autocomplete="given-name"
								placeholder="First name"
								class="input-bordered input w-full"
								bind:value={firstName}
								disabled={isLoading}
								aria-invalid={firstNameInvalid}
								aria-describedby={firstNameDescribedBy}
							/>
						</div>

						<div class="form-control">
							<label class="label" for="lastName">
								<span class="label-text">Last name (optional)</span>
							</label>
							<input
								id="lastName"
								name="lastName"
								type="text"
								autocomplete="family-name"
								placeholder="Last name"
								class="input-bordered input w-full"
								bind:value={lastName}
								disabled={isLoading}
								aria-invalid={lastNameInvalid}
								aria-describedby={lastNameDescribedBy}
							/>
						</div>
					</div>

					<div class="form-control">
						<label class="label" for="username">
							<span class="label-text">Username</span>
						</label>
						<input
							id="username"
							name="username"
							type="text"
							autocomplete="username"
							autocapitalize="none"
							spellcheck="false"
							placeholder="Choose a username"
							class="input-bordered input w-full"
							bind:value={username}
							bind:this={usernameInput}
							required
							disabled={isLoading}
							aria-invalid={usernameInvalid}
							aria-describedby={usernameDescribedBy}
							minlength="3"
							maxlength="50"
						/>
						<div id="username-hint" class="register-hint">
							Your username needs 3 to 50 characters.
						</div>
					</div>

					<div class="form-control">
						<label class="label" for="email">
							<span class="label-text">Email</span>
						</label>
						<input
							id="email"
							name="email"
							type="email"
							autocomplete="email"
							autocapitalize="none"
							spellcheck="false"
							placeholder="your.email@example.com"
							class="input-bordered input w-full"
							bind:value={email}
							bind:this={emailInput}
							required
							disabled={isLoading}
							aria-invalid={emailInvalid}
							aria-describedby={emailDescribedBy}
						/>
					</div>

					<div class="form-control">
						<label class="label" for="password">
							<span class="label-text">Password</span>
						</label>
						<input
							id="password"
							name="password"
							type="password"
							autocomplete="new-password"
							placeholder="Create a strong password"
							class="input-bordered input w-full"
							bind:value={password}
							bind:this={passwordInput}
							required
							disabled={isLoading}
							aria-invalid={passwordInvalid}
							aria-describedby={passwordDescribedBy}
							minlength="8"
						/>
						{#if passwordErrors().length > 0 && password}
							<div id="register-password-errors" class="register-field-errors">
								{#each passwordErrors() as error}
									<span class="register-field-error">{error}</span>
								{/each}
							</div>
						{:else}
							<div id="password-hint" class="register-hint">
								Your password needs at least 8 characters.
							</div>
						{/if}
					</div>

					<div class="form-control">
						<label class="label" for="confirmPassword">
							<span class="label-text">Confirm password</span>
						</label>
						<input
							id="confirmPassword"
							name="confirmPassword"
							type="password"
							autocomplete="new-password"
							placeholder="Re-enter your password"
							class="input-bordered input w-full"
							bind:value={confirmPassword}
							bind:this={confirmPasswordInput}
							required
							disabled={isLoading}
							aria-invalid={confirmInvalid}
							aria-describedby={confirmDescribedBy}
							minlength="8"
						/>
					</div>

					<div class="register-actions">
						<button
							type="submit"
							class="font-display btn w-full tracking-wider btn-primary"
							disabled={isLoading}
							aria-busy={isLoading}
						>
							{#if isLoading}
								<span class="loading loading-sm loading-spinner" aria-hidden="true"></span>
								Creating account...
							{:else}
								Create account
							{/if}
						</button>
					</div>
				</form>

				<!-- Footer -->
				<div class="register-footer">
					<p>
						Already have an account?
						<a href={signInHref} class="link font-semibold link-primary">Sign in</a>.
					</p>
					<p class="register-legal">
						By creating an account, you agree to our
						<a href="/terms" class="link link-primary">Terms of Service</a>
						and
						<a href="/privacy" class="link link-primary">Privacy Policy</a>
					</p>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.register-page {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--gradient-warm);
		padding: 2rem 1rem;
	}

	.register-container {
		width: 100%;
		max-width: 28rem;
	}

	.register-card {
		padding: 2.5rem 2rem;
	}

	.register-header {
		text-align: center;
		margin-bottom: 2rem;
	}

	.register-wordmark {
		font-family: var(--font-display);
		font-size: 1.5rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: oklch(var(--p));
		text-decoration: none;
		display: block;
		margin-bottom: 1.25rem;
	}

	.register-title {
		font-family: var(--font-display);
		font-size: 1.5rem;
		font-weight: 700;
		letter-spacing: -0.01em;
		color: oklch(var(--bc));
		margin-bottom: 0.5rem;
	}

	.register-subtitle {
		font-size: 0.875rem;
		color: oklch(var(--bc) / 0.55);
	}

	.register-error {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		border-radius: var(--input-radius);
		background: rgba(230, 57, 70, 0.06);
		border: 1px solid rgba(230, 57, 70, 0.15);
		color: oklch(var(--er));
		font-size: 0.8125rem;
		font-weight: 500;
		margin-bottom: 1.5rem;
	}

	.register-form {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.register-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.register-hint {
		font-size: 0.75rem;
		color: oklch(var(--bc) / 0.45);
		margin-top: 0.375rem;
		padding-left: 0.125rem;
	}

	.register-field-errors {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		margin-top: 0.375rem;
	}

	.register-field-error {
		font-size: 0.75rem;
		color: oklch(var(--er));
		font-weight: 500;
	}

	.register-actions {
		padding-top: 0.5rem;
	}

	.register-footer {
		text-align: center;
		margin-top: 1.75rem;
		padding-top: 1.25rem;
		border-top: 1px solid oklch(var(--bc) / 0.08);
		font-size: 0.875rem;
		color: oklch(var(--bc) / 0.6);
	}

	.register-legal {
		margin-top: 0.75rem;
		font-size: 0.75rem;
		color: oklch(var(--bc) / 0.45);
	}

	.register-success-icon {
		width: 3.5rem;
		height: 3.5rem;
		margin: 0 auto 1.25rem;
		color: oklch(var(--su));
	}

	.register-email-highlight {
		font-weight: 600;
		color: oklch(var(--p));
		font-size: 0.9375rem;
		margin-top: 0.5rem;
	}

	.register-next-steps {
		margin: 1.5rem 0;
		padding: 1.25rem;
		background: oklch(var(--su) / 0.04);
		border: 1px solid oklch(var(--su) / 0.12);
		border-radius: var(--input-radius);
	}

	.register-step-text {
		font-size: 0.875rem;
		color: oklch(var(--bc) / 0.65);
		line-height: 1.6;
		margin-bottom: 1.25rem;
	}

	.register-success-actions {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
</style>
