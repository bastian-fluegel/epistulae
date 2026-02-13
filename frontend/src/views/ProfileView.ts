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

export function renderProfile(profile: ProfileData, editMode: boolean = false): string {
  if (editMode) {
    return `
      <div class="profile-view">
        <h2 class="view-title">Profil bearbeiten</h2>
        <div class="profile-card">
          <form id="profile-edit-form" class="profile-edit-form">
            <label>Name</label>
            <input type="text" name="displayName" value="${escapeHtml(profile.displayName)}" required maxlength="50">
            
            <label>Alter</label>
            <input type="number" name="age" value="${profile.age}" required min="10" max="120">
            
            <label>Was möchtest du lernen?</label>
            <textarea name="wantToLearn" rows="3" maxlength="500">${escapeHtml(profile.wantToLearn)}</textarea>
            
            <label>Selbstbeschreibung</label>
            <textarea name="selfDescription" rows="4" maxlength="800">${escapeHtml(profile.selfDescription)}</textarea>
            
            <div class="profile-edit-actions">
              <button type="submit" class="btn-submit">Speichern</button>
              <button type="button" class="btn-cancel">Abbrechen</button>
            </div>
          </form>
        </div>
      </div>
    `
  }
  
  return `
    <div class="profile-view">
      <div class="profile-header">
        <h2 class="view-title">Dein Profil</h2>
        <button type="button" class="btn-edit-profile">Bearbeiten</button>
      </div>
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

export function showProfile(
  container: HTMLElement, 
  profile: ProfileData,
  onSave?: (updated: Omit<ProfileData, 'letterCount'>) => void
): void {
  let editMode = false
  
  const render = () => {
    container.innerHTML = renderProfile(profile, editMode)
    
    if (editMode) {
      // Edit mode: bind form
      const form = container.querySelector('#profile-edit-form') as HTMLFormElement
      const cancelBtn = container.querySelector('.btn-cancel') as HTMLButtonElement
      
      form?.addEventListener('submit', (e) => {
        e.preventDefault()
        const data = new FormData(form)
        
        const updated = {
          displayName: (data.get('displayName') as string)?.trim() || profile.displayName,
          age: Number(data.get('age')) || profile.age,
          wantToLearn: (data.get('wantToLearn') as string)?.trim() || '',
          selfDescription: (data.get('selfDescription') as string)?.trim() || '',
        }
        
        if (onSave) onSave(updated)
        editMode = false
        render()
      })
      
      cancelBtn?.addEventListener('click', () => {
        editMode = false
        render()
      })
    } else {
      // View mode: bind edit button
      const editBtn = container.querySelector('.btn-edit-profile') as HTMLButtonElement
      editBtn?.addEventListener('click', () => {
        editMode = true
        render()
      })
    }
  }
  
  render()
}
