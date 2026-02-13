import { initApp } from './App'

// Version für Cache-Debugging
const APP_VERSION = '2.0.0-profile-tree'
console.log(`🚀 Epistulae v${APP_VERSION}`)

// SW-Update-Detection: Einfache Lösung ohne virtual module
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(reg => {
      setInterval(() => {
        reg.update() // Check for updates every 60s
      }, 60000)
      
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing
        if (!newWorker) return
        
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // Neue Version verfügbar!
            const banner = document.createElement('div')
            banner.style.cssText = `
              position: fixed; top: 0; left: 0; right: 0; z-index: 9999;
              background: #6b5344; color: #fff; padding: 1rem; text-align: center;
              font-family: system-ui, sans-serif; font-size: 0.95rem; box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            `
            const btn = document.createElement('button')
            btn.textContent = 'Jetzt aktualisieren'
            btn.style.cssText = 'margin-left:1rem;padding:0.4rem 0.8rem;background:#fff;color:#6b5344;border:none;border-radius:4px;cursor:pointer;font-weight:500;'
            btn.onclick = () => {
              newWorker.postMessage({ type: 'SKIP_WAITING' })
              window.location.reload()
            }
            banner.innerHTML = '<span>✨ Neue Version verfügbar!</span>'
            banner.appendChild(btn)
            document.body.prepend(banner)
          }
        })
      })
    })
  })
}

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
