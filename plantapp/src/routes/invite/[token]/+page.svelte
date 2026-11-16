<script lang="ts">
	import {
		attribution,
		errorCopy,
		landingHeading,
		landingTitle,
		noteHeading,
		roleMeaning,
		rolePhrase,
		statusPanel,
		verifyPanel,
		WHAT_HAPPENS_NEXT,
		WRONG_ACCOUNT_HEADING,
		wrongAccountBody
	} from '$lib/invites/copy';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let region = $state<HTMLElement | null>(null);
	const visit = $derived(data.visit);
	const title = $derived.by(() => {
		if (visit.kind === 'landing') return landingTitle(visit.role);
		if (visit.kind === 'status' || visit.kind === 'verify') {
			return `Your invite as ${rolePhrase(visit.role)} — Aevani`;
		}
		if (visit.kind === 'wrong_account') return 'This invite is for a different account — Aevani';
		return "This invite can't be used — Aevani";
	});

	$effect(() => {
		visit.kind;
		region?.focus();
	});
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="invite-public mx-auto max-w-3xl space-y-8 px-4 py-10">
	{#if visit.kind === 'landing'}
		<!-- svelte-ignore a11y_autofocus -->
		<div bind:this={region} tabindex="-1" autofocus>
			<h1 class="font-display text-4xl tracking-tight">{landingHeading(visit.role)}</h1>
			<p class="mt-3 text-base text-base-content/80">{attribution(visit.creatorName)}</p>
			<h2 class="font-display mt-8 text-2xl tracking-tight">What this role means</h2>
			<p class="mt-3 text-base text-base-content/80">{roleMeaning(visit.role)}</p>
			<h2 class="font-display mt-8 text-2xl tracking-tight">What happens next</h2>
			<p class="mt-3 text-base text-base-content/80">{WHAT_HAPPENS_NEXT}</p>
			{#if visit.note}
				<h2 class="font-display mt-8 text-2xl tracking-tight">{noteHeading(visit.creatorName)}</h2>
				<p class="mt-3 text-base whitespace-pre-wrap text-base-content/80">{visit.note}</p>
			{/if}
			<div class="mt-8 flex flex-wrap items-center gap-4">
				<a class="invite-target btn btn-primary" href={data.registerHref}>Create an account</a>
				<a class="invite-target" href={data.loginHref}>Sign in</a>
			</div>
		</div>
	{:else if visit.kind === 'wrong_account'}
		<!-- svelte-ignore a11y_autofocus -->
		<div role="status" tabindex="-1" autofocus bind:this={region}>
			<h1 class="font-display text-4xl tracking-tight">{WRONG_ACCOUNT_HEADING}</h1>
			<p class="mt-3 text-base text-base-content/80">{wrongAccountBody(visit.email)}</p>
			<div class="mt-8 flex flex-wrap items-center gap-4">
				<form method="post" action="?/continue">
					<button type="submit" class="invite-target btn btn-primary">
						Continue as {visit.email}
					</button>
				</form>
				<form method="post" action="?/signout">
					<button type="submit" class="invite-target">Sign out</button>
				</form>
			</div>
		</div>
	{:else if visit.kind === 'verify'}
		{@const panel = verifyPanel(visit.email)}
		<!-- svelte-ignore a11y_autofocus -->
		<div
			id="invite-complete"
			class="rounded-2xl border border-success/30 bg-success/10 p-6"
			role="status"
			tabindex="-1"
			autofocus
			bind:this={region}
		>
			<h1 class="font-display text-2xl tracking-tight">{panel.heading}</h1>
			<p class="mt-3 text-base text-base-content/80">{panel.body}</p>
			<p class="mt-4">
				<a class="invite-target" href={data.resendHref}>Request a new verification email</a>
			</p>
		</div>
	{:else if visit.kind === 'status'}
		{@const panel = statusPanel({
			role: visit.role,
			state: visit.state,
			email: visit.email,
			sellerApplicationReceived: visit.sellerApplicationReceived,
			dashboardAvailable: visit.dashboardAvailable
		})}
		<!-- svelte-ignore a11y_autofocus -->
		<div
			id="invite-complete"
			class="rounded-2xl border border-success/30 bg-success/10 p-6"
			role="status"
			tabindex="-1"
			autofocus
			bind:this={region}
		>
			<h1 class="font-display text-2xl tracking-tight">{panel.heading}</h1>
			<p class="mt-3 text-base text-base-content/80">{panel.body}</p>
			{#if panel.link}
				<p class="mt-4">
					<a class="invite-target" href={panel.link.href}>{panel.link.label}</a>
				</p>
			{/if}
		</div>
	{:else}
		{@const copy = errorCopy(visit.kind)}
		<!-- svelte-ignore a11y_autofocus -->
		<div role="status" tabindex="-1" autofocus bind:this={region}>
			<h1 class="font-display text-4xl tracking-tight">{copy.heading}</h1>
			<p class="mt-3 text-base text-base-content/80">{copy.body}</p>
			<p class="mt-6">
				<a class="invite-target" href="/">Go to the Aevani home page</a>
			</p>
			{#if visit.kind === 'used'}
				<p class="mt-3">
					<a class="invite-target" href="/login">Sign in</a>
				</p>
			{/if}
		</div>
	{/if}
</div>

<style>
	.invite-target {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 24px;
		min-height: 24px;
	}

	h1:focus,
	div:focus {
		outline: none;
	}
</style>
