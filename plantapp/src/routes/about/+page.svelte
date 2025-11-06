<script lang="ts">
	import { Container, Section } from '$lib/components/layout';
	import { Grid } from '$lib/components/layout';

	const values = [
		{
			title: 'Sustainability First',
			description: 'We prioritize eco-friendly practices in everything we do',
			icon: '🌱'
		},
		{
			title: 'Quality Products',
			description: 'Carefully curated products that meet the highest standards',
			icon: '✨'
		},
		{
			title: 'Community Driven',
			description: 'Building a supportive network of sustainable farmers',
			icon: '🤝'
		},
		{
			title: 'Education Focus',
			description: 'Empowering through knowledge and resources',
			icon: '📚'
		}
	];

	const team = [
		{ name: 'Sarah Johnson', role: 'Founder & CEO', image: '/team/sarah.jpg' },
		{ name: 'Michael Chen', role: 'Head of Operations', image: '/team/michael.jpg' },
		{ name: 'Emily Rodriguez', role: 'Lead Agronomist', image: '/team/emily.jpg' },
		{ name: 'David Kim', role: 'Technology Director', image: '/team/david.jpg' }
	];

	const milestones = [
		{ year: '2018', event: 'Aevani founded with a mission to democratize sustainable agriculture' },
							{ year: '2020', event: 'Expanded product line to include aquaponics and agroforestry' },
							{ year: '2022', event: 'Launched affiliate program to empower community growth' },
							{ year: '2024', event: 'Reached 100,000 members in our learning community' }
						],
						foundingDate: '2018-03-15',
						team: [
							{ name: 'Alex Chen', role: 'Founder & CEO', image: '/images/team/alex.jpg' },
							{ name: 'Maria Garcia', role: 'Head of Horticulture', image: '/images/team/maria.jpg' },
							{ name: 'David Lee', role: 'Lead Engineer', image: '/images/team/david.jpg' },
							{ name: 'Sarah Kim', role: 'Community Manager', image: '/images/team/sarah.jpg' }
						]
					};
		</script>
		
		<div class="about-page bg-base-200">
			<section class="hero bg-primary text-primary-content text-center py-20">
				<div class="container mx-auto">
					<h1 class="text-5xl font-bold mb-6">About Aevani</h1>			<p class="text-xl text-base-content/70 max-w-3xl mx-auto">
				We're on a mission to make sustainable agriculture accessible to everyone, from backyard
				gardeners to professional farmers.
			</p>
		</div>

		<!-- Mission Statement -->
		<div class="card bg-primary text-primary-content shadow-2xl mb-16">
			<div class="card-body text-center p-12">
				<h2 class="text-3xl font-bold mb-4">Our Mission</h2>
				<p class="text-lg max-w-4xl mx-auto">
					To empower individuals and communities to grow food sustainably by providing
					high-quality products, expert knowledge, and unwavering support. We believe that
					sustainable agriculture is not just a practice—it's a pathway to a healthier planet
					and more resilient communities.
				</p>
			</div>
		</div>

		<!-- Core Values -->
		<div class="mb-16">
			<h2 class="text-3xl font-bold text-center mb-12">Our Values</h2>
			<Grid columns={4} gap={6}>
				{#each values as value}
					<div class="card bg-base-100 shadow-xl">
						<div class="card-body items-center text-center">
							<span class="text-6xl mb-4">{value.icon}</span>
							<h3 class="card-title">{value.title}</h3>
							<p class="text-base-content/70">{value.description}</p>
						</div>
					</div>
				{/each}
			</Grid>
		</div>

		<!-- Our Story Timeline -->
		<div class="mb-16">
			<h2 class="text-3xl font-bold text-center mb-12">Our Journey</h2>
			<div class="space-y-4">
				{#each milestones as milestone}
					<div class="flex gap-6 items-start">
						<div class="badge badge-primary badge-lg font-bold min-w-[80px]">
							{milestone.year}
						</div>
						<p class="text-lg flex-1">{milestone.event}</p>
					</div>
				{/each}
			</div>
		</div>

		<!-- Team Section -->
		<div class="mb-16">
			<h2 class="text-3xl font-bold text-center mb-12">Meet Our Team</h2>
			<Grid columns={4} gap={6}>
				{#each team as member}
					<div class="card bg-base-100 shadow-xl">
						<figure class="aspect-square">
							<img
								src={member.image}
								alt={member.name}
								class="object-cover w-full h-full"
								on:error={(e) => {
									e.currentTarget.src = '/placeholder-avatar.jpg';
								}}
							/>
						</figure>
						<div class="card-body text-center">
							<h3 class="card-title justify-center">{member.name}</h3>
							<p class="text-sm text-base-content/70">{member.role}</p>
						</div>
					</div>
				{/each}
			</Grid>
		</div>

		<!-- Stats -->
		<div class="stats stats-vertical lg:stats-horizontal shadow-2xl w-full mb-16">
			<div class="stat">
				<div class="stat-title">Customers Served</div>
				<div class="stat-value text-primary">100K+</div>
				<div class="stat-desc">Growing sustainable</div>
			</div>

			<div class="stat">
				<div class="stat-title">Products Offered</div>
				<div class="stat-value text-secondary">500+</div>
				<div class="stat-desc">Carefully curated</div>
			</div>

			<div class="stat">
				<div class="stat-title">Countries Shipped</div>
				<div class="stat-value text-accent">25+</div>
				<div class="stat-desc">Worldwide delivery</div>
			</div>

			<div class="stat">
				<div class="stat-title">CO2 Offset</div>
				<div class="stat-value text-success">5M kg</div>
				<div class="stat-desc">Environmental impact</div>
			</div>
		</div>

		<!-- Certifications -->
		<div class="card bg-base-200">
			<div class="card-body">
				<h2 class="text-2xl font-bold text-center mb-6">Certifications & Partnerships</h2>
				<div class="flex flex-wrap justify-center gap-8">
					<div class="badge badge-lg badge-outline">Certified B Corporation</div>
					<div class="badge badge-lg badge-outline">USDA Organic Partner</div>
					<div class="badge badge-lg badge-outline">Climate Neutral Certified</div>
					<div class="badge badge-lg badge-outline">Fair Trade Supporter</div>
				</div>
			</div>
		</div>

		<!-- CTA -->
		<div class="text-center mt-16">
			<h2 class="text-3xl font-bold mb-6">Join Our Mission</h2>
			<p class="text-lg text-base-content/70 mb-8">
				Whether you're a customer, partner, or team member, there's a place for you here.
			</p>
			<div class="flex gap-4 justify-center">
				<a href="/products/hydroponics" class="btn btn-primary btn-lg">Start Growing</a>
				<a href="/careers" class="btn btn-outline btn-lg">Join Our Team</a>
			</div>
		</div>
	</Container>
</Section>
