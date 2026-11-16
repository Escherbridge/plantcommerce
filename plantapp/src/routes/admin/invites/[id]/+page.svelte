<script lang="ts">
	import { isInviteRole } from '$lib/auth/userRole';
	import {
		COPY_HELP_OK,
		COPY_LINK_FAILED,
		COPY_LINK_OK,
		REVOKE_DISABLED,
		REVOKE_STATUS,
		approvedStatus,
		detailHeading,
		detailSubtitle,
		displayName,
		nextStep,
		personHelpMessage,
		rejectedStatus,
		resendFailed,
		resendOk,
		roleLabel,
		roleRemovedStatus,
		unusedHelpMessage
	} from '$lib/invites/copy';
	import { formatBoiseDate } from '$lib/invites/dates';
	import { canStillRevoke, usesLabel } from '$lib/invites/status';
	import type { PageData } from './$types';

	let { data, form }: { data: PageData; form: { message?: string } | null } = $props();

	let copyMessage = $state('');
	let actionRegion = $state<HTMLElement | null>(null);
	let dialog = $state<HTMLDialogElement | null>(null);
	let dialogHeading = $state<HTMLHeadingElement | null>(null);
	let dialogOpener = $state<HTMLButtonElement | null>(null);
	let dialogMode = $state<'revoke' | 'remove' | 'reject'>('revoke');
	let dialogUseId = $state('');
	let dialogName = $state('');
	let dialogRole = $state<'affiliate' | 'seller' | 'instructor'>('affiliate');

	const detail = $derived(data.detail);
	const notice = $derived.by(() => {
		if (data.notice === 'revoked') return REVOKE_STATUS;
		if (data.notice === 'resent') return resendOk(data.noticeEmail);
		if (data.notice === 'resend-failed') return resendFailed(data.noticeEmail);
		if (!isInviteRole(data.noticeRole)) return '';
		if (data.notice === 'approved') return approvedStatus(data.noticeRole, data.noticeName);
		if (data.notice === 'rejected') return rejectedStatus(data.noticeRole, data.noticeName);
		if (data.notice === 'removed') return roleRemovedStatus(data.noticeRole, data.noticeName);
		return '';
	});

	$effect(() => {
		if (notice || form?.message) actionRegion?.focus();
	});

	function openDialog(
		mode: 'revoke' | 'remove' | 'reject',
		opener: HTMLButtonElement,
		use?: { id: string; name: string; role: 'affiliate' | 'seller' | 'instructor' }
	) {
		dialogMode = mode;
		dialogUseId = use?.id ?? '';
		dialogName = use?.name ?? '';
		dialogRole = use?.role ?? 'affiliate';
		dialogOpener = opener;
		dialog?.showModal();
		dialogHeading?.focus();
	}

	function closeDialog() {
		dialog?.close();
		dialogOpener?.focus();
	}

	async function copyText(value: string, success: string) {
		try {
			await navigator.clipboard.writeText(value);
			copyMessage = success;
		} catch {
			copyMessage = COPY_LINK_FAILED;
		}
	}
</script>

<svelte:head>
	<title>
		{detail
			? `${detailHeading(detail.invite.label, detail.invite.role)} — Aevani`
			: "We couldn't find this invite — Aevani"}
	</title>
</svelte:head>

<div class="platform-content">
	<p><a class="invite-target" href="/admin/invites">All invites</a></p>

	{#if !detail}
		<h1 class="platform-header__title">We couldn't find this invite.</h1>
		<p>
			It may have been deleted, or the address may be mistyped. Go back to all invites and open it
			from the list.
		</p>
	{:else}
		<header class="platform-header">
			<h1 class="platform-header__title">
				{detailHeading(detail.invite.label, detail.invite.role)}
			</h1>
			<p class="platform-header__subtitle">
				{detailSubtitle({
					createdAt: detail.invite.createdAt,
					creatorName: detail.invite.creatorName,
					status: detail.invite.displayStatus,
					revokedAt: detail.invite.revokedAt
				})}
			</p>
		</header>

		{#if notice || form?.message}
			<p
				id="invite-action-status"
				class="invite-status"
				role="status"
				tabindex="-1"
				bind:this={actionRegion}
			>
				{notice || form?.message}
			</p>
		{/if}
		{#if form?.message}
			<div id="invite-error-summary" role="alert" tabindex="-1">{form.message}</div>
		{/if}
		<p class="invite-live" aria-live="polite">{copyMessage}</p>

		<section class="platform-card">
			<label for="detail-invite-link">Invite link</label>
			<input
				id="detail-invite-link"
				class="invite-target input w-full"
				readonly
				value={detail.invite.url}
			/>
			<button
				type="button"
				class="invite-target"
				onclick={() => detail && copyText(detail.invite.url, COPY_LINK_OK)}
			>
				Copy link
			</button>
			<dl>
				<div>
					<dt>Role</dt>
					<dd>{roleLabel(detail.invite.role)}</dd>
				</div>
				<div>
					<dt>Expires</dt>
					<dd>
						{detail.invite.expiresAt ? formatBoiseDate(detail.invite.expiresAt) : 'No end date'}
					</dd>
				</div>
				<div>
					<dt>Uses</dt>
					<dd>{usesLabel(detail.invite.useCount, detail.invite.useLimit)}</dd>
				</div>
				<div>
					<dt>Note</dt>
					<dd>{detail.invite.note || 'No note for the invitee.'}</dd>
				</div>
			</dl>
			<button
				type="button"
				class="invite-target"
				onclick={() =>
					detail &&
					copyText(unusedHelpMessage(detail.invite.role, detail.invite.url), COPY_HELP_OK)}
			>
				Copy a help message
			</button>
			{#if canStillRevoke(detail.invite.displayStatus)}
				<button
					type="button"
					class="invite-target"
					onclick={(event) => openDialog('revoke', event.currentTarget)}
				>
					Revoke this invite
				</button>
			{:else}
				<button type="button" class="invite-target" disabled>{REVOKE_DISABLED}</button>
			{/if}
		</section>

		<section>
			<h2>People who used this link</h2>
			{#if detail.uses.length === 0}
				<div class="platform-empty">
					<p class="platform-empty__title">No one has used this link yet.</p>
					<p class="platform-empty__text">
						When someone completes the invite, they will show up here with their name, email, and
						the next step they still need to take.
					</p>
				</div>
			{:else}
				<div class="platform-table-wrapper">
					<table class="platform-table">
						<thead>
							<tr>
								<th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Verification</th><th
									>Next step</th
								><th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{#each detail.uses as person (person.id)}
								{@const name = displayName(person)}
								<tr>
									<td>{name}</td>
									<td>{person.email}</td>
									<td>
										{roleLabel(person.inviteRole)}{person.roleRemovedAt ? ' (removed)' : ''}
									</td>
									<td>{formatBoiseDate(person.createdAt)}</td>
									<td>{person.emailVerified ? 'Verified' : 'Not verified'}</td>
									<td>
										{nextStep({
											emailVerified: person.emailVerified,
											state: person.status,
											role: person.inviteRole,
											roleRemoved: person.roleRemovedAt != null,
											sellerApplicationReceived: person.sellerApplicationReceived
										})}
									</td>
									<td>
										{#if !person.emailVerified}
											<form method="post" action="?/resend">
												<input type="hidden" name="useId" value={person.id} />
												<button type="submit" class="invite-target">Resend verification</button>
											</form>
										{/if}
										<button
											type="button"
											class="invite-target"
											onclick={() =>
												copyText(
													personHelpMessage({
														name,
														email: person.email,
														url: detail.invite.url,
														emailVerified: person.emailVerified,
														state: person.status,
														role: person.inviteRole
													}),
													COPY_HELP_OK
												)}
										>
											Copy a help message
										</button>
										{#if person.status === 'pending' && !person.roleRemovedAt}
											<form method="post" action="?/approve">
												<input type="hidden" name="useId" value={person.id} />
												<button type="submit" class="invite-target">Approve {name}</button>
											</form>
											<button
												type="button"
												class="invite-target"
												onclick={(event) =>
													openDialog('reject', event.currentTarget, {
														id: person.id,
														name,
														role: person.inviteRole
													})}
											>
												Reject {name}
											</button>
										{/if}
										{#if person.status === 'approved' && !person.roleRemovedAt}
											<button
												type="button"
												class="invite-target"
												onclick={(event) =>
													openDialog('remove', event.currentTarget, {
														id: person.id,
														name,
														role: person.inviteRole
													})}
											>
												Remove {roleLabel(person.inviteRole).toLowerCase()} role
											</button>
										{/if}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</section>
	{/if}
</div>

<dialog
	bind:this={dialog}
	class="invite-dialog"
	aria-labelledby="invite-dialog-heading"
	onclose={() => dialogOpener?.focus()}
>
	<h2 id="invite-dialog-heading" tabindex="-1" bind:this={dialogHeading}>
		{#if dialogMode === 'revoke'}
			Revoke this invite?
		{:else if dialogMode === 'reject'}
			Reject this invite for {dialogName}?
		{:else}
			Remove the {dialogRole} role from {dialogName}?
		{/if}
	</h2>
	<p>
		{#if dialogMode === 'revoke'}
			The link will stop working for anyone who hasn't used it yet. People who already joined keep
			their accounts. This cannot be undone.
		{:else if dialogMode === 'reject'}
			They will not receive the {dialogRole} role. They can still sign in as a regular account.
		{:else}
			They can still sign in as a regular customer account. This does not delete their account, and
			it does not change anyone else's access to this invite.
		{/if}
	</p>
	{#if dialogMode === 'revoke'}
		<form method="post" action="?/revoke">
			<button type="submit" class="invite-target">Revoke invite</button>
			<button type="button" class="invite-target" onclick={closeDialog}>Keep the invite</button>
		</form>
	{:else if dialogMode === 'reject'}
		<form method="post" action="?/reject">
			<input type="hidden" name="useId" value={dialogUseId} />
			<button type="submit" class="invite-target">Reject the invite</button>
			<button type="button" class="invite-target" onclick={closeDialog}>Keep it pending</button>
		</form>
	{:else}
		<form method="post" action="?/remove">
			<input type="hidden" name="useId" value={dialogUseId} />
			<button type="submit" class="invite-target">Remove the role</button>
			<button type="button" class="invite-target" onclick={closeDialog}>Keep the role</button>
		</form>
	{/if}
</dialog>

<style>
	.invite-target {
		display: inline-flex;
		align-items: center;
		min-width: 24px;
		min-height: 24px;
	}

	.invite-dialog {
		max-width: 32rem;
		padding: 1.25rem;
		border-radius: 1rem;
	}

	.invite-live,
	.invite-status {
		margin: 0;
	}

	dl {
		display: grid;
		gap: 0.5rem;
	}

	dt {
		font-weight: 650;
	}
</style>
