/**
 * Avatar Utilities: Generate initials and colors for scholars
 */

/**
 * Generate initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

/**
 * Generate a unique color for a scholar based on their ID
 */
export function getScholarColor(scholarId: string): { bg: string; fg: string } {
  const colors = [
    { bg: '#6b5344', fg: '#ffffff' }, // Brown
    { bg: '#2c5f2d', fg: '#ffffff' }, // Green
    { bg: '#1e3a5f', fg: '#ffffff' }, // Navy
    { bg: '#6d3a3a', fg: '#ffffff' }, // Burgundy
    { bg: '#4a5f6d', fg: '#ffffff' }, // Slate
    { bg: '#7a4b3a', fg: '#ffffff' }, // Terracotta
    { bg: '#3d5a3d', fg: '#ffffff' }, // Forest
    { bg: '#5a4068', fg: '#ffffff' }, // Purple
    { bg: '#6d5a4b', fg: '#ffffff' }, // Taupe
    { bg: '#3a4d6d', fg: '#ffffff' }, // Steel
  ]

  // Hash scholar ID to get consistent color
  let hash = 0
  for (let i = 0; i < scholarId.length; i++) {
    hash = scholarId.charCodeAt(i) + ((hash << 5) - hash)
  }

  const index = Math.abs(hash) % colors.length
  return colors[index]
}

/**
 * Generate avatar HTML with scholar-specific styling
 */
export function renderScholarAvatar(
  scholarId: string,
  name: string,
  size: 'small' | 'medium' | 'large' = 'medium',
  imageUrl?: string
): string {
  const initials = getInitials(name)
  const colors = getScholarColor(scholarId)

  const sizeClass = `scholar-avatar-${size}`

  if (imageUrl) {
    return `
      <div class="scholar-avatar ${sizeClass}" 
           style="background-image: url('${imageUrl}'); background-size: cover; background-position: center;">
      </div>
    `
  }

  return `
    <div class="scholar-avatar ${sizeClass}" 
         style="background: linear-gradient(135deg, ${colors.bg} 0%, ${adjustColorBrightness(colors.bg, 20)} 100%); color: ${colors.fg};">
      ${initials}
    </div>
  `
}

/**
 * Adjust color brightness (for gradient effect)
 */
function adjustColorBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = (num >> 16) + amt
  const G = ((num >> 8) & 0x00ff) + amt
  const B = (num & 0x0000ff) + amt

  return (
    '#' +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  )
}
