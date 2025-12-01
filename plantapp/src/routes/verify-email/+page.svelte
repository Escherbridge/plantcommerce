<script lang="ts">
	import { Container, Section } from '$lib/components/layout';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<Section>
	<Container>
		<div class="max-w-md mx-auto text-center">
			{#if data.success}
				<div class="card bg-base-100 shadow-xl">
					<div class="card-body items-center text-center">
						<div class="text-success text-6xl mb-4">✓</div>
						<h2 class="card-title text-2xl mb-2">Email Verified!</h2>
						<p class="mb-6">{data.message}</p>
						<a href="/login" class="btn btn-primary">Log In</a>
					</div>
				</div>
			{:else}
				<div class="card bg-base-100 shadow-xl">
					<div class="card-body items-center text-center">
						<div class="text-error text-6xl mb-4">✕</div>
						<h2 class="card-title text-2xl mb-2">Verification Failed</h2>
						<p class="mb-6">{data.message}</p>
						<a href="/register" class="btn btn-outline">Back to Registration</a>
					</div>
				</div>
			{/if}
		</div>
	</Container>
</Section>
