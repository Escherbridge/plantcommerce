<script lang="ts">
	import { Container, Section } from '$lib/components/layout';
	import { Grid } from '$lib/components/layout';

	const commitments = [
		{
			title: 'Carbon Neutral Operations',
			icon: '🌍',
			description: 'All operations are 100% carbon neutral through renewable energy and offsets'
		},
		{
			title: 'Sustainable Packaging',
			icon: '📦',
			description: '100% recyclable and biodegradable packaging materials'
		},
		{
			title: 'Ethical Sourcing',
			icon: '🤝',
			description: 'Fair trade and ethical sourcing for all products'
		},
		{
			title: 'Water Conservation',
			icon: '💧',
			description: 'Advanced water recycling in our facilities'
		}
	];

	const metrics = [
		{ label: 'CO2 Offset', value: '5M kg', change: '+15% YoY' },
		{ label: 'Waste Diverted', value: '95%', change: '+5% YoY' },
		{ label: 'Renewable Energy', value: '100%', change: 'Maintained' },
		{ label: 'Trees Planted', value: '50K+', change: '+20K this year' }
	];

	const initiatives = [
		{
			title: 'Tree Planting Program',
			description: 'We plant one tree for every order placed',
			impact: '50,000+ trees planted since 2020'
		},
		{
			title: 'Packaging Innovation',
			description: 'Developing fully compostable packaging materials',
			impact: '90% reduction in plastic use'
		},
		{
			title: 'Community Gardens',
			description: 'Supporting urban agriculture initiatives',
			impact: '25 community gardens funded'
		},
		{
			title: 'Education Programs',
			description: 'Free workshops on sustainable farming',
			impact: '10,000+ people trained'
		}
	];
</script>

<Section>
	<Container>
		<!-- Hero -->
		<div class="text-center mb-16">
			<h1 class="text-5xl font-bold mb-6">Our Sustainability Commitment</h1>
			<p class="text-xl text-base-content/70 max-w-3xl mx-auto">
				At Aevani, sustainability isn't just a buzzword—it's the foundation of everything
				we do. We're committed to building a better future for our planet and communities.
			</p>
		</div>

		<!-- Core Commitments -->
		<div class="mb-16">
			<h2 class="text-3xl font-bold text-center mb-12">Our Core Commitments</h2>
			<Grid columns={4} gap={6}>
				{#each commitments as commitment}
					<div class="card bg-base-100 shadow-xl">
						<div class="card-body items-center text-center">
							<span class="text-6xl mb-4">{commitment.icon}</span>
							<h3 class="card-title">{commitment.title}</h3>
							<p class="text-base-content/70">{commitment.description}</p>
						</div>
					</div>
				{/each}
			</Grid>
		</div>

		<!-- Impact Metrics -->
		<div class="card bg-primary text-primary-content shadow-2xl mb-16">
			<div class="card-body p-12">
				<h2 class="text-3xl font-bold text-center mb-8">Our Environmental Impact</h2>
				<Grid columns={4} gap={6}>
					{#each metrics as metric}
						<div class="text-center">
							<div class="text-4xl font-bold mb-2">{metric.value}</div>
							<div class="text-lg mb-1">{metric.label}</div>
							<div class="text-sm opacity-80">{metric.change}</div>
						</div>
					{/each}
				</Grid>
			</div>
		</div>

		<!-- Initiatives -->
		<div class="mb-16">
			<h2 class="text-3xl font-bold text-center mb-12">Active Initiatives</h2>
			<Grid columns={2} gap={6}>
				{#each initiatives as initiative}
					<div class="card bg-base-100 shadow-xl">
						<div class="card-body">
							<h3 class="card-title">{initiative.title}</h3>
							<p class="text-base-content/70">{initiative.description}</p>
							<div class="divider"></div>
							<div class="flex items-center gap-2">
								<span class="badge badge-success">Impact:</span>
								<span class="font-semibold">{initiative.impact}</span>
							</div>
						</div>
					</div>
				{/each}
			</Grid>
		</div>

		<!-- Supply Chain -->
		<div class="card bg-base-100 shadow-2xl mb-16">
			<div class="card-body p-12">
				<h2 class="text-3xl font-bold text-center mb-8">Sustainable Supply Chain</h2>
				<div class="grid md:grid-cols-3 gap-8">
					<div>
						<h3 class="font-bold text-xl mb-4">Sourcing</h3>
						<ul class="space-y-2 text-base-content/70">
							<li>✓ Fair trade certified suppliers</li>
							<li>✓ Local sourcing when possible</li>
							<li>✓ Ethical labor practices</li>
							<li>✓ Environmental audits</li>
						</ul>
					</div>
					<div>
						<h3 class="font-bold text-xl mb-4">Operations</h3>
						<ul class="space-y-2 text-base-content/70">
							<li>✓ 100% renewable energy</li>
							<li>✓ Zero-waste facilities</li>
							<li>✓ Water recycling systems</li>
							<li>✓ Energy-efficient warehouses</li>
						</ul>
					</div>
					<div>
						<h3 class="font-bold text-xl mb-4">Shipping</h3>
						<ul class="space-y-2 text-base-content/70">
							<li>✓ Carbon-neutral delivery</li>
							<li>✓ Eco-friendly packaging</li>
							<li>✓ Optimized routing</li>
							<li>✓ Electric vehicle fleet</li>
						</ul>
					</div>
				</div>
			</div>
		</div>

		<!-- Certifications -->
		<div class="mb-16">
			<h2 class="text-3xl font-bold text-center mb-12">Certifications & Partnerships</h2>
			<div class="flex flex-wrap justify-center gap-6">
				<div class="card bg-base-100 shadow-xl w-64">
					<div class="card-body items-center text-center">
						<span class="text-4xl mb-2">🅱️</span>
						<h3 class="font-bold">B Corporation</h3>
						<p class="text-sm text-base-content/70">Certified since 2020</p>
					</div>
				</div>
				<div class="card bg-base-100 shadow-xl w-64">
					<div class="card-body items-center text-center">
						<span class="text-4xl mb-2">🌿</span>
						<h3 class="font-bold">Climate Neutral</h3>
						<p class="text-sm text-base-content/70">Certified 2021</p>
					</div>
				</div>
				<div class="card bg-base-100 shadow-xl w-64">
					<div class="card-body items-center text-center">
						<span class="text-4xl mb-2">♻️</span>
						<h3 class="font-bold">Zero Waste</h3>
						<p class="text-sm text-base-content/70">Certified Facilities</p>
					</div>
				</div>
				<div class="card bg-base-100 shadow-xl w-64">
					<div class="card-body items-center text-center">
						<span class="text-4xl mb-2">⚡</span>
						<h3 class="font-bold">100% Renewable</h3>
						<p class="text-sm text-base-content/70">Green-e Certified</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Transparency -->
		<div class="card bg-base-200 mb-16">
			<div class="card-body p-12">
				<h2 class="text-3xl font-bold text-center mb-8">Transparency & Reporting</h2>
				<p class="text-center text-base-content/70 mb-8 max-w-3xl mx-auto">
					We believe in complete transparency about our environmental impact. View our detailed
					sustainability reports and third-party audits.
				</p>
				<div class="flex flex-wrap justify-center gap-4">
					<button class="btn btn-primary">2023 Sustainability Report</button>
					<button class="btn btn-outline">Carbon Footprint Analysis</button>
					<button class="btn btn-outline">Supply Chain Audit</button>
				</div>
			</div>
		</div>

		<!-- Future Goals -->
		<div class="mb-16">
			<h2 class="text-3xl font-bold text-center mb-12">2025 Goals</h2>
			<div class="space-y-4">
				<div class="card bg-base-100 shadow-lg">
					<div class="card-body">
						<div class="flex justify-between items-center">
							<div class="flex-1">
								<h3 class="font-bold text-lg">Carbon Negative Operations</h3>
								<p class="text-sm text-base-content/70">Remove more CO2 than we emit</p>
							</div>
							<div class="radial-progress text-primary" style="--value:65;">65%</div>
						</div>
					</div>
				</div>

				<div class="card bg-base-100 shadow-lg">
					<div class="card-body">
						<div class="flex justify-between items-center">
							<div class="flex-1">
								<h3 class="font-bold text-lg">100% Compostable Packaging</h3>
								<p class="text-sm text-base-content/70">Eliminate all plastic packaging</p>
							</div>
							<div class="radial-progress text-primary" style="--value:80;">80%</div>
						</div>
					</div>
				</div>

				<div class="card bg-base-100 shadow-lg">
					<div class="card-body">
						<div class="flex justify-between items-center">
							<div class="flex-1">
								<h3 class="font-bold text-lg">1 Million Trees Planted</h3>
								<p class="text-sm text-base-content/70">Expand reforestation program</p>
							</div>
							<div class="radial-progress text-primary" style="--value:5;">5%</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Call to Action -->
		<div class="card bg-primary text-primary-content">
			<div class="card-body text-center p-12">
				<h2 class="text-3xl font-bold mb-4">Join Us in Making a Difference</h2>
				<p class="text-lg mb-8">
					Every purchase supports sustainable agriculture and environmental conservation.
					Together, we're building a greener future.
				</p>
				<div class="flex gap-4 justify-center">
					<a href="/products/hydroponics" class="btn btn-secondary btn-lg">Start Growing</a>
					<a href="/about" class="btn btn-outline btn-secondary btn-lg">Learn More</a>
				</div>
			</div>
		</div>
	</Container>
</Section>
