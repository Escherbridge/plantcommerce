<script lang="ts">
	import { Container, Section } from '$lib/components/layout';
	import { Grid } from '$lib/components/layout';

	const pressReleases = [
		{
			date: '2023-09-15',
			title: 'Aevani Reaches 100,000 Customers Milestone',
			excerpt: 'Leading sustainable agriculture platform celebrates major growth achievement...'
		},
		{
			date: '2023-07-22',
			title: 'New Partnership with National Agroforestry Association',
			excerpt: 'Aevani announces strategic partnership to expand educational resources...'
		},
		{
			date: '2023-05-10',
			title: 'Aevani Launches Advanced Affiliate Program',
			excerpt: 'Revolutionary commission structure empowers content creators and educators...'
		},
		{
			date: '2023-03-18',
			title: 'Company Achieves Carbon Neutral Certification',
			excerpt: 'Aevani commits to sustainable operations and environmental stewardship...'
		}
	];

	const coverage = [
		{ outlet: 'TechCrunch', logo: '/press/techcrunch.png', article: 'The Future of Urban Farming' },
		{ outlet: 'Forbes', logo: '/press/forbes.png', article: 'Sustainable AgTech Startups to Watch' },
		{ outlet: 'Modern Farmer', logo: '/press/modern-farmer.png', article: 'Making Hydroponics Accessible' },
		{ outlet: 'Fast Company', logo: '/press/fast-company.png', article: 'Innovation in Sustainable Agriculture' }
	];

	const awards = [
		{ year: '2023', award: 'Best AgTech Platform', organization: 'Sustainable Business Awards' },
		{ year: '2022', award: 'Innovation in E-Commerce', organization: 'Green Business Council' },
		{ year: '2022', award: 'Rising Star Award', organization: 'National Farmers Association' },
		{ year: '2021', award: 'Best New Startup', organization: 'AgTech Innovation Summit' }
	];
</script>

<Section>
	<Container>
		<!-- Hero -->
		<div class="text-center mb-16">
			<h1 class="text-5xl font-bold mb-6">Press & Media</h1>
			<p class="text-xl text-base-content/70 max-w-3xl mx-auto">
				Latest news, press releases, and media coverage about Aevani
			</p>
		</div>

		<!-- Quick Stats -->
		<div class="stats stats-vertical lg:stats-horizontal shadow-2xl w-full mb-16">
			<div class="stat">
				<div class="stat-title">Founded</div>
				<div class="stat-value text-primary">2018</div>
			</div>
			<div class="stat">
				<div class="stat-title">Customers</div>
				<div class="stat-value text-secondary">100K+</div>
			</div>
			<div class="stat">
				<div class="stat-title">Products</div>
				<div class="stat-value text-accent">500+</div>
			</div>
			<div class="stat">
				<div class="stat-title">Countries</div>
				<div class="stat-value text-warning">25+</div>
			</div>
		</div>

		<!-- Press Releases -->
		<div class="mb-16">
			<h2 class="text-3xl font-bold mb-8">Press Releases</h2>
			<div class="space-y-4">
				{#each pressReleases as release}
					<div class="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
						<div class="card-body">
							<div class="text-sm text-base-content/60 mb-2">
								{new Date(release.date).toLocaleDateString('en-US', {
									year: 'numeric',
									month: 'long',
									day: 'numeric'
								})}
							</div>
							<h3 class="text-2xl font-bold mb-2">{release.title}</h3>
							<p class="text-base-content/70 mb-4">{release.excerpt}</p>
							<div class="card-actions">
								<button class="btn btn-primary btn-sm">Read Full Release</button>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Media Coverage -->
		<div class="mb-16">
			<h2 class="text-3xl font-bold mb-8">Featured In</h2>
			<Grid columns={2} gap={6}>
				{#each coverage as item}
					<div class="card bg-base-100 shadow-xl">
						<div class="card-body">
							<div class="flex items-center gap-4 mb-4">
								<div class="w-16 h-16 bg-base-200 rounded flex items-center justify-center">
									<span class="font-bold text-xs">{item.outlet}</span>
								</div>
								<div>
									<h3 class="font-bold text-lg">{item.outlet}</h3>
									<p class="text-sm text-base-content/70">{item.article}</p>
								</div>
							</div>
							<button class="btn btn-outline btn-sm">Read Article →</button>
						</div>
					</div>
				{/each}
			</Grid>
		</div>

		<!-- Awards -->
		<div class="mb-16">
			<h2 class="text-3xl font-bold mb-8">Awards & Recognition</h2>
			<div class="overflow-x-auto">
				<table class="table table-zebra">
					<thead>
						<tr>
							<th>Year</th>
							<th>Award</th>
							<th>Organization</th>
						</tr>
					</thead>
					<tbody>
						{#each awards as award}
							<tr>
								<td class="font-bold">{award.year}</td>
								<td>{award.award}</td>
								<td class="text-base-content/70">{award.organization}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>

		<!-- Media Kit -->
		<div class="card bg-base-200 mb-16">
			<div class="card-body text-center p-12">
				<h2 class="text-2xl font-bold mb-4">Media Kit</h2>
				<p class="text-base-content/70 mb-6">
					Download our media kit including logos, brand guidelines, product images, and company
					information.
				</p>
				<button class="btn btn-primary">Download Media Kit</button>
			</div>
		</div>

		<!-- Press Contact -->
		<div class="grid md:grid-cols-2 gap-6">
			<div class="card bg-base-100 shadow-xl">
				<div class="card-body">
					<h3 class="card-title">Press Inquiries</h3>
					<p class="text-base-content/70 mb-4">
						For media inquiries, interview requests, or press information:
					</p>
					<div class="space-y-2">
						<p><strong>Email:</strong> press@aevani.com</p>
						                                    <p><strong>Phone:</strong> (555) 123-4567</p>
						                                </div>
						                                <div class="bg-base-200 p-6 rounded-lg">
						                                    <h3 class="text-xl font-bold mb-2">Partnerships</h3>
						                                    <p>Interested in collaborating or partnering with Aevani?</p>
						                                    <p><strong>Email:</strong> partnerships@aevani.com</p>						<p><strong>Phone:</strong> 1-800-PARTNER</p>
						<p><strong>Office:</strong> Portland, OR</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Newsletter Signup -->
		<div class="mt-16 card bg-primary text-primary-content">
			<div class="card-body text-center p-8">
				<h2 class="text-2xl font-bold mb-4">Stay Updated</h2>
				<p class="mb-6">Subscribe to receive our latest news and announcements</p>
				<div class="flex gap-4 max-w-md mx-auto">
					<input
						type="email"
						placeholder="your@email.com"
						class="input input-bordered flex-1"
					/>
					<button class="btn btn-secondary">Subscribe</button>
				</div>
			</div>
		</div>
	</Container>
</Section>
