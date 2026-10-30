declare global {
	namespace App {
		interface Locals {
			miembro: { id: number; nombre: string; avatar: string; rol: string; conFoto: boolean } | null;
		}
	}
}

export {};
