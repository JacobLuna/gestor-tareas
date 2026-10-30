import { describe, expect, it } from 'vitest';
import { mismoOrigen } from './origen';

describe('mismoOrigen', () => {
	it('acepta el mismo host por http o https', () => {
		expect(mismoOrigen('http://192.168.1.50:3000', '192.168.1.50:3000')).toBe(true);
		expect(mismoOrigen('https://casa.local', 'casa.local')).toBe(true);
	});

	it('rechaza otro host, otro puerto, origen ausente o inválido', () => {
		expect(mismoOrigen('http://evil.com', '192.168.1.50:3000')).toBe(false);
		expect(mismoOrigen('http://192.168.1.50:4000', '192.168.1.50:3000')).toBe(false);
		expect(mismoOrigen(null, '192.168.1.50:3000')).toBe(false);
		expect(mismoOrigen('null', '192.168.1.50:3000')).toBe(false);
	});
});
