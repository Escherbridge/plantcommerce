// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			user: import('$lib/server/auth').SessionValidationResult['user'];
			session: import('$lib/server/auth').SessionValidationResult['session'];
			guestCartSessionId: string | null;
		}
		// Add env variable types
		interface PublicEnv {
			PUBLIC_BASE_URL: string;
		}
	}
	// interface Error {}
	// interface Locals {}
	// interface PageData {}
	// interface PageState {}
	// interface Platform {}
}

declare module '*.sql?raw' {
	const content: string;
	export default content;
}

declare module '*.md?raw' {
	const content: string;
	export default content;
}

export {};
