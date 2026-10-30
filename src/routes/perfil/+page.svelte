<script lang="ts">
	import { enhance } from '$app/forms';
	import Avatar from '$lib/Avatar.svelte';
	import FotoInput from '$lib/FotoInput.svelte';

	let { data, form } = $props();
</script>

<main>
	<h1>Mi perfil</h1>
	{#if data.yo}
		<div class="actual">
			<Avatar m={data.yo} tam={7} />
			<strong>{data.yo.nombre}</strong>
		</div>

		<form method="POST" action="?/subir" enctype="multipart/form-data" use:enhance={() => async ({ update }) => update({ reset: true })}>
			<FotoInput />
			<button class="primario">Guardar foto</button>
		</form>
		{#if data.yo.conFoto}
			<form method="POST" action="?/quitar" use:enhance>
				<button class="quitar">Quitar foto</button>
			</form>
		{/if}
		{#if form?.error}<p class="error">{form.error}</p>{/if}
	{/if}
</main>

<style>
	main {
		max-width: 24rem;
		margin: 2rem auto;
		padding: 0 1rem;
		text-align: center;
	}
	.actual {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
	}
	form {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.7rem;
		margin-bottom: 0.8rem;
	}
	.quitar {
		background: none;
		border: 1px solid var(--borde);
		border-radius: 0.5rem;
		padding: 0.3rem 0.8rem;
		color: var(--suave);
		cursor: pointer;
	}
</style>
