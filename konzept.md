# Epistulae – Konzept

## 1. Vision & Ziel

**Epistulae** ist eine installierbare PWA, in der Sokrates per Zeitreise in der Gegenwart landet, mit der modernen Welt hadert und dem Nutzer Briefe schreibt. Im Zentrum steht nicht Wissensvermittlung, sondern **Selbstreflexion und Weisheit** – angelehnt an die sokratische Methode: Fragen stellen, zum Nachdenken anregen, keine fertigen Antworten liefern.

**Kernziel:** Der Nutzer denkt über sich und die Welt nach, während er mit „Sokrates“ korrespondiert. Der Fortschritt wird als wachsender Baum sichtbar – ein Bild für persönliches Wachstum.

---

## 2. Spielmechanik & Ablauf

### 2.1 Grundablauf

1. **Brief von Sokrates**  
   Sokrates schreibt einen kurzen Brief: Beobachtung aus der heutigen Welt, Verwirrung, eine Frage an den Nutzer.

2. **Drei Antwortoptionen**  
   Der Nutzer wählt eine von drei vorgegebenen Antworten. Diese sind so formuliert, dass sie unterschiedliche Haltungen/Reflexionstiefen abbilden (z.B. oberflächlich, kritisch, philosophisch).

3. **Reaktion von Sokrates**  
   Basierend auf der gewählten Antwort antwortet Sokrates (API-generiert) – mal nachfragend, mal bestärkend, mal provozierend – und leitet zum nächsten Brief oder zur Vertiefung des Themas über.

4. **Fortschritt im Baum**  
   Jede Interaktion beeinflusst den Baum: neue Äste (Themen), Verzweigungen (Unterthemen), Dicke (Tiefe) und Länge (Zeit).

### 2.2 Sokratischer Dialog

- **Keine Quiz-Logik:** Es gibt keine „richtige“ Antwort. Ziel ist, dass der Nutzer seine eigene Position formuliert und hinterfragt.
- **Drei Optionen** pro Brief: z.B.  
  - eine impulsiv/pragmatische,  
  - eine reflektierte,  
  - eine radikal hinterfragende.  
  So entstehen unterschiedliche Gesprächspfade ohne Überforderung.
- **Tonalität:** Sokrates bleibt charakteristisch – neugierig, ironisch, beharrlich fragend, nie belehrend.

---

## 3. Baum-Metapher & Fortschrittsvisualisierung

Der Fortschritt wird als **einziger Baum** dargestellt (z.B. auf einer separaten „Garten“- oder „Baum“-Ansicht).

| Element        | Bedeutung |
|----------------|-----------|
| **Abzweigung** | Neues Thema (neuer Ast vom Stamm oder von einem bestehenden Ast). |
| **Gabelung**   | Ein Thema spaltet sich in Unterthemen (ein Ast teilt sich). |
| **Dicke des Asts** | Wie tief sich der Nutzer mit dem Thema auseinandergesetzt hat (mehr Dialoge, mehr Reflexion → dickerer Ast). |
| **Länge des Asts** | Wie lange (zeitlich/anzahl Interaktionen) der Nutzer am Thema dran war. |

**Technisch:**  
- Jeder Knoten = ein Thema oder Unterthema.  
- Kanten haben Attribute: „Tiefe“ (Skala) und „Länge“ (Zeit/Anzahl).  
- Darstellung: z.B. Canvas/SVG, Aststärke und -länge aus den gespeicherten Metriken berechnet.

**Spielerisches Ziel:** Den Baum wachsen und verzweigen sehen – als Metapher für das eigene Nachdenken.

---

## 4. Themen & Selbstreflexion

Themen sollten aus der „Sokrates trifft Moderne“-Perspektive kommen, z.B.:

- **Technologie & Aufmerksamkeit** (Social Media, ständige Erreichbarkeit)
- **Gerechtigkeit & Ungleichheit** (heutige Gesellschaft)
- **Wahrheit & Meinung** (Fake News, Filterblasen)
- **Glück & Konsum** (Was braucht der Mensch?)
- **Identität & Rolle** (Wer bin ich in dieser Welt?)
- **Tod & Vergänglichkeit** (moderne Medizin, Lebenserwartung, Sinn)

Zu jedem Thema können Unterthemen entstehen (Gabelungen), je nachdem, wohin die Dialoge führen. Die genaue Themenliste und Feintuning können später mit der AI und Redaktion ausgearbeitet werden.

---

## 5. Technisches Konzept

### 5.1 Architektur: PWA + SSR (Python)

- **Frontend:** PWA-fähige Web-App (HTML/CSS/JS oder Framework nach Wahl), installierbar, offline-fähig wo sinnvoll (z.B. bereits geladene Briefe/ Baum-Daten).
- **Backend:** Python-SSR (z.B. FastAPI oder Django).  
  - Rendert initiale Seiten (SEO, schneller First Paint).  
  - Stellt APIs bereit für: Briefe laden, Antworten senden, Baum-Daten, User-Fortschritt.
- **PWA-Anforderungen:**  
  - `manifest.json` (Name, Icons, `display: standalone`).  
  - Service Worker für Caching und Offline-Fallback.  
  - HTTPS (für Deployment und Installierbarkeit).

### 5.2 Firebase

- **Auth:** Anmeldung/Registrierung (E-Mail/Passwort oder z.B. Google Sign-In).  
- **Firestore (oder Realtime DB):**  
  - User-Profil, Fortschritt (welche Briefe gelesen, welche Antworten gewählt).  
  - Baum-Zustand (Knoten, Kanten, Tiefen- und Längenwerte) pro User.  
- Alternative: Fortschritt im Python-Backend in DB speichern und Firebase nur für Auth nutzen; dann Backend als Single Source of Truth für Baum und Briefe.

### 5.3 Google AI Studio API

- **Einsatz:** Generierung der **Reaktionen von Sokrates** auf die gewählte Antwort (und ggf. Vorbereitung von Briefen oder Antwortoptionen).  
- **Ablauf:**  
  - Backend sendet Kontext (aktueller Brief, gewählte Option, bisheriger Verlauf) an die API.  
  - API liefert Text für Sokrates’ nächsten Brief/Absatz.  
  - Optional: API schlägt drei Antwortoptionen für den Nutzer vor; Redaktion kann kuratieren oder ersetzen.  
- **Sicherheit:** API-Key nur im Backend, nie im Frontend.  
- **test.py:** Dient als Referenz für die API-Anbindung (wie in idea.md erwähnt).

### 5.4 Datenfluss (vereinfacht)

1. User öffnet App → SSR liefert erste Seite, Frontend hydratiert.
2. User loggt sich ein (Firebase Auth) → Backend erhält User-ID (z.B. via Token).
3. Briefe & Baum werden vom Backend aus DB/Firestore geladen.
4. User wählt Antwort → Frontend sendet an Backend → Backend ruft AI Studio auf → Antwort wird gespeichert, Baum-Metriken aktualisiert → neuer Brief + aktualisierter Baum werden zurückgegeben.

---

## 6. Deployment (Google)

Damit die PWA installierbar und auffindbar ist:

- **Hosting:** Google-typische Optionen:  
  - **Firebase Hosting** (statische PWA + optional Cloud Functions für API).  
  - **Google Cloud Run** (Container mit Python-SSR-Backend).  
  - **Kombination:** Firebase Hosting für Frontend, Cloud Run für Python-API; Hosting kann per Rewrites API-Requests an Cloud Run weiterleiten.
- **Domain & HTTPS:** Firebase Hosting und Cloud Run liefern HTTPS. Custom Domain möglich.
- **PWA installierbar:** Unter HTTPS mit gültem Manifest und Service Worker wird „Zum Startbildschirm hinzufügen“ / „App installieren“ im Browser angeboten.
- **Konkrete Schritte (für später):**  
  - Projekt in Google Cloud Console / Firebase Console anlegen.  
  - Build (Frontend) → Deploy auf Firebase Hosting.  
  - Backend containerisieren (Dockerfile) → Deploy auf Cloud Run.  
  - Umgebungsvariablen (API-Keys, Firebase Config) in Cloud Run bzw. Firebase setzen.

---

## 7. Phasen & nächste Schritte

| Phase | Inhalt |
|-------|--------|
| **1. Grundgerüst** | Python-Backend (SSR + API), einfache Frontend-Seite, Firebase Auth anbinden, erste Briefe (statisch) mit 3 Antwortoptionen anzeigen. |
| **2. Dialog & AI** | Anbindung Google AI Studio (auf Basis test.py), Generierung von Sokrates-Reaktionen, Speicherung der gewählten Antworten und des Verlaufs. |
| **3. Baum-Logik** | Datenmodell für Themen/Unterthemen, Berechnung von Tiefe und Länge, API für Baum-Zustand. |
| **4. Baum-Visualisierung** | Frontend: Baum zeichnen (Canvas/SVG), Abzweigung/Gabelung/Dicke/Länge darstellen. |
| **5. PWA & Offline** | Manifest, Service Worker, Installierbarkeit testen. |
| **6. Deployment** | Firebase Hosting + Cloud Run (oder gewählte Variante) einrichten, Deploy-Pipeline, Dokumentation für dich. |

---

## 8. Offene Punkte (für spätere Entscheidung)

- **Themen-Redaktion:** Welche Briefe/Antwortoptionen werden fest vorgegeben, welche vollständig von der AI generiert? (Hybrid empfohlen.)
- **Sprache:** Zunächst Deutsch oder von vornherein mehrsprachig?
- **Monetarisierung:** Kostenlos, optional Spende, oder später Premium-Themen – bleibt offen.
- **Name:** „Epistulae“ als Arbeitstitel – kann beibehalten oder angepasst werden.

---

*Konzept entwickelt auf Basis von idea.md – bereit für Feinschliff und Umsetzung.*
