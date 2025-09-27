<script lang="ts">
	// Main page for PlantCommerce with DaisyUI components
</script>

<svelte:head>
	<title>PlantCommerce - Your Plant Marketplace</title>
	<meta name="description" content="PlantCommerce - Your plant marketplace powered by DaisyUI and Tailwind CSS" />
</svelte:head>

<!-- Hero Section -->
<div class="hero min-h-96 bg-base-200">
	<div class="hero-content text-center">
		<div class="max-w-md">
			<h1 class="text-5xl font-bold">🌱 Welcome to PlantCommerce</h1>
			<p class="py-6 text-lg">Your one-stop shop for all your plant needs, beautifully designed with DaisyUI</p>
			<div class="space-x-2">
				<button class="btn btn-primary">Shop Now</button>
				<button class="btn btn-outline">Learn More</button>
			</div>
		</div>
	</div>
</div>

<!-- Feature Cards -->
<div class="py-12">
	<h2 class="text-3xl font-bold text-center mb-8">Why Choose PlantCommerce?</h2>
	<div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto px-4">
		
		<div class="card bg-base-100 shadow-xl">
			<div class="card-body text-center">
				<div class="text-4xl mb-4">🌿</div>
				<h2 class="card-title justify-center">Premium Plants</h2>
				<p>Carefully selected, healthy plants from trusted growers</p>
			</div>
		</div>

		<div class="card bg-base-100 shadow-xl">
			<div class="card-body text-center">
				<div class="text-4xl mb-4">🚚</div>
				<h2 class="card-title justify-center">Fast Delivery</h2>
				<p>Quick and safe delivery to ensure your plants arrive fresh</p>
			</div>
		</div>

		<div class="card bg-base-100 shadow-xl">
			<div class="card-body text-center">
				<div class="text-4xl mb-4">💚</div>
				<h2 class="card-title justify-center">Expert Care</h2>
				<p>Professional tips and ongoing support for plant care</p>
			</div>
		</div>
	</div>
</div>

<!-- DaisyUI Component Showcase -->
<div class="bg-base-300 py-12">
	<div class="container mx-auto px-4">
		<h2 class="text-3xl font-bold text-center mb-8">DaisyUI Components Demo</h2>
		
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
			
			<!-- Form Demo -->
			<div class="card bg-base-100 shadow-lg">
				<div class="card-body">
					<h3 class="card-title">Newsletter Signup</h3>
					<div class="form-control w-full">
						<label class="label" for="newsletter-email">
							<span class="label-text">Email address</span>
						</label>
						<input id="newsletter-email" type="email" placeholder="your@email.com" class="input input-bordered w-full" />
					</div>
					<div class="form-control mt-4">
						<label class="cursor-pointer label justify-start gap-2">
							<input type="checkbox" class="checkbox checkbox-primary" />
							<span class="label-text">Subscribe to plant care tips</span>
						</label>
					</div>
					<div class="card-actions justify-end mt-4">
						<button class="btn btn-primary">Subscribe</button>
					</div>
				</div>
			</div>
			
			<!-- Stats Demo -->
			<div class="card bg-base-100 shadow-lg">
				<div class="card-body">
					<h3 class="card-title">Our Impact</h3>
					<div class="stats stats-vertical lg:stats-horizontal shadow">
						<div class="stat">
							<div class="stat-title">Plants Sold</div>
							<div class="stat-value text-primary">10,000+</div>
						</div>
						<div class="stat">
							<div class="stat-title">Happy Customers</div>
							<div class="stat-value text-secondary">5,000+</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<!-- Success Alert -->
<div class="py-8">
	<div class="max-w-2xl mx-auto px-4">
		<div class="alert alert-success">
			<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
			<span><strong>Success!</strong> DaisyUI and Tailwind CSS are now configured and working perfectly!</span>
		</div>
	</div>
</div>
