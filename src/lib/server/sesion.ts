import { randomBytes } from 'node:crypto';
import type { Cookies } from '@sveltejs/kit';
import { db } from './db';

const COOKIE = 'sesion';
const DIAS = 30;

export const leerSesion = async (cookies: Cookies) => {
	const id = cookies.get(COOKIE);
	if (!id) return null;
	const s = await db.sesion.findUnique({
		where: { id },
		include: { miembro: { select: { id: true, nombre: true, avatar: true, rol: true, conFoto: true } } }
	});
	if (!s) return null;
	if (s.expira < new Date()) {
		await db.sesion.deleteMany({ where: { id } });
		return null;
	}
	return s.miembro;
};

export async function abrirSesion(cookies: Cookies, miembroId: number) {
	const id = randomBytes(32).toString('hex');
	const expira = new Date(Date.now() + DIAS * 864e5);
	await db.sesion.create({ data: { id, miembroId, expira } });
	// shortcut: secure=false porque la app va por http en la red de la casa; con HTTPS ponerlo en true.
	cookies.set(COOKIE, id, { path: '/', httpOnly: true, sameSite: 'lax', secure: false, expires: expira });
}

export async function cerrarSesion(cookies: Cookies) {
	const id = cookies.get(COOKIE);
	if (id) await db.sesion.deleteMany({ where: { id } });
	cookies.delete(COOKIE, { path: '/' });
}
