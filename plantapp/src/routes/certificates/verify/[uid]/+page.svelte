<script lang="ts">
	import { Container } from '$lib/components/layout';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const certificate = $derived(data.certificate);
	const uid = $derived(data.uid);

	const metadata = $derived.by(() => {
		if (!certificate?.metadata) return {};
		try {
			return typeof certificate.metadata === 'string'
				? JSON.parse(certificate.metadata)
				: certificate.metadata;
		} catch {
			return {};
		}
	});

	function formatDate(d: string | Date | null | undefined): string {
		if (!d) return '';
		return new Date(d).toLocaleDateString(undefined, {
			weekday: 'long',
			month: 'long',
			day: 'numeric',
			year: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>Verify Certificate {uid} | Aevani</title>
	<meta name="description" content="Verify the authenticity of a course completion certificate." />
</svelte:head>

<section class="min-h-screen w-full bg-base-200/30 py-16 lg:py-24">
	<Container>
		<div class="mx-auto max-w-3xl">
			<div class="mb-10 text-center">
				<span class="text-editorial font-mono tracking-widest text-secondary"
					>CERTIFICATE VERIFICATION</span
				>
				<h1 class="font-display mt-3 text-4xl font-bold tracking-tight uppercase lg:text-5xl">
					Verify Certificate
				</h1>
				<p class="mt-3 font-mono text-sm font-light tracking-wider text-base-content/60">
					ID: {uid}
				</p>
			</div>

			{#if certificate}
				<!-- Valid -->
				<div class="overflow-hidden rounded-3xl bg-base-100 shadow-xl">
					<div class="flex items-center gap-4 border-b border-success/20 bg-success/10 p-6">
						<div
							class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-success text-success-content"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-7 w-7"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								stroke-width="2.5"
							>
								<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
							</svg>
						</div>
						<div>
							<div class="font-display text-xl font-bold tracking-tight uppercase">
								Valid Certificate
							</div>
							<p class="text-sm text-base-content/60">
								This certificate has been verified as authentic.
							</p>
						</div>
					</div>

					<!-- Certificate body -->
					<div class="bg-gradient-to-br from-base-100 via-base-100 to-primary/5 p-8 lg:p-12">
						<div class="space-y-6 text-center">
							<div class="inline-block">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="mx-auto h-20 w-20 text-primary"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									stroke-width="1.25"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
									/>
								</svg>
							</div>

							<div>
								<span class="text-editorial font-mono text-xs tracking-widest text-secondary"
									>CERTIFIES COMPLETION OF</span
								>
								<h2
									class="font-display mt-3 text-2xl font-bold tracking-tight uppercase lg:text-4xl"
								>
									{metadata.courseTitle ?? 'Course'}
								</h2>
							</div>

							{#if metadata.learnerName}
								<div>
									<span class="text-editorial font-mono text-xs tracking-widest text-secondary"
										>AWARDED TO</span
									>
									<p class="font-display mt-2 text-xl font-bold">{metadata.learnerName}</p>
								</div>
							{/if}

							<div
								class="mx-auto grid max-w-md grid-cols-1 gap-6 border-t border-base-200/50 pt-6 sm:grid-cols-2"
							>
								<div>
									<span
										class="text-editorial block font-mono text-xs tracking-widest text-secondary"
										>ISSUED</span
									>
									<p class="mt-1 text-sm font-medium">{formatDate(certificate.issuedAt)}</p>
								</div>
								<div>
									<span
										class="text-editorial block font-mono text-xs tracking-widest text-secondary"
										>CERTIFICATE ID</span
									>
									<p class="mt-1 font-mono text-sm break-all">{certificate.certificateUid}</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			{:else}
				<!-- Not found -->
				<div class="overflow-hidden rounded-3xl bg-base-100 shadow-xl">
					<div class="flex items-center gap-4 border-b border-error/20 bg-error/10 p-6">
						<div
							class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-error text-error-content"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-7 w-7"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								stroke-width="2.5"
							>
								<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
							</svg>
						</div>
						<div>
							<div class="font-display text-xl font-bold tracking-tight uppercase">Not Found</div>
							<p class="text-sm text-base-content/60">
								No certificate matches this verification ID.
							</p>
						</div>
					</div>
					<div class="p-8 text-center lg:p-12">
						<p class="mx-auto max-w-md font-light text-base-content/60">
							The certificate ID you entered could not be verified. Please double-check the ID and
							try again.
						</p>
						<a
							href="/"
							class="font-display btn mt-6 rounded-2xl tracking-wider uppercase btn-primary"
						>
							Return Home
						</a>
					</div>
				</div>
			{/if}
		</div>
	</Container>
</section>
