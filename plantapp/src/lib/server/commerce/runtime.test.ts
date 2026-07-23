import { describe, expect, it } from 'vitest';
import {
	CommerceConfigurationError,
	DEMO_COMMERCE_CONFIRMATION,
	resolveCommerceModeFrom
} from './runtime';

describe('commerce runtime mode', () => {
	it('defaults to the production-capable database provider', () => {
		expect(resolveCommerceModeFrom({}, new URL('https://aevani.example/products'))).toBe(
			'database'
		);
	});

	it('accepts demo only with explicit confirmation on loopback', () => {
		expect(
			resolveCommerceModeFrom(
				{
					AEVANI_COMMERCE_MODE: 'demo',
					AEVANI_DEMO_COMMERCE_CONFIRM: DEMO_COMMERCE_CONFIRMATION
				},
				new URL('http://127.0.0.1:5173/products'),
				'127.0.0.1'
			)
		).toBe('demo');
	});

	it.each([
		['no confirmation', { AEVANI_COMMERCE_MODE: 'demo' }, 'http://localhost:5173/products'],
		[
			'non-loopback request',
			{
				AEVANI_COMMERCE_MODE: 'demo',
				AEVANI_DEMO_COMMERCE_CONFIRM: DEMO_COMMERCE_CONFIRMATION
			},
			'https://preview.example/products'
		],
		[
			'Railway identity',
			{
				AEVANI_COMMERCE_MODE: 'demo',
				AEVANI_DEMO_COMMERCE_CONFIRM: DEMO_COMMERCE_CONFIRMATION,
				RAILWAY_PROJECT_ID: 'project'
			},
			'http://localhost:5173/products'
		],
		[
			'non-loopback client',
			{
				AEVANI_COMMERCE_MODE: 'demo',
				AEVANI_DEMO_COMMERCE_CONFIRM: DEMO_COMMERCE_CONFIRMATION
			},
			'http://localhost:5173/products',
			'203.0.113.10'
		]
	])('rejects demo with %s', (_label, environment, url, clientAddress = '127.0.0.1') => {
		expect(() => resolveCommerceModeFrom(environment, new URL(url), clientAddress)).toThrow(
			CommerceConfigurationError
		);
	});
});
