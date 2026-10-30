import { fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { validarTarea } from '$lib/tareas';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => ({
	tareas: await db.tarea.findMany({ orderBy: [{ completada: 'asc' }, { creadaEn: 'desc' }] })
});

const idDe = (data: FormData) => {
	const id = Number(data.get('id'));
	return Number.isInteger(id) ? id : null;
};

export const actions: Actions = {
	crear: async ({ request }) => {
		const data = await request.formData();
		const r = validarTarea(data.get('titulo'), data.get('prioridad'));
		if (!r.ok) return fail(400, { error: r.error });
		await db.tarea.create({ data: r.tarea });
	},
	alternar: async ({ request }) => {
		const id = idDe(await request.formData());
		if (id === null) return fail(400, { error: 'Id no válido.' });
		const t = await db.tarea.findUnique({ where: { id } });
		if (!t) return fail(404, { error: 'La tarea no existe.' });
		await db.tarea.update({ where: { id }, data: { completada: !t.completada } });
	},
	borrar: async ({ request }) => {
		const id = idDe(await request.formData());
		if (id === null) return fail(400, { error: 'Id no válido.' });
		await db.tarea.deleteMany({ where: { id } });
	}
};
