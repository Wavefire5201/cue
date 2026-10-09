import { dev } from '$app/env';
import type { AfterNavigate } from '$app/navigation';
import { inject, pageview } from '@vercel/analytics';

// Vercel Web Analytics. The official `@vercel/analytics/sveltekit` wrapper imports
// `$app/stores`, which SvelteKit 3 removed, so this mirrors it with the framework-agnostic API.

export function injectAnalytics() {
	inject(
		{
			mode: dev ? 'development' : 'production',
			framework: 'sveltekit',
			// Page views are reported per route from `trackPageview`, not from history changes.
			disableAutoTrack: true,
			// Set by Vercel at build time (same values the official wrapper reads).
			basePath: import.meta.env.VITE_VERCEL_OBSERVABILITY_BASEPATH
		},
		import.meta.env.VITE_VERCEL_OBSERVABILITY_CLIENT_CONFIG
	);
}

/** One page view per page landed on; search typing only rewrites the query, so it's skipped. */
export function trackPageview({ type, from, to }: AfterNavigate) {
	if (!to?.route.id) return;
	if (type !== 'enter' && from?.url.pathname === to.url.pathname) return;
	pageview({ route: to.route.id, path: to.url.pathname });
}
