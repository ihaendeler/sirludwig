# Farbrechner und Anfrage

`/farbrechner` enthält den Rechner und die Erklärungen. `/deckanfrage` verlinkt darauf und zeigt übernommene Farbwerte als kompakte Zusammenfassung. Beide verwenden dasselbe Datenformat und Rechenmodell. Es werden keine zusätzlichen Dienste, Konten oder Abhängigkeiten benötigt.

## Fachlicher Umfang

Das Modell in `src/lib/color/model.ts` berechnet die mendelsche Vererbung von **E/e1**, **N/bs** und **N/S**. Es ist bewusst kein vollständiger Hundefarb- oder Zuchteignungsrechner. Ludwig vererbt aufgrund von Kb/Kb jedem Welpen Kb. Unter den berücksichtigten Allelen gilt:

- e1/e1: rotbasierte Farbgruppe (Rot, Apricot, Creme), ohne Vorhersage des Farbtons.
- E/e1 mit bs/bs: braune Grundfarbe.
- E/e1 ohne bs/bs: schwarze Grundfarbe innerhalb dieses Modells.
- S-Varianten werden separat als N/N, N/S und S/S ausgegeben. Daraus wird weder eine konkrete Weißzeichnung noch ein Weißanteil abgeleitet.

N beim B-Lokus bedeutet hier ausschließlich: keine Kopie von **bs**. Weitere Braunvarianten, weitere E-Varianten, Verdünnung, Aufhellung und genaue Zeichnung sind nicht modelliert. Mehrere unterschiedliche rezessive Varianten oder ungeklärte Phasen dürfen nicht als bs/bs eingetragen werden. Vor einer Erweiterung müssen Allele, Wechselwirkungen und die Interpretation der Befunde neu geprüft werden.

Die dokumentierten Ergebnisse in `src/data/health.ts` sind die Grundlage für den Rüden. Ein Guard lässt Build und Tests fehlschlagen, wenn sich e1/e1, N/bs, Kb/Kb oder N/S ändern, damit die Interpretation nicht unbemerkt veraltet.

Die Eingabe zeigt direkt drei Auswahlfelder für den Farbtest der Hündin. Es gibt keine Modusauswahl, Beispielvorlagen oder Herkunftsangaben. Der Rechner startet ohne vorausgewählte Werte. Grundfarben werden nach Auswahl von E- und B-Lokus angezeigt, die Verteilung der getesteten S-Variante nach Auswahl des S-Lokus. Fehlende Angaben bleiben in Oberfläche und Anfrage offen; es werden dort keine geschätzten Wahrscheinlichkeiten oder Spannen gezeigt. Der Rechenkern kann intern weiterhin mögliche Grenzen bestimmen. Bei vollständig ausgewählten Werten ergeben die Grundfarben zusammen 100 %. Wahrscheinlichkeiten gelten pro Welpe und sagen keine feste Zusammensetzung eines Wurfes voraus.

### Quellen

Die verwendeten Vererbungsregeln und die Grenzen der Interpretation wurden am 23.10.2026 mit den offiziellen Informationen des UC Davis Veterinary Genetics Laboratory abgeglichen:

- [E-Lokus / MC1R](https://vgl.ucdavis.edu/test/mc1r-dog)
- [Braun / TYRP1](https://vgl.ucdavis.edu/test/brown-dog)
- [Dominantes Schwarz / K-Lokus](https://vgl.ucdavis.edu/test/dominant-black)
- [Weißscheckung / MITF](https://vgl.ucdavis.edu/test/piebald-dog)

Die Ergebnisse des Rüden sind mit den auf der Gesundheitsseite verlinkten Originalbefunden abgeglichen. Das ist keine externe fachliche Freigabe des Rechners.

## Tuxedo verständlich erklären

`TuxedoGuide.astro` erläutert Grundfarbe und Zeichnung, den dokumentierten N/S-Befund, den Beitrag der Hündin und die Grenzen einer Vorhersage des sichtbaren Looks. Die Erklärung ist ausschließlich auf der Rechnerseite enthalten. Das Anfrageformular verlinkt dorthin. Die Genotyp-Tabelle verwendet dasselbe Modell wie der Rechner. Es wird keine Tuxedo-Wahrscheinlichkeit aus der S-Variante abgeleitet. N/N schließt andere Ursachen weißer Abzeichen nicht aus; S/S definiert keine feste Weißverteilung. Der Vorschlag, Familienfotos und bekannte Nachkommen einzubeziehen, ist eine praktische ergänzende Einordnung und keine validierte quantitative Prognose.

Zusätzliche Primärquellen (23.10.2026):

- [Embark: White Spotting](https://embarkvet.com/blogs/resources/embark-for-breeders-dog-dna-test-includes-white-spotting) – getestete MITF-Variante, andere Weißzeichnungen und Irish Spotting.
- [Schmutz et al. 2009: MITF and White Spotting in Dogs](https://doi.org/10.1093/jhered/esp029) – unterschiedliche Ausprägung und Vererbungsweisen in einer Untersuchung mehrerer Rassen. Aus diesen rasseübergreifenden Daten wird keine spezifische Quote für Ludwigs Tuxedo-Nachkommen abgeleitet.

Das **feste**, von den aktuellen Eingaben unabhängige Wurfbeispiel gilt für Ludwig N/S × Hündin N/N bei sechs Welpen. Unter der mendelschen Annahme unabhängiger Weitergabe mit p = 0,5 gilt P(X=k) = C(6,k) / 64. Die Gewichte 1, 6, 15, 20, 15, 6, 1 ergeben zusammen 64. Für genau drei N/S-Welpen gilt 20/64 = 31,25 %. Der Erwartungswert ist drei, aber keine garantierte Wurfaufteilung. Gezählt werden ausschließlich Genotypen, keine Tuxedo-Welpen; Rundungen können die Summe der angezeigten Prozente geringfügig verändern.

## Szenarien und Übergänge

Ein Szenario enthält ausschließlich die Version und drei Farbwerte (`v`, `e`, `b`, `s`). Eine noch nicht getroffene Auswahl wird intern mit `unknown` gespeichert. Die Oberfläche zeigt dafür „Bitte wählen“, Zusammenfassungen „Nicht angegeben“. Es gibt keine Einstufung als geprüft, Beispiel, angenommen oder eigener Befund.

- Alle drei Eingabefelder sind direkt sichtbar. Das Aussehen der Hündin erzeugt keine automatischen Werte.
- Es gibt keine Teilen-Funktion. Die URL-Parameter dienen weiterhin der Übergabe zwischen Rechner und Anfrage sowie dem Öffnen bisheriger Links. Sie enthalten ausschließlich die drei Farbwerte und die Version.
- „Mit dieser Kombination anfragen“ öffnet die Anfrage mit den ausgewählten Werten im Link.
- Das Formular enthält den Link „Zum Farbrechner und zur Erklärung“. Eine übernommene Berechnung zeigt nur die drei Farbwerte sowie „Berechnung ändern“ und „Berechnung entfernen“. „Berechnung ändern“ öffnet den eigenständigen Rechner mit den aktuellen Farbwerten. Die Rückkehr über dessen Anfrage-Schaltfläche übernimmt die geänderte Berechnung. Das Formular bleibt ohne Farbberechnung nutzbar.
- Formulareingaben werden vor dem Öffnen des Rechners und beim Verlassen der Anfrage zusätzlich im bestehenden Entwurf des Browser-Tabs gesichert. Beim Zurückwechseln werden die Angaben wiederhergestellt; persönliche Angaben gelangen dabei nicht in die URL. Eine neue Seitennavigation stellt die Zustimmung nicht wieder her.
- Änderungen aktualisieren die anonymen Szenariowerte der aktuellen URL. Entfernen und Löschen entfernen sie ebenfalls. So überschreibt ein alter Link beim Neuladen keine später bearbeitete Berechnung.
- Die API akzeptiert ein Szenario optional, validiert es und berechnet die E-Mail-Ergebnisse selbst. Mitgeschickte Prozentwerte und zusätzliche Metadaten werden ignoriert.
- Zusammenfassung und E-Mail enthalten die ausgewählten Farbwerte und berechenbaren Ergebnisse. Fehlende Werte werden ausdrücklich als fehlend angegeben.

Neue Links verwenden `v=2`. Gültige bisherige `v=1`-Links und gespeicherte Szenarien werden unter Beibehaltung ihrer drei Farbwerte in das neue Format überführt; die bisherigen Modus- und Herkunftsfelder entfallen dabei. Der bestehende Session-Speicherschlüssel bleibt für diese Migration erhalten. Die Rechenmodell-Version bleibt `1.0.0`, da die Vererbungsregeln unverändert sind. Unbekannte Versionen, doppelte relevante Query-Felder und nicht unterstützte Allele werden abgewiesen. Alte Szenarien müssen auch ihre bisherigen Formatregeln erfüllen.

## Entwürfe und Versand

Die Anfrage erhält Eingaben während des aktuellen Browser-Tabs über `sessionStorage`. Nur nach Auswahl von „Entwurf für später auf diesem Gerät speichern“ werden die erlaubten Felder zusätzlich lokal für sieben Tage gespeichert. Das gilt auch für Angaben aus deaktivierten Kontaktfeldern, die bei erneuter Auswahl wieder verfügbar sind. Es wird nichts im Hintergrund an einen Server gesendet.

Zustimmung, Honeypot und Absendezeitpunkt werden niemals aus einem Entwurf wiederhergestellt. Ungültige und abgelaufene dauerhafte Entwürfe werden beim Laden entfernt. „Entwurf löschen“ setzt die Eingaben zurück und entfernt beide Formularspeicher. Erfolgreicher Versand entfernt sie ebenfalls. Der anonyme Rechnerzustand ist davon unabhängig.

Der erste Formularschritt validiert die Angaben und zeigt eine bearbeitbare Zusammenfassung. Erst „Anfrage absenden“ startet den bestehenden Versand. Netzwerk- und API-Fehler erhalten die Eingaben. Die Backend-Validierung bleibt unabhängig von JavaScript aktiv.

## Prüfung

`npm test` prüft bekannte Kreuzungen, die Maskierung durch e1/e1, S-Vererbung, unbekannte Werte, Serialisierung, Übernahme alter Links und Wegfall der Herkunftsangaben, Entwurfsgrenzen sowie API-Validierung und serverseitige E-Mail-Ergebnisse. Versandtests verwenden einen simulierten Anbieter und versenden keine echte Nachricht. `npm run check` prüft Astro, Client-TypeScript und die Cloudflare Function; `npm run build` erzeugt die statische Website.

Bei Änderungen an der Bedienung zusätzlich den Weg Rechner → Anfrage → Bearbeiten, den Weg Anfrage → Rechner → Anfrage mit erhaltenen Formulareingaben, Feldfehler, Kontaktwechsel, Entwurf wiederherstellen/löschen, die erneute Zustimmung und die mobile Navigation im Browser prüfen.
