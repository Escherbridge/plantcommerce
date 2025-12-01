<script lang="ts">
	import {
		BaseForm,
		MultiStepForm,
		Grid,
		GridItem,
		Container,
		Section,
		OptimizedImage,
		ImageGallery,
		Breadcrumbs,
		Accordion,
		Carousel,
		Flex,
		type FormFieldConfig,
		type MultiFormConfig
	} from '$lib/components';

	// Sample data for demonstrations
	const breadcrumbItems = [
		{ name: 'Home', url: '/' },
		{ name: 'Components', url: '/components' },
		{ name: 'Demo', isActive: true }
	];

	const formFields: FormFieldConfig[] = [
		{
			id: 'name',
			name: 'name',
			type: 'text',
			label: 'Full Name',
			required: true,
			placeholder: 'Enter your full name'
		},
		{
			id: 'email',
			name: 'email',
			type: 'email',
			label: 'Email Address',
			required: true,
			placeholder: 'you@example.com'
		},
		{
			id: 'message',
			name: 'message',
			type: 'textarea',
			label: 'Message',
			placeholder: 'Tell us what you think about our components...'
		}
	];

	const accordionItems = [
		{
			id: 'forms',
			title: 'Form Components',
			content:
				'Comprehensive form system with validation, multi-step forms, file uploads, rich text editing, and date pickers.',
			defaultOpen: true
		},
		{
			id: 'layout',
			title: 'Layout Components',
			content:
				'Swiss design inspired layout system with responsive grids, containers, sections, and flexbox utilities.'
		},
		{
			id: 'images',
			title: 'Image Components',
			content:
				'Performance optimized images with lazy loading, multiple formats, responsive sizing, and gallery functionality.'
		},
		{
			id: 'ui',
			title: 'UI Components',
			content:
				'Interactive components like accordions, carousels, breadcrumbs, and more with full accessibility support.'
		}
	];

	const galleryImages = [
		{
			src: 'https://picsum.photos/400/300?random=1',
			alt: 'Sample image 1',
			title: 'Beautiful Landscape',
			description: 'A stunning mountain view'
		},
		{
			src: 'https://picsum.photos/400/300?random=2',
			alt: 'Sample image 2',
			title: 'Urban Architecture',
			description: 'Modern city buildings'
		},
		{
			src: 'https://picsum.photos/400/300?random=3',
			alt: 'Sample image 3',
			title: 'Nature Close-up',
			description: 'Detailed macro photography'
		}
	];

	const carouselItems = [
		{
			id: 'slide1',
			content: `<div class="bg-primary text-primary-content p-12 rounded-lg text-center">
        <h3 class="text-2xl font-bold mb-4">Slide 1</h3>
        <p>Beautiful carousel with touch support and autoplay</p>
      </div>`
		},
		{
			id: 'slide2',
			content: `<div class="bg-secondary text-secondary-content p-12 rounded-lg text-center">
        <h3 class="text-2xl font-bold mb-4">Slide 2</h3>
        <p>Responsive design with dots and arrow navigation</p>
      </div>`
		},
		{
			id: 'slide3',
			content: `<div class="bg-accent text-accent-content p-12 rounded-lg text-center">
        <h3 class="text-2xl font-bold mb-4">Slide 3</h3>
        <p>Accessible and customizable carousel component</p>
      </div>`
		}
	];

	function handleFormSubmit(data: any) {
		console.log('Form submitted:', data);
		alert('Form submitted! Check the console for data.');
	}

	function handleMultiStepSubmit(data: any) {
		console.log('Multi-step form submitted:', data);
		alert('Multi-step form completed! Check the console for data.');
	}

	const multiStepConfig: MultiFormConfig = {
		steps: [
			{
				id: 'personal',
				title: 'Personal Information',
				description: 'Tell us about yourself',
				fields: [
					{
						id: 'firstName',
						name: 'firstName',
						type: 'text',
						label: 'First Name',
						required: true
					},
					{
						id: 'lastName',
						name: 'lastName',
						type: 'text',
						label: 'Last Name',
						required: true
					}
				]
			},
			{
				id: 'contact',
				title: 'Contact Details',
				description: 'How can we reach you?',
				fields: [
					{
						id: 'email',
						name: 'email',
						type: 'email',
						label: 'Email Address',
						required: true
					},
					{
						id: 'phone',
						name: 'phone',
						type: 'tel',
						label: 'Phone Number'
					}
				]
			},
			{
				id: 'preferences',
				title: 'Preferences',
				description: 'Customize your experience',
				fields: [
					{
						id: 'newsletter',
						name: 'newsletter',
						type: 'checkbox',
						label: 'Newsletter Subscription',
						placeholder: 'Subscribe to our newsletter'
					},
					{
						id: 'interests',
						name: 'interests',
						type: 'select',
						label: 'Primary Interest',
						options: [
							{ value: 'web-development', label: 'Web Development' },
							{ value: 'design', label: 'Design' },
							{ value: 'business', label: 'Business' },
							{ value: 'other', label: 'Other' }
						]
					}
				]
			}
		],
		onSubmit: handleMultiStepSubmit,
		showProgress: true,
		allowBackNavigation: true
	};
</script>

<svelte:head>
	<title>Component Library Demo</title>
	<meta name="description" content="Demonstration of our comprehensive component library" />
</svelte:head>

<Container size="xl">
	<!-- Breadcrumbs -->
	<div class="py-4">
		<Breadcrumbs items={breadcrumbItems} />
	</div>

	<!-- Hero Section -->
	<Section spacing="xl" background="primary" className="rounded-2xl mb-12">
		<div class="text-center">
			<h1 class="mb-6 text-4xl font-bold md:text-6xl">Component Library Demo</h1>
			<p class="mx-auto max-w-2xl text-xl opacity-90">
				A comprehensive showcase of our composable and accessible component system built with
				DaisyUI and Swiss design principles.
			</p>
		</div>
	</Section>

	<!-- Typography Demo -->
	<Section spacing="lg">
		<h2 class="mb-8 text-center text-3xl font-bold">Typography with Liter Font</h2>
		<div class="bg-base-200 rounded-2xl p-8">
			<div class="space-y-6">
				<div>
					<h1 class="font-liter mb-2 text-4xl font-bold">Heading 1 - Liter Font</h1>
					<p class="text-base-content/70 text-sm">font-liter class applied</p>
				</div>
				<div>
					<h2 class="mb-2 text-3xl font-semibold">Heading 2 - Default Font</h2>
					<p class="text-base-content/70 text-sm">Default font family (Liter is now the base)</p>
				</div>
				<div>
					<h3 class="liter-regular mb-2 text-2xl font-medium">Heading 3 - Custom Class</h3>
					<p class="text-base-content/70 text-sm">liter-regular class applied</p>
				</div>
				<div>
					<p class="text-lg leading-relaxed">
						This is a sample paragraph demonstrating the Liter font family. The font provides
						excellent readability and a modern, clean appearance that works well for both headings
						and body text. It's now configured as the default font throughout the application.
					</p>
				</div>
				<div class="flex gap-4">
					<span class="badge badge-primary font-liter">Primary Badge</span>
					<span class="badge badge-secondary">Secondary Badge</span>
					<span class="badge badge-accent liter-regular">Accent Badge</span>
				</div>
			</div>
		</div>
	</Section>

	<!-- Components Overview -->
	<Section spacing="lg">
		<h2 class="mb-8 text-center text-3xl font-bold">Component Categories</h2>
		<Accordion items={accordionItems} variant="bordered" />
	</Section>

	<!-- Layout Demo -->
	<Section spacing="lg">
		<h2 class="mb-8 text-3xl font-bold">Layout System</h2>

		<!-- Basic Grid Examples -->
		<div class="mb-12">
			<h3 class="mb-6 text-2xl font-semibold">Basic Grid Patterns</h3>

			<!-- 3 Column Grid -->
			<div class="mb-8">
				<h4 class="mb-4 text-lg font-medium">3-Column Responsive Grid</h4>
				<Grid columns={{ sm: 1, md: 2, lg: 3 }} gap="md">
					<GridItem>
						<div class="card bg-primary text-primary-content shadow-xl">
							<div class="card-body">
								<h3 class="card-title">Primary Card</h3>
								<p>This card uses the primary theme color with proper contrast.</p>
								<div class="card-actions justify-end">
									<button class="btn btn-ghost">Action</button>
								</div>
							</div>
						</div>
					</GridItem>
					<GridItem>
						<div class="card bg-secondary text-secondary-content shadow-xl">
							<div class="card-body">
								<h3 class="card-title">Secondary Card</h3>
								<p>Secondary theme color with complementary text styling.</p>
								<div class="card-actions justify-end">
									<button class="btn btn-ghost">Action</button>
								</div>
							</div>
						</div>
					</GridItem>
					<GridItem>
						<div class="card bg-accent text-accent-content shadow-xl">
							<div class="card-body">
								<h3 class="card-title">Accent Card</h3>
								<p>Accent color for highlighting important content areas.</p>
								<div class="card-actions justify-end">
									<button class="btn btn-ghost">Action</button>
								</div>
							</div>
						</div>
					</GridItem>
				</Grid>
			</div>

			<!-- Asymmetric Grid -->
			<div class="mb-8">
				<h4 class="mb-4 text-lg font-medium">Asymmetric Grid Layout</h4>
				<Grid columns={{ sm: 1, md: 3, lg: 4 }} gap="lg">
					<GridItem span={{ sm: 1, md: 2, lg: 2 }}>
						<div class="card bg-base-100 h-full shadow-xl">
							<div class="card-body">
								<h3 class="card-title text-2xl">Featured Content</h3>
								<p class="text-lg">
									This content spans 2 columns on medium screens and above, creating visual
									hierarchy and emphasis.
								</p>
								<div class="stats shadow">
									<div class="stat">
										<div class="stat-title">Downloads</div>
										<div class="stat-value text-primary">31K</div>
										<div class="stat-desc">Jan 1st - Feb 1st</div>
									</div>
									<div class="stat">
										<div class="stat-title">New Users</div>
										<div class="stat-value text-secondary">4,200</div>
										<div class="stat-desc">↗︎ 400 (22%)</div>
									</div>
								</div>
							</div>
						</div>
					</GridItem>
					<GridItem>
						<div class="card bg-base-100 h-full shadow-xl">
							<div class="card-body">
								<h3 class="card-title">Quick Stats</h3>
								<div class="space-y-4">
									<div class="flex items-center gap-3">
										<div class="bg-success h-3 w-3 rounded-full"></div>
										<span>Active Users</span>
									</div>
									<div class="flex items-center gap-3">
										<div class="bg-warning h-3 w-3 rounded-full"></div>
										<span>Pending Tasks</span>
									</div>
									<div class="flex items-center gap-3">
										<div class="bg-error h-3 w-3 rounded-full"></div>
										<span>Issues</span>
									</div>
								</div>
							</div>
						</div>
					</GridItem>
					<GridItem>
						<div class="card bg-base-100 h-full shadow-xl">
							<div class="card-body">
								<h3 class="card-title">Actions</h3>
								<div class="space-y-2">
									<button class="btn btn-primary btn-sm w-full">Primary Action</button>
									<button class="btn btn-outline btn-sm w-full">Secondary</button>
									<button class="btn btn-ghost btn-sm w-full">Tertiary</button>
								</div>
							</div>
						</div>
					</GridItem>
				</Grid>
			</div>

			<!-- Complex Grid with Nested Content -->
			<div class="mb-8">
				<h4 class="mb-4 text-lg font-medium">Complex Grid with Nested Layouts</h4>
				<Grid columns={{ sm: 1, md: 2, lg: 3 }} gap="lg">
					<GridItem>
						<div class="card bg-base-100 shadow-xl">
							<figure class="px-10 pt-10">
								<div
									class="from-primary to-secondary flex h-48 w-full items-center justify-center rounded-lg bg-gradient-to-br"
								>
									<span class="text-4xl">📊</span>
								</div>
							</figure>
							<div class="card-body">
								<h3 class="card-title">Analytics Dashboard</h3>
								<p>Comprehensive data visualization and reporting tools.</p>
								<div class="card-actions justify-end">
									<button class="btn btn-primary">View Dashboard</button>
								</div>
							</div>
						</div>
					</GridItem>
					<GridItem>
						<div class="card bg-base-100 shadow-xl">
							<figure class="px-10 pt-10">
								<div
									class="from-accent to-info flex h-48 w-full items-center justify-center rounded-lg bg-gradient-to-br"
								>
									<span class="text-4xl">👥</span>
								</div>
							</figure>
							<div class="card-body">
								<h3 class="card-title">User Management</h3>
								<p>Manage users, roles, and permissions efficiently.</p>
								<div class="card-actions justify-end">
									<button class="btn btn-primary">Manage Users</button>
								</div>
							</div>
						</div>
					</GridItem>
					<GridItem>
						<div class="card bg-base-100 shadow-xl">
							<figure class="px-10 pt-10">
								<div
									class="from-warning to-error flex h-48 w-full items-center justify-center rounded-lg bg-gradient-to-br"
								>
									<span class="text-4xl">⚙️</span>
								</div>
							</figure>
							<div class="card-body">
								<h3 class="card-title">Settings</h3>
								<p>Configure system settings and preferences.</p>
								<div class="card-actions justify-end">
									<button class="btn btn-primary">Open Settings</button>
								</div>
							</div>
						</div>
					</GridItem>
				</Grid>
			</div>
		</div>

		<!-- Flex Layout Examples -->
		<div class="mb-12">
			<h3 class="mb-6 text-2xl font-semibold">Flex Layout Patterns</h3>

			<!-- Horizontal Flex -->
			<div class="mb-8">
				<h4 class="mb-4 text-lg font-medium">Horizontal Flex Layouts</h4>
				<div class="space-y-6">
					<!-- Justify Between -->
					<div>
						<p class="text-base-content/70 mb-2 text-sm">Justify Between</p>
						<Flex justify="between" align="center" className="p-4 bg-base-200 rounded-lg">
							<div class="flex items-center gap-3">
								<div class="avatar">
									<div class="w-10 rounded-full">
										<img src="https://picsum.photos/40/40?random=1" alt="Avatar" />
									</div>
								</div>
								<div>
									<div class="font-semibold">John Doe</div>
									<div class="text-sm opacity-70">Software Engineer</div>
								</div>
							</div>
							<div class="flex gap-2">
								<button class="btn btn-sm btn-outline">Message</button>
								<button class="btn btn-sm btn-primary">Follow</button>
							</div>
						</Flex>
					</div>

					<!-- Justify Around -->
					<div>
						<p class="text-base-content/70 mb-2 text-sm">Justify Around</p>
						<Flex justify="around" align="center" className="p-4 bg-base-200 rounded-lg">
							<div class="text-center">
								<div class="text-primary text-2xl font-bold">1.2K</div>
								<div class="text-sm">Followers</div>
							</div>
							<div class="text-center">
								<div class="text-secondary text-2xl font-bold">340</div>
								<div class="text-sm">Following</div>
							</div>
							<div class="text-center">
								<div class="text-accent text-2xl font-bold">89</div>
								<div class="text-sm">Posts</div>
							</div>
						</Flex>
					</div>

					<!-- Justify Evenly -->
					<div>
						<p class="text-base-content/70 mb-2 text-sm">Justify Evenly</p>
						<Flex justify="evenly" align="center" className="p-4 bg-base-200 rounded-lg">
							<div class="flex items-center gap-2">
								<input type="checkbox" class="checkbox checkbox-primary" checked />
								<span>Email notifications</span>
							</div>
							<div class="flex items-center gap-2">
								<input type="checkbox" class="checkbox checkbox-secondary" />
								<span>SMS alerts</span>
							</div>
							<div class="flex items-center gap-2">
								<input type="checkbox" class="checkbox checkbox-accent" checked />
								<span>Push notifications</span>
							</div>
						</Flex>
					</div>
				</div>
			</div>

			<!-- Vertical Flex -->
			<div class="mb-8">
				<h4 class="mb-4 text-lg font-medium">Vertical Flex Layouts</h4>
				<Grid columns={{ sm: 1, md: 2, lg: 3 }} gap="lg">
					<GridItem>
						<Flex
							direction="col"
							align="center"
							className="p-6 bg-base-100 shadow-xl rounded-lg h-full"
						>
							<div class="mb-4 text-4xl">🎯</div>
							<h3 class="mb-2 text-xl font-bold">Goal Setting</h3>
							<p class="text-base-content/70 mb-4 text-center">
								Set and track your personal and professional goals with our intuitive interface.
							</p>
							<button class="btn btn-primary mt-auto">Get Started</button>
						</Flex>
					</GridItem>
					<GridItem>
						<Flex
							direction="col"
							align="center"
							className="p-6 bg-base-100 shadow-xl rounded-lg h-full"
						>
							<div class="mb-4 text-4xl">📈</div>
							<h3 class="mb-2 text-xl font-bold">Progress Tracking</h3>
							<p class="text-base-content/70 mb-4 text-center">
								Monitor your progress with detailed analytics and visual representations.
							</p>
							<button class="btn btn-secondary mt-auto">View Progress</button>
						</Flex>
					</GridItem>
					<GridItem>
						<Flex
							direction="col"
							align="center"
							className="p-6 bg-base-100 shadow-xl rounded-lg h-full"
						>
							<div class="mb-4 text-4xl">🏆</div>
							<h3 class="mb-2 text-xl font-bold">Achievements</h3>
							<p class="text-base-content/70 mb-4 text-center">
								Celebrate your milestones and unlock new achievements as you progress.
							</p>
							<button class="btn btn-accent mt-auto">View Achievements</button>
						</Flex>
					</GridItem>
				</Grid>
			</div>
		</div>

		<!-- Container Size Examples -->
		<div class="mb-12">
			<h3 class="mb-6 text-2xl font-semibold">Container Size Variations</h3>
			<div class="space-y-8">
				<div>
					<h4 class="mb-4 text-lg font-medium">Small Container (max-w-sm)</h4>
					<Container size="sm" className="bg-primary/10 p-4 rounded-lg">
						<p class="text-center">
							This is a small container, perfect for forms, alerts, or compact content blocks.
						</p>
					</Container>
				</div>

				<div>
					<h4 class="mb-4 text-lg font-medium">Medium Container (max-w-2xl)</h4>
					<Container size="md" className="bg-secondary/10 p-4 rounded-lg">
						<p class="text-center">
							Medium containers work well for articles, blog posts, and moderate content sections.
						</p>
					</Container>
				</div>

				<div>
					<h4 class="mb-4 text-lg font-medium">Large Container (max-w-4xl)</h4>
					<Container size="lg" className="bg-accent/10 p-4 rounded-lg">
						<p class="text-center">
							Large containers are ideal for dashboards, galleries, and content that needs more
							breathing room.
						</p>
					</Container>
				</div>

				<div>
					<h4 class="mb-4 text-lg font-medium">Extra Large Container (max-w-6xl)</h4>
					<Container size="xl" className="bg-info/10 p-4 rounded-lg">
						<p class="text-center">
							Extra large containers provide maximum space for complex layouts and wide content
							areas.
						</p>
					</Container>
				</div>
			</div>
		</div>

		<!-- Section Background Examples -->
		<div class="mb-12">
			<h3 class="mb-6 text-2xl font-semibold">Section Background Variations</h3>
			<div class="space-y-8">
				<Section spacing="md" background="primary" className="rounded-lg">
					<h4 class="mb-4 text-xl font-semibold">Primary Background Section</h4>
					<p>
						This section uses the primary theme color as background with appropriate text contrast.
					</p>
				</Section>

				<Section spacing="md" background="secondary" className="rounded-lg">
					<h4 class="mb-4 text-xl font-semibold">Secondary Background Section</h4>
					<p>Secondary background provides visual variety while maintaining readability.</p>
				</Section>

				<Section spacing="md" background="accent" className="rounded-lg">
					<h4 class="mb-4 text-xl font-semibold">Accent Background Section</h4>
					<p>
						Accent colors are perfect for highlighting important content or call-to-action areas.
					</p>
				</Section>

				<Section spacing="md" background="base" className="rounded-lg border border-base-300">
					<h4 class="mb-4 text-xl font-semibold">Base Background Section</h4>
					<p>Base background with subtle border creates clean, minimal sections.</p>
				</Section>
			</div>
		</div>

		<!-- Advanced Layout Patterns -->
		<div class="mb-12">
			<h3 class="mb-6 text-2xl font-semibold">Advanced Layout Patterns</h3>

			<!-- Dashboard Layout -->
			<div class="mb-8">
				<h4 class="mb-4 text-lg font-medium">Dashboard Layout</h4>
				<Grid columns={{ sm: 1, md: 4, lg: 6 }} gap="xl">
					<!-- Sidebar -->
					<GridItem span={{ sm: 1, md: 1, lg: 1 }}>
						<div class="bg-base-200 h-full rounded-xl p-6 shadow-sm">
							<h5 class="mb-6 text-lg font-bold text-[#1D3557]">Navigation</h5>
							<div class="space-y-3">
								<div
									class="flex cursor-pointer items-center gap-3 rounded-lg bg-[#1D3557] p-3 text-white shadow-md transition-transform hover:scale-105"
								>
									<span>📊</span>
									<span class="text-sm font-medium">Dashboard</span>
								</div>
								<div
									class="hover:bg-base-300 flex cursor-pointer items-center gap-3 rounded-lg p-3 text-[#457B9D] transition-colors"
								>
									<span>👥</span>
									<span class="text-sm font-medium">Users</span>
								</div>
								<div
									class="hover:bg-base-300 flex cursor-pointer items-center gap-3 rounded-lg p-3 text-[#457B9D] transition-colors"
								>
									<span>📈</span>
									<span class="text-sm font-medium">Analytics</span>
								</div>
								<div
									class="hover:bg-base-300 flex cursor-pointer items-center gap-3 rounded-lg p-3 text-[#457B9D] transition-colors"
								>
									<span>⚙️</span>
									<span class="text-sm font-medium">Settings</span>
								</div>
							</div>
						</div>
					</GridItem>

					<!-- Main Content Area -->
					<GridItem span={{ sm: 1, md: 3, lg: 5 }}>
						<div class="space-y-6">
							<!-- Header -->
							<div
								class="border-base-200 flex items-center justify-between rounded-xl border bg-white p-6 shadow-sm"
							>
								<h3 class="text-2xl font-bold text-[#1D3557]">Dashboard Overview</h3>
								<div class="flex gap-3">
									<button
										class="btn btn-sm btn-outline border-[#457B9D] text-[#457B9D] hover:bg-[#457B9D] hover:text-white"
										>Export</button
									>
									<button
										class="btn btn-sm border-[#E63946] bg-[#E63946] text-white hover:bg-[#E63946]/90"
										>Add New</button
									>
								</div>
							</div>

							<!-- Stats Grid -->
							<Grid columns={{ sm: 2, md: 4, lg: 4 }} gap="lg">
								<GridItem>
									<div class="stat bg-base-100 rounded-lg shadow">
										<div class="stat-figure text-primary">
											<span class="text-2xl">📊</span>
										</div>
										<div class="stat-title">Total Sales</div>
										<div class="stat-value text-primary">$89,400</div>
										<div class="stat-desc">21% more than last month</div>
									</div>
								</GridItem>
								<GridItem>
									<div class="stat bg-base-100 rounded-lg shadow">
										<div class="stat-figure text-secondary">
											<span class="text-2xl">👥</span>
										</div>
										<div class="stat-title">Users</div>
										<div class="stat-value text-secondary">2.6K</div>
										<div class="stat-desc">400 new users this month</div>
									</div>
								</GridItem>
								<GridItem>
									<div class="stat bg-base-100 rounded-lg shadow">
										<div class="stat-figure text-accent">
											<span class="text-2xl">📈</span>
										</div>
										<div class="stat-title">Growth</div>
										<div class="stat-value text-accent">+12%</div>
										<div class="stat-desc">Compared to last quarter</div>
									</div>
								</GridItem>
								<GridItem>
									<div class="stat bg-base-100 rounded-lg shadow">
										<div class="stat-figure text-info">
											<span class="text-2xl">🎯</span>
										</div>
										<div class="stat-title">Conversion</div>
										<div class="stat-value text-info">3.2%</div>
										<div class="stat-desc">Visitor to customer rate</div>
									</div>
								</GridItem>
							</Grid>

							<!-- Content Area -->
							<div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
								<div class="bg-base-100 rounded-lg p-4 shadow">
									<h4 class="mb-3 font-semibold">Recent Activity</h4>
									<div class="space-y-3">
										<div class="flex items-center gap-3">
											<div
												class="bg-primary text-primary-content flex h-8 w-8 items-center justify-center rounded-full text-sm"
											>
												JD
											</div>
											<div class="flex-1">
												<div class="text-sm font-medium">John Doe completed a purchase</div>
												<div class="text-base-content/70 text-xs">2 minutes ago</div>
											</div>
										</div>
										<div class="flex items-center gap-3">
											<div
												class="bg-secondary text-secondary-content flex h-8 w-8 items-center justify-center rounded-full text-sm"
											>
												AS
											</div>
											<div class="flex-1">
												<div class="text-sm font-medium">Alice Smith updated profile</div>
												<div class="text-base-content/70 text-xs">5 minutes ago</div>
											</div>
										</div>
										<div class="flex items-center gap-3">
											<div
												class="bg-accent text-accent-content flex h-8 w-8 items-center justify-center rounded-full text-sm"
											>
												BJ
											</div>
											<div class="flex-1">
												<div class="text-sm font-medium">Bob Johnson signed up</div>
												<div class="text-base-content/70 text-xs">10 minutes ago</div>
											</div>
										</div>
									</div>
								</div>

								<div class="bg-base-100 rounded-lg p-4 shadow">
									<h4 class="mb-3 font-semibold">Quick Actions</h4>
									<div class="space-y-2">
										<button class="btn btn-primary btn-sm w-full justify-start">
											<span>📊</span>
											View Analytics
										</button>
										<button class="btn btn-outline btn-sm w-full justify-start">
											<span>👥</span>
											Manage Users
										</button>
										<button class="btn btn-outline btn-sm w-full justify-start">
											<span>📧</span>
											Send Newsletter
										</button>
										<button class="btn btn-outline btn-sm w-full justify-start">
											<span>⚙️</span>
											System Settings
										</button>
									</div>
								</div>
							</div>
						</div>
					</GridItem>
				</Grid>
			</div>

			<!-- Card Grid with Different Sizes -->
			<div class="mb-8">
				<h4 class="mb-4 text-lg font-medium">Masonry-Style Card Grid</h4>
				<Grid columns={{ sm: 1, md: 2, lg: 3 }} gap="lg">
					<GridItem>
						<div class="card bg-base-100 shadow-xl">
							<div class="card-body">
								<h3 class="card-title">Short Card</h3>
								<p>This is a shorter card with minimal content.</p>
								<div class="card-actions justify-end">
									<button class="btn btn-primary btn-sm">Action</button>
								</div>
							</div>
						</div>
					</GridItem>
					<GridItem>
						<div class="card bg-base-100 shadow-xl">
							<div class="card-body">
								<h3 class="card-title">Medium Card</h3>
								<p>
									This card has a moderate amount of content to demonstrate how the grid handles
									different card heights.
								</p>
								<div class="space-y-2">
									<div class="flex justify-between">
										<span>Feature 1</span>
										<span class="badge badge-success">Active</span>
									</div>
									<div class="flex justify-between">
										<span>Feature 2</span>
										<span class="badge badge-warning">Pending</span>
									</div>
								</div>
								<div class="card-actions justify-end">
									<button class="btn btn-primary btn-sm">Action</button>
								</div>
							</div>
						</div>
					</GridItem>
					<GridItem>
						<div class="card bg-base-100 shadow-xl">
							<div class="card-body">
								<h3 class="card-title">Long Card</h3>
								<p>
									This is a longer card with more content to show how the grid system handles
									varying content lengths. It includes multiple paragraphs and elements to
									demonstrate the flexibility of our layout system.
								</p>
								<div class="divider"></div>
								<div class="space-y-3">
									<div class="flex items-center gap-3">
										<input type="checkbox" class="checkbox checkbox-primary" checked />
										<span>Task 1: Complete project setup</span>
									</div>
									<div class="flex items-center gap-3">
										<input type="checkbox" class="checkbox checkbox-primary" checked />
										<span>Task 2: Implement user authentication</span>
									</div>
									<div class="flex items-center gap-3">
										<input type="checkbox" class="checkbox" />
										<span>Task 3: Add payment processing</span>
									</div>
									<div class="flex items-center gap-3">
										<input type="checkbox" class="checkbox" />
										<span>Task 4: Deploy to production</span>
									</div>
								</div>
								<div class="card-actions justify-end">
									<button class="btn btn-primary btn-sm">View All</button>
								</div>
							</div>
						</div>
					</GridItem>
				</Grid>
			</div>

			<!-- Responsive Image Grid -->
			<div class="mb-8">
				<h4 class="mb-4 text-lg font-medium">Responsive Image Grid</h4>
				<Grid columns={{ sm: 1, md: 2, lg: 4 }} gap="md">
					<GridItem>
						<div class="card bg-base-100 shadow-xl">
							<figure>
								<img
									src="https://picsum.photos/300/200?random=1"
									alt="Sample"
									class="h-48 w-full object-cover"
								/>
							</figure>
							<div class="card-body">
								<h3 class="card-title text-sm">Image 1</h3>
								<p class="text-xs">Beautiful landscape photography</p>
							</div>
						</div>
					</GridItem>
					<GridItem>
						<div class="card bg-base-100 shadow-xl">
							<figure>
								<img
									src="https://picsum.photos/300/200?random=2"
									alt="Sample"
									class="h-48 w-full object-cover"
								/>
							</figure>
							<div class="card-body">
								<h3 class="card-title text-sm">Image 2</h3>
								<p class="text-xs">Urban architecture and design</p>
							</div>
						</div>
					</GridItem>
					<GridItem>
						<div class="card bg-base-100 shadow-xl">
							<figure>
								<img
									src="https://picsum.photos/300/200?random=3"
									alt="Sample"
									class="h-48 w-full object-cover"
								/>
							</figure>
							<div class="card-body">
								<h3 class="card-title text-sm">Image 3</h3>
								<p class="text-xs">Nature and wildlife photography</p>
							</div>
						</div>
					</GridItem>
					<GridItem>
						<div class="card bg-base-100 shadow-xl">
							<figure>
								<img
									src="https://picsum.photos/300/200?random=4"
									alt="Sample"
									class="h-48 w-full object-cover"
								/>
							</figure>
							<div class="card-body">
								<h3 class="card-title text-sm">Image 4</h3>
								<p class="text-xs">Abstract and artistic compositions</p>
							</div>
						</div>
					</GridItem>
				</Grid>
			</div>
		</div>
	</Section>

	<!-- Carousel Demo -->
	<Section spacing="lg">
		<h2 class="mb-8 text-3xl font-bold">Carousel Component</h2>
		<div class="mx-auto max-w-4xl">
			<Carousel
				items={carouselItems}
				autoplay={true}
				interval={4000}
				showDots={true}
				showArrows={true}
			/>
		</div>
	</Section>

	<!-- Forms Demo -->
	<Section spacing="lg">
		<div class="grid grid-cols-1 gap-12 lg:grid-cols-2">
			<!-- Basic Form -->
			<div>
				<h2 class="mb-8 text-3xl font-bold">Basic Form</h2>
				<div class="card bg-base-100 shadow-xl">
					<div class="card-body">
						<BaseForm
							fields={formFields}
							onSubmit={handleFormSubmit}
							submitButtonText="Send Message"
						/>
					</div>
				</div>
			</div>

			<!-- Multi-Step Form -->
			<div>
				<h2 class="mb-8 text-3xl font-bold">Multi-Step Form</h2>
				<div class="card bg-base-100 shadow-xl">
					<div class="card-body">
						<MultiStepForm config={multiStepConfig} />
					</div>
				</div>
			</div>
		</div>
	</Section>

	<!-- Image Gallery Demo -->
	<Section spacing="lg">
		<h2 class="mb-8 text-3xl font-bold">Image Gallery</h2>
		<p class="text-base-content/70 mb-8 text-center">
			Performance optimized images with lazy loading and lightbox functionality
		</p>
		<ImageGallery
			images={galleryImages}
			columns={{ sm: 1, md: 2, lg: 3 }}
			showLightbox={false}
			aspectRatio="video"
		/>
	</Section>

	<!-- Footer -->
	<Section spacing="lg" background="base" className="mt-16">
		<div class="text-center">
			<h3 class="mb-4 text-2xl font-bold">Ready to Use</h3>
			<p class="text-base-content/70 mb-6">
				All components are fully typed, accessible, and ready for production use.
			</p>
			<div class="flex flex-wrap justify-center gap-4">
				<div class="badge badge-primary badge-lg">TypeScript</div>
				<div class="badge badge-secondary badge-lg">Accessible</div>
				<div class="badge badge-accent badge-lg">Responsive</div>
				<div class="badge badge-neutral badge-lg">DaisyUI</div>
			</div>
		</div>
	</Section>
</Container>
