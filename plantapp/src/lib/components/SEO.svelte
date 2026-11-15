<script lang="ts">
	// Use $props() instead of export let in runes mode
	import { publicShareImage, publicSite, publicSiteUrl } from '$lib/config/site';

	const DEFAULT_SHARE_IMAGE = publicShareImage.path;

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
		imageAlt = null,
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
		imageAlt?: string | null;
		tags?: string[];
		/** When false, the page supplies the whole document head. */
		identity?: boolean;
	}>();

	// Use $derived for runes mode
	const safeTitle = $derived(title.length > 100 ? title.substring(0, 97) + '...' : title);
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
	const shareAlt = $derived(imageAlt || (usingDefaultImage ? publicShareImage.alt : safeTitle));
</script>

{#if identity}
	<title>{safeTitle}</title>
	<meta name="title" content={safeTitle} />
	<meta name="description" content={safeDescription} />
	<meta name="author" content={author || 'Escherbridge'} />

	<meta property="og:type" content={type} />
	<meta property="og:url" content={absoluteUrl} />
	<meta property="og:title" content={safeTitle} />
	<meta property="og:description" content={safeDescription} />
	{#if absoluteImage}
		<meta property="og:image" content={absoluteImage} />
		<meta property="og:image:alt" content={shareAlt} />
		{#if usingDefaultImage}
			<meta property="og:image:width" content={String(publicShareImage.width)} />
			<meta property="og:image:height" content={String(publicShareImage.height)} />
		{/if}
	{/if}

	<meta property="twitter:card" content="summary_large_image" />
	<meta property="twitter:url" content={absoluteUrl} />
	<meta property="twitter:title" content={safeTitle} />
	<meta property="twitter:description" content={safeDescription} />
	{#if absoluteImage}
		<meta property="twitter:image" content={absoluteImage} />
		<meta name="twitter:image:alt" content={shareAlt} />
	{/if}

	{#if type === 'article' && publishedTime}
		<meta property="article:published_time" content={publishedTime} />
	{/if}

	{#if type === 'article' && modifiedTime}
		<meta property="article:modified_time" content={modifiedTime} />
	{/if}

	{#if type === 'article'}
		<meta property="article:author" content={author || 'Escherbridge'} />
	{/if}

	{#if type === 'article' && tags.length > 0}
		{#each tags as tag}
			<meta property="article:tag" content={tag} />
		{/each}
	{/if}

	<link rel="canonical" href={absoluteUrl} />
{/if}
