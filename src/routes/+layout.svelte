<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import Avatar from '$lib/Avatar.svelte';

	let { data, children } = $props();
</script>

{#if data.yo}
	<nav>
		<a href="/" class:activo={page.url.pathname === '/'}>Tablero</a>
		{#if data.yo.rol === 'admin'}
			<a href="/familia" class:activo={page.url.pathname === '/familia'}>Familia</a>
		{/if}
		<a class="yo" href="/perfil"><Avatar m={data.yo} tam={1.6} /> {data.yo.nombre}</a>
		<form method="POST" action="/entrar?/salir" use:enhance>
			<button>Salir</button>
		</form>
	</nav>
{/if}

{@render children()}

<style>
	:global(:root) {
		--fondo: #f4f5f7;
		--superficie: #fff;
		--texto: #1f2430;
		--suave: #6b7280;
		--borde: #e3e6eb;
		--acento: #5b5bd6;
		--alta: #e5484d;
		--media: #f5a524;
		--baja: #3b82f6;
	}
	@media (prefers-color-scheme: dark) {
		:global(:root) {
			--fondo: #14161c;
			--superficie: #1e212b;
			--texto: #e8eaf0;
			--suave: #9aa1b2;
			--borde: #2e3240;
			--acento: #8b8bf0;
		}
	}
	:global(body) {
		margin: 0;
		background: var(--fondo);
		color: var(--texto);
		font-family: system-ui, sans-serif;
	}
	:global(input, select) {
		padding: 0.65rem 0.8rem;
		border: 1px solid var(--borde);
		border-radius: 0.6rem;
		background: var(--superficie);
		color: inherit;
		font: inherit;
	}
	:global(.primario) {
		padding: 0.65rem 1.2rem;
		border: none;
		border-radius: 0.6rem;
		background: var(--acento);
		color: #fff;
		font: inherit;
		font-weight: 600;
		cursor: pointer;
	}
	:global(.error) {
		color: var(--alta);
	}
	nav {
		display: flex;
		align-items: center;
		gap: 1rem;
		max-width: 70rem;
		margin: 0 auto;
		padding: 0.8rem 1rem 0;
	}
	nav a {
		color: var(--suave);
		text-decoration: none;
		font-weight: 600;
	}
	nav a.activo {
		color: var(--acento);
	}
	.yo {
		margin-left: auto;
	}
	nav form button {
		background: none;
		border: 1px solid var(--borde);
		border-radius: 0.5rem;
		padding: 0.25rem 0.7rem;
		color: var(--suave);
		cursor: pointer;
	}
</style>
