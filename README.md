# Epistulae

Sokrates hat eine Zeitreise in die Gegenwart gemacht – und schreibt dir Briefe. Eine **statische PWA** um Selbstreflexion und sokratischen Dialog, mit Baum-Visualisierung deines Fortschritts.

- **Idee & Konzept:** [idea.md](idea.md), [konzept.md](konzept.md)
- **Firebase verbinden:** [docs/firebase-setup.md](docs/firebase-setup.md)
- **Releases:** [CHANGELOG.md](CHANGELOG.md)

---

## Architektur (statische PWA)

- **Frontend:** Vite + TypeScript, statischer Export (SSG), kein eigenes Backend.
- **Daten:** Firebase JS SDK im Browser – **Auth** (Google Login), **Firestore** (Nutzer-Fortschritt).
- **Offline:** Service Worker (vite-plugin-pwa), Daten in localStorage, Sync mit Firestore bei Online.
- **Deploy:** Firebase Hosting; CI/CD per GitHub Action bei Push auf `main`.

Alles im **Firebase Spark Plan (0€)** nutzbar.

---

## Frontend lokal entwickeln

```bash
cd frontend
cp .env.example .env
# .env mit Firebase-Konfiguration füllen (aus Firebase Console → Projekteinstellungen → Web-App)
npm install
npm run dev
```

App: http://localhost:5173

Optional mit **Emulatoren**: Firebase Emulator Suite starten (siehe [docs/firebase-setup.md](docs/firebase-setup.md)), dann in `.env` z.B. `VITE_USE_FIREBASE_EMULATOR=true` und ggf. `VITE_AUTH_EMULATOR_PORT=9098` / `VITE_FIRESTORE_EMULATOR_PORT=8081` (Docker-Ports).

---

## Build & Deploy (Firebase Hosting)

**Lokal deployen:**

```bash
cd frontend
npm run build
cd ..
npx firebase deploy --only hosting
```

**Automatisch (CI):** Bei jedem Push auf `main` baut die GitHub Action das Frontend und deployed zu Firebase Hosting. Dafür in den **GitHub Repository Secrets** setzen:

- `FIREBASE_TOKEN` – von `npx firebase login:ci`
- `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID` (aus Firebase Console)

Firestore-Regeln deployen (einmalig oder bei Änderung):

```bash
npx firebase deploy --only firestore:rules
```

---

## Alte Python-App (Docker, optional)

Die bisherige FastAPI-App kann weiterhin lokal mit Docker laufen (z.B. für API-Tests oder Migration):

```bash
docker compose up -d
```

- App: http://localhost:8000  
- Emulator-UI: http://localhost:4010  

---

## Versionierung & Changelog

- **Version** in `VERSION`, **Changelog** in `CHANGELOG.md`.

**Release-Script:**

```bash
./version.sh [patch|minor|major] ["Kurzbeschreibung"]
```
