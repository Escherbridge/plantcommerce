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

<section class="bg-base-200/30 w-full min-h-screen py-16 lg:py-24">
	<Container>
		<div class="max-w-3xl mx-auto">
			<div class="text-center mb-10">
				<span class="text-editorial text-secondary font-mono tracking-widest">CERTIFICATE VERIFICATION</span>
				<h1 class="font-display text-4xl lg:text-5xl font-bold uppercase tracking-tight mt-3">
					Verify Certificate
				</h1>
				<p class="text-base-content/60 font-light mt-3 font-mono text-sm tracking-wider">
					ID: {uid}
				</p>
			</div>

			{#if certificate}
				<!-- Valid -->
				<div class="rounded-3xl bg-base-100 shadow-xl overflow-hidden">
					<div class="bg-success/10 border-b border-success/20 p-6 flex items-center gap-4">
						<div class="w-12 h-12 rounded-full bg-success text-success-content flex items-center justify-center flex-shrink-0">
							<svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
								<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
							</svg>
						</div>
						<div>
							<div class="font-display text-xl font-bold uppercase tracking-tight">Valid Certificate</div>
							<p class="text-sm text-base-content/60">This certificate has been verified as authentic.</p>
						</div>
					</div>

					<!-- Certificate body -->
					<div class="p-8 lg:p-12 bg-gradient-to-br from-base-100 via-base-100 to-primary/5">
						<div class="text-center space-y-6">
							<div class="inline-block">
								<svg xmlns="http://www.w3.org/2000/svg" class="w-20 h-20 mx-auto text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.25">
									<path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
								</svg>
							</div>

							<div>
								<span class="text-editorial text-secondary font-mono text-xs tracking-widest">CERTIFIES COMPLETION OF</span>
								<h2 class="font-display text-2xl lg:text-4xl font-bold uppercase tracking-tight mt-3">
									{metadata.courseTitle ?? 'Course'}
								</h2>
							</div>

							{#if metadata.learnerName}
								<div>
									<span class="text-editorial text-secondary font-mono text-xs tracking-widest">AWARDED TO</span>
									<p class="font-display text-xl font-bold mt-2">{metadata.learnerName}</p>
								</div>
							{/if}

							<div class="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-base-200/50 max-w-md mx-auto">
								<div>
									<span class="text-editorial text-secondary font-mono text-xs tracking-widest block">ISSUED</span>
									<p class="text-sm font-medium mt-1">{formatDate(certificate.issuedAt)}</p>
								</div>
								<div>
									<span class="text-editorial text-secondary font-mono text-xs tracking-widest block">CERTIFICATE ID</span>
									<p class="text-sm font-mono mt-1 break-all">{certificate.certificateUid}</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			{:else}
				<!-- Not found -->
				<div class="rounded-3xl bg-base-100 shadow-xl overflow-hidden">
					<div class="bg-error/10 border-b border-error/20 p-6 flex items-center gap-4">
						<div class="w-12 h-12 rounded-full bg-error text-error-content flex items-center justify-center flex-shrink-0">
							<svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
								<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
							</svg>
						</div>
						<div>
							<div class="font-display text-xl font-bold uppercase tracking-tight">Not Found</div>
							<p class="text-sm text-base-content/60">No certificate matches this verification ID.</p>
						</div>
					</div>
					<div class="p-8 lg:p-12 text-center">
						<p class="text-base-content/60 font-light max-w-md mx-auto">
							The certificate ID you entered could not be verified. Please double-check the ID and try again.
						</p>
						<a href="/" class="btn btn-primary mt-6 rounded-2xl font-display uppercase tracking-wider">
							Return Home
						</a>
					</div>
				</div>
			{/if}
		</div>
	</Container>
</section>
