# Changelog

Alle nennenswerten Änderungen an Epistulae werden hier dokumentiert.

Format: [Keep a Changelog](https://keepachangelog.com/de/1.0.0/), Versionierung: [Semantic Versioning](https://semver.org/lang/de/).

---

## [Unreleased]

### Geplant
- PWA-Installation
- Erweiterte Dialog-Historie

---

## [0.3.0] – 2026-02-13

### Hinzugefügt
- **Home-View mit Story**: Neue Startseite erzählt die Geschichte der 20 Gelehrten aus dem Jenseits
- **20 antike Gelehrte**: Vollständige Integration von Philosophen, Mathematikern, Naturwissenschaftlern und Historikern
- **Gelehrten-Übersicht**: Neue View mit allen Gelehrten, gruppiert nach Kategorien, mit Detail-Modals
- **Dynamische Brief-Generierung**: Integration von Google Gemini AI für personalisierte, kontextuelle Briefe
- **Letter Queue System**: Automatische Brief-Generierung alle 20 Minuten, max. 7 vorproduzierte Briefe
- **Freie Texteingabe**: Benutzer können eigene Antworten schreiben statt nur vorgegebene Optionen
- **Countdown-Anzeige**: Zeigt an, wann der nächste Brief generiert wird
- **Neuer Fortschritt-View**: Übersicht aller beantworteten Briefe mit Zeitstempel und Antworten
- **Profil-Bearbeitung**: Möglichkeit, Profildaten nachträglich zu ändern
- **Gelehrten-Avatare**: Farbige Avatar-Platzhalter mit Initialen für jeden Gelehrten
- **Mobile Bottom Navigation**: Responsive Design mit Tab-Bar am unteren Bildschirmrand
- **Verfügbare Briefe im Header**: Anzeige von verfügbaren und beantworteten Briefen im HUD

### Geändert
- Keine Firebase-Authentifizierung mehr: App läuft vollständig lokal mit localStorage
- Navigation erweitert auf 5 Views: Home, Briefe, Fortschritt, Gelehrte, Profil
- HUD zeigt jetzt verfügbare Briefe (Queue) und beantwortete Briefe an
- Briefe werden von verschiedenen Gelehrten geschrieben (zufällige Auswahl)
- Briefe berücksichtigen Konversationshistorie und Benutzerprofil

### Technisch
- Integration von `@google/genai` SDK für Gemini API
- Local Storage für Profil, Fortschritt und Brief-Queue
- Background-Generierung mit setInterval
- Umfassende TypeScript-Typisierung
- Responsive Design mit @media queries für Mobile (<768px)

---

## [0.2.0] – 2026-02-13

### Hinzugefügt
- Modernes HUD mit Navigation (Briefe/Fortschritt/Profil), Brief-Flow mit 'Sokrates liest...'-Warteansicht, zeitloses Design

---

## [0.1.3] – 2026-02-13

### Hinzugefügt
- Profil, Onboarding, HUD, Brief-Flow, Typewriter-Animation

---

## [0.1.2] – 2026-02-13

### Hinzugefügt
- Firebase-Fehlerbehandlung, Hosting Default, README-Checkliste und Troubleshooting

---

## [0.1.1] – 2026-02-13

### Hinzugefügt
- Statische PWA, Firebase epistulae-2318a, Analytics, CI/CD

---

## [0.1.0] – 2026-02-13

### Hinzugefügt
- Idee & Konzept (idea.md, konzept.md)
- Google AI Studio Anbindung (test.py, run.sh)
- Firebase-Setup-Anleitung (docs/firebase-setup.md)
- Changelog und Versionierung (CHANGELOG.md, VERSION, version.sh)
- Docker-Setup mit Firebase-Emulatoren
- Erste Oberfläche: Brief von Sokrates mit drei Antwortoptionen

### Technisch
- Python 3.9+, FastAPI, Firebase Emulator Suite
- Lokale Entwicklung mit Docker Compose

[Unreleased]: https://github.com/bastian-fluegel/epistulae/compare/v0.3.0...HEAD
[0.3.0]: https://github.com/bastian-fluegel/epistulae/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/bastian-fluegel/epistulae/compare/v0.1.3...v0.2.0
[0.1.3]: https://github.com/bastian-fluegel/epistulae/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/bastian-fluegel/epistulae/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/bastian-fluegel/epistulae/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/bastian-fluegel/epistulae/releases/tag/v0.1.0
