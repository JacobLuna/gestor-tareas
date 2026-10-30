<script lang="ts">
	import { enhance } from '$app/forms';
	import Avatar from '$lib/Avatar.svelte';
	import { DIAS_CORTO, ORDEN_SEMANA } from '$lib/fechas';
	import { puedeBorrar, puedeCrear } from '$lib/tareas';

	let { data, form } = $props();

	let modo = $state<'semanal' | 'unico'>('semanal');
	let dias = $state<number[]>([]);

	const enlace = (s: string) => `?s=${s}${data.filtro ? `&quien=${data.filtro}` : ''}`;
	const dia = (iso: string) => Number(iso.slice(8));
	const rango = $derived(
		`${dia(data.semana[0].iso)} – ${dia(data.semana[6].iso)} ${new Date(data.semana[6].iso + 'T00:00').toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}`
	);
</script>

<main>
	<header>
		<h1>Agenda</h1>
		<div class="semana">
			<a href={enlace(data.anterior)} aria-label="Semana anterior">←</a>
			<strong>{rango}</strong>
			<a href={enlace(data.siguiente)} aria-label="Semana siguiente">→</a>
			<a href={enlace(data.hoy)} class="hoy">Hoy</a>
		</div>
	</header>

	<div class="filtro">
		<a href="?s={data.lunes}" class:activo={!data.filtro}>Todos</a>
		{#each data.miembros as m (m.id)}
			<a href="?s={data.lunes}&quien={m.id}" class:activo={data.filtro === m.id}><Avatar {m} tam={1.3} /> {m.nombre}</a>
		{/each}
	</div>

	<div class="grid">
		{#each data.semana as d (d.iso)}
			<section class:hoy={d.iso === data.hoy}>
				<h2>{DIAS_CORTO[d.dow]} <span>{dia(d.iso)}</span></h2>
				{#each d.eventos as e (e.id)}
					<article>
						<span class="horas">{e.inicio}–{e.fin}</span>
						<strong>{e.titulo}</strong>
						<small>
							{#if e.miembro}<Avatar m={e.miembro} tam={1.1} /> {e.miembro.nombre}{:else}Familia{/if}
						</small>
						{#if data.yo && puedeBorrar(data.yo, { asignadoId: null, creadorId: e.creadorId })}
							<form method="POST" action="?/borrar" use:enhance>
								<input type="hidden" name="id" value={e.id} />
								<button aria-label="Borrar {e.titulo}">✕</button>
							</form>
						{/if}
					</article>
				{:else}
					<p class="vacio">—</p>
				{/each}
			</section>
		{/each}
	</div>

	{#if data.yo && puedeCrear(data.yo)}
		<h2 class="titulo-form">Nuevo evento</h2>
		<form
			class="nuevo"
			method="POST"
			action="?/crear"
			use:enhance={() => async ({ update }) => {
				await update();
				modo = 'semanal';
				dias = [];
			}}
		>
			<input name="titulo" placeholder="Ej. Escuela, dentista…" maxlength="80" required />
			<label>De <input type="time" name="inicio" required /></label>
			<label>a <input type="time" name="fin" required /></label>

			<fieldset class="fila">
				<legend>Para</legend>
				<label>
					<input type="radio" name="miembroId" value="" checked={!data.filtro} />
					<span class="chip">Toda la familia</span>
				</label>
				{#each data.miembros as m (m.id)}
					<label>
						<input type="radio" name="miembroId" value={m.id} checked={data.filtro === m.id} />
						<span class="chip"><Avatar {m} tam={1.6} /> {m.nombre}</span>
					</label>
				{/each}
			</fieldset>

			<fieldset class="fila">
				<legend>Se repite</legend>
				<label><input type="radio" name="modo" value="semanal" bind:group={modo} /> Cada semana</label>
				<label><input type="radio" name="modo" value="unico" bind:group={modo} /> Una sola vez</label>
			</fieldset>

			{#if modo === 'semanal'}
				<fieldset class="fila">
					<legend>Días</legend>
					{#each ORDEN_SEMANA as d}
						<label class="dia">
							<input type="checkbox" name="dia" value={d} bind:group={dias} />
							<span class="chip">{DIAS_CORTO[d]}</span>
						</label>
					{/each}
					<button type="button" class="mini" onclick={() => (dias = [1, 2, 3, 4, 5])}>Lun–Vie</button>
				</fieldset>
				<div class="fila">
					<label>Desde <input type="date" name="desde" value={data.hoy} /></label>
					<label>Hasta <input type="date" name="hasta" /></label>
					<small>Pon la fecha final del ciclo escolar para que no siga después.</small>
				</div>
			{:else}
				<div class="fila">
					<label>Fecha <input type="date" name="fecha" value={data.hoy} required /></label>
				</div>
			{/if}

			<button class="primario">Agregar a la agenda</button>
		</form>
		{#if form?.error}<p class="error">{form.error}</p>{/if}
	{/if}
</main>

<style>
	main {
		max-width: 72rem;
		margin: 0 auto;
		padding: 1.5rem 1rem 3rem;
	}
	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 1rem;
	}
	h1 {
		margin: 0;
	}
	.semana {
		display: flex;
		align-items: center;
		gap: 0.8rem;
		text-transform: capitalize;
	}
	.semana a,
	.filtro a {
		color: var(--suave);
		text-decoration: none;
	}
	.semana a:not(.hoy) {
		padding: 0.1rem 0.6rem;
		border: 1px solid var(--borde);
		border-radius: 0.5rem;
	}
	.hoy {
		color: var(--acento);
		font-weight: 600;
	}
	.filtro {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		margin: 1rem 0;
	}
	.filtro a {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		padding: 0.25rem 0.7rem;
		border: 1px solid var(--borde);
		border-radius: 2rem;
		font-size: 0.9rem;
	}
	.filtro a.activo {
		border-color: var(--acento);
		color: var(--texto);
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: 0.6rem;
		align-items: start;
	}
	@media (max-width: 900px) {
		.grid {
			grid-template-columns: 1fr;
		}
	}
	.grid section {
		background: color-mix(in srgb, var(--superficie) 60%, transparent);
		border: 1px solid var(--borde);
		border-radius: 0.8rem;
		padding: 0.6rem;
		min-height: 6rem;
	}
	.grid section.hoy {
		border-color: var(--acento);
	}
	h2 {
		margin: 0 0 0.5rem;
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--suave);
	}
	h2 span {
		color: var(--texto);
		font-size: 1rem;
	}
	.grid article {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
		padding: 0.5rem 1.4rem 0.5rem 0.6rem;
		margin-bottom: 0.4rem;
		background: var(--superficie);
		border: 1px solid var(--borde);
		border-left: 4px solid var(--acento);
		border-radius: 0.5rem;
	}
	.horas {
		font-size: 0.75rem;
		color: var(--suave);
	}
	small,
	.vacio {
		color: var(--suave);
	}
	.vacio {
		margin: 0;
		text-align: center;
	}
	article form {
		position: absolute;
		top: 0.2rem;
		right: 0.2rem;
	}
	article form button {
		background: none;
		border: none;
		color: var(--suave);
		cursor: pointer;
	}
	article form button:hover {
		color: var(--alta);
	}
	.titulo-form {
		margin-top: 2rem;
	}
	.nuevo {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.6rem;
	}
	.nuevo > input[name='titulo'] {
		flex: 1;
		min-width: 12rem;
	}
	.fila {
		flex-basis: 100%;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.4rem;
		border: none;
		margin: 0;
		padding: 0;
	}
	.fila legend {
		float: left;
		margin-right: 0.5rem;
		padding: 0;
		color: var(--suave);
		font-size: 0.85rem;
	}
	.fila label input[type='radio'][name='miembroId'],
	.dia input {
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
	input:checked + .chip {
		border-color: var(--acento);
	}
	input:focus-visible + .chip {
		outline: 2px solid var(--acento);
	}
	.mini {
		background: none;
		border: 1px solid var(--borde);
		border-radius: 0.5rem;
		padding: 0.3rem 0.7rem;
		color: var(--suave);
		cursor: pointer;
	}
</style>
