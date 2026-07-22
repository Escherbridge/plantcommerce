<script lang="ts">
	import '$lib/components/platform/platform.css';
	import { browser } from '$app/environment';

	let theme = $state('system');

	$effect(() => {
		if (!browser) return;
		const saved = localStorage.getItem('theme');
		if (saved) theme = saved;
	});

	function setTheme(value: string) {
		theme = value;
		if (!browser) return;
		localStorage.setItem('theme', value);
		if (value === 'system') {
			const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
			document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
		} else {
			document.documentElement.setAttribute('data-theme', value);
		}
	}
</script>

<div class="platform-content">
	<div class="platform-header">
		<h1 class="platform-header__title">Account Settings</h1>
		<p class="platform-header__subtitle">
			Theme preference is the only setting currently saved on this page.
		</p>
	</div>

	<div class="platform-card">
		<div class="platform-card__header">
			<h2 class="platform-card__title">Theme Preference</h2>
		</div>
		<div class="flex flex-wrap gap-3">
			{#each ['light', 'dark', 'system'] as option}
				<button
					class="platform-action-btn"
					class:active={theme === option}
					onclick={() => setTheme(option)}
				>
					{option}
				</button>
			{/each}
		</div>
	</div>

	<div class="platform-card">
		<div class="platform-card__header">
			<h2 class="platform-card__title">Unavailable settings</h2>
		</div>
		<div class="platform-empty">
			<p class="platform-empty__text">
				Email subscriptions, marketing preferences, order notifications, push notifications, and
				account-deletion controls are not offered here until they are backed by persisted consent,
				delivery, and account-management workflows.
			</p>
		</div>
	</div>
</div>
