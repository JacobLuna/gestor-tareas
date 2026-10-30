import { error, fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { esEstado, puedeBorrar, puedeCrear, puedeMover, validarTarea } from '$lib/tareas';
import type { Actions, PageServerLoad } from './$types';

const quien = { select: { id: true, nombre: true, avatar: true, conFoto: true } };

export const load: PageServerLoad = async ({ locals, url }) => {
	const soloMias = url.searchParams.get('ver') === 'mias';
	return {
		soloMias,
		miembros: await db.miembro.findMany({ ...quien, orderBy: { nombre: 'asc' } }),
		tareas: await db.tarea.findMany({
			where: soloMias ? { asignadoId: locals.miembro!.id } : {},
			include: { asignado: quien, creador: quien },
			orderBy: { creadaEn: 'desc' }
		})
	};
};

const idDe = (data: FormData) => {
	const id = Number(data.get('id'));
	return Number.isInteger(id) ? id : null;
};

export const actions: Actions = {
	crear: async ({ request, locals }) => {
		if (!puedeCrear(locals.miembro!)) error(403, 'No puedes crear tareas.');
		const data = await request.formData();
		const r = validarTarea(data.get('titulo'), data.get('prioridad'));
		if (!r.ok) return fail(400, { error: r.error });
		const raw = data.get('asignadoId');
		let asignadoId: number | null = null;
		if (raw) {
			asignadoId = Number(raw);
			if (!Number.isInteger(asignadoId) || !(await db.miembro.findUnique({ where: { id: asignadoId } }))) {
				return fail(400, { error: 'El integrante no existe.' });
			}
		}
		await db.tarea.create({ data: { ...r.tarea, asignadoId, creadorId: locals.miembro!.id } });
	},
	mover: async ({ request, locals }) => {
		const data = await request.formData();
		const id = idDe(data);
		const estado = data.get('estado');
		if (id === null || !esEstado(estado)) return fail(400, { error: 'Movimiento no válido.' });
		const t = await db.tarea.findUnique({ where: { id } });
		if (!t) return fail(404, { error: 'La tarea no existe.' });
		if (!puedeMover(locals.miembro!, t)) error(403, 'No puedes mover esa tarea.');
		await db.tarea.update({ where: { id }, data: { estado } });
	},
	borrar: async ({ request, locals }) => {
		const id = idDe(await request.formData());
		if (id === null) return fail(400, { error: 'Id no válido.' });
		const t = await db.tarea.findUnique({ where: { id } });
		if (!t) return;
		if (!puedeBorrar(locals.miembro!, t)) error(403, 'No puedes borrar esa tarea.');
		await db.tarea.delete({ where: { id } });
	}
};
