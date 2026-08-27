// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		interface Platform {
			env?: {
				CLOUDFLARE_IMAGES_API_TOKEN?: string;
				CLOUDFLARE_ACCOUNT_ID?: string;
				CLOUDFLARE_IMAGES_ACCOUNT_HASH?: string;
			};
		}
	}
}

export {};
