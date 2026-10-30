import { redirect, type Handle } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { leerSesion } from '$lib/server/sesion';

export const handle: Handle = async ({ event, resolve }) => {
	const miembro = await leerSesion(event.cookies);
	event.locals.miembro = miembro;
	const ruta = event.url.pathname;

	if (!miembro) {
		const destino = (await db.miembro.count()) > 0 ? '/entrar' : '/configurar';
		if (ruta !== destino) redirect(303, destino);
	} else if (event.request.method === 'GET' && (ruta === '/entrar' || ruta === '/configurar')) {
		redirect(303, '/');
	} else if (ruta.startsWith('/familia') && miembro.rol !== 'admin') {
		redirect(303, '/');
	}

	return resolve(event);
};
