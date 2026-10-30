<script lang="ts">
	import { enhance } from '$app/forms';
	import { AVATARES, ROLES } from '$lib/miembros';
	import Avatar from '$lib/Avatar.svelte';
	import FotoInput from '$lib/FotoInput.svelte';

	let { data, form } = $props();
</script>

<main>
	<h1>Familia</h1>

	<form class="nuevo" method="POST" action="?/crear" enctype="multipart/form-data" use:enhance={() => async ({ update }) => update({ reset: true })}>
		<input name="nombre" placeholder="Nombre" maxlength="30" required />
		<select name="avatar" aria-label="Avatar">
			{#each AVATARES as a}<option value={a}>{a}</option>{/each}
		</select>
		<input name="pin" type="password" inputmode="numeric" pattern="[0-9][0-9][0-9][0-9]" maxlength="4" placeholder="PIN (4 dígitos)" autocomplete="off" required />
		<select name="rol" aria-label="Rol">
			{#each ROLES as r}<option value={r} selected={r === 'miembro'}>{r}</option>{/each}
		</select>
		<FotoInput />
		<button class="primario">Agregar</button>
	</form>
	{#if form?.error}<p class="error">{form.error}</p>{/if}

	<ul>
		{#each data.miembros as m (m.id)}
			<li>
				<Avatar {m} tam={2.4} />
				<div class="quien">
					<strong>{m.nombre}</strong>
					<small>{m.rol} · {m._count.asignadas} tareas asignadas</small>
				</div>
				<form method="POST" action="?/resetearPin" use:enhance={() => async ({ update }) => update({ reset: true })}>
					<input type="hidden" name="id" value={m.id} />
					<input name="pin" type="password" inputmode="numeric" pattern="[0-9][0-9][0-9][0-9]" maxlength="4" placeholder="Nuevo PIN" autocomplete="off" required />
					<button>Cambiar PIN</button>
				</form>
				{#if m.id !== data.yo?.id}
						<form method="POST" action="?/cambiarRol" use:enhance>
							<input type="hidden" name="id" value={m.id} />
							<select name="rol" aria-label="Rol de {m.nombre}" onchange={(e) => e.currentTarget.form?.requestSubmit()}>
								{#each ROLES as r}<option value={r} selected={r === m.rol}>{r}</option>{/each}
							</select>
						</form>
					<form method="POST" action="?/borrar" use:enhance>
						<input type="hidden" name="id" value={m.id} />
						<button class="borrar" aria-label="Borrar a {m.nombre}">✕</button>
					</form>
				{/if}
			</li>
		{/each}
	</ul>
</main>

<style>
	main {
		max-width: 44rem;
		margin: 0 auto;
		padding: 1.5rem 1rem 3rem;
	}
	.nuevo {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	.nuevo input[name='nombre'] {
		flex: 1;
		min-width: 8rem;
	}
	ul {
		list-style: none;
		padding: 0;
		margin-top: 1.5rem;
	}
	li {
		display: flex;
		align-items: center;
		gap: 0.8rem;
		padding: 0.7rem 0.9rem;
		margin-bottom: 0.5rem;
		background: var(--superficie);
		border: 1px solid var(--borde);
		border-radius: 0.7rem;
	}
	.quien {
		flex: 1;
		display: flex;
		flex-direction: column;
	}
	small {
		color: var(--suave);
	}
	li form {
		display: flex;
		gap: 0.3rem;
	}
	li input {
		width: 6.5rem;
		padding: 0.4rem 0.6rem;
	}
	li button {
		background: none;
		border: 1px solid var(--borde);
		border-radius: 0.5rem;
		padding: 0.35rem 0.7rem;
		color: var(--suave);
		cursor: pointer;
	}
	.borrar:hover {
		color: var(--alta);
	}
</style>
