# Firebase mit Epistulae verbinden

Diese Anleitung beschreibt, wie du das Projekt mit Firebase (echtes Projekt oder lokale Emulatoren) verbindest.

---

## 1. Firebase-Projekt anlegen (Produktion)

1. Gehe zu [Firebase Console](https://console.firebase.google.com/).
2. **Projekt erstellen** (oder bestehendes wählen) → z.B. `epistulae`.
3. Optional: Google Analytics aktivieren.

### 1.1 Authentication aktivieren

- Links **Build** → **Authentication** → **Get started**.
- Unter **Sign-in method** z.B. **E-Mail/Passwort** und **Google** aktivieren.
- Unter **Authorized domains** später deine App-Domain eintragen (für lokale Entwicklung: `localhost` ist bereits erlaubt).

### 1.2 Firestore aktivieren

- **Build** → **Firestore Database** → **Create database**.
- **Testmodus** für Entwicklung oder direkt **Production** mit Regeln.
- Region wählen (z.B. `europe-west1`).

### 1.3 Konfiguration holen

- **Projektübersicht** (Zahnrad) → **Projekteinstellungen**.
- Unter **Allgemein** → **Deine Apps** → **</> Web-App** hinzufügen (falls noch nicht).
- **Firebase SDK-Konfiguration** (z.B. `firebaseConfig`) und **Firebase Admin SDK** (Service-Account-Key) fürs Backend notieren.

---

## 2. Konfiguration im Projekt

### 2.1 Umgebungsvariablen (Backend / lokale Entwicklung)

Erstelle bzw. ergänze `.env` im Projektroot (wird von `.gitignore` ausgeschlossen):

```bash
# Google AI (bereits vorhanden)
GOOGLE_API_KEY=dein_google_ai_studio_key

# Firebase Admin (Backend)
FIREBASE_PROJECT_ID=epistulae
# Optional, wenn du Service-Account-JSON nutzt:
# GOOGLE_APPLICATION_CREDENTIALS=path/to/serviceAccountKey.json
```

Für **Service-Account-Key** (empfohlen für Backend):

1. Firebase Console → **Projekteinstellungen** → **Dienstkonten**.
2. **Neuen privaten Schlüssel generieren** → JSON herunterladen.
3. Datei z.B. als `config/firebase-service-account.json` ablegen (und in `.gitignore` eintragen).
4. In `.env`:  
   `GOOGLE_APPLICATION_CREDENTIALS=config/firebase-service-account.json`

### 2.2 Frontend (Browser)

Die Web-App braucht die **Firebase SDK-Konfiguration** (nur öffentliche Keys, kein Geheimnis):

- In Firebase Console unter **Projekteinstellungen** → **Allgemein** → deine Web-App die Werte wie `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId` kopieren.
- Im Frontend entweder:
  - aus einer **umgebungsbasierten Konfiguration** (z.B. Build-Zeit oder `/config.js` vom Backend), oder
  - für lokale Entwicklung in eine Datei wie `static/config.firebase.js` (nur für Dev, nicht für echte Secrets).

Beispiel `config.firebase.js` (nur für lokale Dev, nicht committen wenn mit echten Daten):

```javascript
window.__FIREBASE_CONFIG__ = {
  apiKey: "...",
  authDomain: "epistulae.firebaseapp.com",
  projectId: "epistulae",
  storageBucket: "epistulae.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};
```

---

## 3. Lokal mit Firebase-Emulatoren (Docker)

Damit du ohne echtes Firebase-Projekt entwickeln kannst, laufen die **Firebase Auth- und Firestore-Emulatoren** in Docker. Die App verbindet sich dann mit den Emulator-URLs.

### 3.1 Was die Emulatoren ersetzen

- **Authentication** → Nutzer anlegen/anmelden nur lokal.
- **Firestore** → Daten (Briefe, Fortschritt, Baum) nur in der lokalen Emulator-Datenbank.

### 3.2 Ablauf im Projekt

1. **Emulatoren starten** (über Docker Compose, siehe README):
   ```bash
   docker compose up -d
   ```
   Damit starten die Firebase-Emulatoren und die Epistulae-App.
   - **App:** http://localhost:8000  
   - **Emulator-UI** (Auth, Firestore): http://localhost:4010 (Firestore 8081, Auth 9098)

2. **Frontend auf Emulatoren umstellen**  
   Wenn die App die Umgebungsvariable `USE_FIREBASE_EMULATOR=true` oder die Emulator-Hosts kennt, verbindet das Firebase JS SDK sich automatisch mit:
   - Auth: `http://localhost:9099`
   - Firestore: `localhost:8080`  
   (Ports können in `firebase.json` stehen.)

3. **Backend auf Emulatoren umstellen**  
   Das Python-Backend nutzt die Umgebungsvariable `FIRESTORE_EMULATOR_HOST=localhost:8080` (und ggf. Auth-Emulator), damit das Admin SDK gegen die Emulatoren schreibt.

Details stehen in der `docker-compose.yml` und in `firebase.json`.

### 3.3 Von Emulator auf echtes Firebase umschalten

- **Lokal ohne Docker:** `.env` ohne Emulator-Variablen, gültige `GOOGLE_APPLICATION_CREDENTIALS` und Projekt-ID → Verbindung zum echten Projekt.
- **Docker:** In `docker-compose.yml` die Emulator-Variablen auskommentieren und echte Credentials als Volume/Env übergeben, dann starten.

---

## 4. Sicherheit

- **API-Keys (Google AI, andere):** Nur im Backend (.env / Umgebungsvariablen), nie im Frontend committen.
- **Firebase Web `apiKey`:** Ist für die Nutzung in öffentlichen Apps gedacht; Zugriff kontrollierst du über **Firestore Rules** und **Auth**.
- **Service-Account-JSON:** Niemals committen, nur lokal oder über sichere Secrets (z.B. CI/Cloud) bereitstellen.

---

## 5. Nützliche Links

- [Firebase Console](https://console.firebase.google.com/)
- [Firebase Auth Dokumentation](https://firebase.google.com/docs/auth)
- [Firestore Dokumentation](https://firebase.google.com/docs/firestore)
- [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite)
