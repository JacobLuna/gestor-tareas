import { describe, expect, it } from 'vitest';
import { leerHoras, validarEvento } from './agenda';
import { diaSemana, esFechaISO, leerRegla, lunesDe, ocurreEn, sumarDias } from './fechas';

const form = (campos: [string, string][]) => {
	const f = new FormData();
	for (const [k, v] of campos) f.append(k, v);
	return f;
};

describe('fechas', () => {
	it('calcula día de la semana, suma días y lunes', () => {
		expect(diaSemana('2026-10-30')).toBe(5); // viernes
		expect(sumarDias('2026-10-30', 3)).toBe('2026-11-02');
		expect(sumarDias('2026-12-31', 1)).toBe('2027-01-01');
		expect(lunesDe('2026-10-30')).toBe('2026-10-26');
		expect(lunesDe('2026-11-01')).toBe('2026-10-26'); // domingo cuenta a la semana anterior
	});

	it('rechaza fechas inexistentes', () => {
		expect(esFechaISO('2026-02-30')).toBe(false);
		expect(esFechaISO('2026-2-3')).toBe(false);
		expect(esFechaISO('2026-02-28')).toBe(true);
	});

	it('ocurreEn respeta días y rango', () => {
		const lunVie = { dias: [1, 2, 3, 4, 5], desde: '2026-10-01', hasta: '2026-12-15' };
		expect(ocurreEn(lunVie, '2026-10-30')).toBe(true); // viernes
		expect(ocurreEn(lunVie, '2026-10-31')).toBe(false); // sábado
		expect(ocurreEn(lunVie, '2026-12-16')).toBe(false); // fuera de rango
		expect(ocurreEn({ dias: [5], desde: null, hasta: null }, '2030-01-04')).toBe(true);
	});

	it('leerRegla exige días y rango coherente', () => {
		expect(leerRegla(form([]), '2026-10-30').ok).toBe(false);
		expect(leerRegla(form([['dia', '1'], ['desde', '2026-11-05'], ['hasta', '2026-11-01']]), '2026-10-30').ok).toBe(false);
		expect(leerRegla(form([['dia', '3'], ['dia', '1'], ['dia', '1']]), '2026-10-30')).toEqual({
			ok: true,
			dias: [1, 3],
			desde: '2026-10-30',
			hasta: null
		});
	});
});

describe('leerHoras', () => {
	it('ordena, quita repetidas y vacías', () => {
		expect(leerHoras(form([['hora', '20:00'], ['hora', '08:00'], ['hora', ''], ['hora', '08:00']]))).toEqual({
			ok: true,
			horas: ['08:00', '20:00']
		});
	});
	it('rechaza horas mal formadas', () => {
		expect(leerHoras(form([['hora', '25:00']])).ok).toBe(false);
	});
});

describe('validarEvento', () => {
	const semanal: [string, string][] = [['titulo', ' Escuela '], ['inicio', '08:00'], ['fin', '14:00'], ['miembroId', '2'], ['dia', '1'], ['dia', '2']];

	it('acepta un bloque semanal', () => {
		const r = validarEvento(form(semanal), '2026-10-30');
		expect(r).toEqual({
			ok: true,
			evento: { titulo: 'Escuela', inicio: '08:00', fin: '14:00', miembroId: 2, fecha: null, dias: '1,2', desde: '2026-10-30', hasta: null }
		});
	});

	it('acepta un evento único con fecha y para toda la familia', () => {
		const r = validarEvento(
			form([['titulo', 'Dentista'], ['inicio', '16:00'], ['fin', '17:00'], ['modo', 'unico'], ['fecha', '2026-11-12']]),
			'2026-10-30'
		);
		expect(r.ok && r.evento.miembroId).toBeNull();
		expect(r.ok && r.evento.fecha).toBe('2026-11-12');
	});

	it('rechaza fin antes del inicio y título vacío', () => {
		expect(validarEvento(form([...semanal.slice(0, 1), ['inicio', '10:00'], ['fin', '09:00'], ['dia', '1']]), 'x').ok).toBe(false);
		expect(validarEvento(form([['titulo', ' '], ['inicio', '08:00'], ['fin', '09:00'], ['dia', '1']]), 'x').ok).toBe(false);
	});
});
