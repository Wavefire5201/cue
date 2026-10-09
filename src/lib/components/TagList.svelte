<script lang="ts">
	let { tags, label = 'Genres' }: { tags: string[]; label?: string } = $props();
</script>

{#if tags.length}
	<ul aria-label={label}>
		{#each tags as tag (tag)}
			<li>{tag}</li>
		{/each}
	</ul>
{/if}

<style>
	ul {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	li {
		padding: 3px 11px 4px;
		border: 1px solid var(--line);
		font-size: 0.8125rem;
		color: var(--muted);
	}
</style>
