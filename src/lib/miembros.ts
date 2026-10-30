export const AVATARES = ['🧔', '👩', '👨', '👦', '👧', '👶', '👴', '👵', '🐶', '🐱', '🦊', '🐼'] as const;
export const ROLES = ['admin', 'miembro', 'hijo'] as const;
export type Rol = (typeof ROLES)[number];

export const esRol = (v: FormDataEntryValue | null): v is Rol => ROLES.includes(v as Rol);

export type NuevoMiembro = { nombre: string; avatar: string; pin: string; rol: Rol };

const PIN = /^\d{4}$/;

export const validarPin = (pin: FormDataEntryValue | null) =>
	typeof pin === 'string' && PIN.test(pin);

/** Valida el alta de un integrante; el rol llega ya decidido por quien llama. */
export function validarMiembro(
	nombre: FormDataEntryValue | null,
	avatar: FormDataEntryValue | null,
	pin: FormDataEntryValue | null,
	rol: Rol
): { ok: true; miembro: NuevoMiembro } | { ok: false; error: string } {
	const n = typeof nombre === 'string' ? nombre.trim() : '';
	if (!n) return { ok: false, error: 'El nombre es obligatorio.' };
	if (n.length > 30) return { ok: false, error: 'El nombre no puede pasar de 30 caracteres.' };
	if (!AVATARES.includes(avatar as (typeof AVATARES)[number])) {
		return { ok: false, error: 'Avatar no válido.' };
	}
	if (!validarPin(pin)) return { ok: false, error: 'El PIN debe tener 4 dígitos.' };
	return { ok: true, miembro: { nombre: n, avatar: avatar as string, pin: pin as string, rol } };
}
