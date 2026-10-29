export const PRIORIDADES = ['alta', 'media', 'baja'] as const;
export type Prioridad = (typeof PRIORIDADES)[number];

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
