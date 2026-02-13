/**
 * ProfileView: Profil-Daten anzeigen
 */
export interface ProfileData {
  displayName: string
  age: number
  wantToLearn: string
  selfDescription: string
  letterCount: number
}

function escapeHtml(s: string): string {
  const div = document.createElement('div')
  div.textContent = s
  return div.innerHTML
}

export function renderProfile(profile: ProfileData): string {
  return `
    <div class="profile-view">
      <h2 class="view-title">Dein Profil</h2>
      <div class="profile-card">
        <dl class="profile-dl">
          <dt>Name</dt>
          <dd>${escapeHtml(profile.displayName)}</dd>
          
          <dt>Alter</dt>
          <dd>${profile.age}</dd>
          
          <dt>Lernwunsch</dt>
          <dd>${escapeHtml(profile.wantToLearn) || '–'}</dd>
          
          <dt>Selbstbeschreibung</dt>
          <dd>${escapeHtml(profile.selfDescription) || '–'}</dd>
          
          <dt>Briefe beantwortet</dt>
          <dd>${profile.letterCount}</dd>
        </dl>
      </div>
    </div>
  `
}

export function showProfile(container: HTMLElement, profile: ProfileData): void {
  container.innerHTML = renderProfile(profile)
}
