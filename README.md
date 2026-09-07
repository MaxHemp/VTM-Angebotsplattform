# VTM Angebotsplattform · Leistungskonfigurator 2.0

Landingpage mit Leistungskonfigurator für das **VersicherungsTech Magazin
(VTM)**, live unter angebote.versicherungstech-magazin.de. Kundinnen und
Kunden wählen aus den drei VTM-Leistungen der Mediadaten 2026 und den
Podcast-Formaten von Insurance Monday, sehen die Netto-Summe live und senden
ihre Konfiguration als unverbindliche Anfrage.

## Inhalt

- `index.html` – vollständige, selbstenthaltene Seite (HTML + CSS + Vanilla
  JS, kein Framework, kein Build-Schritt).
- `catalog.json` – **Single Source of Truth** für Leistungen, Preise,
  Detailtexte und Grundsätze (gilt auch für die Insurance-Monday-Seite).
- `scripts/sync-catalog.mjs` – schreibt den Katalog in beide Seiten.
- `assets/` – Bildmotive, Logos, OG-Bild.

## Leistungen (Mediadaten 2026)

**VTM-Leistungen** (ausschließlich die drei Bausteine der Mediadaten):

| Leistung | Preis | Menge im Konfigurator |
|---|---|---|
| Themenkampagne | 9.000 € einmalig, 6 bis 8 Wochen | Kampagnen (1 bis 4) |
| Führungskräfte-Kommunikation | 1.500 € pro Monat je Führungskraft | Führungskräfte (1 bis 5) × Monate (1 bis 24) |
| Themenpartnerschaft | 36.000 € pro Jahr (3.000 € pro Monat) | Jahre (1 bis 3) |

**Podcast · Insurance Monday** (Kooperationspartner, in der Seite als
Partnerschaft gekennzeichnet): Quartalssponsoring 30.000 €, Podcast-Episode
3.500 €, Pre-Roll-Paket 2.500 € (3 Episoden).

Alle Preise netto zuzüglich gesetzlicher Umsatzsteuer. Preisformel:
`unit × Menge` bzw. `unit × Führungskräfte × Monate`. Es gibt keine
Staffelrabatte, Presets oder Jahresprogramme mehr.

## Preispflege (beide Seiten)

Leistungen, Preise, Detailblöcke (PDF-Seiten 2 bis 4) und die Grundsätze der
Zusammenarbeit werden **nur in `catalog.json`** gepflegt. Danach:

```bash
# im VTM-Repo-Root, IM-Repo liegt daneben:
node scripts/sync-catalog.mjs ../inmo-angebotsplattform
```

Das Skript ersetzt in jeder Seite den JS-Katalog (`CATALOG:BEGIN/END`), die
statischen Karten in den `config-grid`-Containern (Gruppen laut
`data-catalog-order` am `<body>`: VTM `vtm,podcast`, IM `podcast,vtm`), die
Detailblöcke (`leistung-details`) und die Grundsätze (`principles`). Fehlt ein
Marker oder Container, bricht es mit Fehler ab. Danach beide Repos committen.

## Design

Umsetzung der **VTM Design Guidelines v6.1** (August 2026):

- Farben: Nachtblau `#0A1638` trägt, Kobalt `#1F4FA3` handelt (einziger
  Aktivfarbton), Gold `#D9A53C` belegt (nur Quellen und Marker, auf hellen
  Flächen als Textvariante `#8A6512`), Eisweiß `#F3F7FD` als Standardfläche.
- Schriften: Bricolage Grotesque Regular (Titel, Zahlen, nie fett),
  Instrument Sans (Text, UI), Newsreader Light kursiv (Unterzeilen),
  IBM Plex Mono (Kicker, Labels, Quellen). Geladen über Google Fonts.
- Bausteine: Fazitband je Sektion, Karte mit Icon-Chip, Kennzahl mit Einheit,
  Kontext und Gold-Quelle, Keymessage mit Kobalt-Rahmen und Gold-Punkt,
  Chevron-Bullets, Dreier-Karten nur mit Hero-Karte, Sandwich-Rhythmus
  (Hero dunkel, Inhalt hell, Keymessage dunkel).
- Web-Regeln: Inhaltsbreite 82 rem, Navigation 64 px weiß mit Kobalt-
  Unterstrich, Buttons 44 px, Karten 12 px Radius, WCAG 2.2 AA (Kontraste
  nachgerechnet), alles funktioniert ohne JavaScript und ohne Animation.

Token-Schichten im `<style>`-Block: primitiv (`--vtm-*`) → semantisch
(`--sem-*`) → Komponente.

## Bilder

- `assets/hero-skyline.webp` und `hero-skyline-mobile.webp`: freigegebenes
  Motiv „Skyline zur blauen Stunde" aus dem Design-System-Repo
  (`MaxHemp/vtm-design-system`), als Illustration gekennzeichnet.
- `assets/kontakt-hempel.webp`: Teamfoto Maximilian Hempel (echtes Foto).
- `assets/partner-insurance-monday.jpg`: Podcast-Cover des Kooperationspartners.
- `assets/vtm-logo-farbe.png`, `vtm-logo-weiss.png`: offizielle Wort-Bild-
  Marke; in der Seite als Data-URIs eingebettet (Nav farbig, Footer weiß).
- `assets/og-image.jpg`: Social-Vorschau, farbiges Logo auf Eisweiß.

## Formular-Backend

Das Formular sendet per `fetch` an Formspree (`https://formspree.io/f/mzdnvzqq`,
Konstante `FORM_ENDPOINT` in `index.html`) mit `konfiguration`, `quelle: "VTM"`
und Betreff-Prefix `[VTM Angebotsplattform]`. Ziel-Postfach
info@versicherungstech-magazin.de wird im Formspree-Dashboard verwaltet.
Schlägt der Versand fehl, bietet die Seite einen `mailto:`-Fallback an.

## Robustheit

Alle Karten, Preise, Detailblöcke und Grundsätze stehen statisch im HTML
(ohne JavaScript sichtbar). JavaScript hydratisiert nur Auswahl, Stepper,
Zusammenfassung, Persistenz (`localStorage`, Schlüssel `vtm-konfigurator-v2`)
und Formularversand.

## Betrieb

Statische Seite über GitHub Pages (Branch
`claude/vtm-leistungen-konfigurator-arw4vr`, Root), Custom Domain
angebote.versicherungstech-magazin.de (`CNAME`).
