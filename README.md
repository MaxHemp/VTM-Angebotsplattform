# VTM Angebotsplattform

Landingpage mit modularem Leistungs-Konfigurator für das
**VersicherungsTech Magazin (VTM)**. Kundinnen und Kunden stellen sich
ihre gewünschten VTM-Leistungen selbstständig zusammen, sehen live eine
Preisübersicht und senden ihre Konfiguration als unverbindliche Anfrage.

## Inhalt

- `index.html` – vollständige, selbstenthaltene Landingpage
  (HTML + CSS + Vanilla JS, keine Build-Tools, kein Framework).

## Funktionen

- **Modularer Konfigurator** in vier Kategorien (Magazin-Leistungen
  zuerst, Podcast danach):
  - Magazin · Reichweite & Sichtbarkeit (Website-Banner,
    Website + App-Banner, Newsletter-Sponsoring) – Banner-Varianten
    schließen sich gegenseitig aus
  - Magazin · Content & Thought Leadership (Fachartikel, Executive
    Interview, Case Study inkl. Lead-Liste, LinkedIn as a Service,
    Sponsored LinkedIn Posts)
  - Podcast & Audio (Quartalssponsoring Insurance Monday,
    Einzel-Episoden, Podcast Ads Pre-Roll)
  - Programm-Bausteine auf Anfrage (Marktcheck im Entscheider-Panel,
    Deep-Dive-Webinar, Expert Commentaries, Kategorie-Exklusivität)
- **Conversion-Elemente**: Social-Proof-Band (Leserschaft), drei
  vorkonfigurierte „Beliebte Kombinationen" mit 1-Klick-Übernahme,
  Bestseller-/Beliebt-Badges, Einwand-FAQ, Reassurance-Microcopy an
  allen CTAs (Antwort in 24 h, keine Zahlungspflicht), Nav-CTA.
- **Mengenrabatt-Logik** für Sponsored LinkedIn Posts:
  ab 5 Posts −10 %, ab 10 Posts −20 % (Ersparnis wird ausgewiesen).
- **Laufzeit-/Stückzahl-Stepper** je Leistung (Monate, Episoden, Pakete …).
- **Live-Zusammenfassung** als Sticky-Panel (Desktop) und
  Bottom-Bar (Mobile), Netto-Summe zzgl. USt.
- **Anfrage-Formular mit echtem Backend**: sendet die Anfrage inkl.
  Konfiguration per `fetch` an einen konfigurierbaren
  Formular-Endpoint (Formspree-kompatibel, siehe unten) – mit
  Ladezustand, Erfolgsbestätigung, Fehlerbehandlung und
  Honeypot-Spamschutz. Ohne konfigurierten Endpoint fällt das Formular
  automatisch auf `mailto:` zurück. Zusätzlich zeigt eine
  Live-Vorschau am Formular die gewählte Konfiguration.
- **Persistenz** der Auswahl über `localStorage`.
- **Jahresprogramme** (Category Presence, Authority Program,
  Startup Presence) als Teaser für geführte Zwölf-Monats-Programme.

## Design

Basiert auf dem **VTM Brand & Design System 4.2 „Luminous Editorial
Edition"**: Farbwelt (Deep Cobalt / Electric Blue / Brass), Typografie
(Plus Jakarta Sans, Inter, Source Serif 4, IBM Plex Mono), Brand Rail,
Hero-Atmosphäre, Signal-Linien und Card-Sprache.

Moderne Design-Patterns (alle rein CSS/JS, keine Video-Assets):

- **Immersiver Full-Screen-Hero** mit Kinetic Type (gestaffelt
  aufsteigende Headline), animiertem Aurora-Hintergrund als
  performanter Video-Loop-Ersatz und Scroll-Cue.
- **Conversational Quickstart** im Hero: Prompt-Optik mit Ziel-Chips
  („Sichtbarkeit aufbauen", „Thought Leader werden" …), die per Klick
  das passende Startpaket in den Konfigurator laden.
- **Bento Grid** für den Warum-VTM-Abschnitt: modulare Kacheln
  unterschiedlicher Größe, dunkle Kachel mit leuchtender Akzentkante,
  Brass-Kachel für die 73-%-Studie.
- **Card Stacking (Story Stack)** für die Jahresprogramme: Karten
  schieben sich beim Scrollen per `position: sticky` übereinander;
  auf Mobile automatischer Reflow zum vertikalen Stapel.
- **KI-Video-Loop im Hero**: 6-Sekunden-Micro-Loop (Seedance 2.0 aus
  einem GPT-Image-2-Master-Motiv, identischer Start-/End-Frame =
  nahtlos). Lädt nur auf Desktop und ohne
  `prefers-reduced-motion`-Präferenz (JS injiziert die Quelle, Mobile
  lädt kein Video); Fallback ist die CSS-Aurora-Atmosphäre. Das
  Master-Standbild wird zusätzlich im Anfrage-Bereich wiederverwendet
  (konsistenter Bildstil, gleiche Szene an mehreren Stellen).
- **Maus-Parallax im Hero** (nur feine Zeiger, respektiert
  Reduced Motion): Video, Atmosphäre und Panel verschieben sich
  subtil gegenläufig zur Mausbewegung.
- **Soft Glassmorphism**: mattierte, halbtransparente Flächen mit
  `backdrop-filter` für Navigation, Hero-Panel, Mobile-Bar und Toasts.
- **Scroll Reveals** via `IntersectionObserver` – Inhalte sind ohne
  JavaScript und bei `prefers-reduced-motion` vollständig sichtbar.

## Formular-Backend

Das Formular sendet per `fetch` an Formspree
(`https://formspree.io/f/mzdnvzqq`, konfiguriert in der Konstante
`FORM_ENDPOINT` in `index.html`). Die Ziel-Adresse
`info@versicherungstech-magazin.de` wird im Formspree-Dashboard
verwaltet. Schlägt der Versand fehl, bietet das Formular automatisch
einen E-Mail-Fallback (`mailto:` an dieselbe Adresse) an.

Zum Austausch des Backends genügt es, `FORM_ENDPOINT` zu ändern – es
funktioniert jeder Endpoint, der ein JSON-POST mit
`{ name, company, email, message, konfiguration }` akzeptiert
(Getform, Basin, eigene API …).

## Robustheit (Progressive Enhancement)

Alle Leistungs- und Paketkarten stehen **statisch im HTML** – Inhalte,
Umfang und Preise sind auch ohne JavaScript sichtbar (wichtig für
SEO, restriktive Firmen-Browser und Datei-Vorschauen). JavaScript
„hydratisiert" die Karten nur noch: Auswahl, Stepper, Summen, Presets
und Formularversand. Die Preset-Preise im HTML werden bei aktivem
JavaScript aus dem Katalog nachgerechnet, damit statisches Markup und
Einzelpreise nie auseinanderlaufen (nach Preisänderungen im `CATALOG`
bitte auch die statischen Kartenpreise im HTML anpassen).

Die Bildmarke (Original-Dateien unter `assets/`) ist als optimierte
**Data-URI direkt in die Seite eingebettet** – Navigation und Favicon
farbig, Footer in Weiß, daneben die Text-Wortmarke. Keine externen
Bild-Requests, die Marke erscheint auch bei blockiertem CDN oder
strenger Content-Security-Policy. Bei einem Logo-Update die Dateien
in `assets/` ersetzen und die Base64-Werte in `index.html` neu
erzeugen (verkleinert auf ~144 px, transparenter Rand beschnitten). Das
Schnellstart-Feld im Hero ist ein echtes Eingabefeld: Freitext wird
in die Anfrage-Nachricht übernommen; erkennt die Seite ein Ziel
(Sichtbarkeit / Thought Leadership / maximale Präsenz), lädt sie
zusätzlich das passende Startpaket.

## Bilder

Drei editorial Bildmotive (mit Higgsfield generiert, VTM-Farbwelt) sind
eingebunden:

- **Podcast-Studio** – Hintergrund der großen Podcast-Kachel im
  Bento-Grid („35.000 Downloads").
- **Insurance-Innovation-Day / Konferenz** – Bildband über den
  Jahresprogrammen.
- **Business-Dialog** – Visual im Anfrage-Bereich.

Jedes Bild liegt hinter einem Gradient-Scrim (Textlesbarkeit) und über
einem Brand-Gradient-Fallback: Fällt ein Bild aus, bleibt die Sektion
im freigegebenen Design bestehen. Die Bilder werden aktuell vom
Higgsfield-CDN geladen (lazy). Für vollständige Selbstständigkeit die
drei Dateien nach `assets/` herunterladen und die `src`-URLs in
`index.html` auf die lokalen Pfade umstellen.

## Betrieb

Statische Seite – einfach `index.html` ausliefern (z. B. GitHub Pages,
Netlify oder ein beliebiger Webserver). Es sind keine Abhängigkeiten
oder Build-Schritte nötig; Schriften werden über Google Fonts geladen,
Logos über das bestehende VTM-CDN.

Alle Preise sind Netto-Preise zuzüglich Umsatzsteuer und werden im
Katalog-Array `CATALOG` in `index.html` gepflegt.
