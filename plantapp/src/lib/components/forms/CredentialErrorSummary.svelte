<script lang="ts">
	import {
		CREDENTIAL_ERROR_SUMMARY_HEADING,
		credentialSummaryItems,
		type CredentialFieldError
	} from '$lib/auth/credentialFieldErrors';

	let {
		errors,
		fieldIds,
		heading = CREDENTIAL_ERROR_SUMMARY_HEADING,
		id
	}: {
		errors: CredentialFieldError[];
		fieldIds: Record<string, string>;
		heading?: string;
		id?: string;
	} = $props();
</script>

<!-- Autofocus is the no-JS way to move focus to the error summary after a failed post. -->
<!-- svelte-ignore a11y_autofocus -->
<div class="credential-error-summary" role="alert" tabindex="-1" autofocus {id}>
	<h2>{heading}</h2>
	<ul>
		{#each credentialSummaryItems(errors) as item (item.id)}
			<li id={item.id}>
				{#if fieldIds[item.field]}
					<a href="#{fieldIds[item.field]}">{item.message}</a>
				{:else}
					{item.message}
				{/if}
			</li>
		{/each}
	</ul>
</div>

<style>
	.credential-error-summary {
		margin: 0 0 1rem;
		padding: 0.75rem 1rem;
		border: 1px solid oklch(var(--er) / 0.35);
		border-radius: 0.5rem;
		background: oklch(var(--er) / 0.08);
		color: oklch(var(--er));
	}

	h2 {
		margin: 0 0 0.35rem;
		font-size: 0.95rem;
		font-weight: 650;
		color: inherit;
	}

	ul {
		margin: 0;
		padding-left: 1.1rem;
	}

	li + li {
		margin-top: 0.25rem;
	}

	a {
		color: inherit;
	}
</style>
