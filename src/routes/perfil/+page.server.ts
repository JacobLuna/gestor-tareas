import { fail } from '@sveltejs/kit';
import { leerFoto } from '$lib/foto';
import { guardarFoto, quitarFoto } from '$lib/server/foto';
import type { Actions } from './$types';

export const actions: Actions = {
	subir: async ({ request, locals }) => {
		const r = await leerFoto((await request.formData()).get('foto'));
		if (!r.ok) return fail(400, { error: r.error });
		if (!r.foto) return fail(400, { error: 'Elige una foto.' });
		await guardarFoto(locals.miembro!.id, r.foto);
	},
	quitar: async ({ locals }) => {
		await quitarFoto(locals.miembro!.id);
	}
};
