import { fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { hashPin } from '$lib/server/pin';
import { guardarFoto } from '$lib/server/foto';
import { leerFoto } from '$lib/foto';
import { esRol, validarMiembro, validarPin } from '$lib/miembros';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => ({
	miembros: await db.miembro.findMany({
		select: { id: true, nombre: true, avatar: true, conFoto: true, rol: true, _count: { select: { asignadas: true } } },
		orderBy: { creadoEn: 'asc' }
	})
});

const idDe = (data: FormData) => {
	const id = Number(data.get('id'));
	return Number.isInteger(id) ? id : null;
};

export const actions: Actions = {
	crear: async ({ request }) => {
		const data = await request.formData();
		const rolForm = data.get('rol');
		const rol = esRol(rolForm) ? rolForm : 'miembro';
		const r = validarMiembro(data.get('nombre'), data.get('avatar'), data.get('pin'), rol);
		if (!r.ok) return fail(400, { error: r.error });
		if (await db.miembro.findUnique({ where: { nombre: r.miembro.nombre } })) {
			return fail(400, { error: 'Ya existe un integrante con ese nombre.' });
		}
		const f = await leerFoto(data.get('foto'));
		if (!f.ok) return fail(400, { error: f.error });
		const { pin, ...resto } = r.miembro;
		const m = await db.miembro.create({ data: { ...resto, pinHash: hashPin(pin) } });
		if (f.foto) await guardarFoto(m.id, f.foto);
	},
	cambiarRol: async ({ request, locals }) => {
		const data = await request.formData();
		const id = idDe(data);
		const rol = data.get('rol');
		if (id === null || !esRol(rol)) return fail(400, { error: 'Rol no válido.' });
		if (id === locals.miembro?.id) return fail(400, { error: 'No puedes cambiar tu propio rol.' });
		const { count } = await db.miembro.updateMany({ where: { id }, data: { rol } });
		if (!count) return fail(404, { error: 'El integrante no existe.' });
	},
	resetearPin: async ({ request }) => {
		const data = await request.formData();
		const id = idDe(data);
		const pin = data.get('pin');
		if (id === null || !validarPin(pin)) return fail(400, { error: 'El PIN debe tener 4 dígitos.' });
		const { count } = await db.miembro.updateMany({ where: { id }, data: { pinHash: hashPin(pin as string) } });
		if (!count) return fail(404, { error: 'El integrante no existe.' });
		await db.sesion.deleteMany({ where: { miembroId: id } });
	},
	borrar: async ({ request, locals }) => {
		const id = idDe(await request.formData());
		if (id === null) return fail(400, { error: 'Id no válido.' });
		if (id === locals.miembro?.id) return fail(400, { error: 'No puedes borrarte a ti mismo.' });
		await db.miembro.deleteMany({ where: { id } });
	}
};
