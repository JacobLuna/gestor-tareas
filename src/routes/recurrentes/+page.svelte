<script lang="ts">
	import { enhance } from '$app/forms';
	import Avatar from '$lib/Avatar.svelte';
	import { DIAS_CORTO, ORDEN_SEMANA, parseDias } from '$lib/fechas';
	import { puedeBorrar } from '$lib/tareas';

	let { data, form } = $props();

	const diasTexto = (s: string) => {
		const d = parseDias(s);
		if (d.length === 7) return 'Todos los días';
		return ORDEN_SEMANA.filter((x) => d.includes(x))
			.map((x) => DIAS_CORTO[x])
			.join(', ');
	};
</script>

<main>
	<h1>Tareas recurrentes</h1>
	<p class="intro">Se crean desde el tablero con «🔁 Repetir». Cada día aparecen como tarjetas.</p>
	{#if form?.error}<p class="error">{form.error}</p>{/if}

	<ul>
		{#each data.recurrentes as r (r.id)}
			<li class:pausada={!r.activa}>
				<div class="quien">
					<strong>{r.titulo}</strong>
					<small>
						{diasTexto(r.dias)} · {r.horas ? r.horas.split(',').join(' · ') : 'sin horario'} ·
						{r.desde}{r.hasta ? ` → ${r.hasta}` : ' → sin fin'}
					</small>
				</div>
				<span class="asignado">
					{#if r.asignado}<Avatar m={r.asignado} tam={1.6} /> {r.asignado.nombre}{:else}de todos{/if}
				</span>
				{#if data.yo && puedeBorrar(data.yo, { asignadoId: null, creadorId: r.creadorId })}
					<form method="POST" action="?/pausar" use:enhance>
						<input type="hidden" name="id" value={r.id} />
						<button>{r.activa ? 'Pausar' : 'Reanudar'}</button>
					</form>
					<form method="POST" action="?/borrar" use:enhance>
						<input type="hidden" name="id" value={r.id} />
						<button class="borrar" aria-label="Borrar {r.titulo}">✕</button>
					</form>
				{/if}
			</li>
		{:else}
			<li class="vacio">Aún no hay tareas recurrentes.</li>
		{/each}
	</ul>
</main>

<style>
	main {
		max-width: 44rem;
		margin: 0 auto;
		padding: 1.5rem 1rem 3rem;
	}
	.intro {
		color: var(--suave);
	}
	ul {
		list-style: none;
		padding: 0;
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
	li.pausada {
		opacity: 0.55;
	}
	.quien {
		flex: 1;
		display: flex;
		flex-direction: column;
	}
	small,
	.vacio {
		color: var(--suave);
	}
	li form {
		display: contents;
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
