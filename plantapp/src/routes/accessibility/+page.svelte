<script lang="ts">
	import { Container, Section } from '$lib/components/layout';
</script>

<Section>
	<Container>
		<div class="prose max-w-4xl mx-auto">
			<h1>Accessibility Statement</h1>
			<p class="text-base-content/70">Last Updated: {new Date().toLocaleDateString()}</p>

			<h2>Our Commitment to Accessibility</h2>
			<p>
				Aevani is committed to ensuring digital accessibility for people with disabilities.
				We are continually improving the user experience for everyone and applying the relevant
				accessibility standards.
			</p>

			<h2>Conformance Status</h2>
			<p>
				We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards.
				These guidelines explain how to make web content more accessible for people with disabilities
				and user-friendly for everyone.
			</p>

			<h2>Accessibility Features</h2>
			<h3>Navigation and Interaction</h3>
			<ul>
				<li><strong>Keyboard Navigation:</strong> Full keyboard accessibility throughout the site</li>
				<li><strong>Skip Links:</strong> Ability to skip to main content and navigation</li>
				<li><strong>Focus Indicators:</strong> Clear visual indicators for keyboard navigation</li>
				<li><strong>Consistent Navigation:</strong> Predictable and consistent navigation patterns</li>
			</ul>

			<h3>Visual Design</h3>
			<ul>
				<li><strong>Color Contrast:</strong> WCAG AA compliant color contrast ratios</li>
				<li><strong>Scalable Text:</strong> Text can be resized up to 200% without loss of functionality</li>
				<li><strong>Responsive Design:</strong> Optimized for various screen sizes and devices</li>
				<li><strong>Dark Mode:</strong> Alternative color scheme for reduced eye strain</li>
			</ul>

			<h3>Content Structure</h3>
			<ul>
				<li><strong>Semantic HTML:</strong> Proper use of headings, lists, and landmarks</li>
				<li><strong>Alt Text:</strong> Descriptive alternative text for images</li>
				<li><strong>Clear Labels:</strong> Properly labeled form fields and buttons</li>
				<li><strong>Link Purpose:</strong> Descriptive link text that makes sense out of context</li>
			</ul>

			<h3>Screen Reader Support</h3>
			<ul>
				<li>ARIA labels and landmarks for improved navigation</li>
				<li>Screen reader-friendly table structures</li>
				<li>Meaningful page titles and headings</li>
				<li>Status messages and error notifications</li>
			</ul>

			<h2>Assistive Technology Compatibility</h2>
			<p>Our website is designed to be compatible with:</p>
			<ul>
				<li>Screen readers (JAWS, NVDA, VoiceOver)</li>
				<li>Screen magnification software</li>
				<li>Speech recognition software</li>
				<li>Alternative input devices</li>
			</ul>

			<h2>Accessibility Tools</h2>
			<div class="not-prose my-6 p-6 bg-base-200 rounded-lg">
				<h3 class="text-xl font-bold mb-4">Customize Your Experience</h3>
				<div class="space-y-4">
					<div class="form-control">
						<label class="label cursor-pointer justify-start gap-4">
							<input type="checkbox" class="toggle toggle-primary" />
							<div>
								<span class="label-text font-semibold block">High Contrast Mode</span>
								<span class="label-text-alt">Increase contrast for better visibility</span>
							</div>
						</label>
					</div>
					<div class="form-control">
						<label class="label cursor-pointer justify-start gap-4">
							<input type="checkbox" class="toggle toggle-primary" />
							<div>
								<span class="label-text font-semibold block">Large Text</span>
								<span class="label-text-alt">Increase default font size</span>
							</div>
						</label>
					</div>
					<div class="form-control">
						<label class="label cursor-pointer justify-start gap-4">
							<input type="checkbox" class="toggle toggle-primary" />
							<div>
								<span class="label-text font-semibold block">Reduce Motion</span>
								<span class="label-text-alt">Minimize animations and transitions</span>
							</div>
						</label>
					</div>
					<div class="form-control">
						<label class="label cursor-pointer justify-start gap-4">
							<input type="checkbox" class="toggle toggle-primary" />
							<div>
								<span class="label-text font-semibold block">Dyslexia-Friendly Font</span>
								<span class="label-text-alt">Use OpenDyslexic font</span>
							</div>
						</label>
					</div>
				</div>
			</div>

			<h2>Known Limitations</h2>
			<p>
				Despite our best efforts, some content may not yet be fully accessible. We are aware of the
				following limitations and are working to address them:
			</p>
			<ul>
				<li>Some third-party embedded content may not be fully accessible</li>
				<li>Older PDF documents may not meet current accessibility standards</li>
				<li>Some product images may lack detailed alternative text</li>
			</ul>

			<h2>Third-Party Content</h2>
			<p>
				Some content on our site is provided by third parties (e.g., payment processors, social
				media widgets). While we encourage our partners to maintain accessibility standards, we
				cannot guarantee the accessibility of third-party content.
			</p>

			<h2>Feedback and Contact</h2>
			<p>
				We welcome your feedback on the accessibility of Aevani. Please let us know if you
				encounter accessibility barriers:
			</p>

			<div class="not-prose my-6 card bg-base-100 shadow-xl">
				<div class="card-body">
					<h3 class="card-title">Report an Accessibility Issue</h3>
					<ul class="space-y-2">
						<li><strong>Email:</strong> accessibility@aevani.com</li>
						<li><strong>Phone:</strong> 1-800-ACCESS</li>
						<li><strong>Mail:</strong> Accessibility Coordinator, 123 Green Street, Portland, OR 97201</li>
					</ul>
					<p class="text-sm text-base-content/70 mt-4">
						We aim to respond to accessibility feedback within 3 business days and propose a
						solution within 10 business days.
					</p>
				</div>
			</div>

			<h2>Technical Specifications</h2>
			<p>Accessibility of Aevani relies on the following technologies:</p>
			<ul>
				<li>HTML5</li>
				<li>WAI-ARIA</li>
				<li>CSS3</li>
				<li>JavaScript</li>
			</ul>

			<h2>Assessment and Testing</h2>
			<p>We regularly assess our accessibility through:</p>
			<ul>
				<li>Automated testing tools (axe, WAVE, Lighthouse)</li>
				<li>Manual testing with keyboard navigation</li>
				<li>Screen reader testing (NVDA, JAWS, VoiceOver)</li>
				<li>User testing with people with disabilities</li>
				<li>Third-party accessibility audits</li>
			</ul>

			<h2>Continuous Improvement</h2>
			<p>
				Accessibility is an ongoing effort. We are committed to:
			</p>
			<ul>
				<li>Regular accessibility audits and updates</li>
				<li>Staff training on accessibility best practices</li>
				<li>Incorporating accessibility into our design and development process</li>
				<li>Monitoring and implementing new accessibility standards</li>
			</ul>

			<h2>Legal Compliance</h2>
			<p>
				Aevani strives to comply with:
			</p>
			<ul>
				<li>Americans with Disabilities Act (ADA)</li>
				<li>Section 508 of the Rehabilitation Act</li>
				<li>Web Content Accessibility Guidelines (WCAG) 2.1 Level AA</li>
			</ul>

			<div class="mt-8 p-6 bg-base-200 rounded-lg">
				<h3 class="text-xl font-bold mb-4">Resources</h3>
				<div class="flex flex-wrap gap-4">
					<a href="https://www.w3.org/WAI/" target="_blank" rel="noopener" class="link link-primary">
						W3C Web Accessibility Initiative
					</a>
					<a href="https://www.ada.gov/" target="_blank" rel="noopener" class="link link-primary">
						ADA Information
					</a>
					<a href="/contact" class="link link-primary">Contact Support</a>
				</div>
			</div>
		</div>
	</Container>
</Section>
