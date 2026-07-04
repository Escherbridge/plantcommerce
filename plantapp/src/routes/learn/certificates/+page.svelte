<script lang="ts">
	import { Container } from '$lib/components/layout';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const certificates = $derived(data.certificates ?? []);

	function formatDate(d: string | Date | null | undefined): string {
		if (!d) return '';
		return new Date(d).toLocaleDateString(undefined, {
			month: 'long',
			day: 'numeric',
			year: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>My Certificates | Aevani</title>
	<meta name="description" content="View and download your earned course completion certificates." />
</svelte:head>

<!-- Hero -->
<section class="bg-primary text-primary-content w-full py-16 lg:py-24">
	<Container>
		<div class="space-y-4">
			<span class="text-editorial text-secondary font-mono tracking-widest">ACHIEVEMENTS</span>
			<h1 class="font-display text-4xl lg:text-6xl font-bold uppercase tracking-tight">My Certificates</h1>
			<p class="text-lg text-primary-content/70 font-light max-w-2xl">
				Certificates of completion you've earned through your dedication to learning.
			</p>
		</div>
	</Container>
</section>

<section class="bg-base-100 w-full py-16 lg:py-24">
	<Container>
		{#if certificates.length === 0}
			<div class="rounded-3xl border border-base-200/50 bg-base-100 p-16 text-center max-w-2xl mx-auto">
				<svg xmlns="http://www.w3.org/2000/svg" class="w-20 h-20 mx-auto text-base-content/20 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
					<path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
				</svg>
				<h3 class="font-display text-2xl font-bold uppercase tracking-tight mb-3">No Certificates Yet</h3>
				<p class="text-base-content/60 font-light mb-8">
					Complete a course to earn your first certificate of completion.
				</p>
				<a href="/courses" class="btn btn-primary rounded-2xl font-display uppercase tracking-wider">
					Browse Courses
				</a>
			</div>
		{:else}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
				{#each certificates as item}
					{@const cert = item.certificate ?? item}
					{@const courseTitle = item.courseTitle ?? 'Course'}
					{@const uid = cert?.certificateUid ?? ''}
					<div class="rounded-3xl border border-base-200/50 bg-base-100 shadow-md hover:shadow-xl transition-all overflow-hidden">
						<!-- Certificate visual -->
						<div class="bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-content p-8 relative">
							<div class="absolute top-4 right-4 opacity-20">
								<svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
									<path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
								</svg>
							</div>
							<span class="text-editorial text-secondary font-mono text-xs tracking-widest">CERTIFICATE OF COMPLETION</span>
							<h3 class="font-display text-xl lg:text-2xl font-bold uppercase tracking-tight mt-3 line-clamp-2">
								{courseTitle}
							</h3>
						</div>

						<div class="p-6">
							<dl class="space-y-3 text-sm mb-6">
								<div class="flex justify-between items-center">
									<dt class="text-base-content/50 font-mono text-xs tracking-wider uppercase">Issued</dt>
									<dd class="font-medium">{formatDate(cert?.issuedAt)}</dd>
								</div>
								<div class="flex justify-between items-center gap-3">
									<dt class="text-base-content/50 font-mono text-xs tracking-wider uppercase">ID</dt>
									<dd class="font-mono text-xs truncate">{uid}</dd>
								</div>
							</dl>

							<div class="grid grid-cols-2 gap-3">
								<a
									href="/certificates/verify/{uid}"
									class="btn btn-outline btn-sm rounded-2xl font-display uppercase tracking-wider"
								>
									Verify
								</a>
								<a
									href="/certificates/verify/{uid}"
									target="_blank"
									rel="noopener"
									class="btn btn-primary btn-sm rounded-2xl font-display uppercase tracking-wider"
								>
									View
								</a>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</Container>
</section>
