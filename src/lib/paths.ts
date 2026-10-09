import { resolve } from '$app/paths';

export function artistPath(id: number) {
	return resolve('/artist/[id]', { id: String(id) });
}

export function albumPath(id: number) {
	return resolve('/album/[id]', { id: String(id) });
}
