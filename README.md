# sirludwig

Technisches Fundament für ein Astro-Projekt (TypeScript Strict), vorbereitet für GitHub und Cloudflare Pages.

## Voraussetzungen

- [Node.js](https://nodejs.org/) >= 22.12.0 (siehe `package.json` → `engines`)

## Installation

```bash
npm install
```

## Entwicklung

```bash
npm run dev
```

Der Entwicklungsserver startet standardmäßig unter `http://localhost:4321/`.

## Produktions-Build

```bash
npm run build
```

Der Build-Output liegt im Ordner `dist/`.

## Cloudflare Pages – Build Settings

| Einstellung | Wert |
|-------------|------|
| Framework preset | Astro |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node.js version | `22` oder höher |

Optional: Environment Variables über das Cloudflare Pages Dashboard setzen (z. B. `.env`-Werte für Production).

## Projektstruktur

```
src/
  components/   # Wiederverwendbare Komponenten
  layouts/      # Seitenlayouts
  pages/        # Routen
  styles/       # Globale Styles
public/
  images/       # Statische Bilder
  documents/    # Statische Dokumente
```
