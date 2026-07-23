<script lang="ts">
	import { Container } from '$lib/components/layout';
	import type { PageData } from './$types';
	import { Icon } from '$lib/components/icons';

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
	<meta
		name="description"
		content="View and download your earned course completion certificates."
	/>
</svelte:head>

<!-- Hero -->
<section class="w-full bg-primary py-16 text-primary-content lg:py-24">
	<Container>
		<div class="space-y-4">
			<span class="text-editorial font-mono tracking-widest text-secondary">ACHIEVEMENTS</span>
			<h1 class="font-display text-4xl font-bold tracking-tight uppercase lg:text-6xl">
				My Certificates
			</h1>
			<p class="max-w-2xl text-lg font-light text-primary-content/70">
				Certificates of completion you've earned through your dedication to learning.
			</p>
		</div>
	</Container>
</section>

<section class="w-full bg-base-100 py-16 lg:py-24">
	<Container>
		{#if certificates.length === 0}
			<div
				class="mx-auto max-w-2xl rounded-3xl border border-base-200/50 bg-base-100 p-16 text-center"
			>
				<Icon name="shield-check" size={80} class="mx-auto mb-6 text-base-content/20" />
				<h3 class="font-display mb-3 text-2xl font-bold tracking-tight uppercase">
					No Certificates Yet
				</h3>
				<p class="mb-8 font-light text-base-content/60">
					Complete a course to earn your first certificate of completion.
				</p>
				<a
					href="/courses"
					class="font-display btn rounded-2xl tracking-wider uppercase btn-primary"
				>
					Browse Courses
				</a>
			</div>
		{:else}
			<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
				{#each certificates as item}
					{@const cert = item.certificate ?? item}
					{@const courseTitle = item.courseTitle ?? 'Course'}
					{@const uid = cert?.certificateUid ?? ''}
					<div
						class="overflow-hidden rounded-3xl border border-base-200/50 bg-base-100 shadow-md transition-all hover:shadow-xl"
					>
						<!-- Certificate visual -->
						<div class="relative bg-primary p-8 text-primary-content">
							<div class="absolute top-4 right-4 opacity-20">
								<Icon name="shield-check" size={64} />
							</div>
							<span class="text-editorial font-mono text-xs tracking-widest text-secondary"
								>CERTIFICATE OF COMPLETION</span
							>
							<h3
								class="font-display mt-3 line-clamp-2 text-xl font-bold tracking-tight uppercase lg:text-2xl"
							>
								{courseTitle}
							</h3>
						</div>

						<div class="p-6">
							<dl class="mb-6 space-y-3 text-sm">
								<div class="flex items-center justify-between">
									<dt class="font-mono text-xs tracking-wider text-base-content/50 uppercase">
										Issued
									</dt>
									<dd class="font-medium">{formatDate(cert?.issuedAt)}</dd>
								</div>
								<div class="flex items-center justify-between gap-3">
									<dt class="font-mono text-xs tracking-wider text-base-content/50 uppercase">
										ID
									</dt>
									<dd class="truncate font-mono text-xs">{uid}</dd>
								</div>
							</dl>

							<div class="grid grid-cols-2 gap-3">
								<a
									href="/certificates/verify/{uid}"
									class="font-display btn rounded-2xl tracking-wider uppercase btn-outline btn-sm"
								>
									Verify
								</a>
								<a
									href="/certificates/verify/{uid}"
									target="_blank"
									rel="noopener"
									class="font-display btn rounded-2xl tracking-wider uppercase btn-sm btn-primary"
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
