/**
 * HUD: Navigation zwischen Letter, Progress, Profile
 */
export type View = 'letter' | 'progress' | 'profile'

export interface HUDProps {
  displayName: string
  letterCount: number
  currentView: View
  onNavigate: (view: View) => void
}

const VIEWS = [
  { id: 'letter' as View, icon: '✉️', label: 'Briefe' },
  { id: 'progress' as View, icon: '🌳', label: 'Fortschritt' },
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
        <span class="hud-meta">${props.letterCount} Brief${props.letterCount !== 1 ? 'e' : ''}</span>
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
