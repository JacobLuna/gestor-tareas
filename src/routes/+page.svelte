<script lang="ts">
	import { enhance } from '$app/forms';
	import Avatar from '$lib/Avatar.svelte';
	import { PRIORIDADES, puedeBorrar, puedeCrear, puedeMover, type Estado } from '$lib/tareas';

	let { data, form } = $props();

	const columnas: { estado: Estado; titulo: string; icono: string }[] = [
		{ estado: 'pendiente', titulo: 'Pendiente', icono: '○' },
		{ estado: 'en_curso', titulo: 'En curso', icono: '◐' },
		{ estado: 'hecha', titulo: 'Hecha', icono: '●' }
	];

	const total = $derived(data.tareas.length);
	const hechas = $derived(data.tareas.filter((t) => t.estado === 'hecha').length);
	const progreso = $derived(total ? Math.round((hechas / total) * 100) : 0);
</script>

<main>
	<header>
		<div>
			<h1>Tareas de la familia</h1>
			<p class="resumen">{hechas} de {total} completadas</p>
		</div>
		<div class="filtro">
			<a href="/" class:activo={!data.soloMias}>Todas</a>
			<a href="/?ver=mias" class:activo={data.soloMias}>Mis tareas</a>
		</div>
		<div class="barra" role="progressbar" aria-valuenow={progreso} aria-valuemin="0" aria-valuemax="100">
			<span style="width: {progreso}%"></span>
		</div>
	</header>

	{#if data.yo && puedeCrear(data.yo)}
	<form class="nueva" method="POST" action="?/crear" use:enhance>
		<input name="titulo" placeholder="¿Qué hay que hacer?" maxlength="120" required />
		<select name="prioridad" aria-label="Prioridad">
			{#each PRIORIDADES as p}
				<option value={p} selected={p === 'media'}>{p}</option>
			{/each}
		</select>
		<button class="primario">Agregar</button>
		<fieldset class="asignar">
			<legend>Asignar a</legend>
			<label>
				<input type="radio" name="asignadoId" value="" />
				<span class="chip">de todos</span>
			</label>
			{#each data.miembros as m (m.id)}
				<label>
					<input type="radio" name="asignadoId" value={m.id} checked={m.id === data.yo?.id} />
					<span class="chip"><Avatar {m} tam={1.6} /> {m.nombre}</span>
				</label>
			{/each}
		</fieldset>
	</form>
	{/if}
	{#if form?.error}<p class="error">{form.error}</p>{/if}

	<div class="tablero">
		{#each columnas as col, i (col.estado)}
			{@const tareas = data.tareas.filter((t) => t.estado === col.estado)}
			<section class="columna {col.estado}">
				<h2>
					<span class="punto">{col.icono}</span>
					{col.titulo}
					<span class="cuenta">{tareas.length}</span>
				</h2>

				{#each tareas as t (t.id)}
					<article class="tarjeta {t.prioridad}">
						<p class="titulo">{t.titulo}</p>
						<footer>
							<span class="prio">
								{#if t.asignado}<Avatar m={t.asignado} tam={1.2} /> {t.asignado.nombre}{:else}de todos{/if} · {t.prioridad}
							</span>
							<div class="acciones">
								{#if data.yo && puedeMover(data.yo, t)}
								{#if i > 0}
									<form method="POST" action="?/mover" use:enhance>
										<input type="hidden" name="id" value={t.id} />
										<input type="hidden" name="estado" value={columnas[i - 1].estado} />
										<button class="icono" aria-label="Mover a {columnas[i - 1].titulo}">←</button>
									</form>
								{/if}
								{#if i < columnas.length - 1}
									<form method="POST" action="?/mover" use:enhance>
										<input type="hidden" name="id" value={t.id} />
										<input type="hidden" name="estado" value={columnas[i + 1].estado} />
										<button class="icono" aria-label="Mover a {columnas[i + 1].titulo}">→</button>
									</form>
								{/if}
								{/if}
								{#if data.yo && puedeBorrar(data.yo, t)}
									<form method="POST" action="?/borrar" use:enhance>
										<input type="hidden" name="id" value={t.id} />
										<button class="icono borrar" aria-label="Borrar tarea">✕</button>
									</form>
								{/if}
							</div>
						</footer>
					</article>
				{:else}
					<p class="vacio">Nada por aquí.</p>
				{/each}
			</section>
		{/each}
	</div>
</main>

<style>
	main {
		max-width: 70rem;
		margin: 0 auto;
		padding: 2rem 1rem 3rem;
	}
	header {
		display: flex;
		align-items: end;
		justify-content: space-between;
		gap: 1.5rem;
		flex-wrap: wrap;
	}
	h1 {
		margin: 0;
		font-size: 1.8rem;
		letter-spacing: -0.02em;
	}
	.resumen {
		margin: 0.25rem 0 0;
		color: var(--suave);
	}
	.barra {
		flex: 1;
		min-width: 12rem;
		max-width: 22rem;
		height: 0.5rem;
		background: var(--borde);
		border-radius: 1rem;
		overflow: hidden;
	}
	.barra span {
		display: block;
		height: 100%;
		background: var(--acento);
		transition: width 0.3s;
	}
	.nueva {
		display: flex;
		gap: 0.5rem;
		margin: 1.5rem 0 0.5rem;
	}
	.nueva {
		flex-wrap: wrap;
	}
	.nueva input {
		flex: 1;
		min-width: 12rem;
	}
	.asignar {
		flex-basis: 100%;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.4rem;
		border: none;
		margin: 0;
		padding: 0;
	}
	.asignar legend {
		float: left;
		margin-right: 0.5rem;
		padding: 0;
		color: var(--suave);
		font-size: 0.85rem;
	}
	.asignar label input {
		position: absolute;
		opacity: 0;
	}
	.chip {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.25rem 0.7rem 0.25rem 0.3rem;
		border: 2px solid var(--borde);
		border-radius: 2rem;
		background: var(--superficie);
		cursor: pointer;
		font-size: 0.9rem;
	}
	.asignar label:first-of-type .chip {
		padding-left: 0.7rem;
	}
	.asignar input:checked + .chip {
		border-color: var(--acento);
	}
	.asignar input:focus-visible + .chip {
		outline: 2px solid var(--acento);
	}
	.filtro {
		display: flex;
		gap: 0.3rem;
		padding: 0.2rem;
		background: var(--borde);
		border-radius: 0.6rem;
	}
	.filtro a {
		padding: 0.3rem 0.8rem;
		border-radius: 0.45rem;
		color: var(--suave);
		text-decoration: none;
		font-size: 0.9rem;
	}
	.filtro a.activo {
		background: var(--superficie);
		color: var(--texto);
	}
	.tablero {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1rem;
		margin-top: 1.5rem;
		align-items: start;
	}
	@media (max-width: 760px) {
		.tablero {
			grid-template-columns: 1fr;
		}
	}
	.columna {
		background: color-mix(in srgb, var(--superficie) 60%, transparent);
		border: 1px solid var(--borde);
		border-radius: 0.9rem;
		padding: 0.8rem;
		min-height: 8rem;
	}
	h2 {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin: 0 0 0.8rem;
		font-size: 0.85rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--suave);
	}
	.pendiente .punto {
		color: var(--suave);
	}
	.en_curso .punto {
		color: var(--media);
	}
	.hecha .punto {
		color: #30a46c;
	}
	.cuenta {
		margin-left: auto;
		padding: 0.05rem 0.5rem;
		border-radius: 1rem;
		background: var(--borde);
		font-size: 0.75rem;
	}
	.tarjeta {
		background: var(--superficie);
		border: 1px solid var(--borde);
		border-left: 4px solid var(--suave);
		border-radius: 0.6rem;
		padding: 0.7rem 0.8rem;
		margin-bottom: 0.6rem;
		box-shadow: 0 1px 2px rgb(0 0 0 / 0.05);
	}
	.tarjeta.alta {
		border-left-color: var(--alta);
	}
	.tarjeta.media {
		border-left-color: var(--media);
	}
	.tarjeta.baja {
		border-left-color: var(--baja);
	}
	.hecha .titulo {
		text-decoration: line-through;
		color: var(--suave);
	}
	.titulo {
		margin: 0 0 0.6rem;
		overflow-wrap: anywhere;
	}
	footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.prio {
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--suave);
	}
	.acciones {
		display: flex;
		gap: 0.1rem;
	}
	.acciones form {
		display: contents;
	}
	.icono {
		background: none;
		border: none;
		border-radius: 0.4rem;
		padding: 0.15rem 0.45rem;
		color: var(--suave);
		font-size: 1rem;
		cursor: pointer;
	}
	.icono:hover {
		background: var(--borde);
		color: var(--texto);
	}
	.borrar:hover {
		color: var(--alta);
	}
	.vacio {
		color: var(--suave);
		font-size: 0.9rem;
		text-align: center;
		margin: 1rem 0;
	}
</style>
