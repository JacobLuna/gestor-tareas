import { error, fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { puedeBorrar } from '$lib/tareas';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => ({
	recurrentes: await db.recurrente.findMany({
		include: { asignado: { select: { id: true, nombre: true, avatar: true, conFoto: true } } },
		orderBy: { creadaEn: 'desc' }
	})
});

// Pausar y borrar: el admin o quien creó la plantilla.
async function plantillaPropia(request: Request, miembro: { id: number; rol: string }) {
	const id = Number((await request.formData()).get('id'));
	if (!Number.isInteger(id)) return fail(400, { error: 'Id no válido.' });
	const p = await db.recurrente.findUnique({ where: { id } });
	if (!p) return fail(404, { error: 'La tarea recurrente no existe.' });
	if (!puedeBorrar(miembro, { asignadoId: null, creadorId: p.creadorId })) error(403, 'No puedes modificarla.');
	return p;
}

export const actions: Actions = {
	pausar: async ({ request, locals }) => {
		const p = await plantillaPropia(request, locals.miembro!);
		if ('status' in p) return p;
		await db.recurrente.update({ where: { id: p.id }, data: { activa: !p.activa } });
	},
	borrar: async ({ request, locals }) => {
		const p = await plantillaPropia(request, locals.miembro!);
		if ('status' in p) return p;
		// Borra también las tarjetas ya generadas (cascada).
		await db.recurrente.delete({ where: { id: p.id } });
	}
};
