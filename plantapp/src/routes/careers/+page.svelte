<script lang="ts">
	import { Container, Section } from '$lib/components/layout';
	import { Grid } from '$lib/components/layout';

	const benefits = [
		{ title: 'Competitive Salary', icon: 'money', description: 'Market-leading compensation packages' },
		{ title: 'Health Insurance', icon: 'hospital', description: 'Comprehensive medical, dental, and vision' },
		{ title: 'Remote Work', icon: 'home', description: 'Flexible work-from-home options' },
		{ title: '401(k) Matching', icon: 'trending', description: 'Generous retirement contributions' },
		{ title: 'Paid Time Off', icon: 'vacation', description: 'Unlimited PTO policy' },
		{ title: 'Learning Budget', icon: 'book', description: 'Annual education and conference budget' },
		{ title: 'Wellness Programs', icon: 'wellness', description: 'Gym memberships and wellness initiatives' },
		{ title: 'Product Discounts', icon: 'gift', description: '50% off all Aevani products' }
	];

	const openings = [
		{
			title: 'Senior Full Stack Engineer',
			department: 'Engineering',
			location: 'Remote',
			type: 'Full-time'
		},
		{
			title: 'Product Manager',
			department: 'Product',
			location: 'Portland, OR',
			type: 'Full-time'
		},
		{
			title: 'Customer Success Specialist',
			department: 'Support',
			location: 'Remote',
			type: 'Full-time'
		},
		{
			title: 'Content Marketing Manager',
			department: 'Marketing',
			location: 'Remote',
			type: 'Full-time'
		},
		{
			title: 'Agriculture Specialist',
			department: 'Operations',
			location: 'Sacramento, CA',
			type: 'Full-time'
		},
		{
			title: 'Warehouse Associate',
			department: 'Operations',
			location: 'Sacramento, CA',
			type: 'Full-time'
		}
	];

	const values = [
		'We put sustainability first in every decision',
		'We believe in transparent and honest communication',
		'We embrace diversity and foster an inclusive culture',
		'We encourage continuous learning and growth',
		'We celebrate wins and learn from failures together'
	];
</script>

<Section>
	<Container>
		<!-- Hero -->
		<div class="text-center mb-16">
			<h1 class="text-5xl font-display uppercase tracking-tight mb-6">Careers at Aevani</h1>
			<p class="text-xl text-base-content/70 max-w-3xl mx-auto">
				Join our mission to make sustainable agriculture accessible to everyone. Build your
				career while building a better planet.
			</p>
		</div>

		<!-- Culture -->
		<div class="card bg-primary text-primary-content rounded-3xl border border-base-200/30 shadow-md mb-16">
			<div class="card-body p-12">
				<h2 class="text-3xl font-display uppercase tracking-tight mb-6 text-center">Our Culture</h2>
				<p class="text-lg text-center max-w-3xl mx-auto mb-8">
					We're a team of passionate individuals united by our commitment to sustainability,
					innovation, and making a positive impact on the world.
				</p>
				<ul class="space-y-3 max-w-2xl mx-auto">
					{#each values as value}
						<li class="flex items-start gap-3">
							<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" fill="none" class="w-5 h-5 mt-0.5 shrink-0">
								<path d="M5 13l4 4L19 7"/>
							</svg>
							<span class="text-lg">{value}</span>
						</li>
					{/each}
				</ul>
			</div>
		</div>

		<!-- Benefits -->
		<div class="mb-16">
			<h2 class="text-3xl font-display uppercase tracking-tight text-center mb-12">Benefits & Perks</h2>
			<Grid columns={4} gap={6}>
				{#each benefits as benefit}
					<div class="card bg-base-100 rounded-3xl border border-base-200/30 shadow-md">
						<div class="card-body items-center text-center">
							<div class="mb-3">
								{#if benefit.icon === 'money'}
									<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" fill="none" class="w-10 h-10 text-primary">
										<path d="M12 2a10 10 0 100 20 10 10 0 000-20zM12 6v12M8 10h8M9 14h6"/>
									</svg>
								{:else if benefit.icon === 'hospital'}
									<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" fill="none" class="w-10 h-10 text-primary">
										<path d="M3 3h18v18H3V3zM12 7v10M7 12h10"/>
									</svg>
								{:else if benefit.icon === 'home'}
									<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" fill="none" class="w-10 h-10 text-primary">
										<path d="M3 10l9-7 9 7v10a1 1 0 01-1 1H4a1 1 0 01-1-1V10z"/>
									</svg>
								{:else if benefit.icon === 'trending'}
									<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" fill="none" class="w-10 h-10 text-primary">
										<path d="M3 17l6-6 4 4 8-8M14 7h7v7"/>
									</svg>
								{:else if benefit.icon === 'vacation'}
									<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" fill="none" class="w-10 h-10 text-primary">
										<path d="M12 3v18M8 8c0-3 4-5 4-5s4 2 4 5M6 13c0-4 6-7 6-7s6 3 6 7"/>
									</svg>
								{:else if benefit.icon === 'book'}
									<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" fill="none" class="w-10 h-10 text-primary">
										<path d="M4 4h6a2 2 0 012 2v14a1 1 0 00-1-1H4V4zM20 4h-6a2 2 0 00-2 2v14a1 1 0 011-1h7V4z"/>
									</svg>
								{:else if benefit.icon === 'wellness'}
									<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" fill="none" class="w-10 h-10 text-primary">
										<path d="M12 2a10 10 0 100 20 10 10 0 000-20zM8 14s1.5 2 4 2 4-2 4-2"/>
									</svg>
								{:else if benefit.icon === 'gift'}
									<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" fill="none" class="w-10 h-10 text-primary">
										<path d="M3 8h18v12H3V8zM12 8v12M3 12h18M8 8V6a2 2 0 014 0v2M16 8V6a2 2 0 00-4 0v2"/>
									</svg>
								{/if}
							</div>
							<p class="font-mono text-xs uppercase tracking-widest text-secondary mb-1">Perk</p>
							<h3 class="font-display uppercase tracking-tight font-bold">{benefit.title}</h3>
							<p class="text-sm text-base-content/70">{benefit.description}</p>
						</div>
					</div>
				{/each}
			</Grid>
		</div>

		<!-- Open Positions -->
		<div class="mb-16">
			<h2 class="text-3xl font-display uppercase tracking-tight text-center mb-12">Open Positions</h2>
			<div class="space-y-4">
				{#each openings as job}
					<div class="card bg-base-100 rounded-3xl border border-base-200/30 shadow-md hover:shadow-lg transition-shadow">
						<div class="card-body">
							<div class="flex flex-wrap justify-between items-start gap-4">
								<div class="flex-1">
									<p class="font-mono text-xs uppercase tracking-widest text-secondary mb-1">{job.department}</p>
									<h3 class="text-2xl font-display uppercase tracking-tight mb-2">{job.title}</h3>
									<div class="flex flex-wrap gap-3">
										<span class="badge badge-primary">{job.location}</span>
										<span class="badge badge-outline">{job.type}</span>
									</div>
								</div>
								<button class="btn btn-primary font-display uppercase tracking-wider">Apply Now</button>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Don't See Your Role -->
		<div class="card bg-base-200 rounded-3xl border border-base-200/30 shadow-md mb-16">
			<div class="card-body text-center p-12">
				<h2 class="text-2xl font-display uppercase tracking-tight mb-4">Don't See Your Perfect Role?</h2>
				<p class="text-base-content/70 mb-6">
					We're always looking for talented individuals who share our passion. Send us your
					resume and let us know how you can contribute to our mission.
				</p>
				<button class="btn btn-outline font-display uppercase tracking-wider">Send General Application</button>
			</div>
		</div>

		<!-- Hiring Process -->
		<div>
			<h2 class="text-3xl font-display uppercase tracking-tight text-center mb-12">Our Hiring Process</h2>
			<div class="grid md:grid-cols-4 gap-6">
				<div class="text-center">
					<div class="w-16 h-16 bg-primary text-primary-content rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
						1
					</div>
					<p class="font-mono text-xs uppercase tracking-widest text-secondary mb-1">Step</p>
					<h3 class="font-display uppercase tracking-tight font-bold mb-2">Apply</h3>
					<p class="text-sm text-base-content/70">Submit your application online</p>
				</div>
				<div class="text-center">
					<div class="w-16 h-16 bg-primary text-primary-content rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
						2
					</div>
					<p class="font-mono text-xs uppercase tracking-widest text-secondary mb-1">Step</p>
					<h3 class="font-display uppercase tracking-tight font-bold mb-2">Phone Screen</h3>
					<p class="text-sm text-base-content/70">30-minute conversation with our team</p>
				</div>
				<div class="text-center">
					<div class="w-16 h-16 bg-primary text-primary-content rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
						3
					</div>
					<p class="font-mono text-xs uppercase tracking-widest text-secondary mb-1">Step</p>
					<h3 class="font-display uppercase tracking-tight font-bold mb-2">Interviews</h3>
					<p class="text-sm text-base-content/70">Meet the team and showcase your skills</p>
				</div>
				<div class="text-center">
					<div class="w-16 h-16 bg-primary text-primary-content rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
						4
					</div>
					<p class="font-mono text-xs uppercase tracking-widest text-secondary mb-1">Step</p>
					<h3 class="font-display uppercase tracking-tight font-bold mb-2">Offer</h3>
					<p class="text-sm text-base-content/70">Join the Aevani family!</p>
				</div>
			</div>
		</div>
	</Container>
</Section>
