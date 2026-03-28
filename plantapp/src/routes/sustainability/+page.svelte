<script lang="ts">
	import { Container, Section } from '$lib/components/layout';
	import { Grid } from '$lib/components/layout';

	const commitments = [
		{
			title: 'Carbon Neutral Operations',
			icon: 'globe',
			description: 'All operations are 100% carbon neutral through renewable energy and offsets'
		},
		{
			title: 'Sustainable Packaging',
			icon: 'package',
			description: '100% recyclable and biodegradable packaging materials'
		},
		{
			title: 'Ethical Sourcing',
			icon: 'handshake',
			description: 'Fair trade and ethical sourcing for all products'
		},
		{
			title: 'Water Conservation',
			icon: 'water',
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
			<h1 class="text-5xl font-display uppercase tracking-tight mb-6">Our Sustainability Commitment</h1>
			<p class="text-xl text-base-content/70 max-w-3xl mx-auto">
				At Aevani, sustainability isn't just a buzzword—it's the foundation of everything
				we do. We're committed to building a better future for our planet and communities.
			</p>
		</div>

		<!-- Core Commitments -->
		<div class="mb-16">
			<h2 class="text-3xl font-display uppercase tracking-tight text-center mb-12">Our Core Commitments</h2>
			<Grid columns={4} gap={6}>
				{#each commitments as commitment}
					<div class="card bg-base-100 shadow-xl rounded-3xl border border-base-200/30">
						<div class="card-body items-center text-center">
							<div class="w-16 h-16 mb-4 flex items-center justify-center text-primary">
								{#if commitment.icon === 'globe'}
									<svg class="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
										<circle cx="12" cy="12" r="10"/>
										<line x1="2" y1="12" x2="22" y2="12"/>
										<path d="M12 2a15 15 0 014 10 15 15 0 01-4 10M12 2a15 15 0 00-4 10 15 15 0 004 10"/>
									</svg>
								{:else if commitment.icon === 'package'}
									<svg class="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
										<path d="M3 7l9-4 9 4v10l-9 4-9-4V7z"/>
										<line x1="3" y1="7" x2="12" y2="11"/>
										<line x1="21" y1="7" x2="12" y2="11"/>
										<line x1="12" y1="22" x2="12" y2="11"/>
									</svg>
								{:else if commitment.icon === 'handshake'}
									<svg class="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
										<path d="M17 8a5 5 0 00-10 0c0 4 5 8 5 12 0-4 5-8 5-12z"/>
									</svg>
								{:else if commitment.icon === 'water'}
									<svg class="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
										<path d="M12 2c-4 6-8 10-8 14a8 8 0 0016 0c0-4-4-8-8-14z"/>
									</svg>
								{/if}
							</div>
							<h3 class="card-title font-display uppercase tracking-tight">{commitment.title}</h3>
							<p class="text-base-content/70">{commitment.description}</p>
						</div>
					</div>
				{/each}
			</Grid>
		</div>

		<!-- Impact Metrics -->
		<div class="card bg-primary text-primary-content shadow-2xl mb-16 rounded-3xl border border-base-200/30">
			<div class="card-body p-12">
				<h2 class="text-3xl font-display uppercase tracking-tight text-center mb-8">Our Environmental Impact</h2>
				<Grid columns={4} gap={6}>
					{#each metrics as metric}
						<div class="text-center">
							<div class="text-4xl font-bold mb-2">{metric.value}</div>
							<div class="font-mono text-xs uppercase tracking-widest mb-1">{metric.label}</div>
							<div class="text-sm opacity-80">{metric.change}</div>
						</div>
					{/each}
				</Grid>
			</div>
		</div>

		<!-- Initiatives -->
		<div class="mb-16">
			<h2 class="text-3xl font-display uppercase tracking-tight text-center mb-12">Active Initiatives</h2>
			<Grid columns={2} gap={6}>
				{#each initiatives as initiative}
					<div class="card bg-base-100 shadow-xl rounded-3xl border border-base-200/30">
						<div class="card-body">
							<h3 class="card-title font-display uppercase tracking-tight">{initiative.title}</h3>
							<p class="text-base-content/70">{initiative.description}</p>
							<div class="divider"></div>
							<div class="flex items-center gap-2">
								<span class="badge badge-success font-mono text-xs uppercase tracking-widest">Impact</span>
								<span class="font-semibold">{initiative.impact}</span>
							</div>
						</div>
					</div>
				{/each}
			</Grid>
		</div>

		<!-- Supply Chain -->
		<div class="card bg-base-100 shadow-2xl mb-16 rounded-3xl border border-base-200/30">
			<div class="card-body p-12">
				<h2 class="text-3xl font-display uppercase tracking-tight text-center mb-8">Sustainable Supply Chain</h2>
				<div class="grid md:grid-cols-3 gap-8">
					<div>
						<h3 class="font-display uppercase tracking-tight text-xl mb-4">Sourcing</h3>
						<ul class="space-y-2 text-base-content/70">
							<li>Fair trade certified suppliers</li>
							<li>Local sourcing when possible</li>
							<li>Ethical labor practices</li>
							<li>Environmental audits</li>
						</ul>
					</div>
					<div>
						<h3 class="font-display uppercase tracking-tight text-xl mb-4">Operations</h3>
						<ul class="space-y-2 text-base-content/70">
							<li>100% renewable energy</li>
							<li>Zero-waste facilities</li>
							<li>Water recycling systems</li>
							<li>Energy-efficient warehouses</li>
						</ul>
					</div>
					<div>
						<h3 class="font-display uppercase tracking-tight text-xl mb-4">Shipping</h3>
						<ul class="space-y-2 text-base-content/70">
							<li>Carbon-neutral delivery</li>
							<li>Eco-friendly packaging</li>
							<li>Optimized routing</li>
							<li>Electric vehicle fleet</li>
						</ul>
					</div>
				</div>
			</div>
		</div>

		<!-- Certifications -->
		<div class="mb-16">
			<h2 class="text-3xl font-display uppercase tracking-tight text-center mb-12">Certifications & Partnerships</h2>
			<div class="flex flex-wrap justify-center gap-6">
				<div class="card bg-base-100 shadow-xl rounded-3xl border border-base-200/30 w-64">
					<div class="card-body items-center text-center">
						<div class="w-12 h-12 mb-2 flex items-center justify-center text-primary">
							<svg class="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
								<circle cx="12" cy="12" r="10"/>
								<path d="M9 12l2 2 4-4"/>
							</svg>
						</div>
						<h3 class="font-display uppercase tracking-tight">B Corporation</h3>
						<p class="font-mono text-xs uppercase tracking-widest text-base-content/70">Certified since 2020</p>
					</div>
				</div>
				<div class="card bg-base-100 shadow-xl rounded-3xl border border-base-200/30 w-64">
					<div class="card-body items-center text-center">
						<div class="w-12 h-12 mb-2 flex items-center justify-center text-primary">
							<svg class="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
								<path d="M12 3c-4 4-8 9-8 14 0 3 2 5 5 5s5-2 5-5c0-5-4-10-8-14z"/>
								<line x1="12" y1="3" x2="12" y2="21"/>
							</svg>
						</div>
						<h3 class="font-display uppercase tracking-tight">Climate Neutral</h3>
						<p class="font-mono text-xs uppercase tracking-widest text-base-content/70">Certified 2021</p>
					</div>
				</div>
				<div class="card bg-base-100 shadow-xl rounded-3xl border border-base-200/30 w-64">
					<div class="card-body items-center text-center">
						<div class="w-12 h-12 mb-2 flex items-center justify-center text-primary">
							<svg class="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
								<polyline points="23 4 23 10 17 10"/>
								<path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
							</svg>
						</div>
						<h3 class="font-display uppercase tracking-tight">Zero Waste</h3>
						<p class="font-mono text-xs uppercase tracking-widest text-base-content/70">Certified Facilities</p>
					</div>
				</div>
				<div class="card bg-base-100 shadow-xl rounded-3xl border border-base-200/30 w-64">
					<div class="card-body items-center text-center">
						<div class="w-12 h-12 mb-2 flex items-center justify-center text-primary">
							<svg class="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
								<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
							</svg>
						</div>
						<h3 class="font-display uppercase tracking-tight">100% Renewable</h3>
						<p class="font-mono text-xs uppercase tracking-widest text-base-content/70">Green-e Certified</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Transparency -->
		<div class="card bg-base-200 mb-16 rounded-3xl border border-base-200/30">
			<div class="card-body p-12">
				<h2 class="text-3xl font-display uppercase tracking-tight text-center mb-8">Transparency & Reporting</h2>
				<p class="text-center text-base-content/70 mb-8 max-w-3xl mx-auto">
					We believe in complete transparency about our environmental impact. View our detailed
					sustainability reports and third-party audits.
				</p>
				<div class="flex flex-wrap justify-center gap-4">
					<button class="btn btn-primary font-display uppercase tracking-wider">2023 Sustainability Report</button>
					<button class="btn btn-outline font-display uppercase tracking-wider">Carbon Footprint Analysis</button>
					<button class="btn btn-outline font-display uppercase tracking-wider">Supply Chain Audit</button>
				</div>
			</div>
		</div>

		<!-- Future Goals -->
		<div class="mb-16">
			<h2 class="text-3xl font-display uppercase tracking-tight text-center mb-12">2025 Goals</h2>
			<div class="space-y-4">
				<div class="card bg-base-100 shadow-lg rounded-3xl border border-base-200/30">
					<div class="card-body">
						<div class="flex justify-between items-center">
							<div class="flex-1">
								<h3 class="font-display uppercase tracking-tight text-lg">Carbon Negative Operations</h3>
								<p class="font-mono text-xs uppercase tracking-widest text-base-content/70">Remove more CO2 than we emit</p>
							</div>
							<div class="radial-progress text-primary" style="--value:65;">65%</div>
						</div>
					</div>
				</div>

				<div class="card bg-base-100 shadow-lg rounded-3xl border border-base-200/30">
					<div class="card-body">
						<div class="flex justify-between items-center">
							<div class="flex-1">
								<h3 class="font-display uppercase tracking-tight text-lg">100% Compostable Packaging</h3>
								<p class="font-mono text-xs uppercase tracking-widest text-base-content/70">Eliminate all plastic packaging</p>
							</div>
							<div class="radial-progress text-primary" style="--value:80;">80%</div>
						</div>
					</div>
				</div>

				<div class="card bg-base-100 shadow-lg rounded-3xl border border-base-200/30">
					<div class="card-body">
						<div class="flex justify-between items-center">
							<div class="flex-1">
								<h3 class="font-display uppercase tracking-tight text-lg">1 Million Trees Planted</h3>
								<p class="font-mono text-xs uppercase tracking-widest text-base-content/70">Expand reforestation program</p>
							</div>
							<div class="radial-progress text-primary" style="--value:5;">5%</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Call to Action -->
		<div class="card bg-primary text-primary-content rounded-3xl border border-base-200/30">
			<div class="card-body text-center p-12">
				<h2 class="text-3xl font-display uppercase tracking-tight mb-4">Join Us in Making a Difference</h2>
				<p class="text-lg mb-8">
					Every purchase supports sustainable agriculture and environmental conservation.
					Together, we're building a greener future.
				</p>
				<div class="flex gap-4 justify-center">
					<a href="/products/hydroponics" class="btn btn-secondary btn-lg font-display uppercase tracking-wider">Start Growing</a>
					<a href="/about" class="btn btn-outline btn-secondary btn-lg font-display uppercase tracking-wider">Learn More</a>
				</div>
			</div>
		</div>
	</Container>
</Section>
