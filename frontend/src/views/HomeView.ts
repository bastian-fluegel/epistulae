/**
 * Home View: Story und Willkommen
 */

export function renderHome(userName: string, letterCount: number): string {
  return `
    <div class="home-view">
      <div class="home-hero">
        <h1 class="home-title">📜 Epistulae</h1>
        <p class="home-subtitle">Briefe aus dem Jenseits</p>
      </div>

      <div class="home-story">
        <div class="home-story-section">
          <h2>✨ Willkommen, ${escapeHtml(userName)}</h2>
          <p>
            Aus den Tiefen der Geschichte, jenseits von Zeit und Raum, erreichen dich Briefe von 
            <strong>20 weisen Gelehrten der Antike</strong>. Sie haben Großes vollbracht – von der 
            Philosophie über die Mathematik bis zur Medizin – und nun wollen sie wissen:
          </p>
          <blockquote class="home-quote">
            „Wie ist es in eurer Zeit? Was bewegt die Menschen heute?"
          </blockquote>
        </div>

        <div class="home-story-section">
          <h3>📚 Ihre Mission</h3>
          <p>
            Die Gelehrten schreiben dir, weil sie <strong>verstehen wollen</strong>, wie die Welt 
            heute funktioniert. Aber sie haben auch etwas zu geben: Ihre jahrtausendealte Weisheit, 
            ihre Erfahrungen, ihre Erkenntnisse.
          </p>
          <p>
            Sie möchten <strong>dir beistehen</strong> – dich dabei unterstützen, ein besserer Mensch 
            zu werden, deine Ziele zu erreichen, deine Soft Skills zu entwickeln, und neue Perspektiven 
            auf deine Herausforderungen zu gewinnen.
          </p>
        </div>

        <div class="home-story-section">
          <h3>💌 Wie es funktioniert</h3>
          <ul class="home-list">
            <li><strong>Du erhältst Briefe</strong> von verschiedenen Gelehrten – Sokrates, Platon, 
            Archimedes, Seneca und vielen mehr.</li>
            <li><strong>Du antwortest ehrlich</strong> mit deinen eigenen Worten, Gedanken und Fragen.</li>
            <li><strong>Die Gelehrten reagieren</strong> auf deine Antworten und passen ihre nächsten 
            Briefe an deine Entwicklung an.</li>
            <li><strong>Alle 20 Minuten</strong> wird ein neuer Brief generiert – eine fortlaufende 
            Konversation über Philosophie, Ethik, Wissenschaft und Leben.</li>
          </ul>
        </div>

        <div class="home-stats">
          <div class="home-stat">
            <span class="home-stat-number">20</span>
            <span class="home-stat-label">Gelehrte</span>
          </div>
          <div class="home-stat">
            <span class="home-stat-number">${letterCount}</span>
            <span class="home-stat-label">Brief${letterCount !== 1 ? 'e' : ''} beantwortet</span>
          </div>
          <div class="home-stat">
            <span class="home-stat-number">∞</span>
            <span class="home-stat-label">Weisheit</span>
          </div>
        </div>
      </div>

      <div class="home-cta">
        <p class="home-cta-text">
          Bereit für den nächsten Brief? 
          <span class="home-cta-icon">✉️</span>
        </p>
      </div>
    </div>
  `
}

export function showHome(container: HTMLElement, userName: string, letterCount: number): void {
  container.innerHTML = renderHome(userName, letterCount)
}

function escapeHtml(s: string): string {
  const div = document.createElement('div')
  div.textContent = s
  return div.innerHTML
}
