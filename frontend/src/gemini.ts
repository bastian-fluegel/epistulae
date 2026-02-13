/**
 * Google Gemini API Integration (mit @google/genai SDK)
 */

import { GoogleGenAI } from '@google/genai'
import type { Scholar } from './scholars'
import type { UserProfile } from './App'

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ''

export interface GeneratedLetter {
  text: string
  answers: string[]
  topic: string
  scholarId: string
}

export async function generateLetter(
  scholar: Scholar,
  profile: UserProfile,
  previousLetters: Array<{ text: string; answer: string; scholar: string }> = []
): Promise<GeneratedLetter> {
  if (!GEMINI_API_KEY) {
    throw new Error('VITE_GEMINI_API_KEY ist nicht gesetzt')
  }

  // Konversationshistorie mit Gelehrten-Namen
  const conversationHistory = previousLetters
    .map((l, i) => `Brief ${i + 1} (von ${l.scholar}):\n${l.text}\n\nDeine Antwort: ${l.answer}`)
    .join('\n\n---\n\n')

  const prompt = `Du bist ${scholar.name} (${scholar.era}), ${scholar.fieldOfStudy}.
Du schreibst einen Brief aus dem Jenseits an ${profile.displayName} (${profile.age} Jahre alt).

**Über ${profile.displayName}:**
- Alter: ${profile.age} Jahre
- Möchte lernen: ${profile.wantToLearn}
- Selbstbeschreibung: ${profile.selfDescription}

**Deine Expertise:** ${scholar.expertise.join(', ')}
**Deine Kategorie:** ${scholar.category}

**Bisherige Konversation:**
${conversationHistory || 'Dies ist der erste Brief.'}

**WICHTIG:**
1. Dieser Brief ist Teil einer **fortlaufenden Konversation** über mehrere Gelehrte hinweg
2. Beziehe dich auf die bisherigen Briefe und Antworten (auch wenn sie von anderen Gelehrten waren)
3. Baue auf dem bisher Erreichten auf - die Konversation soll Fortschritt zeigen
4. Schreibe 150-250 Wörter, persönlich und nachdenklich
5. Stelle eine tiefgründige Frage aus deinem Fachgebiet
6. Beziehe dich auf ${profile.displayName}s Lernziele: "${profile.wantToLearn}"
7. Sprich aus deiner historischen Perspektive, aber mit Relevanz für heute
8. Bleibe authentisch in deinem Stil und deiner Persönlichkeit
9. Nutze die "Du"-Form und sprich ${profile.displayName} direkt an
10. **Wichtig:** Auch wenn andere Gelehrte vorher geschrieben haben, knüpfe an ihre Gedanken an

**Format:**
Schreibe den Brief, ende mit einer Frage, und gib dann auf einer neuen Zeile nach "---ANTWORTEN---" genau 3 mögliche Antworten an (eine pro Zeile, mit "- " davor).

Beispiel:
Grüße, ${profile.displayName}! [Brief-Text hier] Was denkst du darüber?

---ANTWORTEN---
- Erste mögliche Antwort
- Zweite mögliche Antwort
- Dritte mögliche Antwort
`

  try {
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY })
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    })

    const generatedText = response.text || ''

    if (!generatedText) {
      throw new Error('Keine Antwort von Gemini API erhalten')
    }

    // Parse Brief und Antworten
    const parts = generatedText.split('---ANTWORTEN---')
    const letterText = parts[0]?.trim() || generatedText
    const answersRaw = parts[1]?.trim() || ''

    const answers = answersRaw
      .split('\n')
      .map((line: string) => line.replace(/^-\s*/, '').trim())
      .filter((line: string) => line.length > 0)

    // Fallback: Wenn keine Antworten geparst wurden, generiere Default-Antworten
    if (answers.length < 3) {
      answers.push(
        'Das ist eine schwierige Frage. Lass mich darüber nachdenken.',
        'Ich habe eine andere Perspektive darauf.',
        'Kannst du mir mehr dazu sagen?'
      )
    }

    return {
      text: letterText,
      answers: answers.slice(0, 3),
      topic: scholar.fieldOfStudy,
      scholarId: scholar.id,
    }
  } catch (error) {
    console.error('❌ Fehler beim Generieren des Briefs:', error)
    throw error
  }
}

// Test-Funktion (nur für Development)
export async function testGeminiConnection(): Promise<boolean> {
  if (!GEMINI_API_KEY) {
    console.error('❌ VITE_GEMINI_API_KEY nicht gesetzt')
    return false
  }

  try {
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY })
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: 'Hallo, bist du da?',
    })

    if (response.text) {
      console.log('✅ Gemini API funktioniert:', response.text)
      return true
    } else {
      console.error('❌ Gemini API: Keine Antwort')
      return false
    }
  } catch (error) {
    console.error('❌ Gemini API Connection Error:', error)
    return false
  }
}
