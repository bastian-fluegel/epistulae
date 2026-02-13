/**
 * Entry Point: Service Worker deregistrieren, App starten
 */
import { initApp } from './App'

// Service Worker komplett deaktivieren (alte Versionen entfernen)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((reg) => reg.unregister())
  })
}

// Alle Caches löschen
if ('caches' in window) {
  caches.keys().then((names) => {
    names.forEach((name) => caches.delete(name))
  })
}

// Version für Debugging
const APP_VERSION = '0.2.0'
console.log(`🚀 Epistulae v${APP_VERSION}`)

// App starten
try {
  initApp()
} catch (e) {
  const root = document.getElementById('app')
  if (root) {
    const msg = e instanceof Error ? e.message : String(e)
    root.innerHTML = `
      <div style="max-width:36rem;margin:2rem auto;padding:1.5rem;font-family:system-ui,sans-serif;">
        <h2 style="color:#6b5344;">Epistulae</h2>
        <p style="color:#c44;background:#fdd;padding:1rem;border-radius:8px;">${msg.replace(/</g, '&lt;')}</p>
        <p style="color:#666;font-size:0.9rem;">
          In <code>frontend/.env</code> die Werte aus der Firebase Console eintragen.
        </p>
      </div>
    `
  }
  throw e
}
