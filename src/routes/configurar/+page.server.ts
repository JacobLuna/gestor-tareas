import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { hashPin } from '$lib/server/pin';
import { guardarFoto } from '$lib/server/foto';
import { leerFoto } from '$lib/foto';
import { abrirSesion } from '$lib/server/sesion';
import { validarMiembro } from '$lib/miembros';
import type { Actions } from './$types';

export const actions: Actions = {
	crear: async ({ request, cookies }) => {
		if ((await db.miembro.count()) > 0) return fail(403, { error: 'La familia ya está configurada.' });
		const data = await request.formData();
		const r = validarMiembro(data.get('nombre'), data.get('avatar'), data.get('pin'), 'admin');
		if (!r.ok) return fail(400, { error: r.error });
		const f = await leerFoto(data.get('foto'));
		if (!f.ok) return fail(400, { error: f.error });
		const { pin, ...resto } = r.miembro;
		const m = await db.miembro.create({ data: { ...resto, pinHash: hashPin(pin) } });
		if (f.foto) await guardarFoto(m.id, f.foto);
		await abrirSesion(cookies, m.id);
		redirect(303, '/');
	}
};
