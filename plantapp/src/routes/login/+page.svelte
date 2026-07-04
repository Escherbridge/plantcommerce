<script lang="ts">
	import { trpc } from '$lib/trpc/client';
	import { page } from '$app/stores';
	import { toasts } from '$lib/stores/toast';

	let email = '';
	let password = '';
	let loading = false;
	let error = '';

	function getRedirectUrl(): string {
		const redirect = $page.url.searchParams.get('redirect');
		if (redirect && redirect.startsWith('/')) {
			return redirect;
		}
		return '/account/profile';
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		loading = true;
		error = '';

		if (!email.trim() || !password.trim()) {
			error = 'Please enter your email and password.';
			loading = false;
			return;
		}

		try {
			const result = await trpc.auth.login.mutate({
				usernameOrEmail: email,
				password: password
			});

			if (result.user && result.sessionToken) {
				toasts.addToast({
					message: `Welcome back, ${result.user.firstName || result.user.username}!`,
					variant: 'success',
					duration: 3000
				});
				window.location.href = getRedirectUrl();
			} else {
				error = 'Login failed. Please try again.';
			}
		} catch (err: any) {
			const message = err?.message || '';
			if (message.includes('UNAUTHORIZED') || message.includes('Invalid')) {
				error = 'Invalid email or password. Please try again.';
			} else if (message.includes('FORBIDDEN') || message.includes('disabled')) {
				error = 'Your account has been disabled. Please contact support.';
			} else {
				error = 'Something went wrong. Please try again later.';
			}
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Sign In - Aevani</title>
</svelte:head>

<div class="login-page">
	<div class="login-container">
		<div class="login-card glass-card-strong">
			<!-- Header -->
			<div class="login-header">
				<a href="/" class="login-wordmark">AEVANI</a>
				<h1 class="login-title">Sign in to your account</h1>
				<p class="login-subtitle">Welcome back. Enter your credentials below.</p>
			</div>

			<!-- Error -->
			{#if error}
				<div class="login-error">
					<svg class="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
						<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
					</svg>
					<span>{error}</span>
				</div>
			{/if}

			<!-- Form -->
			<form class="login-form" onsubmit={handleSubmit} novalidate>
				<div class="form-control">
					<label class="label" for="email-address">
						<span class="label-text">Email address</span>
					</label>
					<input
						id="email-address"
						name="email"
						type="email"
						autocomplete="email"
						required
						bind:value={email}
						class="input input-bordered w-full"
						placeholder="you@example.com"
						disabled={loading}
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
						autocomplete="current-password"
						required
						bind:value={password}
						class="input input-bordered w-full"
						placeholder="Enter your password"
						disabled={loading}
					/>
				</div>

				<div class="login-actions">
					<button
						type="submit"
						disabled={loading}
						class="btn btn-primary w-full font-display uppercase tracking-wider"
					>
						{#if loading}
							<span class="loading loading-spinner loading-sm"></span>
							Signing in...
						{:else}
							Sign in
						{/if}
					</button>
				</div>
			</form>

			<!-- Footer -->
			<div class="login-footer">
				<p>
					Don't have an account?
					<a href="/register" class="link link-primary font-semibold">Create one</a>
				</p>
			</div>
		</div>
	</div>
</div>

<style>
	.login-page {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--gradient-warm);
		padding: 2rem 1rem;
	}

	.login-container {
		width: 100%;
		max-width: 26rem;
	}

	.login-card {
		padding: 2.5rem 2rem;
	}

	.login-header {
		text-align: center;
		margin-bottom: 2rem;
	}

	.login-wordmark {
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

	.login-title {
		font-family: var(--font-display);
		font-size: 1.5rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: -0.01em;
		color: oklch(var(--bc));
		margin-bottom: 0.5rem;
	}

	.login-subtitle {
		font-size: 0.875rem;
		color: oklch(var(--bc) / 0.55);
	}

	.login-error {
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

	.login-form {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.login-actions {
		padding-top: 0.5rem;
	}

	.login-footer {
		text-align: center;
		margin-top: 1.75rem;
		padding-top: 1.25rem;
		border-top: 1px solid oklch(var(--bc) / 0.08);
		font-size: 0.875rem;
		color: oklch(var(--bc) / 0.6);
	}
</style>
