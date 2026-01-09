# 🧪 Copilot Desktop - Test Walkthrough

> Datum: _______________
> Tester: _______________
> App Version: 0.1.0

Markiere mit `[x]` was funktioniert, `[~]` für teilweise, `[ ]` für nicht getestet, `[!]` für Bug

---

## 1. 🚀 App Start & Auth

### 1.1 App Launch
- [x] App startet ohne Fehler
- [x] Kein weißer Bildschirm
- [x] Keine Console-Errors (Cmd+Option+I)

### 1.2 Login (falls noch nicht eingeloggt)
- [x] Login-Screen wird angezeigt
- [x] "Login with GitHub" Button reagiert
- [x] Device Code erscheint
- [x] Link zu github.com/login/device öffnet sich
- [x] Nach Autorisierung → automatischer Wechsel zum Chat

### 1.3 Auth Persistenz
- [!] App schließen und neu starten
- [!] Noch eingeloggt (kein erneuter Login nötig)

**Notizen:**
```
- Glaube am anfang ist noch nen "test http fetch" debug knopf
- Anmeldung ist bisschen holprig. Kopierknopf hat keine animation. Seite öffnet sich nicht direkt(ich muss irgendwie öfter klicken, vielleicht hängt auch nur mein pc). Wenn ich mich anmelde, musste ich extra auf "status prüfen" klicken (vielleicht hab ich nicht lang genug gewartet) - dann gehts aber
- unten links steht nur user und nicht mein wirklicher nutzer
- "Loading ..." nach anmeldung sieht nicht so schön aus
- Wenn ich die App schließe und neustarte (mit pnpm tauri dev) muss ich mich neu einloggen
- Verlauf bleibt aber
- Manchmal geht der Text rechts über den Rand hinaus
```

---

## 2. 💬 Chat Grundfunktionen

### 2.1 Neuer Chat
- [x] "Neuer Chat" Button vorhanden
- [x] Klick erstellt neuen Chat
- [x] Neuer Chat erscheint in Sidebar
- [x] Neuer Chat wird automatisch ausgewählt

### 2.2 Nachricht senden
- [x] Textfeld vorhanden
- [x] Text eingeben möglich
- [x] Enter oder Send-Button sendet
- [x] User-Nachricht erscheint im Chat
- [x] Loading/Typing-Indikator während Antwort

### 2.3 Response empfangen
- [x] Antwort kommt an
- [x] Streaming funktioniert (Text erscheint Stück für Stück)
- [~] Antwort ist vollständig lesbar
- [x] Kein Abbruch mitten im Text

### 2.4 Markdown Rendering
- [x] **Fett** wird korrekt angezeigt
- [x] *Kursiv* wird korrekt angezeigt
- [x] `Code inline` wird korrekt angezeigt
- [x] Code-Blöcke mit Syntax-Highlighting
- [x] Listen (- oder 1.) werden korrekt angezeigt
- [~] Links werden anklickbar

Test-Prompt: "Zeige mir ein Python Code-Beispiel mit einer Funktion und erkläre es mit Markdown-Formatierung"

**Notizen:**
```
- Der Text kann zu nah an das Textfeld geraten
- Ich glaub "`INHALT`" wird nicht richtig angezeigt
- Es wäre cool, wenn codevorschläge mit nem kopierknopf dazukommen.
- Wenn ich nen Link anklicke, öffnet sichs im programm. ich kann dann nicht mehr rauskommen :/
- Das chat lösch symbol (links) ist zu nah am punkt, der signalisiert, dass da gerade was passiert
```

---

## 3. 🎨 Modellauswahl

### 3.1 Dropdown
- [x] Modell-Dropdown im Header sichtbar
- [x] Klick öffnet Dropdown
- [~] Mehrere Modelle zur Auswahl

### 3.2 Verfügbare Modelle (abhaken was angezeigt wird)
- [x] GPT-4o
- [x] GPT-4o-mini
- [x] Claude 3.5 Sonnet
- [x] o1-preview
- [x] o1-mini
- [!] Andere: _______________

### 3.3 Modellwechsel
- [x] Anderes Modell auswählen möglich
- [x] Nach Wechsel: neue Nachricht verwendet neues Modell
- [x] Modell wird pro Chat gespeichert

**Notizen:**
```
- Ich glaub es werden nicht alle copilot modelle angezeigt
- Bei Calude 3.5 Sonnet z. B. kriege ich diese Errornachricht "[Error: Copilot API Error: Bad Request {"error":{"message":"The requested model is not supported.","code":"model_not_supported","param":"model","type":"invalid_request_error"}} ]"
- manchmal wenn ich nen "älteren" chat anklicke, wird oben bisschen ui abgeschnitten (ist glaub ich bisher nur bei markdown passiert, außerdem ist zwischen text ganz unten und textzeile kleiner schwarzer balken)
```

---

## 4. 📁 Sidebar & Navigation

### 4.1 Chat-Liste
- [x] Alle Chats werden angezeigt
- [x] Neueste Chats oben
- [x] Aktiver Chat ist hervorgehoben
- [x] Chat-Titel werden angezeigt

### 4.2 Chat wechseln
- [x] Klick auf anderen Chat wechselt Ansicht
- [x] Alter Chat-Verlauf wird geladen
- [x] Kein Datenverlust beim Wechseln

### 4.3 Chat löschen
- [~] Lösch-Option vorhanden (Hover oder Rechtsklick)
- [!] Bestätigung vor Löschen
- [x] Chat wird aus Liste entfernt
- [?] Chat ist wirklich weg (nicht nur versteckt)

### 4.4 Chat umbenennen
- [!] Umbenennen-Option vorhanden
- [!] Neuer Name wird gespeichert
- [!] Name bleibt nach App-Neustart

### 4.5 Suche
- [x] Suchfeld in Sidebar vorhanden
- [!] Eingabe filtert Chat-Liste
- [!] Suche findet Chats nach Titel
- [!] Suche findet Chats nach Inhalt (optional)

**Notizen:**
```
- Kannst du Chat Titel änderbar machen? Außerdem soll der Titel erstmals von der ki vom thema abhängig bestimmt werden
- Rechtsklick löschen geht nicht
- Es kommt keine bestätigungsmeldung beim löschen eines Chats
- ich weiß nicht, ob der chat wirklich weg ist
- umbenennen der chats nicht möglich
- suche macht basically gar nichts

- Nen neuer chat hat so nen grauen kreis über "Wie kann ich helfen". Kannst du ihm zum programm icon ändern?
- Wenn ich 
```

---

## 5. 📂 Projekt-Ordner

### 5.1 Projekt erstellen
- [x] "Neues Projekt" Button vorhanden
- [!] Klick öffnet Dialog/Eingabe
- [!] Name eingeben möglich
- [!] Projekt erscheint in Sidebar

### 5.2 Projekt-Struktur
- [!] Projekt ist klappbar (Pfeil)
- [!] Projekt kann Chats enthalten
- [!] Chats ohne Projekt werden separat angezeigt

### 5.3 Chat zu Projekt zuweisen
- [!] Drag & Drop von Chat zu Projekt
- [!] Oder: Kontextmenü "Zu Projekt verschieben"
- [!] Chat erscheint unter Projekt

### 5.4 Projekt löschen
- [!] Lösch-Option vorhanden
- [!] Was passiert mit Chats im Projekt? _______________

**Notizen:**
```
Wenn ich bei Projekte aufs "+" klicke, passiert nichts, von daher kann ich den rest nicht überprüfen
```

---

## 6. 🌙 Dark/Light Mode

### 6.1 Toggle
- [x] Theme-Toggle vorhanden (wo? _______________)
- [!] Klick wechselt Theme
- [!] Wechsel ist sofort sichtbar

### 6.2 Dark Mode
- [!] Dunkler Hintergrund
- [!] Heller Text
- [!] Guter Kontrast
- [!] Keine unlesbaren Elemente

### 6.3 Light Mode
- [x] Heller Hintergrund
- [x] Dunkler Text
- [x] Kein Blenden

### 6.4 Persistenz
- [!] Theme-Einstellung wird gespeichert
- [!] Nach App-Neustart: gleiches Theme

**Notizen:**
```
- Theme toggle ist in den einstellungen zu finden. Ich kann es auswählen, aber es ändert sich nichts (außer dass es augewählt ist).
-> Das gilt basically für alle 3, wofür auch immer der monitor steht. Default ist also light mode
```

---

## 7. ⚙️ Einstellungen

### 7.1 Settings öffnen
- [x] Settings-Button vorhanden (wo? _______________)
- [x] Klick öffnet Settings-Modal/Seite

### 7.2 Account-Info
- [x] GitHub Username wird angezeigt
- [x] Avatar wird angezeigt
- [x] Logout-Option vorhanden

### 7.3 Weitere Einstellungen
- [!] Theme-Auswahl
- [~] Andere Optionen: _______________

**Notizen:**
```
- Beim account steht ein limit. Leider ist es ein falsches limit. außerdem versteh ich "active" nicht
- Logout ist vorhanden, wenn ich ihn anklicke werde ich auch (ohne bestätigung) ausgeloggt. Leider bin ich immernoch alles sehend wie davor (obwohl ich kein account mehr angemeldet habe). In chats krieg ich nen error nachdem ich ne prompt abgeschickt habe "[Error: No GitHub accounts connected]"
-> "Weitere Account verinden" macht leider auch nichts
```

---

## 8. 💾 Daten-Persistenz

### 8.1 Chat-Speicherung
- [x] Chat erstellen → App schließen → App öffnen
- [x] Chat ist noch da
- [x] Alle Nachrichten sind da
- [x] Modell-Einstellung ist erhalten

### 8.2 Projekt-Speicherung
- [!] Projekt erstellen → App schließen → App öffnen
- [!] Projekt ist noch da
- [!] Chats im Projekt sind zugeordnet

### 8.3 Einstellungen-Speicherung
- [!] Theme ändern → App schließen → App öffnen
- [!] Theme-Einstellung ist erhalten

**Notizen:**
```

```

---

## 9. 🐝 Swarm Mode

### 9.1 Swarm Toggle
- [x] Swarm Toggle im Header sichtbar
- [x] Klick aktiviert Swarm Mode
- [x] Visuelles Feedback (Farbe/Icon ändert sich)

### 9.2 Swarm Konfiguration
- [x] Settings/Config Button neben Toggle
- [x] Klick öffnet Swarm Config Modal
- [~] Controller Model wählbar
- [~] Strategy wählbar (Consensus, Parallel, etc.)

### 9.3 Worker hinzufügen
- [x] "+ Worker hinzufügen" Button
- [x] Model für Worker wählbar
- [x] Role/Name für Worker eingebbar
- [~] Weight einstellbar
- [!] Worker kann gelöscht werden

### 9.4 Swarm Config speichern
- [x] "Speichern" Button
- [x] Config wird gespeichert
- [x] Config bleibt nach App-Neustart

### 9.5 Swarm Ausführung
- [x] Swarm aktivieren
- [x] Nachricht senden
- [x] Worker-Status wird angezeigt
- [~] Einzelne Worker-Responses sichtbar
- [x] Progress/Status pro Worker
- [~] Finale aggregierte Antwort erscheint

### 9.6 Swarm Strategies testen

**Consensus (alle beantworten gleiche Frage):**
- [ ] Config: Strategy = Consensus, 2+ Worker
- [ ] Frage senden
- [ ] Alle Worker antworten
- [ ] Beste Antwort wird kombiniert

**Parallel (Aufgabe aufteilen):**
- [ ] Config: Strategy = Parallel, 2+ Worker mit verschiedenen Roles
- [ ] Komplexe Frage senden
- [ ] Controller teilt auf
- [ ] Worker bearbeiten Teilaufgaben
- [ ] Ergebnis wird zusammengeführt

Test-Prompt für Parallel: "Erstelle eine TODO-App: Worker 1 soll das Backend designen, Worker 2 das Frontend"

**Notizen:**
```
- nur 2 controller model wählbar
- nur 2 strategien wählbar
- nur 3 modelle für worker wählbar

- was ist weight?
- Ich kann nen schwarm nicht umbenennen

- Wenn nen request error kommt, geht das swarm active fenster nicht weg, obwohl alle worker nen vollen grünen balken haben (auch wenn ich nen neuen chat anklicke oder den von dem der schwarm ursprünglich kommt lösche oder den schwarm beende)

- ich glaube es wäre sinnvoll nen schwarm nur in nem projekt laufen lassen zu können. Ein worker hat dann seinen eigenen chat und der controller versucht "alle miteinander" kommunizieren zu lassen, wenn das geht


```

---

## 10. 🔧 Edge Cases & Fehler

### 10.1 Leere Eingabe
- [x] Leere Nachricht senden → wird verhindert oder ignoriert

### 10.2 Sehr lange Nachricht
- [ ] 1000+ Zeichen eingeben
- [ ] Wird korrekt gesendet
- [ ] Response kommt an

### 10.3 Schnelle Nachrichten
- [ ] Mehrere Nachrichten schnell hintereinander
- [ ] Alle werden verarbeitet
- [ ] Keine doppelten Antworten

### 10.4 Offline-Verhalten
- [ ] Internet trennen
- [ ] Nachricht senden
- [ ] Fehlermeldung erscheint (kein Crash)

### 10.5 API-Fehler
- [ ] Bei Fehler: Fehlermeldung sichtbar
- [ ] App crasht nicht
- [ ] Retry möglich

**Notizen:**
```

```

---

## 11. 🎯 Status-Indikatoren

### 11.1 Chat-Status in Sidebar
- [ ] `●` Grün = Streaming (Antwort kommt gerade)
- [ ] `◐` Gelb = Pending (wartet)
- [ ] `○` Grau = Idle (bereit)
- [ ] `!` Rot = Error

### 11.2 Typing-Indikator
- [ ] Während Antwort: visuelles Feedback
- [ ] Nach Antwort: Indikator verschwindet

**Notizen:**
```

```

---

## 12. 📊 Performance

### 12.1 App-Start
- [ ] Schnell (< 3 Sekunden)
- [ ] Langsam (3-10 Sekunden)
- [ ] Sehr langsam (> 10 Sekunden)

### 12.2 Chat-Wechsel
- [ ] Sofort
- [ ] Kurze Verzögerung
- [ ] Lange Verzögerung

### 12.3 Speicherverbrauch
- [ ] Normal
- [ ] Hoch
- [ ] Steigt mit der Zeit (Memory Leak?)

**Notizen:**
```

```

---

## 📝 Zusammenfassung

### Funktioniert gut ✅
```
1. 
2. 
3. 
```

### Teilweise funktioniert ⚠️
```
1. 
2. 
3. 
```

### Bugs gefunden 🐛
```
1. 
2. 
3. 
```

### Feature Requests 💡
```
1. 
2. 
3. 
```

### Priorität für nächste Iteration
```
1. 
2. 
3. 
```

---

## 🖼️ Screenshots (optional)

Füge hier Screenshots von Bugs oder besonderen Situationen ein:

```
[Screenshot 1 - Beschreibung]

[Screenshot 2 - Beschreibung]
```
