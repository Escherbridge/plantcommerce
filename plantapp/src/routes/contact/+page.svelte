<script lang="ts">
	import { Container, Section } from '$lib/components/layout';
	import { Grid } from '$lib/components/layout';
	import { BaseForm } from '$lib/components/forms';
	import { Select } from '$lib/components/ui';

	let formData = {
		name: '',
		email: '',
		subject: '',
		message: ''
	};

	const contactMethods = [
		{
			title: 'Email Support',
			icon: 'email',
			detail: 'support@aevani.com',
			description: 'Response within 24 hours'
		},
		{
			title: 'Phone Support',
			icon: 'phone',
			detail: '1-800-PLANT-CO',
			description: 'Mon-Fri, 9AM-5PM EST'
		},
		{
			title: 'Live Chat',
			icon: 'chat',
			detail: 'Start Chat',
			description: 'Available during business hours'
		}
	];
</script>

<Section>
	<Container>
		<div class="text-center mb-12">
			<h1 class="text-4xl font-display uppercase tracking-tight mb-4">Contact Us</h1>
			<p class="text-lg text-base-content/70 max-w-2xl mx-auto">
				Have questions? We're here to help. Reach out through any of our contact methods below.
			</p>
		</div>

		<!-- Contact Methods -->
		<Grid columns={3} gap={6} class="mb-12">
			{#each contactMethods as method}
				<div class="card bg-base-100 rounded-3xl border border-base-200/30 shadow-md">
					<div class="card-body items-center text-center">
						<div class="mb-4">
							{#if method.icon === 'email'}
								<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" fill="none" class="w-10 h-10 text-primary">
									<path d="M3 5h18v14H3V5zM3 5l9 7 9-7"/>
								</svg>
							{:else if method.icon === 'phone'}
								<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" fill="none" class="w-10 h-10 text-primary">
									<path d="M22 16.9v3a2 2 0 01-2.2 2A19.8 19.8 0 013 4.2 2 2 0 015 2h3a2 2 0 012 1.7c.1.9.4 1.7.7 2.5a2 2 0 01-.4 2.1L8.1 10.5a16 16 0 006.4 6.4l2.2-2.2a2 2 0 012.1-.4c.8.3 1.6.5 2.5.7a2 2 0 011.7 2z"/>
								</svg>
							{:else if method.icon === 'chat'}
								<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" fill="none" class="w-10 h-10 text-primary">
									<path d="M21 11.5a8.4 8.4 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.4 8.4 0 01-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.4 8.4 0 013.8-.9h.5a8.5 8.5 0 018 8v.5z"/>
								</svg>
							{/if}
						</div>
						<p class="font-mono text-xs uppercase tracking-widest text-secondary mb-1">Contact</p>
						<h3 class="card-title font-display uppercase tracking-tight">{method.title}</h3>
						<p class="text-xl font-semibold text-primary">{method.detail}</p>
						<p class="text-sm text-base-content/70">{method.description}</p>
					</div>
				</div>
			{/each}
		</Grid>

		<div class="grid md:grid-cols-2 gap-12">
			<!-- Contact Form -->
			<div>
				<h2 class="text-2xl font-display uppercase tracking-tight mb-6">Send us a Message</h2>
				<form class="contact-form">
					<div class="form-control">
						<label class="label" for="name">
							<span class="label-text">Name</span>
						</label>
						<input
							id="name"
							type="text"
							placeholder="Your name"
							class="input input-bordered w-full"
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
							class="input input-bordered w-full"
							bind:value={formData.email}
							required
						/>
					</div>

					<div class="form-control">
						<label class="label" for="subject">
							<span class="label-text">Subject</span>
						</label>
						<Select
							id="subject"
							name="subject"
							bind:value={formData.subject}
							placeholder="Choose a subject..."
							options={[
								{ value: 'general', label: 'General Inquiry' },
								{ value: 'product', label: 'Product Question' },
								{ value: 'order', label: 'Order Support' },
								{ value: 'technical', label: 'Technical Issue' },
								{ value: 'partnership', label: 'Partnership Opportunity' }
							]}
						/>
					</div>

					<div class="form-control">
						<label class="label" for="message">
							<span class="label-text">Message</span>
						</label>
						<textarea
							id="message"
							class="textarea textarea-bordered w-full"
							rows="5"
							placeholder="How can we help you?"
							bind:value={formData.message}
							required
						></textarea>
					</div>

					<button type="submit" class="btn btn-primary w-full font-display uppercase tracking-wider">Send Message</button>
				</form>
			</div>

			<!-- Office Information -->
			<div>
				<h2 class="text-2xl font-display uppercase tracking-tight mb-6">Our Offices</h2>
				<div class="space-y-6">
					<div class="card bg-base-100 rounded-3xl border border-base-200/30 shadow-md">
						<div class="card-body">
							<p class="font-mono text-xs uppercase tracking-widest text-secondary mb-1">Location</p>
							<h3 class="card-title font-display uppercase tracking-tight">Headquarters</h3>
							<p class="text-base-content/70">
								123 Green Street<br />
								Portland, OR 97201<br />
								United States
							</p>
						</div>
					</div>

					<div class="card bg-base-100 rounded-3xl border border-base-200/30 shadow-md">
						<div class="card-body">
							<p class="font-mono text-xs uppercase tracking-widest text-secondary mb-1">Location</p>
							<h3 class="card-title font-display uppercase tracking-tight">Distribution Center</h3>
							<p class="text-base-content/70">
								456 Agriculture Way<br />
								Sacramento, CA 95814<br />
								United States
							</p>
						</div>
					</div>

					<div class="card bg-base-100 rounded-3xl border border-base-200/30 shadow-md">
						<div class="card-body">
							<p class="font-mono text-xs uppercase tracking-widest text-secondary mb-1">Hours</p>
							<h3 class="card-title font-display uppercase tracking-tight">Business Hours</h3>
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
		<div class="mt-12 p-8 bg-base-200 rounded-3xl border border-base-200/30 shadow-md text-center">
			<h3 class="text-xl font-display uppercase tracking-tight mb-4">Looking for Quick Answers?</h3>
			<p class="text-base-content/70 mb-4">
				Check out our FAQ section for answers to common questions.
			</p>
			<a href="/faq" class="btn btn-outline font-display uppercase tracking-wider">Visit FAQ</a>
		</div>
	</Container>
</Section>

<style>
	.contact-form {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}
</style>
