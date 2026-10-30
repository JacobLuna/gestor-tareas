<script lang="ts">
	let {
		m,
		tam = 2
	}: { m: { id: number; avatar: string; conFoto: boolean }; tam?: number } = $props();
</script>

{#if m.conFoto}
	<img src="/foto/{m.id}" alt="" style="width: {tam}rem; height: {tam}rem" />
{:else}
	<span style="font-size: {tam * 0.8}rem; line-height: {tam}rem; width: {tam}rem">{m.avatar}</span>
{/if}

<style>
	img {
		border-radius: 50%;
		object-fit: cover;
		vertical-align: middle;
	}
	span {
		display: inline-block;
		text-align: center;
		vertical-align: middle;
	}
</style>
