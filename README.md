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

Der Deckanfrage-Versand läuft über eine **Cloudflare Pages Function** unter `functions/api/deckanfrage.ts` (Route: `/api/deckanfrage`). Der Resend-Key wird als Cloudflare-Secret **`deckanfragen_send`** gelesen (alternativ `RESEND_API_KEY`).

Optional: Environment Variables über das Cloudflare Pages Dashboard setzen (Settings → Variables & Secrets).

### Deckanfrage (Resend)

| Variable | Beschreibung |
|----------|--------------|
| `deckanfragen_send` | Resend API-Schlüssel (Secret in Cloudflare Pages, Production) |

In Cloudflare Pages unter **Settings → Variables and Secrets** hinterlegen:

1. **Add** → **Secret**
2. Name: `deckanfragen_send`
3. Wert: dein Resend-Key (`re_…`)
4. Environment: **Production** (und optional Preview)
5. Nach dem Speichern: **Retry deployment** oder Push auf `main`

Alternativ funktioniert auch der Name `RESEND_API_KEY`.

CLI:

```bash
npx wrangler pages secret put deckanfragen_send --project-name=sirludwig
```

Optional:

| Variable | Beschreibung |
|----------|--------------|
| `RESEND_FROM_EMAIL` | Verifizierte Absenderadresse in Resend (Standard: `Sir Ludwig Website <noreply@sirludwig.de>`) |

Lokal: `.dev.vars` anlegen (siehe `.dev.vars.example`):

```env
deckanfragen_send=re_dein_key_hier
```

Ohne gesetztes Secret erscheint beim Absenden eine klare Hinweismeldung.

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

## Open Graph Bild (`public/og.jpg`)

Das Share-Bild für WhatsApp, Facebook, Telegram, LinkedIn und X wird beim Build automatisch erzeugt.

### Hero-Quelle

- Pfad: `src/assets/images/hero/PXL_20260516_084223542.jpg`
- Verwendung auf der Startseite als Hero-Foto

### Generierung

```bash
npm run generate:og   # manuell
npm run build         # läuft automatisch via prebuild-Hook
```

Skript: `src/scripts/generate-og.ts`

- Zuschnitt **1200 × 630 px** (Landscape) aus dem Hero-Bild
- Hund rechts, Markentext links unten auf dezentem Cream-Verlauf
- Ausgabe: `public/og.jpg` (stabile URL, kein Hash im Dateinamen)

SEO-Metadaten (`og:image`, `twitter:image`) verweisen über `defaultOgImage` in `src/config/site.ts` auf `/og.jpg`.

### Anpassen

| Änderung | Wo |
|----------|-----|
| Anderes Quellfoto | `HERO_IMAGE_REL` in `src/scripts/generate-og.ts` |
| Texte / Farben | Konstanten am Anfang von `generate-og.ts` |
| Bildausschnitt | `FOCAL_Y_RATIO` oder Crop-Logik in `cropHeroPhoto()` |
| Overlay-Layout | Funktion `buildOverlaySvg()` |

Nach Änderungen `npm run generate:og` ausführen und `public/og.jpg` prüfen.

## Bildsignatur

Die Bildsignatur ist **kein Wasserzeichen** und kein Diebstahlschutz. Sie wirkt wie die dezente Signatur eines Fotografen, Künstlers oder Gestüts — ein zurückhaltendes Markenelement auf ausgewählten Fotos.

### Zweck

- Einheitliche, hochwertige Kennzeichnung editorialer Bilder
- Wiedererkennung der Marke ohne Dominanz über das Motiv
- Visuelle Verbindung zu Favicon und Monogramm der Website

### Einsatzbereiche (geplant)

| Bereich | Signatur |
|---------|----------|
| Galerie | ja |
| Ausstellungen | ja |
| Nachzucht | ja |
| Hero / Startseite | nein |
| Open Graph (`og.jpg`) | nein |
| Gesundheitsdokumente | nein |
| Stammbaumgrafiken | nein |

### Dateien

Alle Varianten liegen unter `public/branding/`:

| Datei | Inhalt | Einsatz |
|-------|--------|---------|
| `signature.svg` | **SL** Monogramm in Dunkelbraun (`#4A3428`) | Standard — helle bis mittlere Bildbereiche |
| `signature-light.svg` | **SL** in Cremeweiß (`#F4F0E8`) | Dunkle Bildbereiche |
| `signature-wordmark.svg` | **SIR LUDWIG** Wortmarke | Alternative bei großzügigem Rand |
| `signature-full.svg` | **SL** + *by Flying Royals* | Alternative mit Herkunftshinweis |

### Platzierungskonzept (für spätere Umsetzung)

- Position: unten rechts
- Abstand zum Rand: 24–40 px (responsive skalieren)
- Deckkraft: 20–35 %
- Kein Hintergrund, keine Box, keine Umrandung, kein Schatten

### Varianten — Empfehlung

| Variante | Charakter | Bewertung |
|----------|-----------|-----------|
| **SL Monogramm** (`signature.svg`) | Kompakt, zeitlos, analog zum Favicon | **Empfohlen** — passt am besten zur bestehenden Website und wirkt am natürlichsten wie eine Fotografensignatur |
| SIR LUDWIG Wortmarke | Lesbarer, aber breiter und präsenter | Für große Formate oder wenn der Name explizit sichtbar sein soll |
| SL + by Flying Royals | Herkunft erkennbar, etwas mehr Höhe | Für formale Kontexte (z. B. Ausstellungen), wenn etwas mehr Marke erlaubt ist |

**Empfehlung:** `signature.svg` (SL) als Standard. Auf dunklen Bildpartien `signature-light.svg` wählen — nicht beide gleichzeitig überlagern.

### Spätere automatische Anwendung (noch nicht aktiv)

Aktuell werden **keine Bilder verändert**. Für eine spätere Integration sind zwei Wege denkbar:

**1. CSS-Overlay in der Galerie (bevorzugt für die Website)**

```html
<figure class="gallery-photo">
  <img src="…" alt="…" />
  <img
    class="gallery-photo__signature"
    src="/branding/signature.svg"
    alt=""
    aria-hidden="true"
  />
</figure>
```

```css
.gallery-photo {
  position: relative;
}

.gallery-photo__signature {
  position: absolute;
  right: clamp(1.5rem, 4vw, 2.5rem);
  bottom: clamp(1.5rem, 4vw, 2.5rem);
  width: clamp(2.5rem, 6vw, 4rem);
  height: auto;
  opacity: 0.28;
  pointer-events: none;
}
```

Bei dunklem Untergrund `signature-light.svg` per Klasse tauschen.

**2. Build-Zeit-Compositing (für exportierte Dateien)**

Analog zu `src/scripts/generate-og.ts` könnte ein separates Skript die SVG mit Sharp auf Galerie-Assets compositen — nur für Bereiche Galerie, Ausstellungen und Nachzucht. Nicht für Hero, OG oder Dokumente.

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
| **Bildsignatur** | `public/branding/signature.svg` — dezentes SL-Monogramm für Galerie, Ausstellungen, Nachzucht (siehe Abschnitt *Bildsignatur*) |
| **Favicon** | `public/favicon.svg` — cremefarbener Hintergrund (`#F4F0E8`), Monogramm in Dunkelbraun (`#4A3428`) |

### Favicon und App Icons

Basis ist das bestehende **SL-Monogramm** in `public/favicon.svg` — unverändertes Branding, keine Neugestaltung.

Alle Raster- und App-Icons werden daraus automatisch erzeugt und liegen in `public/`:

| Datei | Verwendung |
|-------|------------|
| `favicon.svg` | Moderne Browser |
| `favicon.ico` | Legacy-Browser (16 + 32 px) |
| `favicon-16x16.png` / `favicon-32x32.png` | Tab-Icons |
| `apple-touch-icon.png` | iOS / iPadOS (180×180) |
| `android-chrome-192x192.png` / `android-chrome-512x512.png` | Android / PWA |
| `site.webmanifest` | Web App Manifest |

Generierung:

```bash
npm run generate:icons   # manuell
npm run build            # automatisch via prebuild
```

Skript: `src/scripts/generate-favicons.ts`

**Bei Änderungen am Favicon** zuerst `public/favicon.svg` anpassen, dann `npm run generate:icons` ausführen — alle Größen und `favicon.ico` werden neu erzeugt. Einbindung in `src/layouts/BaseLayout.astro`.

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
