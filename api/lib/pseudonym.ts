const ANIMALS = [
  'Tigre', 'Leon', 'Lobo', 'Aguila', 'Puma', 'Zorro', 'Pantera', 'Halcon',
  'Jaguar', 'Cobra', 'Buho', 'Lince', 'Oso', 'Condor', 'Delfin', 'Cuervo',
  'Fenix', 'Dragon', 'Toro', 'Grifo', 'Buitre', 'Rapaz', 'Coyote', 'Mastín',
]

const ADJECTIVES = [
  'Veloz', 'Feroz', 'Audaz', 'Bravo', 'Agil', 'Fuerte', 'Rapido', 'Listo',
  'Astuto', 'Osado', 'Tenaz', 'Firme', 'Vivo', 'Certero', 'Activo', 'Habil',
  'Sagaz', 'Fiero', 'Diestro', 'Invicto', 'Velado', 'Rugiente', 'Imparable', 'Acerado',
]

function hash(str: string, seed: number): number {
  let h = seed
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 0x9e3779b9)
    h ^= h >>> 16
  }
  return h >>> 0
}

export function getPseudonym(userId: string): string {
  const h1 = hash(userId, 0xdeadbeef)
  const h2 = hash(userId, 0x12345678)
  return ANIMALS[h1 % ANIMALS.length] + ADJECTIVES[h2 % ADJECTIVES.length]
}
