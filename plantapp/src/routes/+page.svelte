<script lang="ts">
	import { Container, Section, Grid, GridItem, OptimizedImage } from '$lib/components';
	import { getMockProducts } from '$lib/utils/mockProducts';

	// Get featured products for homepage
	const featuredProducts = getMockProducts({ featured: true, limit: 6 });
</script>

<svelte:head>
	<title>Aevani - Sustainable Agriculture Marketplace</title>
	<meta
		name="description"
		content="From monoculture to polyculture. Sustainable agriculture systems for a resilient future."
	/>
</svelte:head>

<!-- Full-Width Asymmetric Hero Section -->
<section class="bg-base-100 relative min-h-screen w-screen overflow-hidden">
	<div class="grid min-h-screen w-full grid-cols-1 gap-0 lg:grid-cols-12">
		<!-- Large Image - Takes up 8/12 columns -->
		<div class="relative lg:col-span-8">
			<OptimizedImage
				src="/src/lib/images/AI-MockAssets/MAINHERO.png"
				alt="Thriving biodiverse polyculture garden"
				width={1400}
				height={900}
				aspectRatio="landscape"
				objectFit="cover"
				loading="eager"
				className="w-full h-full object-cover"
			/>
			<!-- Enhanced gradient overlay -->
			<div
				class="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"
			></div>
		</div>

		<!-- Content - Takes up 4/12 columns -->
		<div class="bg-base-100 flex items-center justify-center p-8 lg:col-span-4 lg:p-16 xl:p-24">
			<div class="w-full max-w-xl space-y-8">
				<!-- Enhanced typography with better spacing -->
				<div class="space-y-6">
					<h1
						class="text-base-content text-3xl font-bold leading-[0.95] tracking-tight lg:text-5xl xl:text-8xl"
					>
						AEVANI
					</h1>
					<div class="bg-primary h-1 w-24"></div>
					<p class="text-primary text-xl font-bold leading-tight lg:text-3xl xl:text-4xl">
						MARKETPLACE
					</p>
				</div>

				<p
					class="text-base-content/70 max-w-lg text-lg font-light leading-relaxed lg:text-xl xl:text-2xl"
				>
					From monoculture to polyculture. Sustainable agriculture systems for a resilient future.
				</p>

				<div class="flex flex-col gap-4 pt-4 sm:flex-row">
					<a
						href="/products"
						class="btn btn-primary btn-lg text-base font-semibold tracking-wide transition-transform hover:scale-105"
					>
						EXPLORE PRODUCTS
					</a>
					<a
						href="/learn"
						class="btn btn-outline btn-lg text-base font-semibold tracking-wide transition-transform hover:scale-105"
					>
						LEARN MORE
					</a>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Core Values Section with Enhanced Design -->
<section class="bg-neutral w-full py-32">
	<div class="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-12">
		<!-- Section Title with Better Spacing -->
		<div class="mb-24 space-y-6 text-center">
			<h2 class="text-5xl font-bold tracking-tight lg:text-7xl xl:text-8xl">CORE VALUES</h2>
			<div class="bg-primary mx-auto h-1.5 w-32"></div>
			<p class="text-base-content/60 mx-auto max-w-3xl text-xl font-light lg:text-2xl">
				Building a sustainable future through diversity, education, and community
			</p>
		</div>

		<!-- Enhanced Asymmetric Grid -->
		<div
			class="grid w-full grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-10 xl:grid-cols-4"
		>
			<!-- Sustainability - Large Feature Card -->
			<div class="group md:col-span-2 lg:col-span-2 xl:col-span-2">
				<div class="relative h-full overflow-hidden rounded-2xl shadow-2xl">
					<OptimizedImage
						src="/src/lib/images/AI-MockAssets/SustainabilityHero.png"
						alt="Hands nurturing rich soil with seedlings"
						width={1000}
						height={700}
						aspectRatio="landscape"
						objectFit="cover"
						className="w-full h-80 lg:h-96 xl:h-[32rem] object-cover transition-transform duration-700 group-hover:scale-110"
					/>
					<div
						class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
					></div>
					<div
						class="bg-primary/0 group-hover:bg-primary/10 absolute inset-0 transition-colors duration-500"
					></div>
					<div
						class="absolute bottom-0 left-0 right-0 transform p-8 transition-transform duration-500 group-hover:translate-y-0 lg:p-12"
					>
						<h3 class="mb-4 text-4xl font-bold text-white lg:text-5xl xl:text-6xl">
							SUSTAINABILITY
						</h3>
						<p class="max-w-xl text-lg font-light text-white/90 xl:text-2xl">
							Nurturing the soil, growing resilient ecosystems
						</p>
					</div>
				</div>
			</div>

			<!-- Education Card with Enhanced Styling -->
			<div class="group xl:col-span-1">
				<div
					class="bg-base-100 border-base-300 h-full rounded-2xl border p-10 shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl lg:p-12"
				>
					<div
						class="mb-10 transform text-7xl transition-transform duration-300 group-hover:scale-110"
					>
						📚
					</div>
					<h3 class="text-base-content mb-6 text-3xl font-bold lg:text-4xl">EDUCATION</h3>
					<p class="text-base-content/70 text-lg font-light leading-relaxed">
						Accessible, practical knowledge for growers at every level
					</p>
				</div>
			</div>

			<!-- Community Card with Enhanced Image Treatment -->
			<div class="group md:col-span-1 lg:col-span-1 xl:col-span-1">
				<div class="relative h-full overflow-hidden rounded-2xl shadow-2xl">
					<OptimizedImage
						src="/src/lib/images/AI-MockAssets/CommunityHero.png"
						alt="Diverse community gardening together"
						width={700}
						height={500}
						aspectRatio="landscape"
						objectFit="cover"
						className="w-full h-72 lg:h-80 object-cover transition-transform duration-700 group-hover:scale-110"
					/>
					<div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
					<div
						class="bg-primary/0 group-hover:bg-primary/10 absolute inset-0 transition-colors duration-500"
					></div>
					<div class="absolute bottom-6 left-6 right-6">
						<h3 class="mb-2 text-2xl font-bold text-white lg:text-3xl">COMMUNITY</h3>
						<p class="text-base font-light text-white/90">Growing together</p>
					</div>
				</div>
			</div>

			<!-- Diversity - Enhanced Large Content Block -->
			<div class="group md:col-span-2 lg:col-span-2 xl:col-span-2">
				<div
					class="from-primary to-primary/80 text-primary-content hover:shadow-3xl relative h-full overflow-hidden rounded-2xl bg-gradient-to-br p-10 shadow-2xl transition-all duration-300 hover:-translate-y-1 lg:p-14 xl:p-20"
				>
					<!-- Subtle pattern overlay -->
					<div
						class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-5"
					></div>
					<div class="relative z-10 space-y-8">
						<h3 class="text-4xl font-bold tracking-tight lg:text-6xl xl:text-7xl">DIVERSITY</h3>
						<p
							class="max-w-2xl text-xl font-light leading-relaxed opacity-95 lg:text-2xl xl:text-3xl"
						>
							From monoculture to polyculture. Embrace biodiversity, complexity, and the
							interconnectedness of all living things.
						</p>
						<a
							href="/products"
							class="btn btn-secondary btn-lg mt-4 inline-block text-base font-semibold tracking-wide transition-transform hover:scale-105"
						>
							EXPLORE PRODUCTS
						</a>
					</div>
				</div>
			</div>

			<!-- Empowerment Card -->
			<div class="group xl:col-span-1">
				<div
					class="bg-base-100 border-base-300 h-full rounded-2xl border p-10 text-center shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl lg:p-12"
				>
					<div
						class="mb-10 transform text-7xl transition-transform duration-300 group-hover:scale-110"
					>
						💪
					</div>
					<h3 class="text-base-content mb-6 text-3xl font-bold lg:text-4xl">EMPOWERMENT</h3>
					<p class="text-base-content/70 text-lg font-light">
						Tools and knowledge to make a positive impact
					</p>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Featured Products Section with Enhanced Cards -->
<section class="bg-base-100 w-full py-32">
	<Container>
		<div class="mb-20 space-y-6 text-center">
			<h2 class="text-5xl font-bold tracking-tight lg:text-7xl xl:text-8xl">FEATURED PRODUCTS</h2>
			<div class="bg-primary mx-auto h-1.5 w-32"></div>
			<p class="text-base-content/60 mx-auto max-w-3xl text-xl font-light lg:text-2xl">
				Carefully curated systems and kits for sustainable agriculture
			</p>
		</div>

		<Grid columns={3} gap={10}>
			{#each featuredProducts as product}
				<a
					href="/products/{product.category?.slug || 'all'}/{product.slug}"
					class="card bg-base-100 hover:shadow-3xl border-base-200 group overflow-hidden rounded-2xl border shadow-xl transition-all duration-500 hover:-translate-y-3"
				>
					<figure class="bg-base-200 relative h-72 overflow-hidden">
						{#if product.images && product.images.length > 0}
							<img
								src={product.images[0].url}
								alt={product.images[0].altText}
								class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
							/>
							<!-- Overlay on hover -->
							<div
								class="bg-primary/0 group-hover:bg-primary/10 absolute inset-0 transition-colors duration-500"
							></div>
						{:else}
							<div class="flex h-full items-center justify-center">
								<span class="text-6xl">🌱</span>
							</div>
						{/if}
					</figure>
					<div class="card-body space-y-4 p-8">
						<h3
							class="card-title text-base-content group-hover:text-primary text-2xl font-bold leading-tight transition-colors"
						>
							{product.name}
						</h3>
						<p class="text-base-content/70 line-clamp-2 text-base font-light leading-relaxed">
							{product.shortDescription}
						</p>
						<div
							class="card-actions border-base-200 mt-6 items-center justify-between border-t pt-4"
						>
							<div class="text-primary text-4xl font-bold">
								${parseFloat(product.price).toFixed(2)}
							</div>
							<span
								class="btn btn-primary btn-sm font-semibold tracking-wide transition-transform group-hover:scale-110"
							>
								VIEW DETAILS
							</span>
						</div>
					</div>
				</a>
			{/each}
		</Grid>

		<div class="mt-16 text-center">
			<a
				href="/products"
				class="btn btn-outline btn-lg text-base font-semibold tracking-wide transition-transform hover:scale-105"
			>
				VIEW ALL PRODUCTS
			</a>
		</div>
	</Container>
</section>

<!-- Newsletter Section with Enhanced Design -->
<section class="from-neutral to-neutral/80 relative w-full overflow-hidden bg-gradient-to-br py-24">
	<!-- Subtle pattern overlay -->
	<div
		class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-5"
	></div>
	<div class="relative z-10 mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-12">
		<div class="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-5 lg:gap-16">
			<!-- Content -->
			<div class="space-y-6 lg:col-span-3">
				<h2 class="text-4xl font-bold tracking-tight lg:text-6xl xl:text-7xl">STAY CONNECTED</h2>
				<p class="text-base-content/70 max-w-2xl text-xl font-light leading-relaxed lg:text-2xl">
					Get exclusive access to new products, growing guides, and sustainable agriculture tips.
				</p>
			</div>

			<!-- Form -->
			<div class="lg:col-span-2">
				<div class="form-control">
					<div class="join join-vertical sm:join-horizontal w-full shadow-2xl">
						<input
							type="email"
							placeholder="Enter your email"
							class="input input-bordered input-lg join-item bg-base-100 focus:outline-primary flex-1 text-lg"
						/>
						<button
							class="btn btn-primary btn-lg join-item font-semibold tracking-wide transition-transform hover:scale-105"
						>
							SUBSCRIBE
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>
