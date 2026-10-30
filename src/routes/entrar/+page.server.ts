import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { bloqueado, limpiarFallos, registrarFallo, verificarPin } from '$lib/server/pin';
import { abrirSesion, cerrarSesion } from '$lib/server/sesion';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => ({
	miembros: await db.miembro.findMany({
		select: { id: true, nombre: true, avatar: true, conFoto: true },
		orderBy: { nombre: 'asc' }
	})
});

export const actions: Actions = {
	entrar: async ({ request, cookies }) => {
		const data = await request.formData();
		const id = Number(data.get('miembroId'));
		const pin = data.get('pin');
		const m = Number.isInteger(id) ? await db.miembro.findUnique({ where: { id } }) : null;
		if (!m || typeof pin !== 'string') return fail(400, { error: 'Elige un integrante e ingresa tu PIN.' });
		if (bloqueado(m.id)) return fail(429, { error: 'Demasiados intentos. Espera un minuto.' });
		if (!verificarPin(pin, m.pinHash)) {
			registrarFallo(m.id);
			return fail(400, { error: 'PIN incorrecto.' });
		}
		limpiarFallos(m.id);
		await abrirSesion(cookies, m.id);
		redirect(303, '/');
	},
	salir: async ({ cookies }) => {
		await cerrarSesion(cookies);
		redirect(303, '/entrar');
	}
};
