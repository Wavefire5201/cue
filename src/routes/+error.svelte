<script lang="ts">
	import { page } from '$app/state';
	import BackLink from '#lib/components/BackLink.svelte';
</script>

<svelte:head>
	<title>{page.error?.message ?? 'Something went wrong'}</title>
</svelte:head>

<BackLink />

<div class="error">
	<p class="label num">{page.status}</p>
	<h1>{page.error?.message ?? 'Something went wrong'}</h1>
	<p class="hint">
		{page.status === 404
			? 'Deezer doesn’t have this one. Try finding it from search.'
			: 'Deezer didn’t respond as expected. Try again in a moment.'}
	</p>
</div>

<style>
	.error {
		margin-top: 48px;
	}

	h1 {
		margin-top: 8px;
		font-size: clamp(2.25rem, 6vw, 4rem);
		font-weight: 250;
		letter-spacing: -0.04em;
		line-height: 1.05;
	}

	.hint {
		margin-top: 16px;
		color: var(--muted);
	}
</style>
