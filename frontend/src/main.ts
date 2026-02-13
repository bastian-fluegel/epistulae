import { initApp } from './App'

try {
  initApp()
} catch (e) {
  const root = document.getElementById('app')
  if (root) {
    const msg = e instanceof Error ? e.message : String(e)
    root.innerHTML = `
      <div style="max-width:36rem;margin:2rem auto;padding:1.5rem;font-family:system-ui,sans-serif;">
        <h2 style="color:#6b5344;">Epistulae</h2>
        <p style="color:#a44;background:#fdd;padding:1rem;border-radius:6px;">${msg.replace(/</g, '&lt;')}</p>
        <p style="color:#666;font-size:0.9rem;">Schritte: <code>cd frontend</code> → <code>cp .env.example .env</code> → Werte aus der Firebase Console (Projekteinstellungen → Web-App) eintragen.</p>
      </div>
    `
  }
  throw e
}
