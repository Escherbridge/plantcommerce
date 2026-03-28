<script lang="ts">
	import { Container, Section } from '$lib/components/layout';
	import { Grid } from '$lib/components/layout';

	const values = [
		{
			title: 'Sustainability First',
			description: 'We prioritize eco-friendly practices in everything we do',
			icon: 'leaf'
		},
		{
			title: 'Quality Products',
			description: 'Carefully curated products that meet the highest standards',
			icon: 'star'
		},
		{
			title: 'Community Driven',
			description: 'Building a supportive network of sustainable farmers',
			icon: 'handshake'
		},
		{
			title: 'Education Focus',
			description: 'Empowering through knowledge and resources',
			icon: 'book'
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
	];
</script>

<Section>
	<Container>
		<div class="about-page bg-base-200">
			<section class="hero bg-primary text-primary-content text-center py-20">
				<div class="container mx-auto">
					<h1 class="text-5xl font-display uppercase tracking-tight mb-6">About Aevani</h1>
					<p class="text-xl text-base-content/70 max-w-3xl mx-auto">
						We're on a mission to make sustainable agriculture accessible to everyone, from backyard
						gardeners to professional farmers.
					</p>
				</div>
			</section>

		<!-- Mission Statement -->
		<div class="card bg-primary text-primary-content shadow-2xl mb-16 rounded-3xl border border-base-200/30">
			<div class="card-body text-center p-12">
				<h2 class="text-3xl font-display uppercase tracking-tight mb-4">Our Mission</h2>
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
			<h2 class="text-3xl font-display uppercase tracking-tight text-center mb-12">Our Values</h2>
			<Grid columns={4} gap={6}>
				{#each values as value}
					<div class="card bg-base-100 shadow-xl rounded-3xl border border-base-200/30">
						<div class="card-body items-center text-center">
							<div class="w-16 h-16 mb-4 flex items-center justify-center text-primary">
								{#if value.icon === 'leaf'}
									<svg class="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
										<path d="M12 3c-4 4-8 9-8 14 0 3 2 5 5 5s5-2 5-5c0-5-4-10-8-14z"/>
										<line x1="12" y1="3" x2="12" y2="21"/>
									</svg>
								{:else if value.icon === 'star'}
									<svg class="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
										<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
									</svg>
								{:else if value.icon === 'handshake'}
									<svg class="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
										<path d="M17 8a5 5 0 00-10 0c0 4 5 8 5 12 0-4 5-8 5-12z"/>
									</svg>
								{:else if value.icon === 'book'}
									<svg class="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
										<path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
										<path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
									</svg>
								{/if}
							</div>
							<h3 class="card-title font-display uppercase tracking-tight">{value.title}</h3>
							<p class="text-base-content/70">{value.description}</p>
						</div>
					</div>
				{/each}
			</Grid>
		</div>

		<!-- Our Story Timeline -->
		<div class="mb-16">
			<h2 class="text-3xl font-display uppercase tracking-tight text-center mb-12">Our Journey</h2>
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
			<h2 class="text-3xl font-display uppercase tracking-tight text-center mb-12">Meet Our Team</h2>
			<Grid columns={4} gap={6}>
				{#each team as member}
					<div class="card bg-base-100 shadow-xl rounded-3xl border border-base-200/30">
						<figure class="aspect-square">
							<img
								src={member.image}
								alt={member.name}
								class="object-cover w-full h-full"
								onerror={(e) => {
									e.currentTarget.src = '/placeholder-avatar.jpg';
								}}
							/>
						</figure>
						<div class="card-body text-center">
							<h3 class="card-title justify-center font-display uppercase tracking-tight">{member.name}</h3>
							<p class="font-mono text-xs uppercase tracking-widest text-base-content/70">{member.role}</p>
						</div>
					</div>
				{/each}
			</Grid>
		</div>

		<!-- Stats -->
		<div class="stats stats-vertical lg:stats-horizontal shadow-2xl w-full mb-16 rounded-3xl border border-base-200/30">
			<div class="stat">
				<div class="stat-title font-mono text-xs uppercase tracking-widest">Customers Served</div>
				<div class="stat-value text-primary">100K+</div>
				<div class="stat-desc">Growing sustainable</div>
			</div>

			<div class="stat">
				<div class="stat-title font-mono text-xs uppercase tracking-widest">Products Offered</div>
				<div class="stat-value text-secondary">500+</div>
				<div class="stat-desc">Carefully curated</div>
			</div>

			<div class="stat">
				<div class="stat-title font-mono text-xs uppercase tracking-widest">Countries Shipped</div>
				<div class="stat-value text-accent">25+</div>
				<div class="stat-desc">Worldwide delivery</div>
			</div>

			<div class="stat">
				<div class="stat-title font-mono text-xs uppercase tracking-widest">CO2 Offset</div>
				<div class="stat-value text-success">5M kg</div>
				<div class="stat-desc">Environmental impact</div>
			</div>
		</div>

		<!-- Certifications -->
		<div class="card bg-base-200 rounded-3xl border border-base-200/30">
			<div class="card-body">
				<h2 class="text-2xl font-display uppercase tracking-tight text-center mb-6">Certifications & Partnerships</h2>
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
			<h2 class="text-3xl font-display uppercase tracking-tight mb-6">Join Our Mission</h2>
			<p class="text-lg text-base-content/70 mb-8">
				Whether you're a customer, partner, or team member, there's a place for you here.
			</p>
			<div class="flex gap-4 justify-center">
				<a href="/products/hydroponics" class="btn btn-primary btn-lg font-display uppercase tracking-wider">Start Growing</a>
				<a href="/careers" class="btn btn-outline btn-lg font-display uppercase tracking-wider">Join Our Team</a>
			</div>
		</div>
		</div>
	</Container>
</Section>
