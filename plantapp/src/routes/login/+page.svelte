<script lang="ts">
	import { trpc } from '$lib/trpc/client';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

	let usernameOrEmail = $state('');
	let password = $state('');
	let errorMessage = $state('');
	let isLoading = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		errorMessage = '';
		isLoading = true;

		try {
			const result = await trpc.auth.login.mutate({
				usernameOrEmail,
				password
			});

			if (result.sessionToken) {
				// IMPORTANT: Set the cookie
				document.cookie = `auth-session=${result.sessionToken}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;

				// Wait a bit for cookie to be set, then redirect
				setTimeout(() => {
					if (browser) {
						window.location.href = '/account/profile';
					}
				}, 100);
			}
		} catch (error: any) {
			console.error('Login error:', error);
			errorMessage = error.message || 'Login failed. Please check your credentials.';
		} finally {
			isLoading = false;
		}
	}
</script>

<svelte:head>
	<title>Login - Aevani</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-base-200 py-12 px-4 sm:px-6 lg:px-8">
	<div class="max-w-md w-full">
		<div class="card bg-base-100 shadow-xl">
			<div class="card-body">
				<h2 class="card-title text-3xl font-bold text-center mb-6">Login to Aevani</h2>

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
					<div class="form-control">
						<label class="label" for="usernameOrEmail">
							<span class="label-text">Username or Email</span>
						</label>
						<input
							id="usernameOrEmail"
							type="text"
							placeholder="Enter your username or email"
							class="input input-bordered w-full"
							bind:value={usernameOrEmail}
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
							placeholder="Enter your password"
							class="input input-bordered w-full"
							bind:value={password}
							required
							disabled={isLoading}
							minlength="8"
						/>
						<div class="label">
							<a href="/forgot-password" class="label-text-alt link link-hover">
								Forgot password?
							</a>
						</div>
					</div>

					<div class="form-control mt-6">
						<button type="submit" class="btn btn-primary w-full" disabled={isLoading}>
							{#if isLoading}
								<span class="loading loading-spinner"></span>
								Logging in...
							{:else}
								Login
							{/if}
						</button>
					</div>
				</form>

				<div class="divider">OR</div>

				<div class="text-center">
					<p class="text-sm">
						Don't have an account?
						<a href="/register" class="link link-primary font-semibold">Register here</a>
					</p>
				</div>
			</div>
		</div>
	</div>
</div>
