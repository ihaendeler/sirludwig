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
  assets/
    images/           # Optimierte Bilder (Astro Image Pipeline)
      hero/           # Hero-Bilder der Startseite
      ludwig/         # Portraits und Ludwig-Bilder
      galerie/        # Galeriebilder
      ausstellungen/  # Ausstellungsfotos
      nachzucht/      # Nachzucht-Bilder
      gesundheit/     # Gesundheits- und Dokumentationsbilder
  components/         # Wiederverwendbare Komponenten (inkl. Brand.astro)
  config/             # Zentrale Konfiguration (Site, Navigation)
  layouts/            # Seitenlayouts
  pages/              # Routen
  styles/             # Globale Styles
public/
  documents/          # Statische Dokumente (PDFs etc.)
```

## Bildstruktur

Alle Fotos für die Website liegen unter `src/assets/images/`. Astro optimiert diese beim Build automatisch über die Image Pipeline (`astro:assets`).

### Ordner und Verwendung

| Ordner | Verwendung |
|--------|------------|
| `hero/` | Hero-Bilder auf der Startseite |
| `ludwig/` | Portraits und Hauptbilder von Ludwig |
| `galerie/` | Galeriebilder |
| `ausstellungen/` | Ausstellungsfotos |
| `nachzucht/` | Nachzucht-Bilder |
| `gesundheit/` | Gesundheits- und Dokumentationsbilder |

### Empfohlene Bildgrößen

**Hero-Bilder**

- Mindestens 2500 bis 3000 Pixel Breite

**Galeriebilder**

- Mindestens 2000 Pixel Breite

**Portraits**

- Mindestens 2000 Pixel Breite

### Dateiformat

- JPG oder JPEG
- Hohe Qualität
- Keine PNGs für Fotos

### Verwendung in Astro

```astro
---
import { Image } from 'astro:assets';
import heroImage from '../assets/images/hero/beispiel.jpg';
---

<Image
  src={heroImage}
  alt="Beschreibung"
  widths={[640, 960, 1280, 1920]}
  sizes="(max-width: 640px) 100vw, 1280px"
  loading="eager"
  decoding="async"
/>
```

Bilder aus `src/assets/` werden beim Build in moderne Formate konvertiert, in mehrere Größen gerendert und für Mobilgeräte optimiert ausgeliefert.

## Konfiguration

Zentrale Werte werden in `src/config/` gepflegt:

- `site.ts` — Site Name, URL, Brand Name, Social Media, Kontakt
- `navigation.ts` — Navigationspunkte für Header und Menü

## Branding

Die Marke folgt einem minimalistischen Premium-Ansatz — editorial, modern und zeitlos. Bewusst kein klassisches Hundezüchterdesign.

### Nicht verwendet

- Kronen, Wappen, Pfoten, Hundesilhouetten
- Goldoptik, Verläufe, dekorative Rahmen

### Markenbestandteile

| Element | Verwendung |
|---------|------------|
| **Wortmarke** | `SIR LUDWIG` + `by Flying Royals` — Komponente `Brand.astro`, Variante `full` |
| **Monogramm** | `SL` — Variante `monogram` in `Brand.astro` |
| **Favicon** | `public/favicon.svg` — cremefarbener Hintergrund (`#F4F0E8`), Monogramm in Dunkelbraun (`#4A3428`) |

### Farben

- Cream: `#F4F0E8`
- Brown: `#4A3428`

Zentrale Werte in `src/config/site.ts`: `brandName`, `brandTagline`, `brandMonogram`.

### Verwendung

```astro
---
import Brand from '../components/Brand.astro';
---

<Brand href="/" />
<Brand variant="monogram" />
```
