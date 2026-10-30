import { createHash } from 'node:crypto';
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, request }) => {
	const foto = await db.foto.findUnique({ where: { miembroId: Number(params.id) } });
	if (!foto) error(404, 'Sin foto');
	const etag = `"${createHash('md5').update(foto.datos).digest('hex')}"`;
	const headers = {
		ETag: etag,
		'Cache-Control': 'private, no-cache',
		'X-Content-Type-Options': 'nosniff'
	};
	if (request.headers.get('if-none-match') === etag) return new Response(null, { status: 304, headers });
	return new Response(foto.datos, { headers: { ...headers, 'Content-Type': foto.tipo } });
};
