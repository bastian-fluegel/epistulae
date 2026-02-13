/**
 * Gelehrte aus dem Jenseits
 */

export interface Scholar {
  id: string
  name: string
  fieldOfStudy: string
  category: string
  expertise: string[]
  bio: string
  era: string
  imageUrl?: string
}

export const SCHOLARS: Record<string, Scholar> = {
  // ===== Philosophie & Geisteswissenschaften =====
  sokrates: {
    id: 'sokrates',
    name: 'Sokrates',
    fieldOfStudy: 'Ethik & Erkenntnistheorie',
    category: 'Philosophie & Geisteswissenschaften',
    expertise: ['Die Kunst des Hinterfragens', 'Mäeutik', 'Tugendethik'],
    bio: 'Sokrates war ein griechischer Philosoph, der als Begründer der abendländischen Philosophie gilt. Seine Methode des permanenten Hinterfragens (Mäeutik) revolutionierte das Denken. Er schrieb selbst nichts auf – alles was wir wissen, stammt von seinen Schülern wie Platon.',
    era: '469–399 v. Chr.',
  },
  
  platon: {
    id: 'platon',
    name: 'Platon',
    fieldOfStudy: 'Metaphysik & Staatsphilosophie',
    category: 'Philosophie & Geisteswissenschaften',
    expertise: ['Ideenlehre', 'Der ideale Staat', 'Politeia'],
    bio: 'Platon war Schüler des Sokrates und Lehrer des Aristoteles. Seine Ideenlehre besagt, dass hinter der sichtbaren Welt eine vollkommene Welt der Ideen existiert. In "Der Staat" entwirft er eine Vision der perfekten Gesellschaft.',
    era: '428–348 v. Chr.',
  },
  
  aristoteles: {
    id: 'aristoteles',
    name: 'Aristoteles',
    fieldOfStudy: 'Logik, Biologie & Poetik',
    category: 'Philosophie & Geisteswissenschaften',
    expertise: ['Systematisierung des Wissens', 'Syllogistik', 'Naturbeobachtung'],
    bio: 'Aristoteles war der Universalgelehrte der Antike. Er systematisierte nahezu alle damals bekannten Wissenschaften – von der Logik über Biologie bis zur Poetik. Seine Werke prägten das abendländische Denken für Jahrhunderte.',
    era: '384–322 v. Chr.',
  },
  
  seneca: {
    id: 'seneca',
    name: 'Seneca',
    fieldOfStudy: 'Praktische Ethik & Stoizismus',
    category: 'Philosophie & Geisteswissenschaften',
    expertise: ['Lebensführung', 'Gelassenheit', 'Briefkultur'],
    bio: 'Seneca war römischer Philosoph, Dramatiker und Staatsmann. Als Stoiker schrieb er über die Kunst der Lebensführung, den Umgang mit Schicksalsschlägen und die Bedeutung von Gelassenheit. Seine Briefe an Lucilius sind Meisterwerke praktischer Ethik.',
    era: '4 v. Chr.–65 n. Chr.',
  },
  
  cicero: {
    id: 'cicero',
    name: 'Cicero',
    fieldOfStudy: 'Rhetorik, Rechtsphilosophie & Staatskunst',
    category: 'Philosophie & Geisteswissenschaften',
    expertise: ['Redekunst', 'Römisches Recht', 'Republik'],
    bio: 'Cicero war römischer Politiker, Anwalt und Philosoph. Seine rhetorischen Schriften und Reden gelten als Meisterwerke der lateinischen Prosa. Er verteidigte die Republik gegen tyrannische Machtansprüche.',
    era: '106–43 v. Chr.',
  },
  
  // ===== Mathematik & Formale Wissenschaften =====
  pythagoras: {
    id: 'pythagoras',
    name: 'Pythagoras',
    fieldOfStudy: 'Zahlentheorie & Harmonik',
    category: 'Mathematik & Formale Wissenschaften',
    expertise: ['Mathematik als Weltprinzip', 'Harmonie', 'Geometrie'],
    bio: 'Pythagoras war Mathematiker, Philosoph und Mystiker. Er glaubte, dass Zahlen die Grundlage der Wirklichkeit sind. Der berühmte Satz des Pythagoras ist nur ein Teil seines umfassenden Systems.',
    era: 'ca. 570–495 v. Chr.',
  },
  
  euklid: {
    id: 'euklid',
    name: 'Euklid',
    fieldOfStudy: 'Geometrie',
    category: 'Mathematik & Formale Wissenschaften',
    expertise: ['Axiomatik', 'Beweisführung', 'Elemente'],
    bio: 'Euklid schuf mit seinen "Elementen" eines der einflussreichsten Lehrbücher aller Zeiten. Seine axiomatische Methode – vom Einfachen zum Komplexen – prägt die Mathematik bis heute.',
    era: 'ca. 300 v. Chr.',
  },
  
  diophantos: {
    id: 'diophantos',
    name: 'Diophantos von Alexandria',
    fieldOfStudy: 'Algebra',
    category: 'Mathematik & Formale Wissenschaften',
    expertise: ['Gleichungssysteme', 'Zahlentheorie', 'Diophantische Gleichungen'],
    bio: 'Diophantos gilt als "Vater der Algebra". Er untersuchte systematisch Gleichungen mit ganzzahligen Lösungen und legte damit Grundsteine für die moderne Zahlentheorie.',
    era: 'ca. 200–284 n. Chr.',
  },
  
  // ===== Naturwissenschaften & Technik =====
  archimedes: {
    id: 'archimedes',
    name: 'Archimedes',
    fieldOfStudy: 'Physik, Mechanik & Ingenieurwesen',
    category: 'Naturwissenschaften & Technik',
    expertise: ['Hebel', 'Auftrieb', 'Kriegsmaschinen'],
    bio: 'Archimedes war das größte Genie der Antike. Er entdeckte das Hebelgesetz, das Auftriebsprinzip und erfand zahlreiche Maschinen. "Gebt mir einen festen Punkt, und ich hebe die Welt aus den Angeln."',
    era: 'ca. 287–212 v. Chr.',
  },
  
  demokrit: {
    id: 'demokrit',
    name: 'Demokrit',
    fieldOfStudy: 'Naturphilosophie (Atomismus)',
    category: 'Naturwissenschaften & Technik',
    expertise: ['Atomtheorie', 'Materiephilosophie', 'Teilchenphysik'],
    bio: 'Demokrit postulierte, dass alles aus unteilbaren Teilchen (Atomen) besteht – 2000 Jahre vor der modernen Physik. Seine materialistische Weltsicht war revolutionär.',
    era: 'ca. 460–370 v. Chr.',
  },
  
  hippokrates: {
    id: 'hippokrates',
    name: 'Hippokrates',
    fieldOfStudy: 'Medizin & Medizinethik',
    category: 'Naturwissenschaften & Technik',
    expertise: ['Hippokratischer Eid', 'Klinische Beobachtung', 'Humoralmedizin'],
    bio: 'Hippokrates gilt als Vater der Medizin. Er befreite die Heilkunst von Magie und Aberglauben und etablierte systematische Beobachtung. Der nach ihm benannte Eid prägt die medizinische Ethik bis heute.',
    era: 'ca. 460–370 v. Chr.',
  },
  
  galenos: {
    id: 'galenos',
    name: 'Galenos (Galen)',
    fieldOfStudy: 'Anatomie & Physiologie',
    category: 'Naturwissenschaften & Technik',
    expertise: ['Anatomische Forschung', 'Experimentelle Medizin', 'Chirurgie'],
    bio: 'Galen war Arzt der Gladiatoren und später des Kaisers. Seine anatomischen Studien prägten die Medizin für 1500 Jahre. Er führte Experimente durch und systematisierte medizinisches Wissen.',
    era: '129–ca. 216 n. Chr.',
  },
  
  vitruv: {
    id: 'vitruv',
    name: 'Vitruv',
    fieldOfStudy: 'Architektur & Bautechnik',
    category: 'Naturwissenschaften & Technik',
    expertise: ['Proportionslehre', 'Baumechanik', 'Stadtplanung'],
    bio: 'Vitruv verfasste "De architectura", das einzige erhaltene antike Werk über Architektur. Seine Prinzipien von Festigkeit, Nützlichkeit und Schönheit prägen die Baukunst bis heute.',
    era: 'ca. 80–15 v. Chr.',
  },
  
  // ===== Erd- & Weltraumwissenschaften =====
  aristarch: {
    id: 'aristarch',
    name: 'Aristarch von Samos',
    fieldOfStudy: 'Astronomie',
    category: 'Erd- & Weltraumwissenschaften',
    expertise: ['Heliozentrisches Weltbild', 'Planetenbahnen', 'Entfernungsberechnungen'],
    bio: 'Aristarch postulierte als erster, dass die Erde um die Sonne kreist – 1800 Jahre vor Kopernikus. Seine Zeitgenossen lehnten diese radikale Idee ab. Er berechnete auch Entfernungen zu Sonne und Mond.',
    era: 'ca. 310–230 v. Chr.',
  },
  
  ptolemaios: {
    id: 'ptolemaios',
    name: 'Ptolemäus',
    fieldOfStudy: 'Astronomie & Kartographie',
    category: 'Erd- & Weltraumwissenschaften',
    expertise: ['Geozentrisches Weltbild', 'Epizyklenbahnen', 'Weltkarten'],
    bio: 'Ptolemäus schuf das umfassendste astronomische System der Antike. Obwohl sein geozentrisches Weltbild falsch war, funktionierte es mathematisch erstaunlich gut und dominierte 1400 Jahre lang.',
    era: 'ca. 100–170 n. Chr.',
  },
  
  eratosthenes: {
    id: 'eratosthenes',
    name: 'Eratosthenes',
    fieldOfStudy: 'Geographie & Geodäsie',
    category: 'Erd- & Weltraumwissenschaften',
    expertise: ['Berechnung des Erdumfangs', 'Kartographie', 'Chronologie'],
    bio: 'Eratosthenes berechnete den Erdumfang mit erstaunlicher Genauigkeit – nur mit Stöcken, Schatten und Geometrie. Er war Leiter der Bibliothek von Alexandria und ein Universalgelehrter.',
    era: 'ca. 276–194 v. Chr.',
  },
  
  // ===== Gesellschafts- & Kulturwissenschaften =====
  herodot: {
    id: 'herodot',
    name: 'Herodot',
    fieldOfStudy: 'Geschichtsschreibung & Ethnologie',
    category: 'Gesellschafts- & Kulturwissenschaften',
    expertise: ['Historische Methode', 'Kulturvergleich', 'Reiseberichte'],
    bio: 'Herodot gilt als "Vater der Geschichtsschreibung". Er reiste durch die bekannte Welt und sammelte Geschichten, Mythen und Fakten. Seine "Historien" sind eine faszinierende Mischung aus Geschichtswerk und Ethnographie.',
    era: 'ca. 484–425 v. Chr.',
  },
  
  thukydides: {
    id: 'thukydides',
    name: 'Thukydides',
    fieldOfStudy: 'Politische Zeitgeschichte & Strategie',
    category: 'Gesellschafts- & Kulturwissenschaften',
    expertise: ['Kritische Quellenanalyse', 'Machtpolitik', 'Kriegsgeschichte'],
    bio: 'Thukydides schrieb die Geschichte des Peloponnesischen Krieges mit beispielloser Objektivität und Analyse. Er untersuchte die Mechanismen von Macht, Angst und Ehrgeiz – zeitlos gültig.',
    era: 'ca. 460–400 v. Chr.',
  },
  
  solon: {
    id: 'solon',
    name: 'Solon',
    fieldOfStudy: 'Rechtswissenschaft & Gesetzgebung',
    category: 'Gesellschafts- & Kulturwissenschaften',
    expertise: ['Rechtsreformen', 'Verfassungsentwurf', 'Soziale Gerechtigkeit'],
    bio: 'Solon war Staatsmann und Gesetzgeber Athens. Seine Reformen legten den Grundstein für die athenische Demokratie. Er hob die Schuldknechtschaft auf und schuf ein gerechteres Rechtssystem.',
    era: 'ca. 640–560 v. Chr.',
  },
  
  aristoxenos: {
    id: 'aristoxenos',
    name: 'Aristoxenos',
    fieldOfStudy: 'Musiktheorie',
    category: 'Gesellschafts- & Kulturwissenschaften',
    expertise: ['Harmonik', 'Rhythmik', 'Musik als Kunst'],
    bio: 'Aristoxenos war Schüler des Aristoteles und der erste, der Musik systematisch als Kunstform analysierte. Er beschrieb Harmonien, Rhythmen und die Wirkung von Musik auf die Seele.',
    era: 'ca. 370–300 v. Chr.',
  },
}

export function getScholar(id: string): Scholar | undefined {
  return SCHOLARS[id]
}

export function getAllScholars(): Scholar[] {
  return Object.values(SCHOLARS)
}

export function getScholarsByCategory(category: string): Scholar[] {
  return getAllScholars().filter(s => s.category === category)
}

export function getRandomScholar(): Scholar {
  const scholars = getAllScholars()
  return scholars[Math.floor(Math.random() * scholars.length)]
}

// Helper: Wähle Gelehrten basierend auf Thema/Keywords
export function selectScholarByTopic(topic: string): Scholar {
  const lowerTopic = topic.toLowerCase()
  
  // Keyword-Matching
  if (lowerTopic.includes('ethik') || lowerTopic.includes('moral') || lowerTopic.includes('frage')) {
    return SCHOLARS.sokrates
  }
  if (lowerTopic.includes('staat') || lowerTopic.includes('ideal') || lowerTopic.includes('gerechtigkeit')) {
    return SCHOLARS.platon
  }
  if (lowerTopic.includes('logik') || lowerTopic.includes('systematisch') || lowerTopic.includes('wissenschaft')) {
    return SCHOLARS.aristoteles
  }
  if (lowerTopic.includes('leben') || lowerTopic.includes('stoisch') || lowerTopic.includes('gelassen')) {
    return SCHOLARS.seneca
  }
  if (lowerTopic.includes('rede') || lowerTopic.includes('politik') || lowerTopic.includes('rhetorik')) {
    return SCHOLARS.cicero
  }
  if (lowerTopic.includes('zahl') || lowerTopic.includes('mathematik') || lowerTopic.includes('harmonie')) {
    return SCHOLARS.pythagoras
  }
  if (lowerTopic.includes('geometrie') || lowerTopic.includes('beweis')) {
    return SCHOLARS.euklid
  }
  if (lowerTopic.includes('mechanik') || lowerTopic.includes('physik') || lowerTopic.includes('hebel')) {
    return SCHOLARS.archimedes
  }
  if (lowerTopic.includes('atom') || lowerTopic.includes('teilchen') || lowerTopic.includes('materie')) {
    return SCHOLARS.demokrit
  }
  if (lowerTopic.includes('medizin') || lowerTopic.includes('gesundheit') || lowerTopic.includes('heilung')) {
    return SCHOLARS.hippokrates
  }
  if (lowerTopic.includes('astronomie') || lowerTopic.includes('planet') || lowerTopic.includes('stern')) {
    return Math.random() > 0.5 ? SCHOLARS.aristarch : SCHOLARS.ptolemaios
  }
  if (lowerTopic.includes('geschichte') || lowerTopic.includes('krieg') || lowerTopic.includes('vergangenheit')) {
    return Math.random() > 0.5 ? SCHOLARS.herodot : SCHOLARS.thukydides
  }
  
  // Fallback: Random
  return getRandomScholar()
}
