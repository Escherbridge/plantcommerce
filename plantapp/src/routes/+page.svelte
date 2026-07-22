<script lang="ts">
	import StructuredData from '$lib/components/StructuredData.svelte';
	import { Container } from '$lib/components/layout';
	import { MockCommerceNotice } from '$lib/components/commerce';
	import { Icon, type IconName } from '$lib/components/icons';
	import { formatMoney } from '$lib/commerce/contracts';
	import { PatternBackground, RootSystem } from '$lib/components/patterns';
	import { publicSite } from '$lib/config/site';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const growingSystems: Array<{
		name: string;
		slug: string;
		index: string;
		icon: IconName;
		description: string;
	}> = [
		{
			name: 'Hydroponics',
			slug: 'hydroponics',
			index: '01',
			icon: 'sprout',
			description: 'Soilless growing systems, nutrient delivery, and controlled environments.'
		},
		{
			name: 'Aquaponics',
			slug: 'aquaponics',
			index: '02',
			icon: 'maintenance',
			description: 'Integrated fish and plant systems built around careful water stewardship.'
		},
		{
			name: 'Silvopasture & Agroforestry',
			slug: 'silvopasture-agroforestry',
			index: '03',
			icon: 'calendar',
			description: 'Field references for trees, forage, livestock, and layered land-use systems.'
		}
	];

	const values: Array<{ name: string; icon: IconName; description: string }> = [
		{
			name: 'Stewardship',
			icon: 'sprout',
			description: 'Choices shaped by soil health, water care, and long-term resilience.'
		},
		{
			name: 'Education',
			icon: 'book-open',
			description: 'Practical knowledge made legible for growers at every level.'
		},
		{
			name: 'Community',
			icon: 'message-circle',
			description: 'Shared learning, transparent evidence, and support that stays human.'
		},
		{
			name: 'Agency',
			icon: 'wrench',
			description: 'Tools and information that help people make informed decisions.'
		}
	];
</script>

<svelte:head>
	<title>{publicSite.name} | Sustainable Agriculture Marketplace</title>
	<meta
		name="description"
		content="Field-tested tools and practical knowledge for more resilient growing systems."
	/>
	{#if data.context.isMock}<meta name="robots" content="noindex,nofollow" />{/if}
	<StructuredData
		type="website"
		data={{
			name: publicSite.name,
			url: publicSite.origin,
			description: publicSite.description
		}}
	/>
	<StructuredData type="organization" data={{ name: publicSite.name, url: publicSite.origin }} />
</svelte:head>

{#if data.context.isMock}<MockCommerceNotice label={data.context.label} />{/if}

<section
	class="relative isolate overflow-hidden bg-primary py-20 text-primary-content sm:py-28 lg:py-36"
>
	<PatternBackground pattern={RootSystem} opacity={0.08} class="absolute inset-0 -z-10" />
	<Container size="xl">
		<div class="grid items-end gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
			<div class="max-w-5xl">
				<p class="font-mono text-xs font-bold tracking-[0.2em] text-accent uppercase">
					Field notes for resilient growing
				</p>
				<h1
					class="font-display mt-6 text-7xl leading-[0.82] font-bold tracking-tight uppercase sm:text-8xl lg:text-[10rem]"
				>
					Aevani
				</h1>
				<p class="mt-8 max-w-2xl text-lg leading-relaxed text-primary-content/80 sm:text-xl">
					From monoculture to polyculture: useful tools, careful evidence, and practical knowledge
					for more resilient growing systems.
				</p>
			</div>
			<div class="border-l border-accent pl-6">
				<p class="font-mono text-xs font-bold tracking-widest text-accent uppercase">Start here</p>
				<div class="mt-4 flex flex-col gap-3">
					<a class="btn btn-accent" href="/products">
						{data.context.isMock ? 'Explore test catalogue' : 'Explore catalogue'}
					</a>
					<a
						class="btn border border-primary-content/60 bg-transparent text-primary-content hover:border-accent hover:bg-accent hover:text-accent-content"
						href="/learn"
					>
						Browse learning
					</a>
				</div>
			</div>
		</div>
	</Container>
</section>

<section class="bg-base-100 py-20 sm:py-28">
	<Container size="xl">
		<header
			class="grid gap-5 border-b border-base-content/30 pb-8 lg:grid-cols-[1fr_32rem] lg:items-end"
		>
			<div>
				<p class="text-lime-ink font-mono text-xs font-bold tracking-[0.18em] uppercase">
					Three systems
				</p>
				<h2 class="font-display mt-3 text-5xl font-bold tracking-tight uppercase sm:text-7xl">
					Explore growing systems
				</h2>
			</div>
			<p class="text-lg leading-relaxed text-base-content/70">
				Browse the catalogue and field references through clear, system-led pathways.
			</p>
		</header>

		<div class="mt-8 grid gap-px border border-base-content/30 bg-base-content/30 md:grid-cols-3">
			{#each growingSystems as system}
				<a class="group min-w-0 bg-base-100 p-6 hover:bg-base-200" href="/products/{system.slug}">
					<div class="flex items-start justify-between gap-4">
						<span class="text-lime-ink font-mono text-xs font-bold">{system.index}</span>
						<span
							class="grid h-12 w-12 place-items-center border border-primary bg-accent text-accent-content"
						>
							<Icon name={system.icon} size={32} />
						</span>
					</div>
					<h3 class="font-display mt-12 text-3xl font-bold uppercase">{system.name}</h3>
					<p class="mt-3 text-sm leading-relaxed text-base-content/70">{system.description}</p>
					<span
						class="mt-8 inline-block font-mono text-xs font-bold tracking-wider uppercase group-hover:underline"
					>
						Explore system
					</span>
				</a>
			{/each}
		</div>
	</Container>
</section>

<section class="bg-secondary py-20 text-secondary-content sm:py-28">
	<Container size="xl">
		<p class="font-mono text-xs font-bold tracking-[0.18em] text-accent uppercase">
			Working principles
		</p>
		<h2 class="font-display mt-3 text-5xl font-bold uppercase sm:text-7xl">
			Cultivate with intent
		</h2>
		<div class="mt-12 grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
			{#each values as value}
				<article class="border-t border-secondary-content/40 pt-5">
					<Icon name={value.icon} size={32} class="text-accent" />
					<h3 class="font-display mt-8 text-2xl font-bold uppercase">{value.name}</h3>
					<p class="mt-3 leading-relaxed text-secondary-content/75">{value.description}</p>
				</article>
			{/each}
		</div>
	</Container>
</section>

<section class="bg-base-100 py-20 sm:py-28">
	<Container size="xl">
		<header class="max-w-3xl">
			<p class="text-lime-ink font-mono text-xs font-bold tracking-[0.18em] uppercase">
				{data.context.isMock ? 'Test catalogue selection' : 'Catalogue selection'}
			</p>
			<h2 class="font-display mt-3 text-5xl font-bold uppercase sm:text-7xl">Current field kit</h2>
			<p class="mt-5 text-lg leading-relaxed text-base-content/70">
				{data.context.isMock
					? 'These fictional mock/test listings exercise the local catalogue journey only.'
					: 'A current selection from the active Aevani catalogue.'}
			</p>
		</header>

		{#if data.featuredProducts.length}
			<div class="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
				{#each data.featuredProducts as product}
					<a
						class="flex min-w-0 flex-col border border-base-content/30 bg-base-100 p-5 hover:border-primary"
						href="/products/{product.category.slug}/{product.slug}"
					>
						{#if data.context.isMock}
							<p class="text-lime-ink font-mono text-xs font-bold tracking-wider uppercase">
								Mock/test item
							</p>
						{/if}
						<p class="mt-8 text-xs font-bold tracking-wider text-base-content/75 uppercase">
							{product.category.name}
						</p>
						<h3 class="font-display mt-2 text-2xl font-bold uppercase">{product.name}</h3>
						<p class="mt-3 line-clamp-3 text-sm leading-relaxed text-base-content/70">
							{product.shortDescription}
						</p>
						<div
							class="mt-8 flex items-end justify-between gap-4 border-t border-base-content/20 pt-4"
						>
							<span>
								{#if data.context.isMock}<small class="block font-bold uppercase">Test price</small
									>{/if}
								<strong class="font-mono text-xl">{formatMoney(product.price)}</strong>
							</span>
							<span class="font-mono text-xs font-bold tracking-wider uppercase">Details</span>
						</div>
					</a>
				{/each}
			</div>
		{:else}
			<div class="mt-10 border border-base-content/30 p-8">
				<p class="text-lg text-base-content/70">
					No featured catalogue items are available right now.
				</p>
			</div>
		{/if}

		<a class="btn mt-10 btn-primary" href="/products">View full catalogue</a>
	</Container>
</section>

<section class="bg-primary py-20 text-primary-content sm:py-24">
	<Container>
		<div class="mx-auto max-w-3xl text-center">
			<p class="font-mono text-xs font-bold tracking-[0.18em] text-accent uppercase">
				Keep in touch
			</p>
			<h2 class="font-display mt-3 text-5xl font-bold uppercase sm:text-7xl">Stay connected</h2>
			<p class="mt-5 text-lg leading-relaxed text-primary-content/75">
				Newsletter sign-up is currently unavailable. For updates or support,
				<a class="underline decoration-accent underline-offset-4" href="/contact">contact Aevani</a
				>.
			</p>
		</div>
	</Container>
</section>
