import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

export function hashPin(pin: string) {
	const sal = randomBytes(16);
	return `${sal.toString('hex')}:${scryptSync(pin, sal, 32).toString('hex')}`;
}

export function verificarPin(pin: string, guardado: string) {
	const [sal, hash] = guardado.split(':');
	const calculado = scryptSync(pin, Buffer.from(sal, 'hex'), 32);
	return timingSafeEqual(calculado, Buffer.from(hash, 'hex'));
}

// shortcut: contador en memoria, se pierde al reiniciar; con varias instancias moverlo a la DB.
const MAX_INTENTOS = 5;
const BLOQUEO_MS = 60_000;
const fallos = new Map<number, { n: number; hasta: number }>();

export const bloqueado = (id: number, ahora = Date.now()) => (fallos.get(id)?.hasta ?? 0) > ahora;

export function registrarFallo(id: number, ahora = Date.now()) {
	const n = (fallos.get(id)?.n ?? 0) + 1;
	fallos.set(id, n >= MAX_INTENTOS ? { n: 0, hasta: ahora + BLOQUEO_MS } : { n, hasta: 0 });
}

export const limpiarFallos = (id: number) => fallos.delete(id);
