<script lang="ts">
	import '../app.css';
	import { Header } from '$lib/components/navigation';

	let { children } = $props();
</script>

<div class="drawer">
	<input id="drawer-toggle" type="checkbox" class="drawer-toggle" />
	<div class="drawer-content flex flex-col min-h-screen">
		<header class="navbar bg-base-100 shadow-lg">
			<div class="flex-none">
				<label for="drawer-toggle" class="btn btn-square btn-ghost">
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
					</svg>
				</label>
			</div>
			<div class="flex-1">
				<a href="/" class="btn btn-ghost text-xl font-liter">PlantCommerce</a>
			</div>
		</header>

		<main class="flex-1 flex flex-col p-4 w-full max-w-7xl mx-auto">
			{@render children()}
		</main>

		<footer class="footer footer-center p-4 bg-base-300 text-base-content">
			<div>
				<p>&copy; 2024 PlantCommerce. All rights reserved.</p>
			</div>
		</footer>
	</div>
	<div class="drawer-side">
		<label for="drawer-toggle" class="drawer-overlay"></label>
		<div class="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
			<!-- Sidebar content here -->
			<h3 class="font-bold text-lg mb-4 font-liter">Navigation</h3>
			<ul>
				<li><a href="/" class="btn btn-ghost justify-start">Home</a></li>
			</ul>
		</div>
	</div>
</div>
