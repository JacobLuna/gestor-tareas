export const PRIORIDADES = ['alta', 'media', 'baja'] as const;
export type Prioridad = (typeof PRIORIDADES)[number];

export const ESTADOS = ['pendiente', 'en_curso', 'hecha'] as const;
export type Estado = (typeof ESTADOS)[number];

export const esEstado = (v: FormDataEntryValue | null): v is Estado =>
	ESTADOS.includes(v as Estado);

type Quien = { id: number; rol: string };
type DeTarea = { asignadoId: number | null; creadorId: number | null };

/** El rol hijo solo atiende tareas: no crea ni asigna. */
export const puedeCrear = (m: Quien) => m.rol !== 'hijo';

/** Admin mueve todo; un miembro, lo asignado a él o lo que no es de nadie. */
export const puedeMover = (m: Quien, t: DeTarea) =>
	m.rol === 'admin' || t.asignadoId === null || t.asignadoId === m.id;

export const puedeBorrar = (m: Quien, t: DeTarea) => m.rol === 'admin' || t.creadorId === m.id;

export type NuevaTarea = { titulo: string; prioridad: Prioridad };

/** Valida el formulario de alta; devuelve la tarea limpia o el mensaje de error. */
export function validarTarea(
	titulo: FormDataEntryValue | null,
	prioridad: FormDataEntryValue | null
): { ok: true; tarea: NuevaTarea } | { ok: false; error: string } {
	const t = typeof titulo === 'string' ? titulo.trim() : '';
	if (!t) return { ok: false, error: 'El título es obligatorio.' };
	if (t.length > 120) return { ok: false, error: 'El título no puede pasar de 120 caracteres.' };
	if (!PRIORIDADES.includes(prioridad as Prioridad)) {
		return { ok: false, error: 'Prioridad no válida.' };
	}
	return { ok: true, tarea: { titulo: t, prioridad: prioridad as Prioridad } };
}
