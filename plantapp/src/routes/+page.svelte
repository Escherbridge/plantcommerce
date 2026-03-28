<script lang="ts">
	import StructuredData from '$lib/components/StructuredData.svelte';
	import { Container, Section, Grid, GridItem, OptimizedImage } from '$lib/components';
	import { PatternBackground, MyceliumNetwork, RootSystem } from '$lib/components/patterns';
	import ScrollReveal from '$lib/components/ui/ScrollReveal.svelte';
	import ParallaxHero from '$lib/components/ui/ParallaxHero.svelte';
	import type { PageData } from './$types';

	// Import images via Vite for proper bundling
	import sustainabilityImg from '$lib/images/AI-MockAssets/SustainabilityHero.png';
	import communityImg from '$lib/images/AI-MockAssets/CommunityHero.png';
	import heroImg from '$lib/images/AI-MockAssets/MAINHERO.png';
	import hydroImg from '$lib/images/AI-MockAssets/HydroToolProduct-VerticalTowerGardenSystem.png';
	import aquaImg from '$lib/images/AI-MockAssets/ToolProduct-AquaPonic.png';
	import silvoImg from '$lib/images/AI-MockAssets/Silvopasture&AgroforestryProducts-SilvopastureSeedMix.png';
	import agroImg from '$lib/images/AI-MockAssets/Silvopasture&AgroforestryProducts-Nitrogen-FixingTreeSeeds.png';

	let { data }: { data: PageData } = $props();

	// Featured products from server load (database-backed)
	const featuredProducts = data.featuredProducts;

	let subscribed = $state(false);
	let emailValue = $state('');

	function handleSubscribe(e: Event) {
		e.preventDefault();
		if (emailValue) {
			subscribed = true;
		}
	}

	const categories = [
		{
			label: 'Hydroponics',
			href: '/products/hydroponics',
			image: hydroImg,
			alt: 'Vertical tower garden hydroponic system'
		},
		{
			label: 'Aquaponics',
			href: '/products/aquaponics',
			image: aquaImg,
			alt: 'Aquaponic system with fish and plants'
		},
		{
			label: 'Silvopasture',
			href: '/products/silvopasture',
			image: silvoImg,
			alt: 'Silvopasture seed mix products'
		},
		{
			label: 'Agroforestry',
			href: '/products/agroforestry',
			image: agroImg,
			alt: 'Nitrogen-fixing tree seeds for agroforestry'
		}
	];
</script>

<svelte:head>
	<title>Aevani - Sustainable Agriculture Marketplace</title>
	<meta
		name="description"
		content="From monoculture to polyculture. Sustainable agriculture systems for a resilient future."
	/>

	<!-- Add this StructuredData component -->
	<StructuredData
		type="website"
		data={{
			name: 'PlantCommerce',
			url: 'https://plantcommerce.com',
			description: 'Sustainable growing tools, hydroponic systems, and educational resources for modern growers.',
			potentialAction: {
				'@type': 'SearchAction',
				target: 'https://plantcommerce.com/search?q={search_term_string}',
				'query-input': 'required name=search_term_string'
			}
		}}
	/>

	<!-- Also add Organization schema -->
	<StructuredData
		type="organization"
		data={{
			name: 'PlantCommerce',
			url: 'https://plantcommerce.com',
			logo: 'https://plantcommerce.com/images/AI-MockAssets/MAINHERO.png',
			sameAs: [
				'https://facebook.com/plantcommerce',
				'https://twitter.com/plantcommerce',
				'https://instagram.com/plantcommerce'
			]
		}}
	/>
</svelte:head>

<!-- Section 1: Parallax Hero -->
<ParallaxHero
	title="AEVANI"
	subtitle="From monoculture to polyculture. Sustainable agriculture systems for a resilient future."
	backgroundImage={heroImg}
	ctaLinks={[
		{ label: 'Explore Products', href: '/products', variant: 'primary' },
		{ label: 'Learn More', href: '/learn', variant: 'outline' }
	]}
/>

<!-- Section 2: Shop by Category — Editorial Showcase -->
<section class="bg-base-100 w-full py-24 md:py-32">
	<Container>
		<div class="mb-16 space-y-4 text-center">
			<h2 class="text-display uppercase tracking-widest">Shop by Category</h2>
			<div class="bg-primary mx-auto h-1 w-24"></div>
			<p class="text-base-content/60 mx-auto max-w-2xl text-xl font-light">
				Browse our sustainable growing collections
			</p>
		</div>

		<ScrollReveal animation="stagger-children">
			<div
				class="grid grid-cols-1 gap-4 md:grid-cols-2 md:grid-rows-2"
				style="grid-template-rows: auto auto;"
			>
				<!-- First card: spans 2 rows -->
				<a
					href={categories[0].href}
					class="group relative overflow-hidden rounded-2xl md:row-span-2 min-h-[60vh]"
				>
					<img
						src={categories[0].image}
						alt={categories[0].alt}
						class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
					/>
					<div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
					<div class="absolute inset-0 flex flex-col justify-end p-8 lg:p-12">
						<h3 class="text-display text-white uppercase tracking-widest text-4xl lg:text-6xl mb-4">
							{categories[0].label}
						</h3>
						<span
							class="inline-block translate-y-4 text-white/0 font-semibold tracking-widest uppercase text-sm transition-all duration-300 group-hover:translate-y-0 group-hover:text-white"
						>
							Shop Now &rarr;
						</span>
					</div>
				</a>

				<!-- Cards 2–4: single cells -->
				{#each categories.slice(1) as category}
					<a
						href={category.href}
						class="group relative overflow-hidden rounded-2xl min-h-[60vh] md:min-h-0"
						style="min-height: 280px;"
					>
						<img
							src={category.image}
							alt={category.alt}
							class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
						/>
						<div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
						<div class="absolute inset-0 flex flex-col justify-end p-6 lg:p-8">
							<h3 class="text-display text-white uppercase tracking-widest text-2xl lg:text-3xl mb-2">
								{category.label}
							</h3>
							<span
								class="inline-block translate-y-4 text-white/0 font-semibold tracking-widest uppercase text-sm transition-all duration-300 group-hover:translate-y-0 group-hover:text-white"
							>
								Shop Now &rarr;
							</span>
						</div>
					</a>
				{/each}
			</div>
		</ScrollReveal>

		<div class="mt-12 text-center">
			<a
				href="/products"
				class="inline-flex items-center text-lg font-medium text-primary hover:underline"
			>
				View all products
				<svg class="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
				</svg>
			</a>
		</div>
	</Container>
</section>

<!-- Section 3: Core Values -->
<section class="bg-neutral relative w-full overflow-hidden py-32">
	<PatternBackground pattern={MyceliumNetwork} opacity={0.05} class="absolute inset-0 z-0" />

	<div class="relative z-10 mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-12">
		<div class="mb-24 space-y-6 text-center">
			<h2 class="text-display uppercase tracking-tight text-5xl lg:text-7xl xl:text-8xl">CORE VALUES</h2>
			<div class="bg-primary mx-auto h-1.5 w-32"></div>
			<p class="text-base-content/60 mx-auto max-w-3xl text-xl font-light lg:text-2xl">
				Building a sustainable future through diversity, education, and community
			</p>
		</div>

		<ScrollReveal animation="stagger-children">
			<div
				class="grid w-full grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-10 xl:grid-cols-4"
			>
				<!-- Sustainability - Large Feature Card -->
				<div class="group md:col-span-2 lg:col-span-2 xl:col-span-2">
					<div class="relative h-full overflow-hidden rounded-2xl shadow-2xl">
						<img
							src={sustainabilityImg}
							alt="Hands nurturing rich soil with seedlings"
							class="w-full h-80 lg:h-96 xl:h-[32rem] object-cover transition-transform duration-700 group-hover:scale-110"
							loading="lazy"
						/>
						<div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
						<div class="bg-primary/0 group-hover:bg-primary/10 absolute inset-0 transition-colors duration-500"></div>
						<div class="absolute bottom-0 left-0 right-0 transform p-8 transition-transform duration-500 group-hover:translate-y-0 lg:p-12">
							<h3 class="mb-4 text-4xl font-bold text-white lg:text-5xl xl:text-6xl">SUSTAINABILITY</h3>
							<p class="max-w-xl text-lg font-light text-white/90 xl:text-2xl">
								Nurturing the soil, growing resilient ecosystems
							</p>
						</div>
					</div>
				</div>

				<!-- Education Card — inline SVG book icon -->
				<div class="group xl:col-span-1">
					<div class="bg-base-100 h-full rounded-3xl border border-base-200/30 p-10 shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-primary/20 lg:p-12">
						<div class="mb-8 transform transition-transform duration-300 group-hover:scale-110">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" class="text-primary h-14 w-14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
								<path d="M4 8c0-1.1.9-2 2-2h14v36H6a2 2 0 01-2-2V8z" />
								<path d="M44 8c0-1.1-.9-2-2-2H28v36h14a2 2 0 002-2V8z" />
								<path d="M20 6h8" /><path d="M20 42h8" />
								<path d="M10 14h8M10 20h8M10 26h6" />
								<path d="M30 14h8M30 20h8M30 26h6" />
							</svg>
						</div>
						<h3 class="text-base-content mb-4 text-2xl font-bold font-display uppercase tracking-tight lg:text-3xl">EDUCATION</h3>
						<p class="text-base-content/70 text-lg font-light leading-relaxed">
							Accessible, practical knowledge for growers at every level
						</p>
					</div>
				</div>

				<!-- Community Card -->
				<div class="group md:col-span-1 lg:col-span-1 xl:col-span-1">
					<div class="relative h-full overflow-hidden rounded-2xl shadow-2xl">
						<img
							src={communityImg}
							alt="Diverse community gardening together"
							class="w-full h-72 lg:h-80 object-cover transition-transform duration-700 group-hover:scale-110"
							loading="lazy"
						/>
						<div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
						<div class="bg-primary/0 group-hover:bg-primary/10 absolute inset-0 transition-colors duration-500"></div>
						<div class="absolute bottom-6 left-6 right-6">
							<h3 class="mb-2 text-2xl font-bold text-white lg:text-3xl">COMMUNITY</h3>
							<p class="text-base font-light text-white/90">Growing together</p>
						</div>
					</div>
				</div>

				<!-- Diversity Block -->
				<div class="group md:col-span-2 lg:col-span-2 xl:col-span-2">
					<div class="from-primary to-primary/80 text-primary-content hover:shadow-3xl relative h-full overflow-hidden rounded-2xl bg-gradient-to-br p-10 shadow-2xl transition-all duration-300 hover:-translate-y-1 lg:p-14 xl:p-20">
						<div class="relative z-10 space-y-8">
							<h3 class="text-4xl font-bold tracking-tight lg:text-6xl xl:text-7xl">DIVERSITY</h3>
							<p class="max-w-2xl text-xl font-light leading-relaxed opacity-95 lg:text-2xl xl:text-3xl">
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

				<!-- Empowerment Card — inline SVG seedling icon -->
				<div class="group xl:col-span-1">
					<div class="bg-base-100 h-full rounded-3xl border border-base-200/30 p-10 text-center shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-primary/20 lg:p-12">
						<div class="mb-8 flex justify-center transform transition-transform duration-300 group-hover:scale-110">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" class="text-primary h-14 w-14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
								<line x1="24" y1="42" x2="24" y2="20" />
								<path d="M24 30c-6-1-11-7-9-14 4 4 8 9 9 14z" fill="currentColor" opacity="0.15" />
								<path d="M24 30c-6-1-11-7-9-14 4 4 8 9 9 14" />
								<path d="M24 24c6-1 11-7 9-14-4 4-8 9-9 14z" fill="currentColor" opacity="0.15" />
								<path d="M24 24c6-1 11-7 9-14-4 4-8 9-9 14" />
								<path d="M24 42c-3-1-5 1-8 0" />
								<path d="M24 42c3-1 5 1 8 0" />
							</svg>
						</div>
						<h3 class="text-base-content mb-4 text-2xl font-bold font-display uppercase tracking-tight lg:text-3xl">EMPOWERMENT</h3>
						<p class="text-base-content/70 text-base font-light leading-relaxed">
							Tools and knowledge to make a positive impact
						</p>
					</div>
				</div>
			</div>
		</ScrollReveal>
	</div>
</section>

<!-- Section 4: Featured Products — Editorial Grid -->
<section class="bg-base-100 w-full py-32">
	<Container>
		<div class="mb-20 space-y-6 text-center">
			<h2 class="text-display uppercase tracking-tight text-5xl lg:text-7xl xl:text-8xl">FEATURED PRODUCTS</h2>
			<div class="bg-primary mx-auto h-1.5 w-32"></div>
			<p class="text-base-content/60 mx-auto max-w-3xl text-xl font-light lg:text-2xl">
				Carefully curated systems and kits for sustainable agriculture
			</p>
		</div>

		<ScrollReveal animation="fade-up">
			<div class="grid grid-cols-2 gap-6 lg:gap-10">
				{#each featuredProducts as product, i}
					<a
						href="/products/{product.category?.slug || 'all'}/{product.slug}"
						class="card bg-base-100 border-base-200 group overflow-hidden rounded-2xl border shadow-xl transition-all duration-500 hover:scale-[1.02] hover:shadow-xl {i === 0 ? 'col-span-2 md:col-span-1 md:row-span-2' : 'col-span-2 md:col-span-1'}"
					>
						<figure class="relative overflow-hidden {i === 0 ? 'h-80 md:h-[28rem]' : 'h-64'}">
							{#if product.images && product.images.length > 0}
								<img
									src={product.images[0].url}
									alt={product.images[0].altText}
									class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
								/>
								<div class="absolute inset-0 flex items-center justify-center bg-primary/0 opacity-0 transition-all duration-500 group-hover:bg-primary/20 group-hover:opacity-100">
									<span class="text-white font-semibold tracking-widest uppercase text-sm">Quick View</span>
								</div>
							{:else}
								<div class="flex h-full items-center justify-center bg-base-200">
									<svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-base-content/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 3C7 3 3 7 3 12s4 9 9 9 9-4 9-9-4-9-9-9zm0 0v9m0-9c2 2 3 5 3 9m-3-9c-2 2-3 5-3 9" />
									</svg>
								</div>
							{/if}
						</figure>
						<div class="card-body space-y-4 p-6 {i === 0 ? 'lg:p-10' : ''}">
							<h3 class="card-title text-base-content group-hover:text-primary transition-colors {i === 0 ? 'text-2xl lg:text-3xl' : 'text-xl'} font-bold leading-tight">
								{product.name}
							</h3>
							{#if i === 0}
								<p class="text-base-content/70 text-base font-light leading-relaxed">
									{product.shortDescription}
								</p>
							{:else}
								<p class="text-base-content/70 line-clamp-2 text-sm font-light leading-relaxed">
									{product.shortDescription}
								</p>
							{/if}
							<div class="card-actions border-base-200 mt-4 items-center justify-between border-t pt-4">
								<div class="text-primary font-mono text-2xl font-bold {i === 0 ? 'text-3xl lg:text-4xl' : ''}">
									${parseFloat(product.price).toFixed(2)}
								</div>
								<span class="text-display btn btn-primary btn-sm uppercase tracking-widest transition-transform group-hover:scale-110 {i === 0 ? 'btn-md' : ''}">
									VIEW DETAILS
								</span>
							</div>
						</div>
					</a>
				{/each}
			</div>
		</ScrollReveal>

		<div class="mt-16 text-center">
			<a
				href="/products"
				class="btn btn-outline btn-lg text-display uppercase tracking-widest transition-transform hover:scale-105"
			>
				VIEW ALL PRODUCTS
			</a>
		</div>
	</Container>
</section>

<!-- Section 5: Newsletter — Reimagined -->
<section class="bg-neutral relative w-full overflow-hidden py-32">
	<PatternBackground pattern={RootSystem} opacity={0.08} class="absolute inset-0 z-0" />

	<div class="relative z-10 mx-auto w-full max-w-[900px] px-4 sm:px-6 lg:px-12 text-center">
		<ScrollReveal animation="fade-up">
			<h2 class="text-display uppercase tracking-tight text-5xl lg:text-7xl xl:text-8xl mb-6">
				STAY CONNECTED
			</h2>
			<p class="text-base-content/60 mx-auto max-w-2xl text-xl font-light leading-relaxed mb-16">
				Get exclusive access to new products, growing guides, and sustainable agriculture tips.
			</p>

			{#if subscribed}
				<div class="flex flex-col items-center gap-6">
					<div class="flex h-20 w-20 items-center justify-center rounded-full border-2 border-accent">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-10 w-10 text-accent"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							stroke-width="2"
						>
							<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
						</svg>
					</div>
					<p class="text-base-content/80 text-xl font-light">You're in. We'll be in touch soon.</p>
				</div>
			{:else}
				<form onsubmit={handleSubscribe} class="flex flex-col items-center gap-8">
					<div class="w-full max-w-lg">
						<input
							type="email"
							placeholder="your@email.com"
							bind:value={emailValue}
							required
							class="w-full border-b-2 border-base-content/30 bg-transparent py-4 text-center text-2xl font-light text-base-content placeholder:text-base-content/30 focus:border-accent focus:outline-none transition-colors duration-300"
						/>
					</div>
					<button type="submit" class="btn btn-accent btn-lg text-display uppercase tracking-widest px-12">
						SUBSCRIBE
					</button>
				</form>
			{/if}
		</ScrollReveal>
	</div>
</section>
