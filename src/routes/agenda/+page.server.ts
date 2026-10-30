import { error, fail } from '@sveltejs/kit';
import { validarEvento } from '$lib/agenda';
import { diaSemana, esFechaISO, hoyISO, lunesDe, ocurreEn, parseDias, sumarDias } from '$lib/fechas';
import { db } from '$lib/server/db';
import { puedeBorrar, puedeCrear } from '$lib/tareas';
import type { Actions, PageServerLoad } from './$types';

const quien = { select: { id: true, nombre: true, avatar: true, conFoto: true } };

export const load: PageServerLoad = async ({ url }) => {
	const hoy = hoyISO();
	const s = url.searchParams.get('s');
	const lunes = lunesDe(esFechaISO(s) ? s : hoy);
	const filtro = Number(url.searchParams.get('quien')) || null;

	const eventos = await db.evento.findMany({
		where: filtro ? { OR: [{ miembroId: filtro }, { miembroId: null }] } : {},
		include: { miembro: quien }
	});

	return {
		hoy,
		lunes,
		anterior: sumarDias(lunes, -7),
		siguiente: sumarDias(lunes, 7),
		filtro,
		miembros: await db.miembro.findMany({ ...quien, orderBy: { nombre: 'asc' } }),
		semana: Array.from({ length: 7 }, (_, i) => {
			const iso = sumarDias(lunes, i);
			return {
				iso,
				dow: diaSemana(iso),
				eventos: eventos
					.filter((e) =>
						e.fecha ? e.fecha === iso : ocurreEn({ dias: parseDias(e.dias), desde: e.desde, hasta: e.hasta }, iso)
					)
					.sort((a, b) => a.inicio.localeCompare(b.inicio))
			};
		})
	};
};

export const actions: Actions = {
	crear: async ({ request, locals }) => {
		if (!puedeCrear(locals.miembro!)) error(403, 'No puedes crear eventos.');
		const r = validarEvento(await request.formData(), hoyISO());
		if (!r.ok) return fail(400, { error: r.error });
		const { miembroId } = r.evento;
		if (miembroId !== null && !(await db.miembro.findUnique({ where: { id: miembroId } }))) {
			return fail(400, { error: 'El integrante no existe.' });
		}
		await db.evento.create({ data: { ...r.evento, creadorId: locals.miembro!.id } });
	},
	borrar: async ({ request, locals }) => {
		const id = Number((await request.formData()).get('id'));
		if (!Number.isInteger(id)) return fail(400, { error: 'Id no válido.' });
		const e = await db.evento.findUnique({ where: { id } });
		if (!e) return;
		if (!puedeBorrar(locals.miembro!, { asignadoId: null, creadorId: e.creadorId })) error(403, 'No puedes borrar ese evento.');
		await db.evento.delete({ where: { id } });
	}
};
