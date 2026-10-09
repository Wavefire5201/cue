# Cue

Minimal artist and album search, built with SvelteKit and the [Deezer API](https://developers.deezer.com/api).

- Search artists or albums
- Artist pages: popular tracks with 30-second previews, discography, related artists
- Album pages: tracklist, release date, length, genres
- Light and dark themes

## How it works

A client-rendered SvelteKit (Svelte 5) single-page app with hand-written CSS. Deezer sends no
CORS headers, so data is loaded with JSONP straight from the browser (`src/lib/deezer.ts`). No
API key or backend is needed. Shared state lives in `src/lib/state/`.

## Develop

```sh
bun install
bun run dev
```

`bun run check` type-checks, `bun run build` builds for Vercel.

## Deploy

Import the repo in Vercel. No environment variables needed.
