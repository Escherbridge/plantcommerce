<script lang="ts">
	import { Container, Section } from '$lib/components/layout';
	import { publicOperator } from '$lib/config/site';

	const topics = [
		{
			title: 'Support',
			body: 'Product questions, account access, and which policy page to read first.',
			href: '/support',
			label: 'Open support'
		},
		{
			title: 'Shipping',
			body: 'Free shipping on qualifying orders, and the shipping notes on current listings.',
			href: '/shipping',
			label: 'Read shipping'
		},
		{
			title: 'Returns',
			body: 'Product pages state 30-day returns and a no-fuss guarantee.',
			href: '/returns',
			label: 'Read returns'
		},
		{
			title: 'Orders',
			body: 'Signed-in orders are listed in your account.',
			href: '/account/orders',
			label: 'View orders'
		}
	];

	const profiles = [
		{ label: 'Instagram', href: 'https://instagram.com/aevani' },
		{ label: 'X', href: 'https://twitter.com/aevani' },
		{ label: 'Facebook', href: 'https://facebook.com/aevani' }
	];
</script>

<svelte:head>
	<title>Contact | Aevani</title>
	<meta
		name="description"
		content="Email, phone, and mailing address for Aevani, plus help for products, orders, shipping, and returns."
	/>
</svelte:head>

<Section>
	<Container>
		<div class="mx-auto max-w-4xl space-y-10">
			<header class="space-y-4">
				<p class="font-mono text-xs font-semibold tracking-widest text-secondary uppercase">
					Contact
				</p>
				<h1 class="font-display text-4xl tracking-tight uppercase md:text-5xl">Contact</h1>
				<p class="max-w-3xl text-lg text-base-content/70">
					Aevani's contact is {publicOperator.contactName}. Questions about a product, an order,
					shipping, or returns can also start with the page that matches the question.
				</p>
			</header>

			<section class="rounded-2xl border border-base-200 bg-base-100 p-6 shadow-sm md:p-8">
				<h2 class="font-display text-2xl tracking-tight uppercase">Aevani contact</h2>
				<ul class="mt-4 space-y-2 text-base-content/80">
					<li>
						<strong>Email:</strong>
						<a class="link link-primary" href="mailto:{publicOperator.email}"
							>{publicOperator.email}</a
						>
					</li>
					<li>
						<strong>Phone:</strong>
						<a class="link link-primary" href={publicOperator.phoneHref}>{publicOperator.phone}</a>
					</li>
					<li><strong>Mail:</strong> {publicOperator.address}</li>
				</ul>
			</section>

			<div class="grid gap-6 md:grid-cols-2">
				{#each topics as topic}
					<section class="card border border-base-200 bg-base-100 shadow-sm">
						<div class="card-body">
							<h2 class="font-display card-title tracking-tight uppercase">{topic.title}</h2>
							<p class="text-base-content/70">{topic.body}</p>
							<a class="link link-primary" href={topic.href}>{topic.label}</a>
						</div>
					</section>
				{/each}
			</div>

			<section class="rounded-2xl bg-base-200 p-6 md:p-8">
				<h2 class="font-display text-2xl tracking-tight uppercase">Also on the site</h2>
				<ul class="mt-4 list-disc space-y-2 pl-5 text-base-content/70">
					<li><a class="link link-primary" href="/faq">Frequently asked questions</a></li>
					<li><a class="link link-primary" href="/warranty">Warranty</a></li>
					<li>
						<a class="link link-primary" href="/accessibility">Accessibility feedback</a>
					</li>
					<li>
						<a class="link link-primary" href="/forgot-password">Reset your password</a>
					</li>
				</ul>
			</section>

			<section class="space-y-3">
				<h2 class="font-display text-2xl tracking-tight uppercase">Profiles</h2>
				<ul class="flex flex-wrap gap-x-6 gap-y-2">
					{#each profiles as profile}
						<li>
							<a class="link link-primary" href={profile.href} rel="noopener noreferrer"
								>{profile.label}</a
							>
						</li>
					{/each}
				</ul>
			</section>
		</div>
	</Container>
</Section>
