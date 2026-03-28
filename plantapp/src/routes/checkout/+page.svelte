<script lang="ts">
	import { enhance } from '$app/forms';
	import { Container, Section } from '$lib/components/layout';
	import type { PageData, ActionData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	let sameAsShipping = true;

	$: subtotal = data.cart.totalAmount;
	$: shipping = 5.00; // Fixed shipping for now
	$: tax = subtotal * 0.08;
	$: total = subtotal + shipping + tax;
</script>

<Section>
	<Container>
		<h1 class="text-3xl font-display uppercase tracking-tight mb-8">Checkout</h1>

		<div class="grid lg:grid-cols-3 gap-8">
			<!-- Checkout Form -->
			<div class="lg:col-span-2">
				<form method="POST" use:enhance class="space-y-6">
					<!-- Contact Info -->
					<div class="card bg-base-100 shadow-md rounded-2xl border border-base-200/30">
						<div class="card-body">
							<h2 class="card-title font-display uppercase tracking-tight mb-4">Contact Information</h2>
							<div class="form-control w-full">
								<label class="label" for="email">
									<span class="label-text">Email Address</span>
								</label>
								<input
									type="email"
									name="email"
									id="email"
									value={form?.data?.email || data.user?.email || ''}
									class="input input-bordered w-full"
									class:input-error={form?.errors?.email}
								/>
								{#if form?.errors?.email}
									<label class="label">
										<span class="label-text-alt text-error">{form.errors.email[0]}</span>
									</label>
								{/if}
							</div>
						</div>
					</div>

					<!-- Shipping Address -->
					<div class="card bg-base-100 shadow-md rounded-2xl border border-base-200/30">
						<div class="card-body">
							<h2 class="card-title font-display uppercase tracking-tight mb-4">Shipping Address</h2>
							<div class="grid grid-cols-2 gap-x-4 gap-y-3">
								<div class="form-control">
									<label class="label" for="firstName">
										<span class="label-text">First Name</span>
									</label>
									<input
										type="text"
										name="firstName"
										id="firstName"
										value={form?.data?.firstName || data.user?.firstName || ''}
										class="input input-bordered"
										class:input-error={form?.errors?.firstName}
									/>
									{#if form?.errors?.firstName}
										<span class="text-xs text-error mt-1">{form.errors.firstName[0]}</span>
									{/if}
								</div>
								<div class="form-control">
									<label class="label" for="lastName">
										<span class="label-text">Last Name</span>
									</label>
									<input
										type="text"
										name="lastName"
										id="lastName"
										value={form?.data?.lastName || data.user?.lastName || ''}
										class="input input-bordered"
										class:input-error={form?.errors?.lastName}
									/>
									{#if form?.errors?.lastName}
										<span class="text-xs text-error mt-1">{form.errors.lastName[0]}</span>
									{/if}
								</div>
								<div class="form-control col-span-2">
									<label class="label" for="address1">
										<span class="label-text">Address</span>
									</label>
									<input
										type="text"
										name="address1"
										id="address1"
										value={form?.data?.address1 || ''}
										class="input input-bordered"
										class:input-error={form?.errors?.address1}
									/>
									{#if form?.errors?.address1}
										<span class="text-xs text-error mt-1">{form.errors.address1[0]}</span>
									{/if}
								</div>
								<div class="form-control col-span-2">
									<label class="label" for="address2">
										<span class="label-text">Apartment, suite, etc. (optional)</span>
									</label>
									<input
										type="text"
										name="address2"
										id="address2"
										value={form?.data?.address2 || ''}
										class="input input-bordered"
									/>
								</div>
								<div class="form-control">
									<label class="label" for="city">
										<span class="label-text">City</span>
									</label>
									<input
										type="text"
										name="city"
										id="city"
										value={form?.data?.city || ''}
										class="input input-bordered"
										class:input-error={form?.errors?.city}
									/>
									{#if form?.errors?.city}
										<span class="text-xs text-error mt-1">{form.errors.city[0]}</span>
									{/if}
								</div>
								<div class="form-control">
									<label class="label" for="state">
										<span class="label-text">State/Province</span>
									</label>
									<input
										type="text"
										name="state"
										id="state"
										value={form?.data?.state || ''}
										class="input input-bordered"
										class:input-error={form?.errors?.state}
									/>
									{#if form?.errors?.state}
										<span class="text-xs text-error mt-1">{form.errors.state[0]}</span>
									{/if}
								</div>
								<div class="form-control">
									<label class="label" for="postalCode">
										<span class="label-text">Postal Code</span>
									</label>
									<input
										type="text"
										name="postalCode"
										id="postalCode"
										value={form?.data?.postalCode || ''}
										class="input input-bordered"
										class:input-error={form?.errors?.postalCode}
									/>
									{#if form?.errors?.postalCode}
										<span class="text-xs text-error mt-1">{form.errors.postalCode[0]}</span>
									{/if}
								</div>
								<div class="form-control">
									<label class="label" for="country">
										<span class="label-text">Country</span>
									</label>
									<select
										name="country"
										id="country"
										class="select select-bordered"
										class:select-error={form?.errors?.country}
										value={form?.data?.country || 'US'}
									>
										<option value="US">United States</option>
										<option value="CA">Canada</option>
										<option value="UK">United Kingdom</option>
									</select>
								</div>
							</div>
						</div>
					</div>

					<!-- Billing Address -->
					<div class="card bg-base-100 shadow-md rounded-2xl border border-base-200/30">
						<div class="card-body">
							<h2 class="card-title font-display uppercase tracking-tight mb-4">Billing Address</h2>
							<div class="form-control">
								<label class="label cursor-pointer justify-start gap-4">
									<input
										type="checkbox"
										name="sameAsShipping"
										class="checkbox checkbox-primary"
										bind:checked={sameAsShipping}
										value="true"
									/>
									<span class="label-text">Same as shipping address</span>
								</label>
							</div>

							{#if !sameAsShipping}
								<div class="grid grid-cols-2 gap-x-4 gap-y-3 mt-4">
									<!-- Billing fields similar to shipping -->
									<div class="form-control">
										<label class="label" for="billingFirstName">First Name</label>
										<input type="text" name="billingFirstName" class="input input-bordered" />
									</div>
									<div class="form-control">
										<label class="label" for="billingLastName">Last Name</label>
										<input type="text" name="billingLastName" class="input input-bordered" />
									</div>
									<div class="form-control col-span-2">
										<label class="label" for="billingAddress1">Address</label>
										<input type="text" name="billingAddress1" class="input input-bordered" />
									</div>
									<div class="form-control col-span-2">
										<label class="label" for="billingAddress2">Address 2</label>
										<input type="text" name="billingAddress2" class="input input-bordered" />
									</div>
									<div class="form-control">
										<label class="label" for="billingCity">City</label>
										<input type="text" name="billingCity" class="input input-bordered" />
									</div>
									<div class="form-control">
										<label class="label" for="billingState">State</label>
										<input type="text" name="billingState" class="input input-bordered" />
									</div>
									<div class="form-control">
										<label class="label" for="billingPostalCode">Postal Code</label>
										<input type="text" name="billingPostalCode" class="input input-bordered" />
									</div>
									<div class="form-control">
										<label class="label" for="billingCountry">Country</label>
										<select name="billingCountry" class="select select-bordered">
											<option value="US">United States</option>
											<option value="CA">Canada</option>
											<option value="UK">United Kingdom</option>
										</select>
									</div>
								</div>
							{/if}
						</div>
					</div>

					<!-- Payment (Placeholder) -->
					<div class="card bg-base-100 shadow-md rounded-2xl border border-base-200/30">
						<div class="card-body">
							<h2 class="card-title font-display uppercase tracking-tight mb-4">Payment Method</h2>
							<div class="alert alert-info">
								<span>Payment integration is currently in sandbox mode. No actual charge will be made.</span>
							</div>
							<div class="form-control">
								<label class="label cursor-pointer justify-start gap-4">
									<input type="radio" name="payment" class="radio radio-primary" checked />
									<span class="label-text">Credit Card (Simulated)</span>
								</label>
							</div>
						</div>
					</div>

					<button type="submit" class="btn btn-primary btn-lg w-full font-display uppercase tracking-wider">
						Place Order
					</button>
				</form>
			</div>

			<!-- Order Summary -->
			<div class="lg:col-span-1">
				<div class="card bg-base-100 shadow-md rounded-2xl border border-base-200/30 sticky top-4">
					<div class="card-body">
						<h2 class="card-title mb-4">Order Summary</h2>
						
						<div class="space-y-4 mb-4 max-h-96 overflow-y-auto">
							{#each data.cart.items as item}
								<div class="flex gap-4">
									<div class="avatar">
										<div class="w-16 h-16 rounded">
											<img
												src={item.product?.images?.[0]?.url || '/placeholder-product.jpg'}
												alt={item.product?.name}
											/>
										</div>
									</div>
									<div class="flex-1">
										<p class="font-bold text-sm">{item.product?.name}</p>
										<p class="text-xs text-base-content/70">Qty: {item.quantity}</p>
									</div>
									<p class="font-semibold">${(parseFloat(item.unitPrice) * item.quantity).toFixed(2)}</p>
								</div>
							{/each}
						</div>

						<div class="divider"></div>

						<div class="space-y-2">
							<div class="flex justify-between">
								<span>Subtotal</span>
								<span>${subtotal.toFixed(2)}</span>
							</div>
							<div class="flex justify-between">
								<span>Shipping</span>
								<span>${shipping.toFixed(2)}</span>
							</div>
							<div class="flex justify-between">
								<span>Tax</span>
								<span>${tax.toFixed(2)}</span>
							</div>
							<div class="divider"></div>
							<div class="flex justify-between text-xl font-bold">
								<span>Total</span>
								<span>${total.toFixed(2)}</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</Container>
</Section>
