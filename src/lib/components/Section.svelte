<script lang="ts">
	import type { Snippet } from 'svelte';

	let { title, children }: { title: string; children: Snippet } = $props();

	const id = $props.id();
</script>

<section aria-labelledby={id}>
	<h2 class="label" {id}>{title}</h2>
	{@render children()}
</section>

<style>
	section {
		margin-top: clamp(56px, 8vw, 88px);
	}

	h2 {
		padding-top: 14px;
		margin-bottom: 28px;
		border-top: 1px solid var(--line);
	}
</style>
