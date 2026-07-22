<script lang="ts">
	import Icon from '$lib/components/icons/Icon.svelte';
	import { trpc } from '$lib/trpc/client';

	let username = $state('');
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let firstName = $state('');
	let lastName = $state('');
	let errorMessage = $state('');
	let isLoading = $state(false);
	let registrationComplete = $state(false);
	let registeredEmail = $state('');
	let verificationEmailSent = $state(false);

	function validEmail(value: string): boolean {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
	}

	const passwordErrors = $derived(() => {
		const errors: string[] = [];
		if (password) {
			if (password.length < 8) {
				errors.push('Password must be at least 8 characters');
			}
			if (confirmPassword && password !== confirmPassword) {
				errors.push('Passwords do not match');
			}
		}
		return errors;
	});

	async function handleSubmit(e: Event) {
		e.preventDefault();
		errorMessage = '';

		if (password !== confirmPassword) {
			errorMessage = 'Passwords do not match';
			return;
		}

		if (password.length < 8) {
			errorMessage = 'Password must be at least 8 characters';
			return;
		}

		const normalizedUsername = username.trim();
		const normalizedEmail = email.trim();
		if (normalizedUsername.length < 3) {
			errorMessage = 'Username must be at least 3 characters';
			return;
		}
		if (!validEmail(normalizedEmail)) {
			errorMessage = 'Enter a valid email address';
			return;
		}

		isLoading = true;

		try {
			const result = await trpc.auth.register.mutate({
				username: normalizedUsername,
				email: normalizedEmail,
				password,
				firstName: firstName.trim() || undefined,
				lastName: lastName.trim() || undefined
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
	<title>Register - Aevani</title>
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
							href="/account/profile"
							class="font-display btn w-full tracking-wider uppercase btn-primary"
						>
							Go to My Account
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
					<h1 class="register-title">Create Your Account</h1>
					<p class="register-subtitle">Join our community of sustainable growers.</p>
				</div>

				<!-- Error -->
				{#if errorMessage}
					<div id="register-form-error" class="register-error" role="alert" aria-live="assertive">
						<Icon name="alert-circle" size={16} class="h-4 w-4 shrink-0" />
						<span>{errorMessage}</span>
					</div>
				{/if}

				<!-- Form -->
				<form onsubmit={handleSubmit} class="register-form" novalidate aria-busy={isLoading}>
					<div class="register-row">
						<div class="form-control">
							<label class="label" for="firstName">
								<span class="label-text">First Name</span>
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
							/>
						</div>

						<div class="form-control">
							<label class="label" for="lastName">
								<span class="label-text">Last Name</span>
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
							required
							disabled={isLoading}
							aria-invalid={Boolean(errorMessage)}
							aria-describedby={errorMessage ? 'register-form-error' : undefined}
							minlength="3"
							maxlength="50"
						/>
						<div class="register-hint">Must be 3-50 characters</div>
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
							required
							disabled={isLoading}
							aria-invalid={Boolean(errorMessage)}
							aria-describedby={errorMessage ? 'register-form-error' : undefined}
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
							required
							disabled={isLoading}
							aria-invalid={Boolean(errorMessage) || passwordErrors().length > 0}
							aria-describedby={errorMessage ? 'register-form-error' : undefined}
							minlength="8"
						/>
						{#if passwordErrors().length > 0 && password}
							<div class="register-field-errors">
								{#each passwordErrors() as error}
									<span class="register-field-error">{error}</span>
								{/each}
							</div>
						{:else}
							<div class="register-hint">Must be at least 8 characters</div>
						{/if}
					</div>

					<div class="form-control">
						<label class="label" for="confirmPassword">
							<span class="label-text">Confirm Password</span>
						</label>
						<input
							id="confirmPassword"
							name="confirmPassword"
							type="password"
							autocomplete="new-password"
							placeholder="Re-enter your password"
							class="input-bordered input w-full"
							bind:value={confirmPassword}
							required
							disabled={isLoading}
							aria-invalid={Boolean(errorMessage) || passwordErrors().length > 0}
							aria-describedby={errorMessage ? 'register-form-error' : undefined}
							minlength="8"
						/>
					</div>

					<div class="register-actions">
						<button
							type="submit"
							class="font-display btn w-full tracking-wider uppercase btn-primary"
							disabled={isLoading || passwordErrors().length > 0}
							aria-busy={isLoading}
						>
							{#if isLoading}
								<span class="loading loading-sm loading-spinner" aria-hidden="true"></span>
								Creating account...
							{:else}
								Create Account
							{/if}
						</button>
					</div>
				</form>

				<!-- Footer -->
				<div class="register-footer">
					<p>
						Already have an account?
						<a href="/login" class="link font-semibold link-primary">Login here</a>
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
		text-transform: uppercase;
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
