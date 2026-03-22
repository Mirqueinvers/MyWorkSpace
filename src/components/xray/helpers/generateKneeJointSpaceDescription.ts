const ZONES = [
  { key: 'leftMedial', side: 'левого', part: 'медиальном' },
  { key: 'leftLateral', side: 'левого', part: 'латеральном' },
  { key: 'rightMedial', side: 'правого', part: 'медиальном' },
  { key: 'rightLateral', side: 'правого', part: 'латеральном' },
] as const

const MODE_MAPS = {
  gaps: {
    single: {
      'Незначительно сужены': 'незначительно сужена',
      'Умеренно сужены': 'умеренно сужена',
      'Выраженно сужены': 'выраженно сужена',
      'Резко сужены': 'резко сужена',
    },
    plural: {
      'незначительно сужена': 'незначительно сужены',
      'умеренно сужена': 'умеренно сужены',
      'выраженно сужена': 'выраженно сужены',
      'резко сужена': 'резко сужены',
    },
    firstPhrase: {
      single: 'Суставная щель',
      plural: 'Суставные щели',
    },
    uniformText: 'Суставные щели коленных суставов сохранены, равномерные',
  },
  surfaces: {
    single: {
      'Поверхность гладкая': 'поверхность гладкая',
      'Незначительные изменения': 'незначительно склерозирована',
      'Умеренные изменения': 'умеренно склерозирована',
      'Выраженные изменения': 'выраженно склерозирована',
      'Резкие изменения': 'резко склерозирована',
    },
    plural: {
      'Поверхность гладкая': 'поверхности гладкие',
      'Незначительные изменения': 'незначительно склерозированы',
      'Умеренные изменения': 'умеренно склерозированы',
      'Выраженные изменения': 'выраженно склерозированы',
      'Резкие изменения': 'резко склерозированы',
    },
    firstPhrase: {
      single: 'Суставные поверхности',
      plural: 'Суставные поверхности',
    },
    uniformText: 'Суставные поверхности ровные, без деформации',
  },
} as const

export interface KneeZoneState {
  degree: string
  predominantly: boolean
}

export interface KneeJointSpaceState {
  leftMedial: KneeZoneState
  leftLateral: KneeZoneState
  rightMedial: KneeZoneState
  rightLateral: KneeZoneState
}

export interface KneeJointSurfaceState {
  leftMedial: KneeZoneState
  leftLateral: KneeZoneState
  rightMedial: KneeZoneState
  rightLateral: KneeZoneState
}

function createInitialState() {
  return {
    leftMedial: { degree: '', predominantly: false },
    leftLateral: { degree: '', predominantly: false },
    rightMedial: { degree: '', predominantly: false },
    rightLateral: { degree: '', predominantly: false },
  }
}

export function createInitialKneeJointSpaceState(): KneeJointSpaceState {
  return createInitialState()
}

export function createInitialKneeJointSurfaceState(): KneeJointSurfaceState {
  return createInitialState()
}

function generateDescription({
  state,
  mode,
}: {
  state: KneeJointSpaceState | KneeJointSurfaceState
  mode: 'gaps' | 'surfaces'
}) {
  const perKnee = { left: {}, right: {} } as Record<
    'left' | 'right',
    Record<string, { degree: string; predominantly: boolean }>
  >
  let totalSelected = 0

  ZONES.forEach(({ key, side, part }) => {
    const degree = state[key].degree
    const isUniform =
      (mode === 'gaps' && degree === 'Равномерной высоты') ||
      (mode === 'surfaces' && degree === 'Поверхность гладкая')

    if (!degree || isUniform) {
      return
    }

    const kneeKey = side === 'левого' ? 'left' : 'right'
    perKnee[kneeKey][part] = {
      degree,
      predominantly: state[key].predominantly,
    }
    totalSelected += 1
  })

  if (totalSelected === 0) {
    return `${MODE_MAPS[mode].uniformText}.`
  }

  const descriptions: string[] = []
  const usedParts = new Set<string>()
  let usePlural = false

  ;(['медиальном', 'латеральном'] as const).forEach((part) => {
    const left = perKnee.left[part]
    const right = perKnee.right[part]

    if (left && right && left.degree === right.degree) {
      const partText = part === 'медиальном' ? 'медиальных' : 'латеральных'
      const predominantlyText = left.predominantly ? ', преимущественно' : ''
      descriptions.push(
        `коленных суставов ${MODE_MAPS[mode].plural[left.degree as keyof typeof MODE_MAPS[typeof mode]['plural']]}${predominantlyText} в ${partText} отделах`,
      )
      usedParts.add(part)
      usePlural = true
    }
  })

  ;(['медиальном', 'латеральном'] as const).forEach((part) => {
    if (usedParts.has(part)) {
      return
    }

    const left = perKnee.left[part]
    const right = perKnee.right[part]

    if (left && right && left.degree !== right.degree) {
      const predominantlyLeft = left.predominantly ? ', преимущественно' : ''
      const predominantlyRight = right.predominantly ? ', преимущественно' : ''
      descriptions.push(
        `правого коленного сустава ${MODE_MAPS[mode].single[right.degree as keyof typeof MODE_MAPS[typeof mode]['single']]}${predominantlyRight} в ${part} отделе, левого коленного сустава ${MODE_MAPS[mode].single[left.degree as keyof typeof MODE_MAPS[typeof mode]['single']]}${predominantlyLeft} в ${part} отделе`,
      )
      usedParts.add(part)
    }
  })

  ;(['left', 'right'] as const).forEach((knee) => {
    const kneeParts = perKnee[knee]
    const sideName = knee === 'left' ? 'левого' : 'правого'

    Object.keys(kneeParts)
      .filter((part) => !usedParts.has(part))
      .forEach((part) => {
        const predominantlyText = kneeParts[part].predominantly ? ', преимущественно' : ''
        descriptions.push(
          `${sideName} коленного сустава ${MODE_MAPS[mode].single[kneeParts[part].degree as keyof typeof MODE_MAPS[typeof mode]['single']]}${predominantlyText} в ${part} отделе`,
        )
      })
  })

  const firstPhrase = usePlural
    ? MODE_MAPS[mode].firstPhrase.plural
    : MODE_MAPS[mode].firstPhrase.single

  return `${firstPhrase} ${descriptions.join(', ')}.`
}

export function generateKneeJointSpaceDescription(state: KneeJointSpaceState) {
  return generateDescription({ state, mode: 'gaps' })
}

export function generateKneeJointSurfaceDescription(state: KneeJointSurfaceState) {
  return generateDescription({ state, mode: 'surfaces' })
}
