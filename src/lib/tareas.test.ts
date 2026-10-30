import { describe, expect, it } from 'vitest';
import { esEstado, validarTarea } from './tareas';

describe('esEstado', () => {
	it('acepta solo estados del tablero', () => {
		expect(esEstado('en_curso')).toBe(true);
		expect(esEstado('borrada')).toBe(false);
		expect(esEstado(null)).toBe(false);
	});
});

describe('validarTarea', () => {
	it('acepta un título válido y recorta espacios', () => {
		expect(validarTarea('  Pagar luz ', 'alta')).toEqual({
			ok: true,
			tarea: { titulo: 'Pagar luz', prioridad: 'alta' }
		});
	});

	it('rechaza título vacío', () => {
		expect(validarTarea('   ', 'media')).toEqual({ ok: false, error: 'El título es obligatorio.' });
		expect(validarTarea(null, 'media').ok).toBe(false);
	});

	it('rechaza título demasiado largo', () => {
		expect(validarTarea('x'.repeat(121), 'media').ok).toBe(false);
	});

	it('rechaza prioridad desconocida', () => {
		expect(validarTarea('Algo', 'urgente').ok).toBe(false);
	});
});
