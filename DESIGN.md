# VTM-Angebote: räumlicher Einstieg und geführte Angebotsauswahl

## Recherche, 10. November 2026

- [VTM](https://www.versicherungstech-magazin.de/): fachliche Einordnung für die
  Versicherungswirtschaft; Magazin, Newsletter, Insurance Monday und 25 EXPERTS
  sind zusammengehörige Zugänge. Für Farben und Schriftrollen gilt die
  bereitgestellte Fassung der VTM Design Guidelines v6.2; siehe BRAND.md.
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

1. Breite, gleichwertige Medienübersicht: VTM-Display, das Originalcover von
   Insurance Monday mit einem kleinen Mikrofon am Tischständer sowie ein
   Bildmotiv von 25 EXPERTS. Die drei Bereiche sind räumlich getrennt und
   verdecken einander nicht. Mobil wird die Komposition neu angeordnet.
   Vier anwählbare Blickwinkel; die Einzelansichten stellen das jeweilige
   Medium frei. Die Szene visualisiert Formate und ist kein Produktfoto.
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
`scripts/experience.mjs`, `scripts/spatial.mjs` oder `scripts/studio-objects.mjs`. Das gebündelte Ergebnis in
`assets/` wird eingecheckt; GitHub Pages benötigt keinen Build-Schritt.

`node scripts/sync-catalog.mjs` nach Katalogänderungen; anschließend
`node scripts/sync-aliases.mjs`, damit ältere Einstiegsadressen dieselbe aktuelle
Seite zeigen. Texte der drei Besuchswege in `index.html` bei Preis- oder
Leistungsänderungen ebenfalls prüfen.

`node tests/configurator.cjs` prüft Angebote, Monatsraten, Auswahl, Speicherung,
Formular und Layout. `node tests/experience.cjs` prüft 3D-Blickwinkel,
Bewegungssteuerung, Besuchswege, Eventvideo, mobile Ansichten und WebGL-Ausfall.
Formularanfragen werden lokal abgefangen; es werden keine echten Anfragen versandt.

## Material- und Kameraüberarbeitung, 10. November 2026

Die elliptische Bühne, der Goldrand, das dicke Buch und die Miniaturbestuhlung
sind entfernt. Die Studioobjekte sind ungefähr im Maßstab 1 Einheit = 10 cm
modelliert. Das Mikrofon hat eine eigene Schaumstoffstruktur, ein pulverbeschichtetes
Gehäuse, Befestigungsschrauben, einen Bügel, einen verbundenen Gelenkarm und
Kabel. Das Display besteht aus einem schlanken Metallkörper, einer selbstleuchtenden
Bildfläche und einer separaten, schwach reflektierenden Glasschicht. 25 EXPERTS
wird durch ein Bildmotiv des Formats dargestellt, nicht als verkleinerter Raum.

Flächenlichter, eine kontrollierte Umgebungsbeleuchtung und weiche Bodenschatten
sorgen für die Materialzeichnung. Die Objekte bewegen sich nicht gegeneinander;
der Blickwinkel reagiert zurückhaltend auf die Eingabe. Ein neues, versioniertes
Standbild zeigt dieselbe Szene auch bei fehlendem WebGL oder JavaScript.

## Verbindlicher Markenabgleich, v6.2

Die bereitgestellten VTM Design Guidelines v6.2 sind die verbindliche Quelle
für den Farb- und Schriftabgleich. Kobalt #1F4FA3 ist die Aktionsfarbe, Gold
#D9A53C bleibt auf Belege bzw. Unterzeilen beschränkt. Auf dunklen Flächen
stehen Links in #8FB0F0. Die zuvor von der Website abgeleitete gelbe
Signalfarbe wird nicht weiter eingesetzt.

Die weiße Navigation ist inklusive Hairline 64 px hoch. Das originale
farbige VTM-Logo führt; UI verwendet Instrument Sans mit 14–16 px.
Das Smartphone-Menü öffnet als Disclosure, schließt bei Linkwahl oder
Escape und verändert die Höhe der Leiste nicht. Bricolage-Titel stehen
in Regular, der Payoff in Newsreader Light Italic.

Die Markenassets aus den Seiten 5 und 6 wurden ohne Zuschnitt, Neusatz oder
Farbänderung aus den eingebetteten Originalbildern extrahiert. Das Cover
von Insurance Monday bleibt vollständig und quadratisch. Herkunft und
Prüfsummen dokumentiert BRAND.md. Die PDF selbst wird nicht veröffentlicht.

Desktop und Smartphone haben getrennte Standbilder, damit die neue
Anordnung auch ohne JavaScript oder WebGL sichtbar bleibt.
