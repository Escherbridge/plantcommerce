<script lang="ts">
	// Use $props() instead of export let in runes mode
	import { publicSite, publicSiteUrl } from '$lib/config/site';

	const DEFAULT_SHARE_IMAGE = '/og-image.png';

	const {
		title = publicSite.defaultTitle,
		description = publicSite.description,
		image = null,
		useDefaultImage = true,
		url = '',
		type = 'website',
		publishedTime = null,
		modifiedTime = null,
		author = null,
		tags = [],
		identity = true
	} = $props<{
		title?: string;
		description?: string;
		image?: string | null;
		/** When false, omit the sitewide share image so a page can set its own. */
		useDefaultImage?: boolean;
		url?: string;
		type?: string;
		publishedTime?: string | null;
		modifiedTime?: string | null;
		author?: string | null;
		tags?: string[];
		/** When false, the page supplies its own title and description. */
		identity?: boolean;
	}>();

	// Use $derived for runes mode
	const safeTitle = $derived(title.length > 60 ? title.substring(0, 57) + '...' : title);
	const safeDescription = $derived(
		description.length > 220 ? description.substring(0, 217) + '...' : description
	);

	const baseUrl = publicSite.origin;
	const absoluteUrl = $derived(url ? (url.startsWith('http') ? url : publicSiteUrl(url)) : baseUrl);

	const imagePath = $derived(image ? (image.startsWith('/') ? image : `/${image}`) : null);
	const customImage = $derived(
		image ? (image.startsWith('http') ? image : publicSiteUrl(imagePath!)) : null
	);
	const absoluteImage = $derived(
		customImage ?? (useDefaultImage ? publicSiteUrl(DEFAULT_SHARE_IMAGE) : null)
	);
	const usingDefaultImage = $derived(!customImage && absoluteImage !== null);
</script>

<!-- Primary Meta Tags -->
{#if identity}
	<title>{safeTitle}</title>
	<meta name="title" content={safeTitle} />
	<meta name="description" content={safeDescription} />
{/if}

<!-- Open Graph / Facebook -->
{#if identity}
	<meta property="og:type" content={type} />
{/if}
<meta property="og:url" content={absoluteUrl} />
{#if identity}
	<meta property="og:title" content={safeTitle} />
	<meta property="og:description" content={safeDescription} />
{/if}
{#if absoluteImage}
	<meta property="og:image" content={absoluteImage} />
	{#if usingDefaultImage}
		<meta property="og:image:width" content="1200" />
		<meta property="og:image:height" content="630" />
	{/if}
{/if}

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image" />
<meta property="twitter:url" content={absoluteUrl} />
{#if identity}
	<meta property="twitter:title" content={safeTitle} />
	<meta property="twitter:description" content={safeDescription} />
{/if}
{#if absoluteImage}
	<meta property="twitter:image" content={absoluteImage} />
{/if}

<!-- Article-specific tags -->
{#if identity && type === 'article' && publishedTime}
	<meta property="article:published_time" content={publishedTime} />
{/if}

{#if identity && type === 'article' && modifiedTime}
	<meta property="article:modified_time" content={modifiedTime} />
{/if}

{#if identity && type === 'article' && author}
	<meta property="article:author" content={author} />
{/if}

{#if identity && type === 'article' && tags.length > 0}
	{#each tags as tag}
		<meta property="article:tag" content={tag} />
	{/each}
{/if}

<!-- Canonical URL -->
<link rel="canonical" href={absoluteUrl} />
