# VTM Angebotsplattform · Leistungskonfigurator 3.0

Statische Angebotsseite für VTM, Insurance Monday und 25 EXPERTS unter
https://angebote.versicherungstech-magazin.de/. HTML, CSS und Vanilla JavaScript;
kein Framework und kein Build-Schritt für die Veröffentlichung.

## Angebot

| Bereich | Leistung | Preis netto |
|---|---|---|
| VTM | Themenkampagne, 6–8 Wochen | 9.000 € einmalig |
| VTM | Themenpartnerschaft, 12 Monate | 36.000 € pro Jahr |
| Insurance Monday | Quartalssponsoring | 30.000 € pro Quartal |
| Insurance Monday | Podcast-Episode | 3.500 € pro Episode |
| Insurance Monday | Pre-Roll-Paket, 3 Episoden | 2.500 € pro Paket |
| 25 EXPERTS | Change Management, 2./3. Dezember 2026, Köln | 8.500 € pro Edition |
| 25 EXPERTS | Weitere Edition | Individuelles Angebot |
| Strategische Partnerschaft | Individuelles Programm | Individuelles Angebot |
| Ergänzungen | Marktbefragung, weitere Fallstudie/Webinar, Veranstaltungsbegleitung, eigene Fachveranstaltung, Rubrikensponsoring | Individuelles Angebot |
| Ergänzungen | Führungskräfte-Kommunikation | 1.500 € pro Monat je Führungskraft |

Alle Preise zuzüglich gesetzlicher Umsatzsteuer. Editionen und exklusive
Sponsoringplätze sind unverbindlich anfragbar; Verfügbarkeit und fachliche
Passung werden persönlich bestätigt. Ein Hauptsponsoring hat keinen Mengenzähler.
Der Preis und Umfang von Change Management gelten nicht automatisch für weitere Editionen.

## Pflege

- `catalog.json`: zentrale Datenquelle für Konfiguratorkarten, Preise, Editionen,
  VTM-/25-EXPERTS-Übersichtskarten, Leistungsdetails und Grundsätze.
- `scripts/sync-catalog.mjs`: schreibt diese Daten in `index.html`.
- `index.html`: Seitenstruktur, übrige redaktionelle Texte, Styles und Interaktion.
- `assets/`: bestehende VTM-Bilder sowie offizielle 25-EXPERTS-SVGs und lokale Schriften.

Nach Katalogänderungen:

```sh
node scripts/sync-catalog.mjs
```

Die generierte Seite wird mit eingecheckt. Wiederholtes Synchronisieren ist
idempotent. Übersichtskarten und Konfigurator beziehen ihre Daten aus demselben
Katalog. Editorialtexte außerhalb der markierten Container werden direkt in
`index.html` gepflegt. Der neue Katalog hat fünf Gruppen. Andere Angebotsseiten
werden nicht automatisch geändert; vor einer Übernahme müssen deren Layout und
Konfigurator dieselben Gruppen und individuellen Preisarten unterstützen.

## Konfigurator

Festpreise werden nach Menge bzw. Personen × Monaten gerechnet. `unit: null`
bezeichnet ein individuelles Angebot, niemals einen Preis von 0 €. Bei Editionen
entscheidet der ausgewählte Eintrag über Preis, Beschreibung und enthaltene
Leistungen. Die bekannte Preissumme und offene Positionen erscheinen konsistent
in Übersicht, mobiler Leiste, Kopiertext und Formular.

Enthaltene Interviews/Webinare werden erläutert. Zusätzliche Module erweitern
den Umfang. Bei einer strategischen Partnerschaft dient die weitere Auswahl als
Grundlage für ein individuell abgestimmtes Gesamtangebot; es wird kein automatischer
Rabatt oder eine pauschale Doppelbereinigung erfunden.

Auswahl wird unter `vtm-konfigurator-v3` in localStorage gespeichert. Alte v2-Auswahlen
werden wegen des geänderten Leistungsumfangs nicht übernommen. Ungültige Mengen,
Editionen und unbekannte IDs werden normalisiert oder verworfen. Ohne JavaScript
bleiben Leistungen und Preise lesbar; das Formular erlaubt eine manuell beschriebene Anfrage.

## Anfrageformular

Unverändert Formspree (`https://formspree.io/f/mzdnvzqq`), Quelle `VTM`,
Betreffpräfix `[VTM Angebotsplattform]`. Bei Fehlern erscheint ein E-Mail-Fallback
mit der vollständigen Konfiguration. Doppelklicks während des Versands sind gesperrt.
Das tatsächliche Zielpostfach wird weiterhin im Formspree-Dashboard verwaltet.

## Prüfen

Node.js und die Entwicklungsabhängigkeit `playwright` installieren, dann die
Seite lokal z. B. mit `python -m http.server 8765 --bind 127.0.0.1` bereitstellen:

```sh
npm install
npm test
```

Die Tests verwenden vorhandenes Chrome. Optional: `CHROME_PATH` setzt den
Browserpfad, `TEST_URL` die Testadresse, `TEST_OUTPUT` das Verzeichnis für Screenshots.
Geprüft werden Preise, individuelle Angebote, Editionswechsel, Auswahl/Persistenz,
Tastaturbedienung, Kopieren, Formularvalidierung, Fehler- und Erfolgsantworten,
Anker, Bilder, JavaScript-Fehler, Layoutbreiten von 320 bis 1440 Pixeln und die
statische Darstellung ohne JavaScript. Alle Formspree-Anfragen werden lokal
abgefangen; Tests senden keine echten Nachrichten.

## Marken und Veröffentlichung

VTM bleibt im bestehenden Design (Nachtblau, Kobalt, Gold). Der eigenständige
25-EXPERTS-Bereich verwendet Tinte `#0B1F26`, Petrol `#0B6470`, Signal `#E4572E`
und Papier `#FBFAF6`, Plus Jakarta Sans und Source Serif 4. Die lokal bereitgestellten
Markendateien werden unverändert übernommen. Kundenverträge und individuelle
Kundenpreise sind nicht Bestandteil der Website oder des Repositorys.

GitHub Pages veröffentlicht den Root des Branches
`claude/vtm-leistungen-konfigurator-arw4vr`. `CNAME` enthält die bestehende Domain.
Nach dem Push den Pages-Build und die tatsächliche Website prüfen.
