# Epistulae

Sokrates hat eine Zeitreise in die Gegenwart gemacht – und schreibt dir Briefe. Eine **statische PWA** um Selbstreflexion und sokratischen Dialog.

- **Idee & Konzept:** [idea.md](idea.md), [konzept.md](konzept.md)
- **Firebase einrichten:** [docs/firebase-setup.md](docs/firebase-setup.md)
- **Releases:** [CHANGELOG.md](CHANGELOG.md)

---

## Architektur

- **Frontend:** Vite + TypeScript, statischer Export, nur Firebase – kein eigenes Backend.
- **Auth:** Google Login (Firebase Authentication).
- **Daten:** Firestore (Nutzer-Fortschritt), Offline-First mit localStorage + Sync.
- **Deploy:** Firebase Hosting, CI/CD per GitHub Action bei Push auf `main`.

**Firebase Spark Plan (0€)** ausreichend.

---

## Checkliste: Damit alles funktioniert

1. **Firebase-Projekt** in der [Console](https://console.firebase.google.com/) anlegen (z.B. `epistulae-2318a`).
2. **Authentication** aktivieren: **Build** → **Authentication** → **Get started**.
3. **Google** als Sign-in-Methode aktivieren: **Sign-in method** → **Google** → aktivieren und speichern.
4. **Authorized domains** prüfen: Unter Authentication → Einstellungen muss `localhost` (und deine Hosting-Domain) eingetragen sein.
5. **Frontend-.env:** Im Ordner `frontend` eine Datei `.env` anlegen (siehe `frontend/.env.example`) und alle `VITE_FIREBASE_*`-Werte aus der Firebase Console (**Projekteinstellungen** → **Allgemein** → deine Web-App) eintragen.

Ohne Schritt 2 und 3 erscheint beim Login „CONFIGURATION_NOT_FOUND“. Ohne Schritt 5 erscheint ein Hinweis auf fehlende `.env`.

---

## Lokal starten

```bash
cd frontend
cp .env.example .env
# .env mit Werten aus Firebase Console → Projekteinstellungen → Web-App füllen
npm install
npm run dev
```

App: http://localhost:5173

---

## Build & Deploy

**Lokal:**

```bash
cd frontend && npm run build && cd .. && npx firebase deploy --only hosting
```

**CI (GitHub Action bei Push auf `main`):** In den **Repository Secrets** eintragen:

- `FIREBASE_TOKEN` (von `npx firebase login:ci`)
- `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`, `VITE_FIREBASE_MEASUREMENT_ID`

Firestore-Regeln einmalig oder bei Änderung:

```bash
npx firebase deploy --only firestore:rules
```

---

## Wenn etwas nicht funktioniert

- **Weiße Seite / Fehlermeldung zu Firebase:** `frontend/.env` prüfen; alle Werte aus der Web-App-Konfiguration in der Firebase Console übernehmen (keine Anführungszeichen um die Werte).
- **„CONFIGURATION_NOT_FOUND“ oder 400 beim Login:** In der Firebase Console **Authentication** → **Get started** und **Google** unter Sign-in method aktivieren.
- **„Nicht autorisierte Domain“:** Unter Authentication → Einstellungen → **Authorized domains** die genutzte Domain (z.B. `localhost`, `epistulae-2318a.web.app`) eintragen.
- **Deploy schlägt fehl:** `npm run build` im Ordner `frontend` muss ohne Fehler durchlaufen. Für Hosting: `npx firebase deploy --only hosting` (ohne `:epistulae`, es sei denn, du hast eine zweite Site „epistulae“ angelegt).

---

## Versionierung

- Version in `VERSION`, Changelog in `CHANGELOG.md`.
- Release: `./version.sh [patch|minor|major] ["Kurzbeschreibung"]`
