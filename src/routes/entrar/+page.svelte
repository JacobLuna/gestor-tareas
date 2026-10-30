<script lang="ts">
	import { enhance } from '$app/forms';
	import Avatar from '$lib/Avatar.svelte';

	let { data, form } = $props();
</script>

<main>
	<h1>¿Quién eres?</h1>
	<form method="POST" action="?/entrar" use:enhance>
		<div class="perfiles">
			{#each data.miembros as m, i (m.id)}
				<label>
					<input type="radio" name="miembroId" value={m.id} required checked={i === 0 && data.miembros.length === 1} />
					<span class="tarjeta">
						<Avatar {m} tam={3.5} />
						{m.nombre}
					</span>
				</label>
			{/each}
		</div>
		<input name="pin" type="password" inputmode="numeric" pattern="[0-9][0-9][0-9][0-9]" maxlength="4" placeholder="PIN de 4 dígitos" autocomplete="off" required />
		<button class="primario">Entrar</button>
		{#if form?.error}<p class="error">{form.error}</p>{/if}
	</form>
</main>

<style>
	main {
		max-width: 32rem;
		margin: 3rem auto;
		padding: 0 1rem;
		text-align: center;
	}
	form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		align-items: center;
	}
	.perfiles {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.8rem;
	}
	label input {
		position: absolute;
		opacity: 0;
	}
	.tarjeta {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.3rem;
		min-width: 6rem;
		padding: 1rem;
		background: var(--superficie);
		border: 2px solid var(--borde);
		border-radius: 0.9rem;
		cursor: pointer;
	}
	label input:checked + .tarjeta {
		border-color: var(--acento);
	}
	label input:focus-visible + .tarjeta {
		outline: 2px solid var(--acento);
	}
</style>
