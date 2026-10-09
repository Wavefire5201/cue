export interface Playable {
	id: number;
	title: string;
	artist: string;
	preview: string | null;
}

/**
 * One shared audio element for 30-second Deezer previews. Lives at module level so a preview
 * keeps playing while you browse, and starting a new track stops the previous one.
 */
class Player {
	current = $state<Playable | null>(null);
	playing = $state(false);
	/** 0–1 through the current preview. */
	progress = $state(0);

	#audio: HTMLAudioElement | null = null;

	#element() {
		if (this.#audio) return this.#audio;

		const audio = new Audio();
		audio.preload = 'none';
		audio.addEventListener('play', () => (this.playing = true));
		audio.addEventListener('pause', () => (this.playing = false));
		audio.addEventListener('timeupdate', () => {
			this.progress = audio.duration ? audio.currentTime / audio.duration : 0;
		});
		audio.addEventListener('ended', () => this.stop());
		// Preview URLs are signed and expire after ~15 minutes; a stale one just stops.
		audio.addEventListener('error', () => this.stop());

		this.#audio = audio;
		return audio;
	}

	toggle(track: Playable) {
		if (!track.preview) return;
		const audio = this.#element();

		if (this.current?.id === track.id) {
			if (audio.paused) audio.play().catch(() => this.stop());
			else audio.pause();
			return;
		}

		this.current = track;
		this.progress = 0;
		audio.src = track.preview;
		audio.play().catch((e: unknown) => {
			// Switching tracks quickly aborts the previous play() — that's expected.
			if (e instanceof DOMException && e.name === 'AbortError') return;
			this.stop();
		});
	}

	stop() {
		this.#audio?.pause();
		this.current = null;
		this.playing = false;
		this.progress = 0;
	}
}

export const player = new Player();
