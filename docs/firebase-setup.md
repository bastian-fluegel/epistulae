# Firebase für Epistulae einrichten

Epistulae nutzt **nur Firebase** (kein eigenes Backend): Auth (Google), Firestore, Hosting.

---

## 1. Projekt in der Firebase Console

1. [Firebase Console](https://console.firebase.google.com/) → Projekt wählen oder anlegen (z.B. `epistulae-2318a`).
2. **Build** → **Authentication** → **Get started**.
3. **Sign-in method** → **Google** aktivieren (E-Mail, Anzeigename, Support-URL ausfüllen). Ohne diesen Schritt erscheint im Browser „CONFIGURATION_NOT_FOUND“ (400) und der Google-Login funktioniert nicht.
4. **Einstellungen** (Zahnrad) → **Authorized domains**: Für lokale Entwicklung ist `localhost` bereits erlaubt. Für die Live-App die Hosting-Domain eintragen (z.B. `epistulae-2318a.web.app`).
5. **Build** → **Firestore Database** → **Create database** (Production mit Regeln oder Testmodus), Region wählen (z.B. `europe-west1`).
6. **Projekteinstellungen** (Zahnrad) → **Allgemein** → **Deine Apps** → **</> Web-App** hinzufügen (falls noch nicht). Die angezeigte `firebaseConfig` (apiKey, authDomain, projectId, …) für Schritt 2 verwenden.

---

## 2. Konfiguration im Projekt

Alle Werte kommen aus der **Web-App-Konfiguration** (kein Service-Account nötig).

Im Ordner **frontend** eine Datei **`.env`** anlegen (wird nicht ins Repo committet):

```bash
cd frontend
cp .env.example .env
```

`.env` mit den Werten aus der Firebase Console füllen:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID` (optional, für Analytics)

---

## 3. Emulatoren (optional, nur lokal)

Ohne echtes Firebase kannst du mit der Emulator Suite lokal testen:

- [Emulator Suite](https://firebase.google.com/docs/emulator-suite) installieren und starten.
- In `frontend/.env`: `VITE_USE_FIREBASE_EMULATOR=true`, ggf. `VITE_AUTH_EMULATOR_PORT=9099`, `VITE_FIRESTORE_EMULATOR_PORT=8080`.

Die App verbindet sich dann mit den lokalen Emulatoren statt mit der Produktion.

---

## 4. Sicherheit

- **API-Keys** in `.env` sind Build-Zeit-Variablen und werden ins Frontend-Bundle eingebettet. Der Zugriff wird über **Firestore Rules** und **Auth** gesteuert.
- **`.env`** und **`frontend/.env`** nie committen (stehen in `.gitignore`).
- Für CI die gleichen Werte als **GitHub Secrets** setzen (`VITE_FIREBASE_*`).

---

## 5. Nützliche Links

- [Firebase Console](https://console.firebase.google.com/)
- [Authentication (Google)](https://firebase.google.com/docs/auth/web/google-signin)
- [Firestore](https://firebase.google.com/docs/firestore)
- [Hosting](https://firebase.google.com/docs/hosting)
