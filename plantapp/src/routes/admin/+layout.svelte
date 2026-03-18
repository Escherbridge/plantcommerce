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
				<a href="/admin" class="btn btn-ghost text-xl">Admin Dashboard</a>
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
			<div class="p-4 border-b border-base-300">
				<h2 class="text-2xl font-bold">Admin Panel</h2>
				<p class="text-sm text-base-content/70">Aevani</p>
			</div>

			<ul class="menu p-4 space-y-1">
				<li>
					<a href="/admin" class="gap-3">
						<span class="text-xl">📊</span>
						Dashboard
					</a>
				</li>
				<li>
					<a href="/admin/seo" class="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100">
						<span class="text-xl">SEO </span>
					</a>
				</li>
				<li>
					<a href="/admin/products" class="gap-3">
						<span class="text-xl">📦</span>
						Products
					</a>
				</li>
				<li>
					<a href="/admin/orders" class="gap-3">
						<span class="text-xl">🛒</span>
						Orders
					</a>
				</li>
				<li>
					<a href="/admin/users" class="gap-3">
						<span class="text-xl">👥</span>
						Users
					</a>
				</li>
				<li>
					<a href="/admin/content" class="gap-3">
						<span class="text-xl">📝</span>
						Content
					</a>
				</li>
				<li>
					<a href="/admin/analytics" class="gap-3">
						<span class="text-xl">📈</span>
						Analytics
					</a>
				</li>
				<div class="divider"></div>
				<li>
					<a href="/admin/settings" class="gap-3">
						<span class="text-xl">⚙️</span>
						Settings
					</a>
				</li>
				<li>
					<a href="/" class="gap-3">
						<span class="text-xl">🏠</span>
						Back to Store
					</a>
				</li>
			</ul>
		</aside>
	</div>
</div>
