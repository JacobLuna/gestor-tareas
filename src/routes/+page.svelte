<script lang="ts">
	import { enhance } from '$app/forms';
	import { PRIORIDADES } from '$lib/tareas';

	let { data, form } = $props();
</script>

<main>
	<h1>Gestor de tareas</h1>

	<form class="nueva" method="POST" action="?/crear" use:enhance>
		<input name="titulo" placeholder="Nueva tarea" maxlength="120" required />
		<select name="prioridad">
			{#each PRIORIDADES as p}
				<option value={p} selected={p === 'media'}>{p}</option>
			{/each}
		</select>
		<button>Agregar</button>
	</form>
	{#if form?.error}<p class="error">{form.error}</p>{/if}

	<ul>
		{#each data.tareas as t (t.id)}
			<li class:hecha={t.completada}>
				<form method="POST" action="?/alternar" use:enhance>
					<input type="hidden" name="id" value={t.id} />
					<button class="icono" aria-label={t.completada ? 'Marcar pendiente' : 'Marcar hecha'}>
						{t.completada ? '☑' : '☐'}
					</button>
				</form>
				<span class="titulo">{t.titulo}</span>
				<span class="prio {t.prioridad}">{t.prioridad}</span>
				<form method="POST" action="?/borrar" use:enhance>
					<input type="hidden" name="id" value={t.id} />
					<button class="icono" aria-label="Borrar tarea">✕</button>
				</form>
			</li>
		{:else}
			<li class="vacio">Sin tareas. Agrega la primera.</li>
		{/each}
	</ul>
</main>

<style>
	main {
		max-width: 36rem;
		margin: 2rem auto;
		padding: 0 1rem;
		font-family: system-ui, sans-serif;
	}
	.nueva {
		display: flex;
		gap: 0.5rem;
	}
	.nueva input {
		flex: 1;
		padding: 0.5rem;
	}
	ul {
		list-style: none;
		padding: 0;
	}
	li {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0;
		border-bottom: 1px solid #ddd;
	}
	li form {
		display: contents;
	}
	.titulo {
		flex: 1;
	}
	.hecha .titulo {
		text-decoration: line-through;
		color: #888;
	}
	.icono {
		background: none;
		border: none;
		cursor: pointer;
		font-size: 1.1rem;
	}
	.prio {
		font-size: 0.75rem;
		padding: 0.1rem 0.5rem;
		border-radius: 1rem;
		color: #fff;
	}
	.alta {
		background: #c0392b;
	}
	.media {
		background: #d68910;
	}
	.baja {
		background: #2e86c1;
	}
	.error {
		color: #c0392b;
	}
	.vacio {
		color: #888;
	}
</style>
