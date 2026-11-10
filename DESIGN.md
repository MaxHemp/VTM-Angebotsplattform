# VTM-Angebote: räumlicher Einstieg und geführte Angebotsauswahl

## Recherche, 10. November 2026

- [VTM](https://www.versicherungstech-magazin.de/): fachliche Einordnung für die
  Versicherungswirtschaft; Magazin, Newsletter, Insurance Monday und 25 EXPERTS
  sind zusammengehörige Zugänge. VTM-Farben Navy `#0A1638`, Kobalt `#1F4FA3`,
  Signalgelb `#FFD700`; Bricolage Grotesque und Instrument Sans.
- [25 EXPERTS / Change Management](https://25-experts.de/editionen/change-management/):
  2./3. Dezember 2026, Köln, Rheinauhafen. Kuratierter Teilnehmerkreis, fachliche
  Arbeit und persönlicher Austausch über anderthalb Tage. Das Hauptsponsoring
  wird aus dem bestehenden Angebotskatalog übernommen. Der öffentliche
  Teilnehmerpreis ist kein Sponsoringpreis.
- [Lusion](https://lusion.co/): tatsächlich räumliche Objekte, Licht und Material,
  kontrollierte Kamerabewegung und unmittelbare Interaktion. Übernommen wird
  das Prinzip, keine abstrakten Formen oder fremde Markenästhetik.
- [Utsubo](https://www.utsubo.com/blog/immersive-storytelling-websites-guide):
  eine kurze, interaktive Geschichte mit erkennbarem nächsten Schritt statt
  einer passiven Effektfolge. Als Gestaltungsansatz genutzt, nicht als Beleg
  für garantierte Konversionen.
- [Three.js](https://threejs.org/manual/): echte Mesh-Geometrie, PBR-Materialien,
  Umgebungsausleuchtung und Schatten. Version 0.187.0, MIT, lokal gebündelt.

## Aufbau

1. Räumliche Formatvisualisierung: digitales Magazin, Studiomikrofon und ein
   Tisch mit 25 Plätzen. Vier anwählbare Blickwinkel, Drehen per Zeiger,
   Kamerafahrten. Die Szene visualisiert Formate und ist kein Produktfoto.
2. Drei Besuchswege: Sichtbarkeit, fachliche Vertiefung, persönliche Gespräche.
   Jede Ansicht erklärt Anlass, Ablauf und konkrete passende Einstiege.
   Einzelleistungen und große Programme haben gleichberechtigte Zugänge.
3. Kompakter Preisvergleich aller 15 Leistungen mit aufklappbarem Umfang,
   Ziel-/Budgetfilter und direkter Auswahl. Keine willkürlich hervorgehobenen
   Angebote. Individuell kalkulierte Angebote behalten ihre Kennzeichnung.
4. Konfigurator zeigt zunächst die eigene Auswahl, mit Mengen und Editionen.
   Der vollständige bestehende Konfigurator kann jederzeit eingeblendet werden.
   Die ausführliche Leistungsbibliothek ist weiterhin separat zugänglich.
5. Anfrage mit derselben automatisch übernommenen Auswahl.

## Technik und Grenzen

- Kein Framework-Wechsel, keine Laufzeit-Abfragen an externe 3D-CDNs.
- Three.js wird separat und erst bei Annäherung an den Header geladen.
  Pixeldichte maximal 1,5, Animation maximal rund 30 Bilder/Sekunde.
- Animation stoppt außerhalb des Sichtfelds und bei verborgenem Browserfenster.
  Pausentaste und Systemeinstellung für reduzierte Bewegung werden beachtet.
- Lokales Standbild für fehlendes WebGL oder JavaScript. Alle Preise und
  Leistungsumfänge bleiben ohne JavaScript lesbar; eine Anfrage ist weiterhin
  möglich. Das Video wird erst bei sichtbarer Eventansicht geladen und hat
  eigene Wiedergabesteuerung.
- Tabs sind mit Pfeiltasten, Home und End bedienbar. Inhalte stehen in HTML,
  nicht nur im Canvas. Monatspreise werden nie zu Laufzeitsummen kumuliert.
- Die zwei bisherigen generischen Formatfotos und die Original-Symbolszene von
  25 EXPERTS sind als KI-generierte Symbolbilder gekennzeichnet. Keine Darstellung
  wird als Foto tatsächlicher VTM-Mitarbeitender oder eines echten Events ausgegeben.

## Pflege und Prüfung

`pnpm install`, anschließend `pnpm run build:experience` bei Änderungen an
`scripts/experience.mjs` oder `scripts/spatial.mjs`. Das gebündelte Ergebnis in
`assets/` wird eingecheckt; GitHub Pages benötigt keinen Build-Schritt.

`node scripts/sync-catalog.mjs` nach Katalogänderungen; anschließend
`node scripts/sync-aliases.mjs`, damit ältere Einstiegsadressen dieselbe aktuelle
Seite zeigen. Texte der drei Besuchswege in `index.html` bei Preis- oder
Leistungsänderungen ebenfalls prüfen.

`node tests/configurator.cjs` prüft Angebote, Monatsraten, Auswahl, Speicherung,
Formular und Layout. `node tests/experience.cjs` prüft 3D-Blickwinkel,
Bewegungssteuerung, Besuchswege, Eventvideo, mobile Ansichten und WebGL-Ausfall.
Formularanfragen werden lokal abgefangen; es werden keine echten Anfragen versandt.
