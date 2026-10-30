import { error, fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { generarDeHoy } from '$lib/server/recurrentes';
import { leerHoras } from '$lib/agenda';
import { hoyISO, leerRegla } from '$lib/fechas';
import { esEstado, puedeBorrar, puedeCrear, puedeMover, validarTarea } from '$lib/tareas';
import type { Actions, PageServerLoad } from './$types';

const quien = { select: { id: true, nombre: true, avatar: true, conFoto: true } };

export const load: PageServerLoad = async ({ locals, url }) => {
	const soloMias = url.searchParams.get('ver') === 'mias';
	const hoy = hoyISO();
	await generarDeHoy(hoy);
	return {
		soloMias,
		hoy,
		miembros: await db.miembro.findMany({ ...quien, orderBy: { nombre: 'asc' } }),
		// De las recurrentes solo se muestran las de hoy; las de días pasados quedan como historial.
		tareas: (
			await db.tarea.findMany({
				where: {
					OR: [{ recurrenteId: null }, { fecha: hoy }],
					...(soloMias ? { asignadoId: locals.miembro!.id } : {})
				},
				include: { asignado: quien, creador: quien },
				orderBy: { creadaEn: 'desc' }
			})
		).sort((a, b) => (a.hora || '~').localeCompare(b.hora || '~'))
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
		const creadorId = locals.miembro!.id;
		if (!data.get('repetir')) {
			await db.tarea.create({ data: { ...r.tarea, asignadoId, creadorId } });
			return;
		}
		const hoy = hoyISO();
		const regla = leerRegla(data, hoy);
		if (!regla.ok) return fail(400, { error: regla.error });
		const h = leerHoras(data);
		if (!h.ok) return fail(400, { error: h.error });
		await db.recurrente.create({
			data: {
				...r.tarea,
				asignadoId,
				creadorId,
				dias: regla.dias.join(','),
				horas: h.horas.join(','),
				desde: regla.desde,
				hasta: regla.hasta
			}
		});
		await generarDeHoy(hoy);
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
