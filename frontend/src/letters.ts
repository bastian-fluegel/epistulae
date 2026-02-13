/**
 * Brief-Inhalte und Ablauf: Welcher Brief folgt auf welche Antwort.
 * Später: neue Briefe aus Profil (name, alter, wantToLearn, selfDescription) generieren.
 */
export interface Letter {
  id: string
  text: string
  antworten: [string, string, string]
}

/** Nächster Brief pro Antwort (Index 0–2). Fehlt der Eintrag = Ende dieses Zweigs. */
const NEXT_LETTER: Record<string, [string | null, string | null, string | null]> = {
  'brief-1': ['brief-2a', 'brief-2b', 'brief-2c'],
  'brief-2a': ['brief-3a', 'brief-3b', null],
  'brief-2b': ['brief-3c', 'brief-3d', null],
  'brief-2c': ['brief-3e', null, null],
  'brief-3a': [null, null, null],
  'brief-3b': [null, null, null],
  'brief-3c': [null, null, null],
  'brief-3d': [null, null, null],
  'brief-3e': [null, null, null],
}

const LETTERS: Record<string, Letter> = {
  'brief-1': {
    id: 'brief-1',
    text: `Grüße, Freund! Ich bin durch eine mir unerklärliche Laune der Götter
in eure Zeit geworfen worden. Alles hier verwirrt mich: die leuchtenden
Schachteln, in die die Menschen starr blicken; die Wagen ohne Pferde;
die Fülle an Dingen, die niemand zu brauchen scheint und doch begehrt.
Sag mir – was hält diese Welt im Innersten zusammen? Und was hält dich?`,
    antworten: [
      'Vielleicht hält uns gar nichts – wir rennen einfach mit.',
      'Ich denke, es geht um Verbindung: zu anderen, zu etwas, das größer ist als man selbst.',
      'Die Frage stelle ich mir auch. Vielleicht ist das Suchen schon die halbe Antwort.',
    ],
  },
  'brief-2a': {
    id: 'brief-2a',
    text: `Du sagst, vielleicht hält uns gar nichts – wir rennen mit. Das klingt nach Resignation, und doch steckt darin eine scharfe Beobachtung. Wenn niemand mehr hält, wer hält dann das Rennen am Laufen? Und: Willst du nur mitrennen, oder gibt es einen Ort, an dem du anhalten möchtest?`,
    antworten: [
      'Ehrlich gesagt renne ich oft ohne zu wissen wohin.',
      'Ich suche einen Ort zum Anhalten – finde ihn aber nicht.',
      'Vielleicht ist das Rennen selbst der Sinn – Bewegung statt Stillstand.',
    ],
  },
  'brief-2b': {
    id: 'brief-2b',
    text: `Verbindung – zu anderen, zu etwas Größerem. In Athen sprachen wir von der Polis, vom Gemeinwesen. Heute sehe ich unzählige Fäden zwischen den Menschen, und doch wirkt vieles einsam. Was bedeutet dir diese Verbindung konkret? Und wo spürst du sie – oder ihr Fehlen?`,
    antworten: [
      'In der Familie und bei wenigen Freunden spüre ich sie.',
      'Ich vermisse sie oft; die Welt wirkt oberflächlich verbunden.',
      'Ich bin unsicher, ob ich Verbindung überhaupt zulassen kann.',
    ],
  },
  'brief-2c': {
    id: 'brief-2c',
    text: `Das Suchen als halbe Antwort – das gefällt mir. Wer sucht, hat noch nicht aufgegeben. Aber wonach suchst du genau? Und wie erträgst du es, die Antwort vielleicht nie zu finden?`,
    antworten: [
      'Ich suche nach einem Sinn, der zu mir passt.',
      'Ich ertrage das Offene schlecht – ich will Gewissheit.',
      'Das Suchen selbst gibt mir Halt, mehr als jede fertige Antwort.',
    ],
  },
  'brief-3a': {
    id: 'brief-3a',
    text: `„Ehrlich gesagt renne ich oft ohne zu wissen wohin.“ Diese Ehrlichkeit ist der erste Schritt. Viele rennen und tun so, als wüssten sie das Ziel. Du tust es nicht. Die Frage ist: Möchtest du weiter nur rennen, oder willst du irgendwann stehen bleiben und schauen, wo du bist?`,
    antworten: [
      'Ich möchte stehen bleiben – ich weiß nur nicht wie.',
      'Erst mal weiterrennen, bis sich etwas zeigt.',
      'Ich fürchte, wenn ich stehe, fällt alles zusammen.',
    ],
  },
  'brief-3b': {
    id: 'brief-3b',
    text: `Einen Ort zum Anhalten suchen und ihn nicht finden – das ist schmerzlich. Vielleicht suchst du den falschen Ort: nicht einen Punkt auf der Landkarte, sondern einen Zustand in dir. Wo bist du, wenn du nicht suchst, sondern einfach da bist?`,
    antworten: [
      'Selten – meist bin ich in Gedanken woanders.',
      'Beim Lesen, in der Natur, manchmal mit Menschen.',
      'Ich weiß nicht, ob ich „einfach da sein“ kenne.',
    ],
  },
  'brief-3c': {
    id: 'brief-3c',
    text: `Familie und wenige Freunde – das klingt nach etwas Festem. In einer Zeit, die so viel Verbindung verspricht und doch oft leer lässt, ist das kein wenig. Die Frage ist: Nährst du diese Verbindungen, oder nähren sie dich – oder beides?`,
    antworten: [
      'Ich hoffe beides; manchmal fühle ich mich leer trotzdem.',
      'Sie nähren mich mehr, als ich zurückgeben kann.',
      'Ich möchte mehr geben, finde aber nicht die rechte Form.',
    ],
  },
  'brief-3d': {
    id: 'brief-3d',
    text: `Oberflächlich verbunden – du triffst einen Nerv. Viele Fäden, wenig Tiefe. Was bräuchte es für dich, damit eine Verbindung tief genug wäre? Und hast du sie je erlebt?`,
    antworten: [
      'Ehrlichkeit und Zeit. Ja, vereinzelt.',
      'Ich glaube, ich habe sie noch nicht wirklich erlebt.',
      'Ich bin nicht sicher, ob ich sie aushalten würde.',
    ],
  },
  'brief-3e': {
    id: 'brief-3e',
    text: `Das Suchen selbst gibt dir Halt – mehr als jede fertige Antwort. Dann bist du schon weiter als viele, die eine Antwort haben und doch unsicher sind. Behalte dieses Suchen bei; lass dich nur nicht von ihm verzehren. Es gibt ein Suchen, das atmet, und eines, das erstickt.`,
    antworten: [
      'Ich will atmen. Danke für diese Worte.',
      'Manchmal fühle ich mich schon verzehrt.',
      'Wie unterscheide ich das eine vom anderen?',
    ],
  },
}

export function getLetter(id: string): Letter | null {
  return LETTERS[id] ?? null
}

export function getFirstLetterId(): string {
  return 'brief-1'
}

/** Nächste Brief-ID nach gewählter Antwort (0–2). null = kein weiterer Brief. */
export function getNextLetterId(letterId: string, chosenIndex: number): string | null {
  const next = NEXT_LETTER[letterId]
  if (!next || chosenIndex < 0 || chosenIndex > 2) return null
  return next[chosenIndex] ?? null
}

export function getLetterCount(letterHistory: { letterId: string; chosenIndex: number }[]): number {
  return letterHistory?.length ?? 0
}
