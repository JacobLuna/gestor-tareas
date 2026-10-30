import { describe, expect, it } from 'vitest';
import { validarMiembro } from './miembros';
import { tipoDeImagen } from './foto';
import { puedeBorrar, puedeCrear, puedeMover } from './tareas';
import { bloqueado, hashPin, limpiarFallos, registrarFallo, verificarPin } from './server/pin';

describe('validarMiembro', () => {
	it('acepta datos válidos y recorta el nombre', () => {
		expect(validarMiembro(' Ana ', '👩', '1234', 'miembro')).toEqual({
			ok: true,
			miembro: { nombre: 'Ana', avatar: '👩', pin: '1234', rol: 'miembro' }
		});
	});

	it('rechaza nombre vacío, avatar ajeno y PIN mal formado', () => {
		expect(validarMiembro('  ', '👩', '1234', 'miembro').ok).toBe(false);
		expect(validarMiembro('Ana', 'x', '1234', 'miembro').ok).toBe(false);
		expect(validarMiembro('Ana', '👩', '12a4', 'miembro').ok).toBe(false);
		expect(validarMiembro('Ana', '👩', '123', 'miembro').ok).toBe(false);
	});
});

describe('permisos de tareas', () => {
	const admin = { id: 1, rol: 'admin' };
	const hijo = { id: 2, rol: 'miembro' };

	it('el miembro solo mueve lo suyo o lo que no es de nadie', () => {
		expect(puedeMover(hijo, { asignadoId: 2, creadorId: 1 })).toBe(true);
		expect(puedeMover(hijo, { asignadoId: null, creadorId: 1 })).toBe(true);
		expect(puedeMover(hijo, { asignadoId: 3, creadorId: 2 })).toBe(false);
		expect(puedeMover(admin, { asignadoId: 3, creadorId: 2 })).toBe(true);
	});

	it('borra el admin o quien la creó', () => {
		expect(puedeBorrar(hijo, { asignadoId: 2, creadorId: 2 })).toBe(true);
		expect(puedeBorrar(hijo, { asignadoId: 2, creadorId: 1 })).toBe(false);
		expect(puedeBorrar(admin, { asignadoId: 2, creadorId: 1 })).toBe(true);
	});
});

describe('PIN', () => {
	it('verifica el correcto y rechaza el incorrecto', () => {
		const h = hashPin('1234');
		expect(verificarPin('1234', h)).toBe(true);
		expect(verificarPin('4321', h)).toBe(false);
	});

	it('bloquea tras 5 fallos y se libera con el tiempo', () => {
		const t = 1_000;
		for (let i = 0; i < 5; i++) registrarFallo(99, t);
		expect(bloqueado(99, t + 1)).toBe(true);
		expect(bloqueado(99, t + 61_000)).toBe(false);
		limpiarFallos(99);
	});
});

describe('tipoDeImagen', () => {
	it('detecta por firma y descarta lo demás', () => {
		expect(tipoDeImagen(Uint8Array.from([0xff, 0xd8, 0xff, 0xe0]))).toBe('image/jpeg');
		expect(tipoDeImagen(Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d]))).toBe('image/png');
		expect(tipoDeImagen(new TextEncoder().encode('RIFF\0\0\0\0WEBPVP8 '))).toBe('image/webp');
		expect(tipoDeImagen(new TextEncoder().encode('<svg xmlns="x"></svg>'))).toBeNull();
	});
});

describe('puedeCrear', () => {
	it('el rol hijo no crea ni asigna', () => {
		expect(puedeCrear({ id: 3, rol: 'hijo' })).toBe(false);
		expect(puedeCrear({ id: 2, rol: 'miembro' })).toBe(true);
		expect(puedeCrear({ id: 1, rol: 'admin' })).toBe(true);
	});
});
