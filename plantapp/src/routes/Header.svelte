<script lang="ts">
	import { page } from '$app/stores';
	
	// Theme switcher functionality
	let currentTheme = 'light';
	
	function toggleTheme() {
		const themes = ['light', 'dark', 'cupcake', 'forest', 'luxury', 'business'];
		const currentIndex = themes.indexOf(currentTheme);
		currentTheme = themes[(currentIndex + 1) % themes.length];
		document.documentElement.setAttribute('data-theme', currentTheme);
	}
</script>

<header class="navbar bg-base-100 shadow-lg">
	<div class="navbar-start">
		<!-- Mobile menu button -->
		<label for="drawer-toggle" class="btn btn-square btn-ghost lg:hidden">
			<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
			</svg>
		</label>
		
		<!-- Logo/Brand -->
		<a href="/" class="btn btn-ghost text-xl">
			🌱 PlantCommerce
		</a>
	</div>
	
	<!-- Desktop navigation -->
	<div class="navbar-center hidden lg:flex">
		<ul class="menu menu-horizontal px-1">
			<li><a href="/" class="btn btn-ghost" class:active={$page.url.pathname === '/'}>Home</a></li>
			<li><a href="/about" class="btn btn-ghost" class:active={$page.url.pathname === '/about'}>About</a></li>
			<li><a href="/demo" class="btn btn-ghost" class:active={$page.url.pathname.startsWith('/demo')}>Demo</a></li>
		</ul>
	</div>
	
	<div class="navbar-end">
		<!-- Theme selector -->
		<div class="dropdown dropdown-end">
			<button class="btn btn-ghost" aria-label="Theme selector">
				🎨 Theme
			</button>
			<ul class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
				<li><button on:click={() => { currentTheme = 'light'; document.documentElement.setAttribute('data-theme', 'light'); }}>Light</button></li>
				<li><button on:click={() => { currentTheme = 'dark'; document.documentElement.setAttribute('data-theme', 'dark'); }}>Dark</button></li>
				<li><button on:click={() => { currentTheme = 'cupcake'; document.documentElement.setAttribute('data-theme', 'cupcake'); }}>Cupcake</button></li>
				<li><button on:click={() => { currentTheme = 'forest'; document.documentElement.setAttribute('data-theme', 'forest'); }}>Forest</button></li>
				<li><button on:click={() => { currentTheme = 'luxury'; document.documentElement.setAttribute('data-theme', 'luxury'); }}>Luxury</button></li>
				<li><button on:click={() => { currentTheme = 'business'; document.documentElement.setAttribute('data-theme', 'business'); }}>Business</button></li>
			</ul>
		</div>
		
		<!-- User menu -->
		<div class="dropdown dropdown-end">
			<button class="btn btn-ghost btn-circle avatar" aria-label="User menu">
				<div class="w-10 rounded-full">
					<div class="bg-neutral-focus text-neutral-content rounded-full w-10 h-10 flex items-center justify-center">
						👤
					</div>
				</div>
			</button>
			<ul class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
				<li><a href="/profile">Profile</a></li>
				<li><a href="/settings">Settings</a></li>
				<li><hr class="my-2"/></li>
				<li><a href="/demo/lucia/login">Login</a></li>
			</ul>
		</div>
	</div>
</header>

<style>
	.active {
		@apply bg-primary text-primary-content;
	}
</style>
