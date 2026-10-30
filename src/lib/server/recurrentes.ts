import { ocurreEn, parseDias } from '$lib/fechas';
import { db } from './db';

/**
 * Crea las tarjetas de `hoy` para cada plantilla activa que toque ese día.
 * Se llama al abrir el tablero; la restricción única (recurrenteId, fecha, hora) evita duplicados.
 */
export async function generarDeHoy(hoy: string) {
	const plantillas = await db.recurrente.findMany({ where: { activa: true, desde: { lte: hoy } } });
	const tocan = plantillas.filter((p) => ocurreEn({ dias: parseDias(p.dias), desde: p.desde, hasta: p.hasta }, hoy));
	if (!tocan.length) return;

	const existentes = await db.tarea.findMany({
		where: { fecha: hoy, recurrenteId: { in: tocan.map((p) => p.id) } },
		select: { recurrenteId: true, hora: true }
	});
	const ya = new Set(existentes.map((t) => `${t.recurrenteId}|${t.hora}`));

	for (const p of tocan) {
		for (const hora of p.horas ? p.horas.split(',') : ['']) {
			if (ya.has(`${p.id}|${hora}`)) continue;
			try {
				await db.tarea.create({
					data: {
						titulo: p.titulo,
						prioridad: p.prioridad,
						asignadoId: p.asignadoId,
						creadorId: p.creadorId,
						recurrenteId: p.id,
						fecha: hoy,
						hora
					}
				});
			} catch (e) {
				// Otra petición la creó a la vez: la restricción única la rechaza y no pasa nada.
				if ((e as { code?: string }).code !== 'P2002') throw e;
			}
		}
	}
}
