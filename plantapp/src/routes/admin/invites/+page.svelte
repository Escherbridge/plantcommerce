<script lang="ts">
	import { enhance } from '$app/forms';
	import CredentialErrorSummary from '$lib/components/forms/CredentialErrorSummary.svelte';
	import { inviteRoles, isInviteRole, type InviteRole } from '$lib/auth/userRole';
	import { formatBoiseDate } from '$lib/invites/dates';
	import {
		APPROVE_NEEDS_VERIFICATION,
		COPY_LINK_FAILED,
		COPY_LINK_OK,
		approvedStatus,
		createdPanelExtra,
		declinedStatus,
		displayName,
		listRowTitle,
		nextStep,
		REVOKE_DISABLED,
		REVOKE_STATUS,
		roleLabel,
		rolePhrase
	} from '$lib/invites/copy';
	import { canStillRevoke, statusLabel, usesLabel } from '$lib/invites/status';
	import {
		INVITE_ERROR_SUMMARY_HEADING,
		INVITE_TRANSPORT_ERROR,
		type InviteFieldError
	} from '$lib/invites/validation';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let submitting = $state(false);
	let clientTransport = $state(false);
	let copyMessage = $state('');
	let statusFilter = $state('all');
	let searchQuery = $state('');
	let revokeId = $state('');
	let dialog = $state<HTMLDialogElement | null>(null);
	let revokeHeading = $state<HTMLHeadingElement | null>(null);
	let revokeOpener = $state<HTMLButtonElement | null>(null);
	let createdPanel = $state<HTMLElement | null>(null);
	let revokedNotice = $state<HTMLElement | null>(null);
	let approvalFilter = $state(data.approval === 'pending' ? 'pending' : 'all');
	let decisionMode = $state<'approve' | 'decline'>('approve');
	let decisionUseId = $state('');
	let decisionName = $state('');
	let decisionRole = $state<InviteRole>('affiliate');
	let decisionDialog = $state<HTMLDialogElement | null>(null);
	let decisionHeading = $state<HTMLHeadingElement | null>(null);
	let decisionOpener = $state<HTMLButtonElement | null>(null);

	const waitingPeople = $derived(
		(data.waiting ?? []).filter((person) => approvalFilter === 'all' || person.status === 'pending')
	);
	const decisionNotice = $derived.by(() => {
		if (!isInviteRole(data.noticeRole)) return '';
		if (data.notice === 'approved') return approvedStatus(data.noticeRole, data.noticeName);
		if (data.notice === 'declined') return declinedStatus(data.noticeRole, data.noticeName);
		return '';
	});

	function pendingCount(id: string): number {
		return (data.waiting ?? []).filter(
			(person) => person.inviteId === id && person.status === 'pending'
		).length;
	}

	function openDecision(
		mode: 'approve' | 'decline',
		opener: HTMLButtonElement,
		person: {
			id: string;
			name: string;
			role: InviteRole;
		}
	) {
		decisionMode = mode;
		decisionUseId = person.id;
		decisionName = person.name;
		decisionRole = person.role;
		decisionOpener = opener;
		decisionDialog?.showModal();
		decisionHeading?.focus();
	}

	const values = $derived(form && 'values' in form ? form.values : undefined);
	const fieldErrors = $derived(
		(form && 'fieldErrors' in form && form.fieldErrors
			? form.fieldErrors
			: []) as InviteFieldError[]
	);
	const transportError = $derived(
		clientTransport || (form && 'transport' in form && form.transport === true)
	);
	const selectedRole = $derived(
		values?.role || (inviteRoles.includes(data.roleQuery as InviteRole) ? data.roleQuery : '')
	);

	function errorFor(field: InviteFieldError['field']): string | undefined {
		return fieldErrors.find((item) => item.field === field)?.message;
	}

	function describedBy(field: InviteFieldError['field'], hintId: string): string | undefined {
		const ids = [hintId];
		if (errorFor(field)) ids.push(`${field}-error`);
		return ids.join(' ');
	}

	const filtered = $derived.by(() => {
		const query = searchQuery.trim().toLowerCase();
		return data.invites.filter((invite) => {
			if (statusFilter !== 'all' && invite.displayStatus !== statusFilter) return false;
			if (!query) return true;
			const haystack = [
				invite.label,
				invite.role,
				roleLabel(invite.role),
				invite.creatorEmail,
				...invite.useEmails
			]
				.filter(Boolean)
				.join(' ')
				.toLowerCase();
			return haystack.includes(query);
		});
	});

	const filtersHideRows = $derived(data.invites.length > 0 && filtered.length === 0);

	$effect(() => {
		if (data.created) createdPanel?.focus();
	});

	$effect(() => {
		if (data.revokedNotice) revokedNotice?.focus();
	});

	function openRevoke(id: string, opener: HTMLButtonElement) {
		revokeId = id;
		revokeOpener = opener;
		dialog?.showModal();
		revokeHeading?.focus();
	}

	function closeRevoke() {
		dialog?.close();
		revokeOpener?.focus();
	}

	async function copyText(value: string) {
		try {
			await navigator.clipboard.writeText(value);
			copyMessage = COPY_LINK_OK;
		} catch {
			copyMessage = COPY_LINK_FAILED;
		}
	}
</script>

<svelte:head>
	<title>Invites — Aevani</title>
</svelte:head>

<div class="platform-content">
	<header class="platform-header">
		<h1 class="platform-header__title">Invites</h1>
		<p class="platform-header__subtitle">
			Create a link when you want someone to join as an affiliate, a seller, or another role the
			site already uses.
		</p>
	</header>

	{#if data.revokedNotice}
		<p
			id="invite-revoked"
			class="invite-status"
			role="status"
			tabindex="-1"
			bind:this={revokedNotice}
		>
			{REVOKE_STATUS}
		</p>
	{/if}
	{#if decisionNotice}
		<p class="invite-status" role="status" tabindex="-1">{decisionNotice}</p>
	{/if}

	{#if data.created}
		<!-- svelte-ignore a11y_autofocus -->
		<div
			id="invite-created"
			class="invite-status rounded-2xl border border-success/30 bg-success/10 p-6"
			role="status"
			tabindex="-1"
			autofocus
			bind:this={createdPanel}
		>
			<h2 class="font-display text-2xl tracking-tight">Invite link created</h2>
			<p class="mt-3">
				This link is ready to send. Anyone who opens it will see what the role involves and can
				create or sign in to an account.
			</p>
			<p class="mt-3">{createdPanelExtra(data.created.role)}</p>
			<label class="mt-4 block" for="created-invite-link">Invite link</label>
			<input
				id="created-invite-link"
				class="invite-target input-bordered input mt-1 w-full"
				readonly
				value={data.created.url}
			/>
			<div class="mt-4 flex flex-wrap gap-3">
				<button
					type="button"
					class="invite-target platform-action-btn"
					onclick={() => data.created && copyText(data.created.url)}
				>
					Copy link
				</button>
				<a class="invite-target platform-action-btn" href="/admin/invites/{data.created.id}">
					View this invite
				</a>
			</div>
		</div>
	{/if}

	<p class="invite-live" aria-live="polite">{copyMessage}</p>

	<section class="platform-card">
		<h2>Create an invite link</h2>
		{#if transportError}
			<p class="invite-alert" role="alert">{INVITE_TRANSPORT_ERROR}</p>
		{/if}
		<form
			method="post"
			class="invite-form"
			use:enhance={() => {
				submitting = true;
				clientTransport = false;
				return async ({ result, update }) => {
					submitting = false;
					if (result.type === 'error') {
						clientTransport = true;
						return;
					}
					await update();
				};
			}}
		>
			{#if fieldErrors.length > 0}
				<CredentialErrorSummary
					id="invite-error-summary"
					heading={INVITE_ERROR_SUMMARY_HEADING}
					errors={fieldErrors}
					fieldIds={{
						role: 'role',
						label: 'label',
						expires: 'expires',
						useLimit: 'useLimit',
						note: 'note'
					}}
				/>
			{/if}

			<fieldset
				id="role"
				role="radiogroup"
				aria-invalid={errorFor('role') ? 'true' : undefined}
				aria-describedby={describedBy('role', 'role-hint')}
			>
				<legend>Role</legend>
				<p id="role-hint">
					Choose the role this link is for. You can invite an affiliate, a seller, or an instructor.
				</p>
				{#each inviteRoles as role (role)}
					<label class="invite-target" for="role-{role}">
						<input
							id="role-{role}"
							type="radio"
							name="role"
							value={role}
							checked={selectedRole === role}
						/>
						{roleLabel(role)}
					</label>
				{/each}
				{#if errorFor('role')}
					<p id="role-error">{errorFor('role')}</p>
				{/if}
			</fieldset>

			<div>
				<label for="label">Label (optional)</label>
				<input
					id="label"
					name="label"
					class="invite-target input-bordered input w-full"
					placeholder="Spring seed house outreach"
					value={values?.label ?? ''}
					maxlength="120"
					aria-invalid={errorFor('label') ? 'true' : undefined}
					aria-describedby={describedBy('label', 'label-hint')}
				/>
				<p id="label-hint">
					A name only you will see, so you can tell this link apart from others.
				</p>
				{#if errorFor('label')}<p id="label-error">{errorFor('label')}</p>{/if}
			</div>

			<div>
				<label for="expires">Expires (optional)</label>
				<input
					id="expires"
					name="expires"
					type="date"
					class="invite-target input-bordered input w-full"
					value={values?.expires ?? ''}
					aria-invalid={errorFor('expires') ? 'true' : undefined}
					aria-describedby={describedBy('expires', 'expires-hint')}
				/>
				<p id="expires-hint">
					Leave this blank if the link should stay open until you revoke it or it reaches a use
					limit.
				</p>
				{#if errorFor('expires')}<p id="expires-error">{errorFor('expires')}</p>{/if}
			</div>

			<div>
				<label for="useLimit">Use limit (optional)</label>
				<input
					id="useLimit"
					name="useLimit"
					type="number"
					min="1"
					step="1"
					class="invite-target input-bordered input w-full"
					value={values?.useLimit ?? ''}
					aria-invalid={errorFor('useLimit') ? 'true' : undefined}
					aria-describedby={describedBy('useLimit', 'use-limit-hint')}
				/>
				<p id="use-limit-hint">
					Leave this blank if more than one person can use the link. Enter 1 if this invite is for a
					single person.
				</p>
				{#if errorFor('useLimit')}<p id="useLimit-error">{errorFor('useLimit')}</p>{/if}
			</div>

			<div>
				<label for="note">Note for the invitee (optional)</label>
				<textarea
					id="note"
					name="note"
					class="invite-target textarea-bordered textarea w-full"
					maxlength="1000"
					aria-invalid={errorFor('note') ? 'true' : undefined}
					aria-describedby={describedBy('note', 'note-hint')}>{values?.note ?? ''}</textarea
				>
				<p id="note-hint">
					This short note appears on the invite page. Do not include a referral share, payout
					timing, or a price.
				</p>
				{#if errorFor('note')}<p id="note-error">{errorFor('note')}</p>{/if}
			</div>

			<button type="submit" class="invite-target platform-action-btn" disabled={submitting}>
				{submitting ? 'Creating the invite…' : 'Create invite link'}
			</button>
		</form>
	</section>

	<section>
		<h2>Waiting for approval</h2>
		<div class="admin-filters">
			<label for="approvals">Approvals</label>
			<select id="approvals" class="invite-target admin-filter-select" bind:value={approvalFilter}>
				<option value="all">All</option>
				<option value="pending">Pending</option>
			</select>
		</div>
		{#if waitingPeople.length === 0}
			<div class="platform-empty">
				<p class="platform-empty__title">No one is waiting for approval.</p>
				<p class="platform-empty__text">
					When someone finishes an invite, they will show up here until you approve or decline them.
				</p>
			</div>
		{:else}
			<div class="platform-table-wrapper">
				<table class="platform-table">
					<thead>
						<tr>
							<th>Name</th>
							<th>Email</th>
							<th>Role</th>
							<th>Invite</th>
							<th>Next step</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{#each waitingPeople as person (person.id)}
							{@const name = displayName(person)}
							<tr>
								<td>{name}</td>
								<td>{person.email}</td>
								<td>{roleLabel(person.inviteRole)}</td>
								<td>
									<a class="invite-target" href="/admin/invites/{person.inviteId}?approval=pending">
										{listRowTitle({
											label: person.inviteLabel,
											role: person.inviteRole,
											createdAt: person.inviteCreatedAt
										})}
									</a>
								</td>
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
									{#if person.status === 'pending'}
										{#if person.emailVerified}
											<button
												type="button"
												class="invite-target"
												onclick={(event) =>
													openDecision('approve', event.currentTarget, {
														id: person.id,
														name,
														role: person.inviteRole
													})}
											>
												Approve
											</button>
										{:else}
											<button
												type="button"
												class="invite-target"
												disabled
												aria-describedby="approve-wait-{person.id}"
											>
												Approve
											</button>
											<span id="approve-wait-{person.id}">{APPROVE_NEEDS_VERIFICATION}</span>
										{/if}
										<button
											type="button"
											class="invite-target admin-table-btn--reject"
											onclick={(event) =>
												openDecision('decline', event.currentTarget, {
													id: person.id,
													name,
													role: person.inviteRole
												})}
										>
											Decline
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

	<section>
		<h2>Invite links</h2>
		<div class="admin-filters">
			<label for="invite-status">Status</label>
			<select
				id="invite-status"
				class="invite-target admin-filter-select"
				bind:value={statusFilter}
			>
				<option value="all">All statuses</option>
				<option value="active">Active</option>
				<option value="used_up">Used up</option>
				<option value="expired">Expired</option>
				<option value="revoked">Revoked</option>
			</select>
			<label for="invite-search">Search invites</label>
			<input
				id="invite-search"
				class="invite-target admin-search-input"
				placeholder="Search by label, role, or email…"
				bind:value={searchQuery}
			/>
		</div>

		{#if filtered.length > 0}
			<div class="platform-table-wrapper">
				<table class="platform-table">
					<thead>
						<tr>
							<th>Label</th>
							<th>Role</th>
							<th>Status</th>
							<th>Uses</th>
							<th>Created</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{#each filtered as invite (invite.id)}
							<tr>
								<td>
									<a class="invite-target" href="/admin/invites/{invite.id}">
										{listRowTitle(invite)}
									</a>
								</td>
								<td>{roleLabel(invite.role)}</td>
								<td>{statusLabel(invite.displayStatus)}</td>
								<td>
									{usesLabel(invite.useCount, invite.useLimit)}
									{#if pendingCount(invite.id)}
										· {pendingCount(invite.id)} pending
									{/if}
								</td>
								<td>{formatBoiseDate(invite.createdAt)}</td>
								<td>
									<button type="button" class="invite-target" onclick={() => copyText(invite.url)}>
										Copy link
									</button>
									<a class="invite-target" href="/admin/invites/{invite.id}">View</a>
									{#if canStillRevoke(invite.displayStatus)}
										<button
											type="button"
											class="invite-target admin-table-btn--reject"
											onclick={(event) => openRevoke(invite.id, event.currentTarget)}
										>
											Revoke
										</button>
									{:else}
										<button
											type="button"
											class="invite-target"
											disabled
											aria-describedby="revoke-disabled-{invite.id}"
										>
											Revoke
										</button>
										<span id="revoke-disabled-{invite.id}">{REVOKE_DISABLED}</span>
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:else if filtersHideRows}
			<div class="platform-empty">
				<p class="platform-empty__title">No invites match</p>
				<p class="platform-empty__text">Try a different status or a shorter search.</p>
			</div>
		{:else}
			<div class="platform-empty">
				<p class="platform-empty__title">No invites yet</p>
				<p class="platform-empty__text">
					Create a link above when you want to invite someone. Nothing is listed here until you do.
				</p>
			</div>
		{/if}
	</section>
</div>

<dialog
	bind:this={dialog}
	class="invite-dialog"
	aria-labelledby="revoke-heading"
	onclose={() => revokeOpener?.focus()}
>
	<h2 id="revoke-heading" tabindex="-1" bind:this={revokeHeading}>Revoke this invite?</h2>
	<p>
		The link will stop working for anyone who hasn't used it yet. People who already joined keep
		their accounts. This cannot be undone.
	</p>
	<form method="post" action="?/revoke">
		<input type="hidden" name="id" value={revokeId} />
		<button type="submit" class="invite-target admin-table-btn--reject">Revoke invite</button>
		<button type="button" class="invite-target" onclick={closeRevoke}>Keep the invite</button>
	</form>
</dialog>

<dialog
	bind:this={decisionDialog}
	class="invite-dialog"
	aria-labelledby="decision-heading"
	onclose={() => decisionOpener?.focus()}
>
	<h2 id="decision-heading" tabindex="-1" bind:this={decisionHeading}>
		{#if decisionMode === 'approve'}
			Approve {decisionName} as {rolePhrase(decisionRole)}?
		{:else}
			Decline {decisionName}?
		{/if}
	</h2>
	<p>
		{#if decisionMode === 'approve'}
			They'll get the role, and we'll let them know. This does not change anyone else's access to
			this invite.
		{:else}
			They won't get the role. Their account stays, and you can invite them again later.
		{/if}
	</p>
	<form method="post" action={decisionMode === 'approve' ? '?/approve' : '?/decline'}>
		<input type="hidden" name="useId" value={decisionUseId} />
		<button type="submit" class="invite-target"
			>{decisionMode === 'approve' ? 'Approve' : 'Decline'}</button
		>
		<button
			type="button"
			class="invite-target"
			onclick={() => {
				decisionDialog?.close();
				decisionOpener?.focus();
			}}
		>
			{decisionMode === 'approve' ? "Don't approve yet" : 'Keep them pending'}
		</button>
	</form>
</dialog>

<style>
	.invite-target {
		display: inline-flex;
		align-items: center;
		min-width: 24px;
		min-height: 24px;
	}

	.invite-form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.invite-form label,
	.invite-form legend {
		font-weight: 650;
	}

	.invite-status,
	.invite-alert,
	.invite-live {
		margin: 0;
	}

	.invite-alert {
		border: 1px solid oklch(var(--er) / 0.35);
		border-radius: 1rem;
		background: oklch(var(--er) / 0.08);
		padding: 1rem;
	}

	.invite-dialog {
		max-width: 32rem;
		padding: 1.25rem;
		border: 1px solid var(--input-border);
		border-radius: 1rem;
	}

	.invite-dialog::backdrop {
		background: oklch(0 0 0 / 0.4);
	}

	.admin-filters {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		align-items: center;
		margin: 0.75rem 0 1rem;
	}

	.admin-search-input,
	.admin-filter-select {
		min-height: 24px;
		padding: 0.625rem 1rem;
		border: 1.5px solid var(--input-border);
		border-radius: var(--input-radius, 10px);
		background: oklch(var(--b1));
	}

	.admin-table-btn--reject {
		color: oklch(var(--er));
	}
</style>
