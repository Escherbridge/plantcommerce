<script lang="ts">
	import { trpc } from '$lib/trpc/client';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

	let username = $state('');
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let firstName = $state('');
	let lastName = $state('');
	let errorMessage = $state('');
	let isLoading = $state(false);
	
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

		// Validation
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

			if (result.sessionToken) {
				// Redirect to account page or home
				if (browser) {
					window.location.href = '/account';
				}
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

<div class="min-h-screen flex items-center justify-center bg-base-200 py-12 px-4 sm:px-6 lg:px-8">
	<div class="max-w-md w-full">
		<div class="card bg-base-100 shadow-xl">
			<div class="card-body">
				<h2 class="card-title text-3xl font-bold text-center mb-6">Create Your Account</h2>

				{#if errorMessage}
					<div class="alert alert-error mb-4">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="stroke-current shrink-0 h-6 w-6"
							fill="none"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<span>{errorMessage}</span>
					</div>
				{/if}

				<form onsubmit={handleSubmit} class="space-y-4">
					<div class="grid grid-cols-2 gap-4">
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
						<label class="label">
							<span class="label-text-alt">Must be 3-50 characters</span>
						</label>
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
							<label class="label">
								{#each passwordErrors() as error}
									<span class="label-text-alt text-error">{error}</span>
								{/each}
							</label>
						{:else}
							<label class="label">
								<span class="label-text-alt">Must be at least 8 characters</span>
							</label>
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

					<div class="form-control mt-6">
						<button
							type="submit"
							class="btn btn-primary w-full"
							disabled={isLoading || passwordErrors.length > 0}
						>
							{#if isLoading}
								<span class="loading loading-spinner"></span>
								Creating account...
							{:else}
								Create Account
							{/if}
						</button>
					</div>
				</form>

				<div class="divider">OR</div>

				<div class="text-center">
					<p class="text-sm">
						Already have an account?
						<a href="/login" class="link link-primary font-semibold">Login here</a>
					</p>
				</div>

				<div class="mt-4 text-center">
					<p class="text-xs text-base-content/60">
						By creating an account, you agree to our
						<a href="/terms" class="link link-primary">Terms of Service</a>
						and
						<a href="/privacy" class="link link-primary">Privacy Policy</a>
					</p>
				</div>
			</div>
		</div>
	</div>
</div>
