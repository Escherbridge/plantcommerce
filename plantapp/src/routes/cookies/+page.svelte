<script lang="ts">
	import { Container, Section } from '$lib/components/layout';
</script>

<Section>
	<Container>
		<div class="prose max-w-4xl mx-auto">
			<h1>Cookie Policy</h1>
			<p class="text-base-content/70">Last Updated: {new Date().toLocaleDateString()}</p>

			<h2>1. What Are Cookies?</h2>
			<p>
				Cookies are small text files that are placed on your device when you visit our website.
				They help us provide you with a better experience by remembering your preferences and
				understanding how you use our site.
			</p>

			<h2>2. Types of Cookies We Use</h2>

			<h3>Essential Cookies</h3>
			<p>
				These cookies are necessary for the website to function properly. They enable basic
				functions like page navigation, secure areas access, and shopping cart functionality.
			</p>
			<ul>
				<li><strong>Session cookies:</strong> Expire when you close your browser</li>
				<li><strong>Authentication cookies:</strong> Keep you logged in</li>
				<li><strong>Security cookies:</strong> Protect against fraudulent activities</li>
			</ul>

			<h3>Performance Cookies</h3>
			<p>
				These cookies collect information about how visitors use our website, such as which pages
				are visited most often and error messages received.
			</p>
			<ul>
				<li>Google Analytics</li>
				<li>Page load time tracking</li>
				<li>Error reporting</li>
			</ul>

			<h3>Functionality Cookies</h3>
			<p>
				These cookies allow the website to remember choices you make and provide enhanced features.
			</p>
			<ul>
				<li>Language preferences</li>
				<li>Theme selection (dark/light mode)</li>
				<li>Shopping preferences</li>
				<li>Recently viewed products</li>
			</ul>

			<h3>Targeting/Advertising Cookies</h3>
			<p>
				These cookies are used to deliver advertisements more relevant to you and your interests.
			</p>
			<ul>
				<li>Facebook Pixel</li>
				<li>Google Ads</li>
				<li>Retargeting campaigns</li>
			</ul>

			<h2>3. Third-Party Cookies</h2>
			<p>We use the following third-party services that may set cookies:</p>
			<ul>
				<li><strong>Google Analytics:</strong> Website analytics and reporting</li>
				<li><strong>Facebook:</strong> Social media integration and advertising</li>
				<li><strong>Stripe/PayPal:</strong> Payment processing</li>
				<li><strong>YouTube:</strong> Video content embedding</li>
			</ul>

			<h2>4. Cookie Duration</h2>
			<div class="overflow-x-auto my-6">
				<table class="table table-zebra">
					<thead>
						<tr>
							<th>Cookie Type</th>
							<th>Duration</th>
							<th>Purpose</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>Session</td>
							<td>Until browser closes</td>
							<td>Shopping cart, authentication</td>
						</tr>
						<tr>
							<td>Authentication</td>
							<td>30 days</td>
							<td>Keep you logged in</td>
						</tr>
						<tr>
							<td>Preferences</td>
							<td>1 year</td>
							<td>Remember your settings</td>
						</tr>
						<tr>
							<td>Analytics</td>
							<td>2 years</td>
							<td>Track site usage</td>
						</tr>
						<tr>
							<td>Affiliate</td>
							<td>30 days</td>
							<td>Track referrals</td>
						</tr>
					</tbody>
				</table>
			</div>

			<h2>5. Managing Cookies</h2>
			<h3>Browser Settings</h3>
			<p>You can control and/or delete cookies as you wish. You can:</p>
			<ul>
				<li>Delete all cookies from your computer</li>
				<li>Block all cookies from being set</li>
				<li>Allow only specific cookies</li>
				<li>Be notified when cookies are being sent</li>
			</ul>

			<h3>Browser-Specific Instructions</h3>
			<ul>
				<li><strong>Chrome:</strong> Settings → Privacy and Security → Cookies</li>
				<li><strong>Firefox:</strong> Options → Privacy & Security → Cookies</li>
				<li><strong>Safari:</strong> Preferences → Privacy → Cookies</li>
				<li><strong>Edge:</strong> Settings → Privacy → Cookies</li>
			</ul>

			<div class="alert alert-info my-6">
				<span>
					⚠️ Note: Blocking all cookies may impact your experience on our website. Some features
					may not work properly without cookies enabled.
				</span>
			</div>

			<h2>6. Your Cookie Preferences</h2>
			<div class="not-prose my-6 p-6 bg-base-200 rounded-lg">
				<h3 class="text-xl font-bold mb-4">Manage Your Cookie Settings</h3>
				<div class="space-y-4">
					<div class="form-control">
						<label class="label cursor-pointer justify-start gap-4">
							<input type="checkbox" checked disabled class="checkbox checkbox-primary" />
							<div>
								<span class="label-text font-semibold block">Essential Cookies</span>
								<span class="label-text-alt">Required for site functionality (cannot be disabled)</span>
							</div>
						</label>
					</div>
					<div class="form-control">
						<label class="label cursor-pointer justify-start gap-4">
							<input type="checkbox" checked class="checkbox checkbox-primary" />
							<div>
								<span class="label-text font-semibold block">Performance Cookies</span>
								<span class="label-text-alt">Help us understand how you use our site</span>
							</div>
						</label>
					</div>
					<div class="form-control">
						<label class="label cursor-pointer justify-start gap-4">
							<input type="checkbox" checked class="checkbox checkbox-primary" />
							<div>
								<span class="label-text font-semibold block">Functionality Cookies</span>
								<span class="label-text-alt">Remember your preferences</span>
							</div>
						</label>
					</div>
					<div class="form-control">
						<label class="label cursor-pointer justify-start gap-4">
							<input type="checkbox" class="checkbox checkbox-primary" />
							<div>
								<span class="label-text font-semibold block">Advertising Cookies</span>
								<span class="label-text-alt">Show you relevant ads</span>
							</div>
						</label>
					</div>
				</div>
				<button class="btn btn-primary mt-6">Save Preferences</button>
			</div>

			<h2>7. Updates to This Policy</h2>
			<p>
				We may update this Cookie Policy from time to time. We will notify you of any changes by
				posting the new policy on this page with an updated "Last Updated" date.
			</p>

			<h2>8. Contact Us</h2>
			<p>If you have questions about our use of cookies, please contact us:</p>
			<ul>
				<li>Email: privacy@aevani.com</li>
				<li>Phone: 1-800-PRIVACY</li>
			</ul>

			<div class="mt-8 p-6 bg-base-200 rounded-lg">
				<h3 class="text-xl font-bold mb-4">Related Policies</h3>
				<div class="flex flex-wrap gap-4">
					<a href="/privacy" class="link link-primary">Privacy Policy</a>
					<a href="/terms" class="link link-primary">Terms of Service</a>
					<a href="/contact" class="link link-primary">Contact Us</a>
				</div>
			</div>
		</div>
	</Container>
</Section>
