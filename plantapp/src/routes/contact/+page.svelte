<script lang="ts">
	import { Container, Section } from '$lib/components/layout';
	import { Grid } from '$lib/components/layout';
	import { BaseForm } from '$lib/components/forms';

	let formData = {
		name: '',
		email: '',
		subject: '',
		message: ''
	};

	const contactMethods = [
		{
			title: 'Email Support',
			icon: '📧',
			detail: 'support@aevani.com',
			description: 'Response within 24 hours'
		},
		{
			title: 'Phone Support',
			icon: '📞',
			detail: '1-800-PLANT-CO',
			description: 'Mon-Fri, 9AM-5PM EST'
		},
		{
			title: 'Live Chat',
			icon: '💬',
			detail: 'Start Chat',
			description: 'Available during business hours'
		}
	];
</script>

<Section>
	<Container>
		<div class="text-center mb-12">
			<h1 class="text-4xl font-bold mb-4">Contact Us</h1>
			<p class="text-lg text-base-content/70 max-w-2xl mx-auto">
				Have questions? We're here to help. Reach out through any of our contact methods below.
			</p>
		</div>

		<!-- Contact Methods -->
		<Grid columns={3} gap={6} class="mb-12">
			{#each contactMethods as method}
				<div class="card bg-base-100 shadow-xl">
					<div class="card-body items-center text-center">
						<span class="text-5xl mb-4">{method.icon}</span>
						<h3 class="card-title">{method.title}</h3>
						<p class="text-xl font-semibold text-primary">{method.detail}</p>
						<p class="text-sm text-base-content/70">{method.description}</p>
					</div>
				</div>
			{/each}
		</Grid>

		<div class="grid md:grid-cols-2 gap-12">
			<!-- Contact Form -->
			<div>
				<h2 class="text-2xl font-bold mb-6">Send us a Message</h2>
				<form class="space-y-4">
					<div class="form-control">
						<label class="label" for="name">
							<span class="label-text">Name</span>
						</label>
						<input
							id="name"
							type="text"
							placeholder="Your name"
							class="input input-bordered"
							bind:value={formData.name}
							required
						/>
					</div>

					<div class="form-control">
						<label class="label" for="email">
							<span class="label-text">Email</span>
						</label>
						<input
							id="email"
							type="email"
							placeholder="your@email.com"
							class="input input-bordered"
							bind:value={formData.email}
							required
						/>
					</div>

					<div class="form-control">
						<label class="label" for="subject">
							<span class="label-text">Subject</span>
						</label>
						<select id="subject" class="select select-bordered" bind:value={formData.subject}>
							<option value="">Choose a subject...</option>
							<option value="general">General Inquiry</option>
							<option value="product">Product Question</option>
							<option value="order">Order Support</option>
							<option value="technical">Technical Issue</option>
							<option value="partnership">Partnership Opportunity</option>
						</select>
					</div>

					<div class="form-control">
						<label class="label" for="message">
							<span class="label-text">Message</span>
						</label>
						<textarea
							id="message"
							class="textarea textarea-bordered h-32"
							placeholder="How can we help you?"
							bind:value={formData.message}
							required
						></textarea>
					</div>

					<button type="submit" class="btn btn-primary w-full">Send Message</button>
				</form>
			</div>

			<!-- Office Information -->
			<div>
				<h2 class="text-2xl font-bold mb-6">Our Offices</h2>
				<div class="space-y-6">
					<div class="card bg-base-100 shadow-lg">
						<div class="card-body">
							<h3 class="card-title">Headquarters</h3>
							<p class="text-base-content/70">
								123 Green Street<br />
								Portland, OR 97201<br />
								United States
							</p>
						</div>
					</div>

					<div class="card bg-base-100 shadow-lg">
						<div class="card-body">
							<h3 class="card-title">Distribution Center</h3>
							<p class="text-base-content/70">
								456 Agriculture Way<br />
								Sacramento, CA 95814<br />
								United States
							</p>
						</div>
					</div>

					<div class="card bg-base-100 shadow-lg">
						<div class="card-body">
							<h3 class="card-title">Business Hours</h3>
							<p class="text-base-content/70">
								Monday - Friday: 9:00 AM - 6:00 PM EST<br />
								Saturday: 10:00 AM - 4:00 PM EST<br />
								Sunday: Closed
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- FAQ Link -->
		<div class="mt-12 p-8 bg-base-200 rounded-lg text-center">
			<h3 class="text-xl font-bold mb-4">Looking for Quick Answers?</h3>
			<p class="text-base-content/70 mb-4">
				Check out our FAQ section for answers to common questions.
			</p>
			<a href="/faq" class="btn btn-outline">Visit FAQ</a>
		</div>
	</Container>
</Section>
