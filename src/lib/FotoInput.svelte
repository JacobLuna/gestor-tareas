<script lang="ts">
	const LADO = 256;

	// Reduce la foto a LADO×LADO (recorte centrado, JPEG) antes de subirla: las del celular pesan MB.
	// Si el navegador no puede decodificarla, se deja tal cual y el servidor decide.
	async function reducir(e: Event & { currentTarget: HTMLInputElement }) {
		const input = e.currentTarget;
		const archivo = input.files?.[0];
		if (!archivo) return;
		try {
			const img = await createImageBitmap(archivo);
			const lado = Math.min(img.width, img.height);
			const canvas = document.createElement('canvas');
			canvas.width = canvas.height = LADO;
			canvas
				.getContext('2d')!
				.drawImage(img, (img.width - lado) / 2, (img.height - lado) / 2, lado, lado, 0, 0, LADO, LADO);
			const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/jpeg', 0.85));
			if (!blob) return;
			const dt = new DataTransfer();
			dt.items.add(new File([blob], 'foto.jpg', { type: 'image/jpeg' }));
			input.files = dt.files;
		} catch {
			/* sin cambios */
		}
	}
</script>

<input type="file" name="foto" accept="image/jpeg,image/png,image/webp" onchange={reducir} />
