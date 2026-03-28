<script lang="ts">
	import type { LayoutData } from './$types';

	let { data, children } = $props();
</script>

<div class="drawer lg:drawer-open">
	<input id="admin-drawer" type="checkbox" class="drawer-toggle" />
	<div class="drawer-content">
		<!-- Page content -->
		<div class="navbar bg-base-200 lg:hidden">
			<div class="flex-none">
				<label for="admin-drawer" class="btn btn-square btn-ghost">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						class="inline-block w-5 h-5 stroke-current"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 6h16M4 12h16M4 18h16"
						></path>
					</svg>
				</label>
			</div>
			<div class="flex-1">
				<a href="/admin" class="btn btn-ghost text-xl font-display uppercase tracking-tight">Admin Dashboard</a>
			</div>
		</div>

		<div class="p-6">
			{@render children()}
		</div>
	</div>

	<!-- Sidebar -->
	<div class="drawer-side">
		<label for="admin-drawer" class="drawer-overlay"></label>
		<aside class="bg-base-200 w-64 min-h-screen">
			<div class="p-4 border-b border-base-200/30">
				<h2 class="text-2xl font-display uppercase tracking-tight">Admin Panel</h2>
				<p class="text-sm text-base-content/70">Aevani</p>
			</div>

			<ul class="menu p-4 space-y-1">
				<li>
					<a href="/admin" class="gap-3">
						<svg viewBox="0 0 24 24" class="w-5 h-5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
							<path d="M4 20h16M8 16V8M12 16V4M16 16v-6"/>
						</svg>
						Dashboard
					</a>
				</li>
				<li>
					<a href="/admin/seo" class="gap-3">
						<svg viewBox="0 0 24 24" class="w-5 h-5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
							<path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
						</svg>
						SEO
					</a>
				</li>
				<li>
					<a href="/admin/products" class="gap-3">
						<svg viewBox="0 0 24 24" class="w-5 h-5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
							<path d="M3 7l9-4 9 4v10l-9 4-9-4V7zM3 7l9 4M21 7l-9 4M12 22V11"/>
						</svg>
						Products
					</a>
				</li>
				<li>
					<a href="/admin/orders" class="gap-3">
						<svg viewBox="0 0 24 24" class="w-5 h-5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
							<path d="M3 3h2l3 12h10l3-9H6M8 21a1 1 0 100-2 1 1 0 000 2zM18 21a1 1 0 100-2 1 1 0 000 2z"/>
						</svg>
						Orders
					</a>
				</li>
				<li>
					<a href="/admin/users" class="gap-3">
						<svg viewBox="0 0 24 24" class="w-5 h-5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
							<path d="M16 11a4 4 0 10-8 0 4 4 0 008 0zM6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/>
						</svg>
						Users
					</a>
				</li>
				<li>
					<a href="/admin/content" class="gap-3">
						<svg viewBox="0 0 24 24" class="w-5 h-5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
							<path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
						</svg>
						Content
					</a>
				</li>
				<li>
					<a href="/admin/analytics" class="gap-3">
						<svg viewBox="0 0 24 24" class="w-5 h-5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
							<path d="M3 17l6-6 4 4 8-8M14 7h7v7"/>
						</svg>
						Analytics
					</a>
				</li>
				<div class="divider"></div>
				<li>
					<a href="/admin/settings" class="gap-3">
						<svg viewBox="0 0 24 24" class="w-5 h-5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
							<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
						</svg>
						Settings
					</a>
				</li>
				<li>
					<a href="/" class="gap-3">
						<svg viewBox="0 0 24 24" class="w-5 h-5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
							<path d="M3 10l9-7 9 7v10a1 1 0 01-1 1H4a1 1 0 01-1-1V10z"/>
						</svg>
						Back to Store
					</a>
				</li>
			</ul>
		</aside>
	</div>
</div>
