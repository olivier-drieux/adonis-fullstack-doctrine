import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

export const SKILL_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
export const DEFAULT_MANIFEST = join(SKILL_ROOT, 'rules', 'manifest.json')
export const REFERENCES_ROOT = join(SKILL_ROOT, 'references')

const LEVELS = new Set(['hard_blocker', 'enforced_default', 'advisory'])
const LEVEL_PREFIX = {
  hard_blocker: 'hb.',
  enforced_default: 'ed.',
  advisory: 'adv.',
}
const ID_PATTERN = /^(hb|ed|adv)\.[a-z][a-z0-9-]*$/
const LEVEL_ORDER = ['hard_blocker', 'enforced_default', 'advisory']

export function loadManifest(path = DEFAULT_MANIFEST) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function checkString(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function checkStringArray(value) {
  return Array.isArray(value) && value.length > 0 && value.every(checkString)
}

export function validateManifest(manifest) {
  const errors = []

  if (!manifest || typeof manifest !== 'object') {
    return ['manifest: objet attendu']
  }
  if (!checkString(manifest.version)) errors.push('manifest.version: chaîne non vide attendue')
  for (const key of ['profiles', 'surfaces', 'slices']) {
    if (!manifest[key] || typeof manifest[key] !== 'object' || Array.isArray(manifest[key])) {
      errors.push(`manifest.${key}: objet attendu`)
    }
  }
  if (!Array.isArray(manifest.rules)) {
    errors.push('manifest.rules: tableau attendu')
    return errors
  }

  const profileNames = new Set(Object.keys(manifest.profiles ?? {}))
  const surfaceNames = new Set(Object.keys(manifest.surfaces ?? {}))
  const sliceNames = new Set(Object.keys(manifest.slices ?? {}))
  const ids = new Set()

  manifest.rules.forEach((rule, index) => {
    const label = rule?.id ? `règle ${rule.id}` : `règle #${index + 1}`
    if (!rule || typeof rule !== 'object') {
      errors.push(`${label}: objet attendu`)
      return
    }
    if (!checkString(rule.id) || !ID_PATTERN.test(rule.id)) {
      errors.push(`${label}: id invalide`)
    } else if (ids.has(rule.id)) {
      errors.push(`${label}: id dupliqué`)
    } else {
      ids.add(rule.id)
    }
    if (!LEVELS.has(rule.level)) {
      errors.push(`${label}: level invalide`)
    } else if (checkString(rule.id) && !rule.id.startsWith(LEVEL_PREFIX[rule.level])) {
      errors.push(`${label}: le préfixe de l'id ne correspond pas au level ${rule.level}`)
    }
    if (!checkStringArray(rule.profiles)) {
      errors.push(`${label}: profiles non vide attendu`)
    } else {
      for (const profile of rule.profiles) {
        if (profile !== '*' && !profileNames.has(profile)) {
          errors.push(`${label}: profil inconnu ${profile}`)
        }
      }
    }
    if (!checkStringArray(rule.surfaces)) {
      errors.push(`${label}: surfaces non vide attendu`)
    } else {
      for (const surface of rule.surfaces) {
        if (surface !== '*' && !surfaceNames.has(surface)) {
          errors.push(`${label}: surface inconnue ${surface}`)
        }
      }
    }
    if (!Array.isArray(rule.slices) || rule.slices.some((slice) => !sliceNames.has(slice))) {
      errors.push(`${label}: slices invalides`)
    }
    if (rule.always !== undefined && typeof rule.always !== 'boolean') {
      errors.push(`${label}: always doit être un booléen`)
    }
    for (const key of ['title', 'rule', 'rationale', 'reference']) {
      if (!checkString(rule[key])) errors.push(`${label}: ${key} non vide attendu`)
    }
    if (!checkString(rule.reference)) return
    try {
      readReference(rule.reference)
    } catch (error) {
      errors.push(`${label}: référence introuvable (${error.message})`)
    }
  })

  return errors
}

export function assertValidManifest(manifest) {
  const errors = validateManifest(manifest)
  if (errors.length > 0) {
    throw new Error(`Manifeste invalide :\n- ${errors.join('\n- ')}`)
  }
}

export function listSlices(manifest) {
  return Object.entries(manifest.slices).map(([name, description]) => {
    const rules = manifest.rules.filter((rule) => rule.slices.includes(name))
    return {
      name,
      description,
      rules: rules.length,
      hard_blockers: rules.filter((rule) => rule.level === 'hard_blocker').length,
    }
  })
}

export function selectRules(manifest, { profile, surface, slices = [] }) {
  if (!manifest.profiles[profile]) {
    throw new Error(`Profil inconnu : ${profile}`)
  }
  if (!manifest.surfaces[surface]) {
    throw new Error(`Surface inconnue : ${surface}`)
  }
  const uniqueSlices = [...new Set(slices)]
  const unknownSlices = uniqueSlices.filter((slice) => !manifest.slices[slice])
  const requested = new Set(uniqueSlices)
  const conservative = unknownSlices.length > 0

  const rules = manifest.rules.filter((rule) => {
    const profileOk = rule.profiles.includes('*') || rule.profiles.includes(profile)
    const surfaceOk = rule.surfaces.includes('*') || rule.surfaces.includes(surface)
    if (!profileOk || !surfaceOk) return false
    if (rule.always === true) return true
    if (conservative && rule.level === 'hard_blocker') return true
    return rule.slices.some((slice) => requested.has(slice))
  })

  return {
    profile,
    surface,
    slices: uniqueSlices,
    mode: conservative ? 'conservative' : 'typed',
    unknown_slices: unknownSlices,
    rules,
    references: buildReferences(rules),
  }
}

function buildReferences(rules) {
  const bySelector = new Map()
  for (const rule of rules) {
    if (!bySelector.has(rule.reference)) bySelector.set(rule.reference, [])
    bySelector.get(rule.reference).push(rule.id)
  }
  return [...bySelector.entries()].map(([selector, ruleIds]) => ({
    selector,
    rules: ruleIds,
  }))
}

export function resolveDoctrine({ profile = 'web', surface, slices = [], manifestPath } = {}) {
  const manifest = loadManifest(manifestPath)
  const effectiveSurface = surface ?? (profile === 'api-only' ? 'api.external' : 'web')
  const result = selectRules(manifest, { profile, surface: effectiveSurface, slices })
  return { ...result, manifest_version: manifest.version }
}

export function formatMarkdown(result) {
  const lines = [
    '# Résolution de doctrine',
    '',
    `- Profil : \`${result.profile}\``,
    `- Surface : \`${result.surface}\``,
    `- Tranches : ${result.slices.length > 0 ? result.slices.map((slice) => `\`${slice}\``).join(', ') : '_aucune_'}`,
    `- Mode : \`${result.mode}\``,
    `- Règles : ${result.rules.length}`,
  ]
  if (result.unknown_slices.length > 0) {
    lines.push(`- Tranches inconnues : ${result.unknown_slices.map((slice) => `\`${slice}\``).join(', ')}`)
  }
  lines.push('')

  for (const level of LEVEL_ORDER) {
    const rules = result.rules.filter((rule) => rule.level === level)
    if (rules.length === 0) continue
    lines.push(`## ${level}`)
    lines.push('')
    for (const rule of rules) {
      lines.push(`- \`${rule.id}\` — **${rule.title}**`)
      lines.push(`  ${rule.rule}`)
      lines.push(`  Référence : \`${rule.reference}\``)
    }
    lines.push('')
  }

  if (result.references.length > 0) {
    lines.push('## Références à charger à la demande')
    lines.push('')
    for (const reference of result.references) {
      lines.push(`- \`${reference.selector}\` (${reference.rules.join(', ')})`)
    }
    lines.push('')
  }

  return lines.join('\n')
}

export function listReferences() {
  const found = []
  const walk = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const absolute = join(directory, entry.name)
      if (entry.isDirectory()) walk(absolute)
      else if (entry.isFile() && entry.name.endsWith('.md')) {
        found.push(relative(REFERENCES_ROOT, absolute).split(sep).join('/'))
      }
    }
  }
  walk(REFERENCES_ROOT)
  return found.sort()
}

function normalizeHeading(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function readReference(selector) {
  if (!checkString(selector)) throw new Error('sélecteur vide')
  const [rawFile, rawHeading] = selector.split('#', 2)
  const file = rawFile.trim()
  if (file.length === 0 || file.includes('..')) {
    throw new Error(`chemin invalide : ${selector}`)
  }
  const absolute = resolve(REFERENCES_ROOT, file)
  if (!absolute.startsWith(REFERENCES_ROOT + sep)) {
    throw new Error(`chemin hors des références : ${selector}`)
  }
  if (!existsSync(absolute)) {
    throw new Error(`fichier introuvable : ${file}`)
  }
  const content = readFileSync(absolute, 'utf8')
  if (!rawHeading) return content

  const wanted = normalizeHeading(rawHeading)
  const lines = content.split('\n')
  const headings = []
  for (let index = 0; index < lines.length; index += 1) {
    const match = /^(#{1,6})\s+(.*)$/.exec(lines[index])
    if (match) {
      headings.push({ index, level: match[1].length, title: match[2].trim() })
    }
  }
  const start = headings.find((heading) => normalizeHeading(heading.title) === wanted)
  if (!start) {
    throw new Error(
      `titre introuvable : ${rawHeading} (disponibles : ${headings.map((h) => h.title).join(', ')})`,
    )
  }
  const next = headings.find(
    (heading) => heading.index > start.index && heading.level <= start.level,
  )
  const end = next ? next.index : lines.length
  return lines.slice(start.index, end).join('\n').trimEnd() + '\n'
}

export function buildIndex(manifest) {
  return {
    version: manifest.version,
    profiles: Object.keys(manifest.profiles),
    surfaces: Object.keys(manifest.surfaces),
    slices: Object.keys(manifest.slices),
    rules: manifest.rules.map((rule) => ({
      id: rule.id,
      level: rule.level,
      profiles: rule.profiles,
      surfaces: rule.surfaces,
      slices: rule.slices,
      always: rule.always === true,
      title: rule.title,
      reference: rule.reference,
    })),
  }
}
