# Farbrechner und Anfrage

`/farbrechner` und der aufklappbare Rechner unter `/deckanfrage` verwenden dieselbe Komponente und dasselbe Rechenmodell. Es werden keine zusätzlichen Dienste, Konten oder Abhängigkeiten benötigt.

## Fachlicher Umfang

Das Modell in `src/lib/color/model.ts` berechnet die mendelsche Vererbung von **E/e1**, **N/bs** und **N/S**. Es ist bewusst kein vollständiger Hundefarb- oder Zuchteignungsrechner. Ludwig vererbt aufgrund von Kb/Kb jedem Welpen Kb. Unter den berücksichtigten Allelen gilt:

- e1/e1: rotbasierte Farbgruppe (Rot, Apricot, Creme), ohne Vorhersage des Farbtons.
- E/e1 mit bs/bs: braune Grundfarbe.
- E/e1 ohne bs/bs: schwarze Grundfarbe innerhalb dieses Modells.
- S-Varianten werden separat als N/N, N/S und S/S ausgegeben. Daraus wird weder eine konkrete Weißzeichnung noch ein Weißanteil abgeleitet.

N beim B-Lokus bedeutet hier ausschließlich: keine Kopie von **bs**. Weitere Braunvarianten, weitere E-Varianten, Verdünnung, Aufhellung und genaue Zeichnung sind nicht modelliert. Mehrere unterschiedliche rezessive Varianten oder ungeklärte Phasen dürfen nicht als bs/bs eingetragen werden. Vor einer Erweiterung müssen Allele, Wechselwirkungen und die Interpretation der Befunde neu geprüft werden.

Die dokumentierten Ergebnisse in `src/data/health.ts` sind die Grundlage für den Rüden. Ein Guard lässt Build und Tests fehlschlagen, wenn sich e1/e1, N/bs, Kb/Kb oder N/S ändern, damit die Interpretation nicht unbemerkt veraltet.

Bei einem unbekannten Genwert werden alle drei unterstützten Genotypen durchgerechnet. Das Ergebnis zeigt je Kategorie Minimum und Maximum. Es werden keine Häufigkeiten aus dem Erscheinungsbild oder einer Population geschätzt. Deshalb müssen die ausgegebenen Spannen nicht zusammen 100 % ergeben. Bei vollständig bekannten Werten ergeben die Grundfarben zusammen 100 %. Wahrscheinlichkeiten gelten pro Welpe und sagen keine feste Zusammensetzung eines Wurfes voraus.

### Quellen

Die verwendeten Vererbungsregeln und die Grenzen der Interpretation wurden am 23.10.2026 mit den offiziellen Informationen des UC Davis Veterinary Genetics Laboratory abgeglichen:

- [E-Lokus / MC1R](https://vgl.ucdavis.edu/test/mc1r-dog)
- [Braun / TYRP1](https://vgl.ucdavis.edu/test/brown-dog)
- [Dominantes Schwarz / K-Lokus](https://vgl.ucdavis.edu/test/dominant-black)
- [Weißscheckung / MITF](https://vgl.ucdavis.edu/test/piebald-dog)

Die Ergebnisse des Rüden sind mit den auf der Gesundheitsseite verlinkten Originalbefunden abgeglichen. Das ist keine externe fachliche Freigabe des Rechners.

## Szenarien und Übergänge

Ein Szenario enthält nur die Version, den Modus, drei Genotypen und deren jeweilige Herkunft. Die Herkunft ist je Genwert `example`, `test`, `assumed` oder `unknown`. Ein selbst eingegebener Gentest wird als **Gentest laut Eingabe** bezeichnet und nicht als verifiziert ausgegeben. Beispielwerte bleiben im Formular und in beiden E-Mail-Formaten ausdrücklich als Simulation markiert.

- Der Einstieg öffnet ein vollständiges Beispiel ohne Eingabe persönlicher Daten.
- „Eigene Hündin“ startet mit unbekannten Werten. Das Aussehen der Hündin erzeugt keine automatischen Genotypen.
- Der Teilen-Link enthält ausschließlich die erlaubten Szenariofelder. Namen, Formulardaten und Kontaktdaten werden nicht übernommen.
- „Mit dieser Kombination anfragen“ öffnet die Anfrage mit dem Szenario im Link.
- Innerhalb der Anfrage bleibt der Rechner auf derselben Seite. Erst „Für meine Anfrage übernehmen“ hängt eine Berechnung an. Danach aktualisieren Änderungen die angehängte Berechnung; sie lässt sich vollständig entfernen.
- Änderungen aktualisieren die anonymen Szenariowerte der aktuellen URL. Entfernen und Löschen entfernen sie ebenfalls. So überschreibt ein alter Link beim Neuladen keine später bearbeitete Berechnung.
- Die API akzeptiert ein Szenario optional, validiert es und berechnet die E-Mail-Ergebnisse selbst. Mitgeschickte Prozentwerte werden ignoriert.

Die Query-Version `v=1` und die Rechenmodell-Version `1.0.0` sind getrennt. Unbekannte Versionen, doppelte Query-Felder, nicht unterstützte Allele und widersprüchliche Herkunftsangaben werden abgewiesen.

## Entwürfe und Versand

Die Anfrage erhält Eingaben während des aktuellen Browser-Tabs über `sessionStorage`. Nur nach Auswahl von „Entwurf für später auf diesem Gerät speichern“ werden die erlaubten Felder zusätzlich lokal für sieben Tage gespeichert. Das gilt auch für Angaben aus deaktivierten Kontaktfeldern, die bei erneuter Auswahl wieder verfügbar sind. Es wird nichts im Hintergrund an einen Server gesendet.

Zustimmung, Honeypot und Absendezeitpunkt werden niemals aus einem Entwurf wiederhergestellt. Ungültige und abgelaufene dauerhafte Entwürfe werden beim Laden entfernt. „Entwurf löschen“ setzt die Eingaben zurück und entfernt beide Formularspeicher. Erfolgreicher Versand entfernt sie ebenfalls. Der anonyme Rechnerzustand ist davon unabhängig.

Der erste Formularschritt validiert die Angaben und zeigt eine bearbeitbare Zusammenfassung. Erst „Anfrage absenden“ startet den bestehenden Versand. Netzwerk- und API-Fehler erhalten die Eingaben. Die Backend-Validierung bleibt unabhängig von JavaScript aktiv.

## Prüfung

`npm test` prüft bekannte Kreuzungen, die Maskierung durch e1/e1, S-Vererbung, unbekannte Werte, Serialisierung und Herkunft, Entwurfsgrenzen sowie API-Validierung und serverseitige E-Mail-Ergebnisse. Versandtests verwenden einen simulierten Anbieter und versenden keine echte Nachricht. `npm run check` prüft Astro, Client-TypeScript und die Cloudflare Function; `npm run build` erzeugt die statische Website.

Bei Änderungen an der Bedienung zusätzlich den Weg Rechner → Anfrage → Bearbeiten, den eingebetteten Rechner, Feldfehler, Kontaktwechsel, Entwurf wiederherstellen/löschen, die erneute Zustimmung und die mobile Navigation im Browser prüfen.
