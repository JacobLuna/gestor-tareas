/** El origen de la petición debe ser el mismo host al que se pidió, sin importar si es http o https. */
export function mismoOrigen(origin: string | null, host: string | null) {
	if (!origin || !host) return false;
	try {
		return new URL(origin).host === host;
	} catch {
		return false;
	}
}
