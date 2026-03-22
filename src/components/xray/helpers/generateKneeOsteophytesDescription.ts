export const KNEE_OSTEOPHYTE_ZONES = [
  {
    key: 'rightFemurLateral',
    label: 'Латеральная поверхность правой бедренной кости',
    side: 'right',
    surface: 'lateral',
    bone: 'femur',
  },
  {
    key: 'rightFemurMedial',
    label: 'Медиальная поверхность правой бедренной кости',
    side: 'right',
    surface: 'medial',
    bone: 'femur',
  },
  {
    key: 'rightTibiaMedial',
    label: 'Медиальная поверхность правой большеберцовой кости',
    side: 'right',
    surface: 'medial',
    bone: 'tibia',
  },
  {
    key: 'rightTibiaLateral',
    label: 'Латеральная поверхность правой большеберцовой кости',
    side: 'right',
    surface: 'lateral',
    bone: 'tibia',
  },
  {
    key: 'leftFemurLateral',
    label: 'Латеральная поверхность левой бедренной кости',
    side: 'left',
    surface: 'lateral',
    bone: 'femur',
  },
  {
    key: 'leftFemurMedial',
    label: 'Медиальная поверхность левой бедренной кости',
    side: 'left',
    surface: 'medial',
    bone: 'femur',
  },
  {
    key: 'leftTibiaMedial',
    label: 'Медиальная поверхность левой большеберцовой кости',
    side: 'left',
    surface: 'medial',
    bone: 'tibia',
  },
  {
    key: 'leftTibiaLateral',
    label: 'Латеральная поверхность левой большеберцовой кости',
    side: 'left',
    surface: 'lateral',
    bone: 'tibia',
  },
] as const

export type KneeOsteophyteZoneKey = (typeof KNEE_OSTEOPHYTE_ZONES)[number]['key']

export type KneeOsteophytesState = Record<KneeOsteophyteZoneKey, boolean>

const SURFACE_SINGLE = {
  medial: 'медиальной',
  lateral: 'латеральной',
} as const

const SURFACE_PLURAL = {
  medial: 'медиальных',
  lateral: 'латеральных',
} as const

const BONE_SINGLE = {
  femur: 'бедренной',
  tibia: 'большеберцовой',
} as const

const BONE_PLURAL = {
  femur: 'бедренных',
  tibia: 'большеберцовых',
} as const

const SIDE_SINGLE = {
  left: 'левой',
  right: 'правой',
} as const

export function createInitialKneeOsteophytesState(): KneeOsteophytesState {
  return KNEE_OSTEOPHYTE_ZONES.reduce(
    (state, zone) => {
      state[zone.key] = false
      return state
    },
    {} as KneeOsteophytesState,
  )
}

export function generateKneeOsteophytesDescription(state: KneeOsteophytesState) {
  const selectedZones = KNEE_OSTEOPHYTE_ZONES.filter((zone) => state[zone.key])

  if (selectedZones.length === 0) {
    return ''
  }

  const matrix: Record<
    'medial' | 'lateral',
    Record<'femur' | 'tibia', Record<'left' | 'right', boolean>>
  > = {
    medial: {
      femur: { left: false, right: false },
      tibia: { left: false, right: false },
    },
    lateral: {
      femur: { left: false, right: false },
      tibia: { left: false, right: false },
    },
  }

  selectedZones.forEach((zone) => {
    matrix[zone.surface][zone.bone][zone.side] = true
  })

  const allSelected = (['medial', 'lateral'] as const).every((surface) =>
    (['femur', 'tibia'] as const).every(
      (bone) => matrix[surface][bone].left && matrix[surface][bone].right,
    ),
  )

  if (allSelected) {
    return 'Определяются краевые костные разрастания на медиальных и латеральных поверхностях бедренных и большеберцовых костей.'
  }

  const parts: string[] = []

  ;(['medial', 'lateral'] as const).forEach((surface) => {
    ;(['femur', 'tibia'] as const).forEach((bone) => {
      const left = matrix[surface][bone].left
      const right = matrix[surface][bone].right

      if (left && right) {
        parts.push(`${SURFACE_PLURAL[surface]} поверхностях ${BONE_PLURAL[bone]} костей`)
        return
      }

      if (left) {
        parts.push(`${SURFACE_SINGLE[surface]} поверхности ${SIDE_SINGLE.left} ${BONE_SINGLE[bone]} кости`)
      }

      if (right) {
        parts.push(`${SURFACE_SINGLE[surface]} поверхности ${SIDE_SINGLE.right} ${BONE_SINGLE[bone]} кости`)
      }
    })
  })

  const mergedParts: string[] = []
  const usedIndexes = new Set<number>()

  for (let index = 0; index < parts.length; index += 1) {
    if (usedIndexes.has(index)) {
      continue
    }

    const part = parts[index]
    const match = part.match(
      /(медиальной|латеральной) поверхности (левой|правой) (бедренной|большеберцовой) кости/,
    )

    if (!match) {
      mergedParts.push(part)
      usedIndexes.add(index)
      continue
    }

    const [, surface, side, bone] = match
    const oppositeSurface = surface === 'медиальной' ? 'латеральной' : 'медиальной'
    const pairIndex = parts.findIndex((candidate, candidateIndex) => {
      if (candidateIndex === index || usedIndexes.has(candidateIndex)) {
        return false
      }

      return candidate === `${oppositeSurface} поверхности ${side} ${bone} кости`
    })

    if (pairIndex !== -1) {
      mergedParts.push(`медиальной и латеральной поверхностях ${side} ${bone} кости`)
      usedIndexes.add(index)
      usedIndexes.add(pairIndex)
      continue
    }

    mergedParts.push(part)
    usedIndexes.add(index)
  }

  if (mergedParts.length === 1) {
    return `Определяются краевые костные разрастания на ${mergedParts[0]}.`
  }

  if (mergedParts.length === 2) {
    return `Определяются краевые костные разрастания на ${mergedParts.join(' и ')}.`
  }

  return `Определяются краевые костные разрастания на ${mergedParts.slice(0, -1).join(', ')}, ${mergedParts[mergedParts.length - 1]}.`
}
