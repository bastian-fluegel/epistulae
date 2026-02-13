/**
 * HUD: Navigation zwischen Home, Letter, Progress, Scholars, Profile
 */
export type View = 'home' | 'letter' | 'progress' | 'scholars' | 'profile'

export interface HUDProps {
  displayName: string
  letterCount: number
  availableLetters: number
  currentView: View
  onNavigate: (view: View) => void
}

const VIEWS = [
  { id: 'home' as View, icon: '🏛️', label: 'Home' },
  { id: 'letter' as View, icon: '✉️', label: 'Briefe' },
  { id: 'progress' as View, icon: '📊', label: 'Fortschritt' },
  { id: 'scholars' as View, icon: '📚', label: 'Gelehrte' },
  { id: 'profile' as View, icon: '👤', label: 'Profil' },
]

export function renderHUD(props: HUDProps): string {
  const navButtons = VIEWS.map(v => {
    const active = props.currentView === v.id ? ' nav-btn--active' : ''
    return `
      <button type="button" class="nav-btn${active}" data-view="${v.id}">
        <span class="nav-btn__icon">${v.icon}</span>
        <span class="nav-btn__label">${v.label}</span>
      </button>
    `
  }).join('')

  return `
    <div class="hud">
      <div class="hud-header">
        <span class="hud-name">Hallo, ${escapeHtml(props.displayName)}</span>
        <div class="hud-meta">
          <span class="hud-meta-item">
            <span class="hud-meta-icon">✉️</span>
            <span class="hud-meta-value">${props.availableLetters}</span>
            <span class="hud-meta-label">verfügbar</span>
          </span>
          <span class="hud-meta-divider">|</span>
          <span class="hud-meta-item">
            <span class="hud-meta-icon">✅</span>
            <span class="hud-meta-value">${props.letterCount}</span>
            <span class="hud-meta-label">beantwortet</span>
          </span>
        </div>
      </div>
      <nav class="hud-nav">${navButtons}</nav>
    </div>
  `
}

export function bindHUD(container: HTMLElement, onNavigate: (view: View) => void): void {
  container.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const view = (btn as HTMLElement).getAttribute('data-view') as View
      if (view) onNavigate(view)
    })
  })
}

function escapeHtml(s: string): string {
  const div = document.createElement('div')
  div.textContent = s
  return div.innerHTML
}
