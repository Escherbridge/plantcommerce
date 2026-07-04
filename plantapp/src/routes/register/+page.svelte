<script lang="ts">
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

		if (username.length < 3) {
			errorMessage = 'Username must be at least 3 characters';
			return;
		}

		isLoading = true;

		try {
			const result = await trpc.auth.register.mutate({
				username,
				email,
				password,
				firstName: firstName || undefined,
				lastName: lastName || undefined
			});

			if (result.user && result.sessionToken) {
				registeredEmail = email;
				registrationComplete = true;
			}
		} catch (error: any) {
			console.error('Registration error:', error);
			errorMessage = error.message || 'Registration failed. Please try again.';
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
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
							<path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
							<polyline points="22 4 12 14.01 9 11.01"/>
						</svg>
					</div>
					<h1 class="register-title">Account Created</h1>
					<p class="register-subtitle">Welcome to Aevani! We've sent a verification email to:</p>
					<p class="register-email-highlight">{registeredEmail}</p>
				</div>

				<div class="register-next-steps">
					<p class="register-step-text">Check your inbox and click the verification link to activate your account. You can start browsing right away.</p>
					<div class="register-success-actions">
						<a href="/products" class="btn btn-primary w-full font-display uppercase tracking-wider">
							Browse Products
						</a>
						<a href="/account/profile" class="btn btn-outline w-full font-display uppercase tracking-wider">
							Go to My Account
						</a>
					</div>
				</div>

				<div class="register-footer">
					<p class="register-legal">
						Didn't receive the email? Check your spam folder or
						<button class="link link-primary" onclick={() => { registrationComplete = false; }}>try again</button>
					</p>
				</div>
			{:else}
			<!-- Header -->
			<div class="register-header">
				<a href="/" class="register-wordmark">AEVANI</a>
				<h1 class="register-title">Create Your Account</h1>
				<p class="register-subtitle">Join our community of sustainable growers.</p>
			</div>

			<!-- Error -->
			{#if errorMessage}
				<div class="register-error">
					<svg class="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
						<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
					</svg>
					<span>{errorMessage}</span>
				</div>
			{/if}

			<!-- Form -->
			<form onsubmit={handleSubmit} class="register-form" novalidate>
				<div class="register-row">
					<div class="form-control">
						<label class="label" for="firstName">
							<span class="label-text">First Name</span>
						</label>
						<input
							id="firstName"
							type="text"
							placeholder="First name"
							class="input input-bordered w-full"
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
							type="text"
							placeholder="Last name"
							class="input input-bordered w-full"
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
						type="text"
						placeholder="Choose a username"
						class="input input-bordered w-full"
						bind:value={username}
						required
						disabled={isLoading}
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
						type="email"
						placeholder="your.email@example.com"
						class="input input-bordered w-full"
						bind:value={email}
						required
						disabled={isLoading}
					/>
				</div>

				<div class="form-control">
					<label class="label" for="password">
						<span class="label-text">Password</span>
					</label>
					<input
						id="password"
						type="password"
						placeholder="Create a strong password"
						class="input input-bordered w-full"
						bind:value={password}
						required
						disabled={isLoading}
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
						type="password"
						placeholder="Re-enter your password"
						class="input input-bordered w-full"
						bind:value={confirmPassword}
						required
						disabled={isLoading}
						minlength="8"
					/>
				</div>

				<div class="register-actions">
					<button
						type="submit"
						class="btn btn-primary w-full font-display uppercase tracking-wider"
						disabled={isLoading || passwordErrors().length > 0}
					>
						{#if isLoading}
							<span class="loading loading-spinner loading-sm"></span>
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
					<a href="/login" class="link link-primary font-semibold">Login here</a>
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

	.register-success-icon svg {
		width: 100%;
		height: 100%;
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
