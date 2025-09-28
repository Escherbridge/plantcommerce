<script lang="ts">
	import { Container, Section, Grid, GridItem, OptimizedImage } from '$lib/components';
</script>

<svelte:head>
	<title>PlantCommerce - Your Plant Marketplace</title>
	<meta name="description" content="PlantCommerce - Your plant marketplace powered by DaisyUI and Tailwind CSS" />
</svelte:head>

<!-- Full-Width Asymmetric Hero Section -->
<section class="min-h-screen bg-base-100 w-screen">
	<div class="grid grid-cols-1 lg:grid-cols-12 gap-0 min-h-screen w-full">
		<!-- Large Image - Takes up 8/12 columns -->
		<div class="lg:col-span-8 relative">
			<OptimizedImage
				src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1400&h=900&fit=crop&crop=center"
				alt="Beautiful plant collection"
				width={1100}
				height={900}
				aspectRatio="landscape"
				objectFit="cover"
				loading="eager"
				className="w-full h-full"
			/>
			<!-- Overlay gradient for text readability -->
			<div class="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent"></div>
		</div>
		
		<!-- Content - Takes up 4/12 columns with asymmetric positioning -->
		<div class="lg:col-span-4 flex items-center justify-center p-8 lg:p-16 xl:p-20">
			<div class="w-full max-w-xl">
				<!-- Swiss typography scale -->
				<h1 class="text-2xl lg:text-4xl xl:text-7xl font-bold leading-tight mb-6 text-base-content">
					PLANT<br/>
					<span class="text-primary">COMMERCE</span>
				</h1>
				<p class="text-lg lg:text-2xl xl:text-3xl leading-relaxed mb-8 text-base-content/80 font-light">
					Discover the world's finest collection of plants, curated with Swiss precision and botanical expertise.
				</p>
				<div class="flex flex-col lg:flex-row gap-4">
					<button class="btn btn-primary btn-lg flex-1 lg:flex-none">
						EXPLORE COLLECTION
					</button>
					<button class="btn btn-outline btn-lg flex-1 lg:flex-none">
						LEARN MORE
					</button>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Full-Width Asymmetric Feature Grid -->
<section class="py-24 bg-neutral w-full">
	<div class="w-full px-4 sm:px-6 lg:px-8">
		<!-- Section Title -->
		<div class="text-center mb-20">
			<h2 class="text-4xl lg:text-6xl xl:text-7xl font-bold mb-6">WHY CHOOSE US</h2>
			<div class="w-32 h-1 bg-primary mx-auto"></div>
		</div>

		<!-- Full-Width Asymmetric Grid Layout -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8 w-full">
			<!-- Large Feature Card - Spans 2 columns -->
			<div class="md:col-span-2 lg:col-span-2 xl:col-span-2">
				<div class="relative group h-full">
					<OptimizedImage
						src="https://images.unsplash.com/photo-1463320726281-696a485928c7?w=1000&h=700&fit=crop&crop=center"
						alt="Premium plant collection"
						width={1000}
						height={700}
						aspectRatio="landscape"
						objectFit="cover"
						className="w-full h-80 lg:h-96 xl:h-[28rem] rounded-lg"
					/>
					<div class="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
					<div class="absolute bottom-8 left-8 text-white">
						<h3 class="text-3xl lg:text-4xl xl:text-5xl font-bold mb-3">PREMIUM QUALITY</h3>
						<p class="text-lg xl:text-xl opacity-90">Hand-selected plants from the world's finest nurseries</p>
					</div>
				</div>
			</div>

			<!-- Smaller Feature Card -->
			<div class="xl:col-span-1">
				<div class="bg-base-100 p-8 lg:p-10 h-full rounded-lg shadow-lg hover:shadow-xl transition-shadow">
					<div class="text-6xl mb-8">🌿</div>
					<h3 class="text-2xl lg:text-3xl font-bold mb-6">EXPERT CARE</h3>
					<p class="text-base-content/70 leading-relaxed text-lg">Professional guidance and ongoing support for optimal plant health</p>
				</div>
			</div>

			<!-- Medium Feature Card -->
			<div class="md:col-span-1 lg:col-span-1 xl:col-span-1">
				<div class="relative group h-full">
					<OptimizedImage
						src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=700&h=500&fit=crop&crop=center"
						alt="Fast delivery service"
						width={700}
						height={500}
						aspectRatio="landscape"
						objectFit="cover"
						className="w-full h-64 lg:h-72 rounded-lg"
					/>
					<div class="absolute inset-0 bg-primary/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
					<div class="absolute bottom-6 left-6 text-base-content">
						<h3 class="text-xl lg:text-2xl font-bold">FAST DELIVERY</h3>
						<p class="text-base opacity-80">Quick & safe shipping</p>
					</div>
				</div>
			</div>

			<!-- Large Content Block -->
			<div class="md:col-span-2 lg:col-span-2 xl:col-span-2">
				<div class="bg-primary text-primary-content p-8 lg:p-12 xl:p-16 h-full rounded-lg">
					<h3 class="text-3xl lg:text-5xl xl:text-6xl font-bold mb-8">SUSTAINABLE FUTURE</h3>
					<p class="text-xl lg:text-2xl xl:text-3xl leading-relaxed mb-8 opacity-90">
						Join our mission to create a greener world through sustainable plant commerce. 
						Every purchase supports environmental conservation and local growers.
					</p>
					<button class="btn btn-secondary btn-lg text-lg">
						JOIN THE MOVEMENT
					</button>
				</div>
			</div>

			<!-- Small Feature Card -->
			<div class="xl:col-span-1">
				<div class="bg-base-100 p-8 lg:p-10 h-full rounded-lg shadow-lg hover:shadow-xl transition-shadow text-center">
					<div class="text-6xl mb-8">💚</div>
					<h3 class="text-2xl lg:text-3xl font-bold mb-6">ECO-FRIENDLY</h3>
					<p class="text-base-content/70 text-lg">Sustainable packaging and carbon-neutral delivery</p>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Full-Width Content Block with Asymmetric Layout -->
<section class="py-24 bg-base-100 w-full">
	<div class="w-full px-4 sm:px-6 lg:px-8">
		<div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-5 gap-12 lg:gap-16 xl:gap-20 items-center w-full">
			<!-- Content - Takes up 3/5 columns on XL screens -->
			<div class="order-2 lg:order-1 xl:col-span-3">
				<h2 class="text-4xl lg:text-6xl xl:text-7xl font-bold mb-8 leading-tight">
					CURATED<br/>
					<span class="text-primary">COLLECTIONS</span>
				</h2>
				<p class="text-xl lg:text-2xl xl:text-3xl leading-relaxed mb-10 text-base-content/80">
					Our botanists carefully curate each collection, ensuring every plant meets our 
					exacting standards for health, beauty, and sustainability.
				</p>
				<div class="space-y-6 mb-12">
					<div class="flex items-center gap-6">
						<div class="w-3 h-3 bg-primary rounded-full"></div>
						<span class="text-lg lg:text-xl">Premium quality guarantee</span>
					</div>
					<div class="flex items-center gap-6">
						<div class="w-3 h-3 bg-primary rounded-full"></div>
						<span class="text-lg lg:text-xl">Expert care instructions</span>
					</div>
					<div class="flex items-center gap-6">
						<div class="w-3 h-3 bg-primary rounded-full"></div>
						<span class="text-lg lg:text-xl">30-day satisfaction guarantee</span>
					</div>
				</div>
				<button class="btn btn-primary btn-lg text-lg">
					VIEW COLLECTIONS
				</button>
			</div>
			
			<!-- Large Image - Takes up 2/5 columns on XL screens -->
			<div class="order-1 lg:order-2 xl:col-span-2">
				<OptimizedImage
					src="https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=1000&h=1200&fit=crop&crop=center"
					alt="Curated plant collections"
					width={1000}
					height={1200}
					aspectRatio="portrait"
					objectFit="cover"
					className="w-full h-[600px] lg:h-[700px] xl:h-[800px] rounded-lg shadow-2xl"
				/>
			</div>
		</div>
	</div>
</section>

<!-- Full-Width Newsletter Section -->
<section class="py-20 bg-neutral w-full">
	<div class="w-full px-4 sm:px-6 lg:px-8">
		<div class="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 xl:gap-16 items-center w-full max-w-none">
			<!-- Content - Takes up 3/5 columns -->
			<div class="lg:col-span-3">
				<h2 class="text-3xl lg:text-5xl xl:text-6xl font-bold mb-6">STAY CONNECTED</h2>
				<p class="text-xl lg:text-2xl xl:text-3xl text-base-content/80 leading-relaxed">
					Get exclusive access to new arrivals, care tips, and special offers delivered to your inbox.
				</p>
			</div>
			
			<!-- Form - Takes up 2/5 columns -->
			<div class="lg:col-span-2">
				<div class="form-control">
					<div class="input-group input-group-lg">
						<input 
							type="email" 
							placeholder="Enter your email address" 
							class="input input-bordered input-lg flex-1 text-lg"
						/>
						<button class="btn btn-primary btn-lg text-lg">
							SUBSCRIBE
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>
