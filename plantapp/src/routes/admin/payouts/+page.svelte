<script lang="ts">
	import '$lib/components/platform/platform.css';

	let { data, form } = $props();
</script>

<div class="platform-content">
	<div class="platform-header">
		<h1 class="platform-header__title">Payouts</h1>
		<p class="platform-header__subtitle">
			Recorded amounts. Transfers stay off until payouts are turned on.
		</p>
	</div>
	<div class="platform-card">
		<ul>
			<li>Pending: {data.pending}</li>
			<li>Held: {data.held}</li>
			<li>Released: {data.released}</li>
			<li>Paid: {data.paid}</li>
			<li>Seller debt: {data.debt}</li>
		</ul>
		<p>
			<a href="/admin/payouts/reconciliation">Reconciliation</a>
			·
			<a href="/admin/payouts/export">Download CSV</a>
		</p>
	</div>
	<div class="platform-card">
		<h2>Accounts still setting up</h2>
		{#if data.accountsNeedingSetup.length === 0}
			<p>None.</p>
		{:else}
			<ul>
				{#each data.accountsNeedingSetup as account (account.id)}
					<li>{account.ownerType} · {account.id}</li>
				{/each}
			</ul>
		{/if}
	</div>
	<div class="platform-card">
		<h2>Failed or skipped transfers</h2>
		{#if data.failedTransfers.length === 0}
			<p>None.</p>
		{:else}
			<ul>
				{#each data.failedTransfers as transfer (transfer.id)}
					<li>{transfer.kind}: {transfer.amount} {transfer.failureReason ?? ''}</li>
				{/each}
			</ul>
		{/if}
	</div>
	<div class="platform-card">
		<h2>Batches waiting</h2>
		{#if data.pendingBatches.length === 0}
			<p>None.</p>
		{:else}
			<ul>
				{#each data.pendingBatches as batch (batch.id)}
					<li>
						{batch.amount}
						<form method="POST" action="?/approve">
							<input type="hidden" name="batchId" value={batch.id} />
							<button class="platform-action-btn" type="submit">Approve batch</button>
						</form>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
	<div class="platform-card">
		<form method="POST">
			<button class="platform-action-btn" type="submit">Run hold check</button>
		</form>
		<form method="POST" action="?/transfers">
			<button class="platform-action-btn" type="submit">Run seller transfers</button>
		</form>
		<form method="POST" action="?/batch">
			<button class="platform-action-btn" type="submit">Run affiliate batch</button>
		</form>
		{#if form?.summary}
			<p>{form.summary}</p>
		{/if}
	</div>
</div>
