const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });
const full = new Intl.NumberFormat('en');

/** 1234567 → "1.2M" */
export function short(n: number) {
	return compact.format(n);
}

/** 1234567 → "1,234,567" */
export function long(n: number) {
	return full.format(n);
}

/** 245 → "4:05" */
export function duration(seconds: number | null) {
	if (!seconds) return '';
	const m = Math.floor(seconds / 60);
	const s = String(seconds % 60).padStart(2, '0');
	return `${m}:${s}`;
}

export function totalDuration(seconds: number) {
	const m = Math.round(seconds / 60);
	return m >= 60 ? `${Math.floor(m / 60)} hr ${m % 60} min` : `${m} min`;
}

const dateFormat = new Intl.DateTimeFormat('en', {
	day: 'numeric',
	month: 'short',
	year: 'numeric',
	timeZone: 'UTC'
});

/** "2007-12-28" → "28 Dec 2007" */
export function releaseDate(iso: string) {
	return dateFormat.format(new Date(`${iso}T00:00:00Z`));
}

const RECORD_TYPES: Record<string, string> = {
	album: 'Album',
	ep: 'EP',
	single: 'Single',
	compile: 'Compilation'
};

export function recordType(type: string) {
	return RECORD_TYPES[type] ?? 'Release';
}
