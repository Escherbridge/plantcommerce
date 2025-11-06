<script lang="ts">
	import { Container, Section } from '$lib/components/layout';
	import { Grid } from '$lib/components/layout';

	const benefits = [
		{ title: 'Competitive Salary', icon: '💰', description: 'Market-leading compensation packages' },
		{ title: 'Health Insurance', icon: '🏥', description: 'Comprehensive medical, dental, and vision' },
		{ title: 'Remote Work', icon: '🏠', description: 'Flexible work-from-home options' },
		{ title: '401(k) Matching', icon: '📈', description: 'Generous retirement contributions' },
		{ title: 'Paid Time Off', icon: '🌴', description: 'Unlimited PTO policy' },
		{ title: 'Learning Budget', icon: '📚', description: 'Annual education and conference budget' },
		{ title: 'Wellness Programs', icon: '🧘', description: 'Gym memberships and wellness initiatives' },
		{ title: 'Product Discounts', icon: '🎁', description: '50% off all Aevani products' }
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
			<h1 class="text-5xl font-bold mb-6">Careers at Aevani</h1>
			<p class="text-xl text-base-content/70 max-w-3xl mx-auto">
				Join our mission to make sustainable agriculture accessible to everyone. Build your
				career while building a better planet.
			</p>
		</div>

		<!-- Culture -->
		<div class="card bg-primary text-primary-content shadow-2xl mb-16">
			<div class="card-body p-12">
				<h2 class="text-3xl font-bold mb-6 text-center">Our Culture</h2>
				<p class="text-lg text-center max-w-3xl mx-auto mb-8">
					We're a team of passionate individuals united by our commitment to sustainability,
					innovation, and making a positive impact on the world.
				</p>
				<ul class="space-y-3 max-w-2xl mx-auto">
					{#each values as value}
						<li class="flex items-start gap-3">
							<span class="text-xl">✓</span>
							<span class="text-lg">{value}</span>
						</li>
					{/each}
				</ul>
			</div>
		</div>

		<!-- Benefits -->
		<div class="mb-16">
			<h2 class="text-3xl font-bold text-center mb-12">Benefits & Perks</h2>
			<Grid columns={4} gap={6}>
				{#each benefits as benefit}
					<div class="card bg-base-100 shadow-xl">
						<div class="card-body items-center text-center">
							<span class="text-5xl mb-3">{benefit.icon}</span>
							<h3 class="font-bold">{benefit.title}</h3>
							<p class="text-sm text-base-content/70">{benefit.description}</p>
						</div>
					</div>
				{/each}
			</Grid>
		</div>

		<!-- Open Positions -->
		<div class="mb-16">
			<h2 class="text-3xl font-bold text-center mb-12">Open Positions</h2>
			<div class="space-y-4">
				{#each openings as job}
					<div class="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
						<div class="card-body">
							<div class="flex flex-wrap justify-between items-start gap-4">
								<div class="flex-1">
									<h3 class="text-2xl font-bold mb-2">{job.title}</h3>
									<div class="flex flex-wrap gap-3">
										<span class="badge badge-primary">{job.department}</span>
										<span class="badge badge-outline">{job.location}</span>
										<span class="badge badge-outline">{job.type}</span>
									</div>
								</div>
								<button class="btn btn-primary">Apply Now</button>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Don't See Your Role -->
		<div class="card bg-base-200 mb-16">
			<div class="card-body text-center p-12">
				<h2 class="text-2xl font-bold mb-4">Don't See Your Perfect Role?</h2>
				<p class="text-base-content/70 mb-6">
					We're always looking for talented individuals who share our passion. Send us your
					resume and let us know how you can contribute to our mission.
				</p>
				<button class="btn btn-outline">Send General Application</button>
			</div>
		</div>

		<!-- Hiring Process -->
		<div>
			<h2 class="text-3xl font-bold text-center mb-12">Our Hiring Process</h2>
			<div class="grid md:grid-cols-4 gap-6">
				<div class="text-center">
					<div class="w-16 h-16 bg-primary text-primary-content rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
						1
					</div>
					<h3 class="font-bold mb-2">Apply</h3>
					<p class="text-sm text-base-content/70">Submit your application online</p>
				</div>
				<div class="text-center">
					<div class="w-16 h-16 bg-primary text-primary-content rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
						2
					</div>
					<h3 class="font-bold mb-2">Phone Screen</h3>
					<p class="text-sm text-base-content/70">30-minute conversation with our team</p>
				</div>
				<div class="text-center">
					<div class="w-16 h-16 bg-primary text-primary-content rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
						3
					</div>
					<h3 class="font-bold mb-2">Interviews</h3>
					<p class="text-sm text-base-content/70">Meet the team and showcase your skills</p>
				</div>
				<div class="text-center">
					<div class="w-16 h-16 bg-primary text-primary-content rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
						4
					</div>
					<h3 class="font-bold mb-2">Offer</h3>
					<p class="text-sm text-base-content/70">Join the Aevani family!</p>
				</div>
			</div>
		</div>
	</Container>
</Section>
