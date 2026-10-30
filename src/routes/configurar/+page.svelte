<script lang="ts">
	import { enhance } from '$app/forms';
	import { AVATARES } from '$lib/miembros';
	import FotoInput from '$lib/FotoInput.svelte';

	let { form } = $props();
</script>

<main>
	<h1>Bienvenido 👋</h1>
	<p>Crea tu perfil de administrador. Después podrás agregar al resto de la familia.</p>
	<form method="POST" action="?/crear" enctype="multipart/form-data" use:enhance>
		<input name="nombre" placeholder="Tu nombre" maxlength="30" required />
		<select name="avatar" aria-label="Avatar">
			{#each AVATARES as a}<option value={a}>{a}</option>{/each}
		</select>
		<input name="pin" type="password" inputmode="numeric" pattern="[0-9][0-9][0-9][0-9]" maxlength="4" placeholder="PIN de 4 dígitos" autocomplete="off" required />
		<FotoInput />
		<button class="primario">Crear administrador</button>
		{#if form?.error}<p class="error">{form.error}</p>{/if}
	</form>
</main>

<style>
	main {
		max-width: 24rem;
		margin: 3rem auto;
		padding: 0 1rem;
		text-align: center;
	}
	form {
		display: flex;
		flex-direction: column;
		gap: 0.8rem;
	}
</style>
