/**
 * Countdown Component
 */

export function renderCountdown(minutesLeft: number): string {
  if (minutesLeft <= 0) {
    return `<div class="countdown">📬 Neuer Brief wird generiert...</div>`
  }

  const hours = Math.floor(minutesLeft / 60)
  const mins = minutesLeft % 60

  let timeText = ''
  if (hours > 0) {
    timeText = `${hours}h ${mins}min`
  } else {
    timeText = `${mins} Minuten`
  }

  return `
    <div class="countdown">
      <span class="countdown-icon">⏰</span>
      <span class="countdown-text">Nächster Brief in: <strong>${timeText}</strong></span>
    </div>
  `
}
