# VTM Angebotsplattform

Landingpage mit modularem Leistungs-Konfigurator für das
**VersicherungsTech Magazin (VTM)**. Kundinnen und Kunden stellen sich
ihre gewünschten VTM-Leistungen selbstständig zusammen, sehen live eine
Preisübersicht und senden ihre Konfiguration als unverbindliche Anfrage.

## Inhalt

- `index.html` – vollständige, selbstenthaltene Landingpage
  (HTML + CSS + Vanilla JS, keine Build-Tools, kein Framework).

## Funktionen

- **Modularer Konfigurator** in vier Kategorien:
  - Podcast & Audio (Quartalssponsoring Insurance Monday,
    Einzel-Episoden, Podcast Ads Pre-Roll)
  - Reichweite & Sichtbarkeit (Website-Banner, Website + App-Banner,
    Newsletter-Sponsoring) – Banner-Varianten schließen sich gegenseitig aus
  - Content & Thought Leadership (Fachartikel, Executive Interview,
    Case Study inkl. Lead-Liste, LinkedIn as a Service,
    Sponsored LinkedIn Posts)
  - Programm-Bausteine auf Anfrage (Marktcheck im Entscheider-Panel,
    Deep-Dive-Webinar, Expert Commentaries, Kategorie-Exklusivität)
- **Mengenrabatt-Logik** für Sponsored LinkedIn Posts:
  ab 5 Posts −10 %, ab 10 Posts −20 % (Ersparnis wird ausgewiesen).
- **Laufzeit-/Stückzahl-Stepper** je Leistung (Monate, Episoden, Pakete …).
- **Live-Zusammenfassung** als Sticky-Panel (Desktop) und
  Bottom-Bar (Mobile), Netto-Summe zzgl. USt.
- **Anfrage-Formular**: öffnet das E-Mail-Programm mit der kompletten
  Konfiguration als vorbereitete Nachricht; alternativ
  „Konfiguration kopieren".
- **Persistenz** der Auswahl über `localStorage`.
- **Jahresprogramme** (Category Presence, Authority Program,
  Startup Presence) als Teaser für geführte Zwölf-Monats-Programme.

## Design

Basiert auf dem **VTM Brand & Design System 4.2 „Luminous Editorial
Edition"**: Farbwelt (Deep Cobalt / Electric Blue / Brass), Typografie
(Plus Jakarta Sans, Inter, Source Serif 4, IBM Plex Mono), Brand Rail,
Hero-Atmosphäre, Signal-Linien und Card-Sprache.

## Betrieb

Statische Seite – einfach `index.html` ausliefern (z. B. GitHub Pages,
Netlify oder ein beliebiger Webserver). Es sind keine Abhängigkeiten
oder Build-Schritte nötig; Schriften werden über Google Fonts geladen,
Logos über das bestehende VTM-CDN.

Alle Preise sind Netto-Preise zuzüglich Umsatzsteuer und werden im
Katalog-Array `CATALOG` in `index.html` gepflegt.
