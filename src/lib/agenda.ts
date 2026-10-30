import { HORA, esFechaISO, leerRegla } from './fechas';

const MAX_HORARIOS = 8;

/** Horarios de una tarea recurrente (inputs `hora`). Sin ninguno, la tarea ocurre una vez al día sin hora. */
export function leerHoras(data: FormData): { ok: true; horas: string[] } | { ok: false; error: string } {
	const horas = data.getAll('hora').filter((h): h is string => typeof h === 'string' && h !== '');
	if (horas.some((h) => !HORA.test(h))) return { ok: false, error: 'Horario no válido.' };
	const unicas = [...new Set(horas)].sort();
	if (unicas.length > MAX_HORARIOS) return { ok: false, error: `Máximo ${MAX_HORARIOS} horarios por día.` };
	return { ok: true, horas: unicas };
}

export type NuevoEvento = {
	titulo: string;
	inicio: string;
	fin: string;
	miembroId: number | null;
	fecha: string | null;
	dias: string;
	desde: string | null;
	hasta: string | null;
};

/** Evento único (modo "unico", con fecha) o bloque semanal (modo "semanal", con días y rango). */
export function validarEvento(
	data: FormData,
	hoy: string
): { ok: true; evento: NuevoEvento } | { ok: false; error: string } {
	const t = data.get('titulo');
	const titulo = typeof t === 'string' ? t.trim() : '';
	if (!titulo) return { ok: false, error: 'El título es obligatorio.' };
	if (titulo.length > 80) return { ok: false, error: 'El título no puede pasar de 80 caracteres.' };

	const inicio = data.get('inicio');
	const fin = data.get('fin');
	if (typeof inicio !== 'string' || typeof fin !== 'string' || !HORA.test(inicio) || !HORA.test(fin)) {
		return { ok: false, error: 'Indica hora de inicio y fin.' };
	}
	if (fin <= inicio) return { ok: false, error: 'La hora final debe ser posterior a la inicial.' };

	const m = data.get('miembroId');
	const miembroId = m ? Number(m) : null;
	if (miembroId !== null && !Number.isInteger(miembroId)) return { ok: false, error: 'Integrante no válido.' };

	const base = { titulo, inicio, fin, miembroId };
	if (data.get('modo') === 'unico') {
		const fecha = data.get('fecha');
		if (!esFechaISO(fecha)) return { ok: false, error: 'Indica la fecha del evento.' };
		return { ok: true, evento: { ...base, fecha, dias: '', desde: null, hasta: null } };
	}
	const r = leerRegla(data, hoy);
	if (!r.ok) return r;
	return { ok: true, evento: { ...base, fecha: null, dias: r.dias.join(','), desde: r.desde, hasta: r.hasta } };
}
