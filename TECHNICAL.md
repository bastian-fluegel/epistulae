# Technische Dokumentation – Epistulae v0.3.0

**Epistulae** ist eine Progressive Web App (PWA), die Benutzern ermöglicht, philosophische Briefe von 20 antiken Gelehrten zu empfangen und zu beantworten. Die Briefe werden dynamisch durch Google Gemini AI generiert und passen sich dem Konversationsverlauf und dem Benutzerprofil an.

---

## 📋 Inhaltsverzeichnis

1. [Architektur-Überblick](#architektur-überblick)
2. [Tech Stack](#tech-stack)
3. [Projektstruktur](#projektstruktur)
4. [Core Features](#core-features)
5. [Datenfluss](#datenfluss)
6. [API-Integration](#api-integration)
7. [State Management](#state-management)
8. [Styling & Responsive Design](#styling--responsive-design)
9. [Build & Deployment](#build--deployment)
10. [Entwicklung](#entwicklung)

---

## 🏗️ Architektur-Überblick

### Prinzipien
- **Local-First**: Alle Daten werden im Browser (localStorage) gespeichert
- **No Backend**: Keine Server-Infrastruktur notwendig
- **AI-Powered**: Dynamische Inhalte durch Google Gemini API
- **Progressive Web App**: Installierbar, offline-fähig (Service Worker)

### High-Level Diagramm

```
┌─────────────────────────────────────────────────────────┐
│                    Browser / Client                      │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   App.ts     │  │  HUD / Nav   │  │    Views     │ │
│  │  (Main App)  │  │ (Navigation) │  │  (UI Logic)  │ │
│  └──────┬───────┘  └──────────────┘  └──────────────┘ │
│         │                                                │
│  ┌──────▼──────────────────────────────────────────┐   │
│  │           State Management                       │   │
│  │  - UserProfile (localStorage)                    │   │
│  │  - UserProgress (localStorage)                   │   │
│  │  - LetterQueue (localStorage)                    │   │
│  └──────┬──────────────────────────────────────────┘   │
│         │                                                │
│  ┌──────▼──────────────────────────────────────────┐   │
│  │        Background Services                       │   │
│  │  - Letter Generation (setInterval: 20min)        │   │
│  │  - Queue Management                              │   │
│  └──────┬──────────────────────────────────────────┘   │
└─────────┼──────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────┐
│              Google Gemini API (REST)                    │
│                   (gemini-1.5-pro)                       │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Vanilla TypeScript (keine Framework-Abhängigkeiten)
- **Build Tool**: Vite 6.4.1
- **TypeScript**: 5.6.3
- **Styling**: Pure CSS (Custom Properties, Responsive Design)

### AI & APIs
- **Google Generative AI SDK**: `@google/genai` (0.21.0)
- **Modell**: `gemini-1.5-pro` (oder `gemini-1.5-flash` für Free Tier)

### PWA
- **Service Worker**: Vite PWA Plugin (`vite-plugin-pwa`)
- **Manifest**: `manifest.webmanifest`
- **Caching Strategy**: generateSW (Workbox)

### Entwicklung
- **Dev Server**: Vite Dev Server (Port 5173)
- **Hot Module Replacement (HMR)**: Ja
- **Linting**: TypeScript Compiler (tsc)

---

## 📁 Projektstruktur

```
epistulae/
├── frontend/
│   ├── src/
│   │   ├── main.ts                 # Entry Point
│   │   ├── App.ts                  # Main App Logic
│   │   ├── letters.ts              # Static Letter Types & Fallbacks
│   │   ├── scholars.ts             # 20 Gelehrten-Definitionen
│   │   ├── gemini.ts               # Google Gemini API Integration
│   │   ├── letterQueue.ts          # Queue Management & Background Generation
│   │   ├── components/
│   │   │   ├── HUD.ts              # Header & Navigation
│   │   │   ├── ScholarCard.ts      # Gelehrten-Avatare & Modals
│   │   │   └── Countdown.ts        # Countdown für nächsten Brief
│   │   ├── views/
│   │   │   ├── HomeView.ts         # Startseite mit Story
│   │   │   ├── LetterView.ts       # Brief lesen & antworten
│   │   │   ├── ProgressViewNew.ts  # Fortschritt (beantwortete Briefe)
│   │   │   ├── ScholarsView.ts     # Gelehrten-Übersicht
│   │   │   └── ProfileView.ts      # Benutzerprofil bearbeiten
│   │   ├── utils/
│   │   │   └── avatars.ts          # Avatar-Generierung (Initialen, Farben)
│   │   ├── style.css               # Global Styles (inkl. Responsive)
│   │   └── sw.ts                   # Service Worker Konfiguration
│   ├── public/
│   │   ├── icon-192.png
│   │   ├── icon-512.png
│   │   └── manifest.webmanifest
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── package.json
│   └── .env                        # VITE_GEMINI_API_KEY
├── VERSION                         # Aktuelle Version (0.3.0)
├── CHANGELOG.md                    # Versionshistorie
└── TECHNICAL.md                    # Diese Datei
```

---

## 🎯 Core Features

### 1. **Onboarding**
- Benutzer gibt Namen, Alter, Lernwunsch und Selbstbeschreibung ein
- Profil wird in `localStorage` gespeichert
- Nach Onboarding: Generierung der ersten 3 Briefe

### 2. **Brief-Generierung**
- **Initial**: 3 Briefe beim ersten Start
- **Background**: Alle 20 Minuten ein neuer Brief (max. 7 in Queue)
- **Kontext-bewusst**: Briefe berücksichtigen:
  - Benutzerprofil (Name, Alter, Lernwunsch, Selbstbeschreibung)
  - Alle bisherigen beantworteten Briefe
  - Zufälliger Gelehrter wird ausgewählt

### 3. **Brief-Beantwortung**
- Freie Texteingabe (max. 500 Zeichen)
- Optional: 3 vorgeschlagene Antworten (können ins Textfeld eingefügt werden)
- Nach Absenden: Antwort wird gespeichert, nächster Brief aus Queue wird geladen

### 4. **Navigation (5 Views)**
- **Home**: Story-Seite mit Erklärung der App
- **Briefe**: Aktuellen Brief lesen & antworten
- **Fortschritt**: Liste aller beantworteten Briefe
- **Gelehrte**: Übersicht aller 20 Gelehrten (gruppiert nach Kategorien)
- **Profil**: Benutzerprofil bearbeiten

### 5. **20 Gelehrte**
Kategorien:
- **Philosophie & Geisteswissenschaften**: Sokrates, Platon, Aristoteles, Seneca, Cicero
- **Mathematik & Formale Wissenschaften**: Pythagoras, Euklid, Diophantos
- **Naturwissenschaften & Technik**: Archimedes, Demokrit, Hippokrates, Galen, Vitruv
- **Erd- & Weltraumwissenschaften**: Aristarch, Ptolemäus, Eratosthenes
- **Gesellschafts- & Kulturwissenschaften**: Herodot, Thukydides, Solon, Aristoxenos

Jeder Gelehrte hat:
- ID, Name, Fachbereich (fieldOfStudy), Kategorie
- Expertise-Bereiche, Biografie, Ära
- Avatar (Initialen mit individueller Farbe)

### 6. **Responsive Design**
- **Desktop**: Header oben, Navigation in Header integriert
- **Mobile (<768px)**: 
  - Header fixiert oben (verfügbare & beantwortete Briefe)
  - Bottom Tab Navigation (fixiert unten)
  - Optimiertes Layout für kleine Screens

---

## 🔄 Datenfluss

### Initialisierung (initApp)

```typescript
1. Lade Profil aus localStorage
   ├─ Profil vorhanden?
   │  ├─ Ja: Starte Background-Generation
   │  │      Navigiere zu 'home'
   │  └─ Nein: Zeige Onboarding
   └─ Onboarding abgeschlossen:
      ├─ Speichere Profil
      ├─ Generiere 3 initiale Briefe
      └─ Navigiere zu 'home'
```

### Brief-Generierung (letterQueue.ts)

```typescript
1. generateAndEnqueue(profile, previousLetters)
   ├─ Wähle zufälligen Gelehrten
   ├─ Rufe Gemini API mit Kontext
   │  ├─ Profil: Name, Alter, Lernwunsch, Selbstbeschreibung
   │  ├─ Historie: Alle beantworteten Briefe
   │  └─ Gelehrter: Name, Expertise, Ära
   ├─ Parse Response (Brief-Text + 3 Antwortoptionen)
   └─ Speichere in Queue (localStorage)

2. startBackgroundGeneration()
   ├─ setInterval(tryGenerateNext, 20 Minuten)
   └─ tryGenerateNext()
      ├─ Queue < 7?
      │  └─ Ja: generateAndEnqueue()
      └─ Nein: Warte
```

### Brief-Anzeige & Antwort (LetterView + App)

```typescript
1. showLetterView()
   ├─ Gibt es currentLetter in progress?
   │  ├─ Ja: Zeige diesen Brief
   │  └─ Nein: Hole nächsten aus Queue
   │     ├─ Queue leer?
   │     │  └─ Zeige Countdown bis nächster Generation
   │     └─ Zeige Brief
   │
2. Benutzer antwortet
   ├─ Speichere Antwort in progress.answeredLetters
   ├─ Lösche currentLetter
   ├─ Zeige Waiting-Animation ("Gelehrter liest...")
   └─ Lade nächsten Brief (goto 1)
```

---

## 🌐 API-Integration

### Google Gemini API

**Datei**: `frontend/src/gemini.ts`

**SDK**: `@google/genai`

**Konfiguration**:
```typescript
import { GoogleGenAI } from '@google/genai'

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY })
```

**Prompt-Struktur**:
```typescript
const prompt = `
Du bist ${scholar.name}, ${scholar.fieldOfStudy}.
Ära: ${scholar.era}
Expertise: ${scholar.expertise.join(', ')}

Hintergrund: Du schreibst aus dem Jenseits...

Benutzerprofil:
- Name: ${profile.displayName}
- Alter: ${profile.age}
- Lernwunsch: ${profile.wantToLearn}
- Selbstbeschreibung: ${profile.selfDescription}

Bisherige Konversation:
${previousLetters.map(l => `- Brief von ${l.scholar}: "${l.text.substring(0,100)}..." → Antwort: "${l.answer}"`).join('\n')}

Schreibe einen Brief (max. 300 Wörter).
Format:
[BRIEF]
...Brieftext...
[/BRIEF]

[ANTWORT1]
...Antwortvorschlag 1...
[/ANTWORT1]

[ANTWORT2]
...Antwortvorschlag 2...
[/ANTWORT2]

[ANTWORT3]
...Antwortvorschlag 3...
[/ANTWORT3]
`
```

**Response-Parsing**:
```typescript
const response = await ai.models.generateContent({
  model: 'gemini-1.5-pro',
  contents: [{ text: prompt }],
})

const generatedText = response.text || ''

// Extrahiere [BRIEF], [ANTWORT1], [ANTWORT2], [ANTWORT3]
const letterMatch = generatedText.match(/\[BRIEF\]([\s\S]*?)\[\/BRIEF\]/)
const answer1Match = generatedText.match(/\[ANTWORT1\]([\s\S]*?)\[\/ANTWORT1\]/)
// ...
```

**Fehlerbehandlung**:
- 404: Modell nicht verfügbar → Fallback auf anderen Modellnamen
- 429: Quota überschritten → Wartezeit einhalten
- Network Error: Benutzer informieren, Retry nach Wartezeit

---

## 💾 State Management

Alle Daten werden in **localStorage** gespeichert.

### Datenstrukturen

#### 1. UserProfile
```typescript
interface UserProfile {
  displayName: string
  age: number
  wantToLearn: string
  selfDescription: string
}

// localStorage Key: 'epistulae_profile'
```

#### 2. UserProgress
```typescript
interface UserProgress {
  currentLetter: QueuedLetter | null  // Aktuell angezeigter Brief
  answeredLetters: AnsweredLetter[]    // Historie
  updatedAt?: number
}

interface AnsweredLetter {
  letterId: string
  text: string                         // Brief-Text
  answer: string                       // Benutzer-Antwort
  scholarName: string
  answeredAt: number                   // Timestamp
}

// localStorage Key: 'epistulae_progress'
```

#### 3. Letter Queue
```typescript
interface QueuedLetter {
  id: string                           // UUID
  text: string
  answers: string[]                    // 3 Vorschläge
  scholarId: string
  scholar: Scholar
  generatedAt: number
}

// localStorage Key: 'epistulae_queue'
```

#### 4. Queue State
```typescript
interface QueueState {
  lastGeneratedAt: number              // Letzter Generierungs-Zeitpunkt
  totalGenerated: number               // Gesamt generierte Briefe
  isGenerating: boolean                // Aktuell am Generieren?
}

// localStorage Key: 'epistulae_queue_state'
```

### Helper Functions

```typescript
// In App.ts
function getLocalProfile(): UserProfile | null
function saveLocalProfile(p: UserProfile): void
function getLocalProgress(): UserProgress | null
function saveLocalProgress(p: UserProgress): void

// In letterQueue.ts
function getQueue(): QueuedLetter[]
function saveQueue(queue: QueuedLetter[]): void
function getQueueState(): QueueState
function saveQueueState(state: QueueState): void
```

---

## 🎨 Styling & Responsive Design

### CSS Architecture

**Datei**: `frontend/src/style.css`

**Strategie**: CSS Custom Properties + BEM-ähnliche Namenskonvention

### Custom Properties (CSS Variables)

```css
:root {
  /* Colors */
  --ink: #1a1a1a;              /* Text */
  --paper: #f8f6f3;            /* Background */
  --paper-dark: #f0ede8;
  --paper-shadow: #dcd5c8;
  --accent: #6b5344;           /* Primary (Brown) */
  --accent-soft: #8f7a6d;
  --white: #ffffff;

  /* Typography */
  --serif: "Crimson Text", "Georgia", serif;
  --sans: "Inter", "Helvetica Neue", sans-serif;

  /* Spacing */
  --radius: 12px;

  /* Effects */
  --shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}
```

### Responsive Breakpoints

```css
/* Desktop First: Standard Styles */

/* Tablet & Mobile */
@media (max-width: 768px) {
  /* Bottom Tab Navigation */
  /* Fixed Header oben */
  /* Kompaktere Layouts */
}

/* Extra Small Screens */
@media (max-width: 480px) {
  /* Labels verstecken */
  /* 2-Spalten-Grid */
}
```

### Key Mobile Adaptions

**HUD**:
- Desktop: Header mit Namen + Meta oben, Navigation integriert
- Mobile: Header fixiert oben, Navigation als Bottom Tab Bar

**Views**:
- Desktop: Full-Width, großzügige Abstände
- Mobile: Kompaktere Padding, vertikale Layouts

**Gelehrten-Grid**:
- Desktop: `repeat(auto-fill, minmax(200px, 1fr))`
- Tablet: `repeat(auto-fill, minmax(150px, 1fr))`
- Mobile: `2 Spalten`

---

## 🚀 Build & Deployment

### Entwicklung

```bash
# Installation
cd frontend
npm install

# Dev Server starten
npm run dev
# → http://localhost:5173

# TypeScript Check
npm run build
```

### Produktion

```bash
# Build für Produktion
npm run build
# → Output: frontend/dist/

# Preview Build
npm run preview
```

### PWA Features

**Service Worker**:
- Automatisch generiert durch `vite-plugin-pwa`
- Caching-Strategie: `generateSW` (Workbox)
- Precache: HTML, CSS, JS

**Manifest** (`public/manifest.webmanifest`):
```json
{
  "name": "Epistulae",
  "short_name": "Epistulae",
  "description": "Briefe aus dem Jenseits",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#6b5344",
  "background_color": "#f8f6f3",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### Deployment

**Empfohlene Plattformen**:
- **Vercel**: `vercel deploy`
- **Netlify**: Drag & Drop `dist/`
- **GitHub Pages**: 
  ```bash
  npm run build
  gh-pages -d dist
  ```

---

## 💻 Entwicklung

### Setup

1. **Klonen**:
   ```bash
   git clone https://github.com/bastian-fluegel/epistulae.git
   cd epistulae/frontend
   ```

2. **Dependencies installieren**:
   ```bash
   npm install
   ```

3. **Gemini API Key**:
   ```bash
   # .env erstellen
   echo "VITE_GEMINI_API_KEY=your_api_key_here" > .env
   ```
   
   API Key beziehen: [Google AI Studio](https://aistudio.google.com/apikey)

4. **Dev Server starten**:
   ```bash
   npm run dev
   ```

### Debugging

**Console Helper**:
```javascript
// Im Browser Console:
resetEpistulae()  // Löscht localStorage und lädt neu
```

**Logs**:
- Queue-Status: `📊 Queue: X Briefe, Nächster in: Y Min`
- Brief-Generierung: `📝 Generiere Brief von [Gelehrter]...`
- Fehler: `❌ Fehler beim Generieren: [Details]`

### Code-Qualität

**TypeScript Strict Mode**: Aktiviert
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

**Linting**: TypeScript Compiler (`tsc -b`)

### Testing

**Manuelle Tests**:
1. Onboarding durchlaufen
2. 3 initiale Briefe werden generiert
3. Brief beantworten
4. Navigation testen (alle 5 Views)
5. Profil bearbeiten
6. Mobile-Ansicht testen (DevTools)
7. Countdown-Anzeige (wenn Queue leer)

**Edge Cases**:
- Keine verfügbaren Briefe (Queue leer)
- Gemini API Fehler (404, 429)
- Netzwerk-Unterbrechung
- localStorage voll

---

## 🔒 Sicherheit & Datenschutz

### Daten-Speicherung
- **Nur lokal**: Alle Daten in Browser localStorage
- **Keine Server**: Keine Daten verlassen das Gerät (außer API-Calls)
- **API Key**: Wird im Code hardcoded (nur für lokale Nutzung empfohlen)

### Empfehlungen für Produktion
- API Key **nicht** im Frontend-Code
- Stattdessen: Backend-Proxy für Gemini API
- Rate Limiting für API-Calls
- Input Validation & Sanitization

---

## 📊 Performance

### Metriken (Zielwerte)
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.5s
- **Lighthouse Score**: > 90 (Performance, Accessibility, Best Practices, SEO)

### Optimierungen
- **Code Splitting**: Dynamische Imports für Views
- **Lazy Loading**: Gelehrten-Bilder (wenn vorhanden)
- **Service Worker**: Aggressive Caching
- **CSS**: Minimiertes, kritisches CSS inline

---

## 🐛 Bekannte Probleme & Limitationen

### Aktuelle Limitationen
1. **Gemini Free Tier**: 
   - 15 RPM (Requests per Minute)
   - 1500 RPD (Requests per Day)
   - Bei Überschreitung: 429 Error

2. **localStorage Limit**: 
   - Typisch 5-10 MB
   - Bei vielen Briefen: Evtl. Limit erreicht

3. **Offline-Funktionalität**: 
   - Brief-Generierung benötigt Netzwerk
   - Lesemodus funktioniert offline

4. **Browser-Kompatibilität**:
   - Moderne Browser (Chrome, Firefox, Safari, Edge)
   - IE11: Nicht unterstützt

### Geplante Verbesserungen
- Backend-Proxy für API-Sicherheit
- Datenbank statt localStorage (optional)
- Erweiterte Offline-Unterstützung
- Dark Mode

---

## 📚 Weitere Ressourcen

- **Google Gemini Docs**: https://ai.google.dev/docs
- **Vite Docs**: https://vite.dev/
- **PWA Docs**: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps
- **TypeScript Docs**: https://www.typescriptlang.org/docs/

---

## 📞 Support & Kontakt

**Projektinhaber**: Bastian Flügel  
**Repository**: https://github.com/bastian-fluegel/epistulae  
**Version**: 0.3.0  
**Letzte Aktualisierung**: 2026-02-13

---

*Für Fragen, Bug-Reports oder Feature-Requests bitte ein GitHub Issue erstellen.*
