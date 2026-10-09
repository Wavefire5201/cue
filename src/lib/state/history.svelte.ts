import type { AfterNavigate } from '$app/navigation';

/**
 * How many in-app pages sit behind the current one in browser history, so the back arrow can
 * pop exactly one route. Fed by `afterNavigate` in the root layout.
 */
class AppHistory {
	#depth = $state(0);

	/** True when going back stays inside the app (not a fresh tab, reload or shared link). */
	get canGoBack() {
		return this.#depth > 0;
	}

	track(navigation: AfterNavigate) {
		const { from, to } = navigation;
		if (navigation.type === 'enter') {
			this.#depth = 0;
		} else if (navigation.type === 'popstate') {
			this.#depth = Math.max(0, this.#depth + navigation.delta);
		} else if (from && to && from.url.pathname !== to.url.pathname) {
			// A new page. Same-page URL changes (search typing, the Artists/Albums toggle) replace
			// the history entry, so they don't count.
			this.#depth += 1;
		}
	}
}

export const appHistory = new AppHistory();
