<script lang="ts">
	// Use $props() instead of export let in runes mode
	import { PUBLIC_BASE_URL } from '$env/static/public';
	
	const {
		title = 'PlantCommerce | Sustainable Growing Tools & Supplies',
		description = 'Discover sustainable growing tools, hydroponic systems, and educational resources for modern growers.',
		image = '/images/AI-MockAssets/MAINHERO.png',
		url = '',
		type = 'website',
		publishedTime = null,
		modifiedTime = null,
		author = null,
		tags = []
	} = $props<{
		title?: string;
		description?: string;
		image?: string;
		url?: string;
		type?: string;
		publishedTime?: string | null;
		modifiedTime?: string | null;
		author?: string | null;
		tags?: string[];
	}>();

	// Use $derived for runes mode
	const safeTitle = $derived(title.length > 60 ? title.substring(0, 57) + '...' : title);
	const safeDescription = $derived(description.length > 160 ? description.substring(0, 157) + '...' : description);
	
	const baseUrl = (PUBLIC_BASE_URL ?? '').endsWith('/') ? PUBLIC_BASE_URL.slice(0, -1) : (PUBLIC_BASE_URL ?? '');
	const urlPath = url ? (url.startsWith('/') ? url : `/${url}`) : '';
	const absoluteUrl = $derived(url ? (url.startsWith('http') ? url : `${baseUrl}${urlPath}`) : baseUrl);

	const imagePath = image.startsWith('/') ? image : `/${image}`;
	const absoluteImage = $derived(image.startsWith('http') ? image : `${baseUrl}${imagePath}`);
</script>

<!-- Primary Meta Tags -->
<title>{safeTitle}</title>
<meta name="title" content={safeTitle} />
<meta name="description" content={safeDescription} />

<!-- Open Graph / Facebook -->
<meta property="og:type" content={type} />
<meta property="og:url" content={absoluteUrl} />
<meta property="og:title" content={safeTitle} />
<meta property="og:description" content={safeDescription} />
<meta property="og:image" content={absoluteImage} />

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image" />
<meta property="twitter:url" content={absoluteUrl} />
<meta property="twitter:title" content={safeTitle} />
<meta property="twitter:description" content={safeDescription} />
<meta property="twitter:image" content={absoluteImage} />

<!-- Article-specific tags -->
{#if type === 'article' && publishedTime}
	<meta property="article:published_time" content={publishedTime} />
{/if}

{#if type === 'article' && modifiedTime}
	<meta property="article:modified_time" content={modifiedTime} />
{/if}

{#if type === 'article' && author}
	<meta property="article:author" content={author} />
{/if}

{#if type === 'article' && tags.length > 0}
	{#each tags as tag}
		<meta property="article:tag" content={tag} />
	{/each}
{/if}

<!-- Canonical URL -->
<link rel="canonical" href={absoluteUrl} />
