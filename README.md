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

## Formular-Backend aktivieren

Das Formular ist Formspree-kompatibel vorbereitet:

1. Kostenloses Konto auf [formspree.io](https://formspree.io) anlegen.
2. Neues Formular erstellen, Ziel-E-Mail:
   `maximilian.hempel@versicherungstech-magazin.de`.
3. In `index.html` die Konstante `FORM_ENDPOINT` (oben im
   `<script>`-Block) auf die Formular-URL setzen, z. B.
   `https://formspree.io/f/abcdwxyz` – oder alternativ vor dem Skript
   `window.VTM_FORM_ENDPOINT` definieren.

Es funktioniert jeder Endpoint, der ein JSON-POST mit
`{ name, company, email, message, konfiguration }` akzeptiert
(Getform, Basin, eigene API …). Solange kein Endpoint gesetzt ist,
öffnet das Formular als Fallback das E-Mail-Programm des Besuchers.

## Betrieb

Statische Seite – einfach `index.html` ausliefern (z. B. GitHub Pages,
Netlify oder ein beliebiger Webserver). Es sind keine Abhängigkeiten
oder Build-Schritte nötig; Schriften werden über Google Fonts geladen,
Logos über das bestehende VTM-CDN.

Alle Preise sind Netto-Preise zuzüglich Umsatzsteuer und werden im
Katalog-Array `CATALOG` in `index.html` gepflegt.
