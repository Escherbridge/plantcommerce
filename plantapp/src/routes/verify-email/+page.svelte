<script lang="ts">
	import { Container, Section } from '$lib/components/layout';
	import type { ActionData, PageData } from './$types';

	export let data: PageData;
	export let form: ActionData;
</script>

<Section>
	<Container>
		<div class="max-w-md mx-auto text-center">
			{#if form?.success}
				<div class="card bg-base-100 shadow-xl">
					<div class="card-body items-center text-center">
						<div class="text-success text-6xl mb-4" aria-hidden="true">✓</div>
						<h1 class="card-title text-2xl mb-2">Email verified</h1>
						<p class="mb-6">{form.message}</p>
						<a href="/login" class="btn btn-primary">Log in</a>
					</div>
				</div>
			{:else if data.token}
				<div class="card bg-base-100 shadow-xl">
					<div class="card-body items-center text-center">
						<h1 class="card-title text-2xl mb-2">Verify your email</h1>
						<p class="mb-6">Confirm that you want to verify this email address.</p>
						<form method="POST">
							<input type="hidden" name="token" value={data.token} />
							<button class="btn btn-primary" type="submit">Verify email</button>
						</form>
						{#if form?.message}
							<p class="mt-4 text-error" role="alert">{form.message}</p>
						{/if}
					</div>
				</div>
			{:else}
				<div class="card bg-base-100 shadow-xl">
					<div class="card-body items-center text-center">
						<div class="text-error text-6xl mb-4" aria-hidden="true">×</div>
						<h1 class="card-title text-2xl mb-2">Verification link required</h1>
						<p class="mb-6">Open the verification link from your email to continue.</p>
						<a href="/register" class="btn btn-outline">Back to registration</a>
					</div>
				</div>
			{/if}
		</div>
	</Container>
</Section>
