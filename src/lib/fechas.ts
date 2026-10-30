// Las fechas viajan como texto "AAAA-MM-DD" en hora local, así se comparan y ordenan como cadenas.
export const DIAS_CORTO = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
export const ORDEN_SEMANA = [1, 2, 3, 4, 5, 6, 0];
export const HORA = /^([01]\d|2[0-3]):[0-5]\d$/;

const pad = (n: number) => String(n).padStart(2, '0');
const aFecha = (iso: string) => {
	const [y, m, d] = iso.split('-').map(Number);
	return new Date(y, m - 1, d);
};

export const aISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const hoyISO = () => aISO(new Date());

export const esFechaISO = (v: unknown): v is string =>
	typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && aISO(aFecha(v)) === v;

export const diaSemana = (iso: string) => aFecha(iso).getDay();

export function sumarDias(iso: string, n: number) {
	const d = aFecha(iso);
	d.setDate(d.getDate() + n);
	return aISO(d);
}

export const lunesDe = (iso: string) => sumarDias(iso, -((diaSemana(iso) + 6) % 7));

export const parseDias = (s: string) => (s ? s.split(',').map(Number) : []);

export type Regla = { dias: number[]; desde: string | null; hasta: string | null };

export const ocurreEn = (r: Regla, iso: string) =>
	r.dias.includes(diaSemana(iso)) && (!r.desde || iso >= r.desde) && (!r.hasta || iso <= r.hasta);

/** Lee días (checkboxes `dia`, 0-6) y el rango opcional desde/hasta de un formulario. */
export function leerRegla(
	data: FormData,
	hoy: string
): { ok: true; dias: number[]; desde: string; hasta: string | null } | { ok: false; error: string } {
	const dias = [...new Set(data.getAll('dia').map(Number))].filter((d) => Number.isInteger(d) && d >= 0 && d <= 6);
	if (!dias.length) return { ok: false, error: 'Elige al menos un día de la semana.' };
	const d = data.get('desde');
	const h = data.get('hasta');
	const desde = d ? d : hoy;
	const hasta = h ? h : null;
	if (!esFechaISO(desde) || (hasta !== null && !esFechaISO(hasta))) return { ok: false, error: 'Fecha no válida.' };
	if (hasta !== null && hasta < desde) return { ok: false, error: 'La fecha final es anterior a la inicial.' };
	return { ok: true, dias: dias.sort(), desde, hasta };
}
