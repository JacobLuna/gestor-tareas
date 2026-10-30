// El límite cabe en el BODY_SIZE_LIMIT por defecto de adapter-node (512 kB).
export const MAX_FOTO = 400 * 1024;

/** Detecta el tipo por los primeros bytes; nunca se confía en el tipo que declara el navegador. */
export function tipoDeImagen(b: Uint8Array): string | null {
	if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg';
	if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return 'image/png';
	const riff = String.fromCharCode(...b.slice(0, 4)) + String.fromCharCode(...b.slice(8, 12));
	return riff === 'RIFFWEBP' ? 'image/webp' : null;
}

/** Lee el campo de archivo del formulario. `foto: null` significa que no mandaron ninguna. */
export async function leerFoto(
	v: FormDataEntryValue | null
): Promise<
	{ ok: true; foto: { datos: Uint8Array<ArrayBuffer>; tipo: string } | null } | { ok: false; error: string }
> {
	if (!(v instanceof File) || v.size === 0) return { ok: true, foto: null };
	if (v.size > MAX_FOTO) return { ok: false, error: 'La foto pesa más de 400 KB.' };
	const datos = new Uint8Array(await v.arrayBuffer());
	const tipo = tipoDeImagen(datos);
	if (!tipo) return { ok: false, error: 'La foto debe ser JPG, PNG o WebP.' };
	return { ok: true, foto: { datos, tipo } };
}
