import { db } from './db';

export async function guardarFoto(miembroId: number, foto: { datos: Uint8Array<ArrayBuffer>; tipo: string }) {
	await db.foto.upsert({
		where: { miembroId },
		create: { miembroId, ...foto },
		update: foto
	});
	await db.miembro.update({ where: { id: miembroId }, data: { conFoto: true } });
}

export async function quitarFoto(miembroId: number) {
	await db.foto.deleteMany({ where: { miembroId } });
	await db.miembro.update({ where: { id: miembroId }, data: { conFoto: false } });
}
