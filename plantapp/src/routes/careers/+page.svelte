<script lang="ts">
	import { Container, Section } from '$lib/components/layout';
	import { Grid } from '$lib/components/layout';
	import { Icon, type IconName } from '$lib/components/icons';

	const benefits = [
		{
			title: 'Competitive Salary',
			icon: 'dollar-circle' as IconName,
			description: 'Market-leading compensation packages'
		},
		{
			title: 'Health Insurance',
			icon: 'hospital' as IconName,
			description: 'Comprehensive medical, dental, and vision'
		},
		{
			title: 'Remote Work',
			icon: 'home' as IconName,
			description: 'Flexible work-from-home options'
		},
		{
			title: '401(k) Matching',
			icon: 'trending-up' as IconName,
			description: 'Generous retirement contributions'
		},
		{ title: 'Paid Time Off', icon: 'sun' as IconName, description: 'Unlimited PTO policy' },
		{
			title: 'Learning Budget',
			icon: 'book-open' as IconName,
			description: 'Annual education and conference budget'
		},
		{
			title: 'Wellness Programs',
			icon: 'heart' as IconName,
			description: 'Gym memberships and wellness initiatives'
		},
		{
			title: 'Product Discounts',
			icon: 'gift' as IconName,
			description: '50% off all Aevani products'
		}
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
		<div class="mb-16 text-center">
			<h1 class="font-display mb-6 text-5xl tracking-tight uppercase">Careers at Aevani</h1>
			<p class="mx-auto max-w-3xl text-xl text-base-content/70">
				Join our mission to make sustainable agriculture accessible to everyone. Build your career
				while building a better planet.
			</p>
		</div>

		<!-- Culture -->
		<div
			class="card mb-16 rounded-3xl border border-base-200/30 bg-primary text-primary-content shadow-md"
		>
			<div class="card-body p-12">
				<h2 class="font-display mb-6 text-center text-3xl tracking-tight uppercase">Our Culture</h2>
				<p class="mx-auto mb-8 max-w-3xl text-center text-lg">
					We're a team of passionate individuals united by our commitment to sustainability,
					innovation, and making a positive impact on the world.
				</p>
				<ul class="mx-auto max-w-2xl space-y-3">
					{#each values as value}
						<li class="flex items-start gap-3">
							<Icon name="check" size={20} class="mt-0.5 shrink-0" />
							<span class="text-lg">{value}</span>
						</li>
					{/each}
				</ul>
			</div>
		</div>

		<!-- Benefits -->
		<div class="mb-16">
			<h2 class="font-display mb-12 text-center text-3xl tracking-tight uppercase">
				Benefits & Perks
			</h2>
			<Grid columns={4} gap={6}>
				{#each benefits as benefit}
					<div class="card rounded-3xl border border-base-200/30 bg-base-100 shadow-md">
						<div class="card-body items-center text-center">
							<div class="mb-3">
								<Icon name={benefit.icon} size={40} class="text-primary" />
							</div>
							<p class="mb-1 font-mono text-xs tracking-widest text-secondary uppercase">Perk</p>
							<h3 class="font-display font-bold tracking-tight uppercase">{benefit.title}</h3>
							<p class="text-sm text-base-content/70">{benefit.description}</p>
						</div>
					</div>
				{/each}
			</Grid>
		</div>

		<!-- Open Positions -->
		<div class="mb-16">
			<h2 class="font-display mb-12 text-center text-3xl tracking-tight uppercase">
				Open Positions
			</h2>
			<div class="space-y-4">
				{#each openings as job}
					<div
						class="card rounded-3xl border border-base-200/30 bg-base-100 shadow-md transition-shadow hover:shadow-lg"
					>
						<div class="card-body">
							<div class="flex flex-wrap items-start justify-between gap-4">
								<div class="flex-1">
									<p class="mb-1 font-mono text-xs tracking-widest text-secondary uppercase">
										{job.department}
									</p>
									<h3 class="font-display mb-2 text-2xl tracking-tight uppercase">{job.title}</h3>
									<div class="flex flex-wrap gap-3">
										<span class="badge badge-primary">{job.location}</span>
										<span class="badge badge-outline">{job.type}</span>
									</div>
								</div>
								<button class="font-display btn tracking-wider uppercase btn-primary"
									>Apply Now</button
								>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Don't See Your Role -->
		<div class="card mb-16 rounded-3xl border border-base-200/30 bg-base-200 shadow-md">
			<div class="card-body p-12 text-center">
				<h2 class="font-display mb-4 text-2xl tracking-tight uppercase">
					Don't See Your Perfect Role?
				</h2>
				<p class="mb-6 text-base-content/70">
					We're always looking for talented individuals who share our passion. Send us your resume
					and let us know how you can contribute to our mission.
				</p>
				<button class="font-display btn tracking-wider uppercase btn-outline"
					>Send General Application</button
				>
			</div>
		</div>

		<!-- Hiring Process -->
		<div>
			<h2 class="font-display mb-12 text-center text-3xl tracking-tight uppercase">
				Our Hiring Process
			</h2>
			<div class="grid gap-6 md:grid-cols-4">
				<div class="text-center">
					<div
						class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-content"
					>
						1
					</div>
					<p class="mb-1 font-mono text-xs tracking-widest text-secondary uppercase">Step</p>
					<h3 class="font-display mb-2 font-bold tracking-tight uppercase">Apply</h3>
					<p class="text-sm text-base-content/70">Submit your application online</p>
				</div>
				<div class="text-center">
					<div
						class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-content"
					>
						2
					</div>
					<p class="mb-1 font-mono text-xs tracking-widest text-secondary uppercase">Step</p>
					<h3 class="font-display mb-2 font-bold tracking-tight uppercase">Phone Screen</h3>
					<p class="text-sm text-base-content/70">30-minute conversation with our team</p>
				</div>
				<div class="text-center">
					<div
						class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-content"
					>
						3
					</div>
					<p class="mb-1 font-mono text-xs tracking-widest text-secondary uppercase">Step</p>
					<h3 class="font-display mb-2 font-bold tracking-tight uppercase">Interviews</h3>
					<p class="text-sm text-base-content/70">Meet the team and showcase your skills</p>
				</div>
				<div class="text-center">
					<div
						class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-content"
					>
						4
					</div>
					<p class="mb-1 font-mono text-xs tracking-widest text-secondary uppercase">Step</p>
					<h3 class="font-display mb-2 font-bold tracking-tight uppercase">Offer</h3>
					<p class="text-sm text-base-content/70">Join the Aevani family!</p>
				</div>
			</div>
		</div>
	</Container>
</Section>
