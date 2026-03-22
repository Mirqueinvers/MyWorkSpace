export interface HipJointSpaceSideState {
  degree: string
  uniformity: string
}

export interface HipJointSpaceState {
  left: HipJointSpaceSideState
  right: HipJointSpaceSideState
}

export interface HipJointSurfaceState {
  left: string
  right: string
}

export interface HipOsteophytesState {
  rightLateral: boolean
  rightMedial: boolean
  leftMedial: boolean
  leftLateral: boolean
  rightGreaterTrochanter: boolean
  leftGreaterTrochanter: boolean
}

export interface PubicSymphysisState {
  isNormal: boolean
  symmetry: string
  osteophytes: string[]
  surfaces: string
}

export function createInitialHipJointSpaceState(): HipJointSpaceState {
  return {
    left: { degree: '', uniformity: '' },
    right: { degree: '', uniformity: '' },
  }
}

export function createInitialHipJointSurfaceState(): HipJointSurfaceState {
  return {
    left: '',
    right: '',
  }
}

export function createInitialHipOsteophytesState(): HipOsteophytesState {
  return {
    rightLateral: false,
    rightMedial: false,
    leftMedial: false,
    leftLateral: false,
    rightGreaterTrochanter: false,
    leftGreaterTrochanter: false,
  }
}

export function createInitialPubicSymphysisState(): PubicSymphysisState {
  return {
    isNormal: false,
    symmetry: '',
    osteophytes: [],
    surfaces: '',
  }
}

export function generateHipJointSpaceDescription(
  state: HipJointSpaceState,
  hasEndoprosthesis = false,
) {
  const desc: Partial<Record<'right' | 'left', string>> = {}

  ;(['right', 'left'] as const).forEach((side) => {
    const { degree, uniformity } = state[side]
    if (!degree && !uniformity) {
      return
    }
    const parts = []
    if (degree) {
      parts.push(degree)
    }
    if (uniformity) {
      parts.push(uniformity)
    }
    desc[side] = parts.join(', ')
  })

  if (!desc.right && !desc.left) {
    return hasEndoprosthesis
      ? 'Суставная щель равномерной высоты.'
      : 'Суставные щели тазобедренных суставов равномерной высоты.'
  }

  if (desc.right && desc.left && desc.right === desc.left) {
    return hasEndoprosthesis
      ? `Суставная щель ${desc.right} сужена.`
      : `Суставные щели тазобедренных суставов ${desc.right} сужены.`
  }

  if (desc.right && desc.left) {
    return `Суставная щель правого тазобедренного сустава ${desc.right} сужена; левого - ${desc.left} сужена.`
  }

  if (desc.right) {
    return hasEndoprosthesis
      ? `Суставная щель ${desc.right} сужена.`
      : `Суставная щель правого тазобедренного сустава ${desc.right} сужена.`
  }

  return hasEndoprosthesis
    ? `Суставная щель ${desc.left} сужена.`
    : `Суставная щель левого тазобедренного сустава ${desc.left} сужена.`
}

export function generateHipJointSurfaceDescription(
  state: HipJointSurfaceState,
  hasEndoprosthesis = false,
) {
  const left = state.left
  const right = state.right

  if (!left && !right) {
    return hasEndoprosthesis
      ? 'Суставные поверхности без патологических изменений.'
      : 'Суставные поверхности тазобедренных суставов без патологических изменений.'
  }

  if (left && right && left === right) {
    return hasEndoprosthesis
      ? `Суставные поверхности ${left} преимущественно в области крыш вертлужных впадин.`
      : `Суставные поверхности тазобедренных суставов ${left} преимущественно в области крыш вертлужных впадин.`
  }

  if (right && left) {
    return `Суставные поверхности правого тазобедренного сустава ${right} преимущественно в области крыши вертлужной впадины, левого ${left} преимущественно в области крыши вертлужной впадины.`
  }

  if (right) {
    return hasEndoprosthesis
      ? `Суставные поверхности ${right} преимущественно в области крыши вертлужной впадины.`
      : `Суставные поверхности правого тазобедренного сустава ${right} преимущественно в области крыши вертлужной впадины.`
  }

  return hasEndoprosthesis
    ? `Суставные поверхности ${left} преимущественно в области крыши вертлужной впадины.`
    : `Суставные поверхности левого тазобедренного сустава ${left} преимущественно в области крыши вертлужной впадины.`
}

export function generateHipOsteophytesDescription(state: HipOsteophytesState) {
  const hips = {
    left: { lat: state.leftLateral, med: state.leftMedial, gt: state.leftGreaterTrochanter },
    right: {
      lat: state.rightLateral,
      med: state.rightMedial,
      gt: state.rightGreaterTrochanter,
    },
  }

  const hasAny = Object.values(state).some(Boolean)
  if (!hasAny) {
    return 'Остеофитов в тазобедренных суставах не выявлено.'
  }

  const parts: string[] = []
  const surfaceNames = { lat: 'латеральн', med: 'медиальн' } as const
  const hipSides = { left: 'левого', right: 'правого' } as const

  ;(['lat', 'med'] as const).forEach((surface) => {
    if (hips.left[surface] && hips.right[surface]) {
      parts.push(`${surfaceNames[surface]}ым поверхностям вертлужных впадин тазобедренных суставов`)
      hips.left[surface] = false
      hips.right[surface] = false
    }
  })

  ;(['left', 'right'] as const).forEach((side) => {
    const active = (['lat', 'med'] as const)
      .filter((surface) => hips[side][surface])
      .map((surface) => `${surfaceNames[surface]}ой`)

    if (!active.length) {
      return
    }

    parts.push(
      active.length > 1
        ? `${active.join(' и ')} поверхности вертлужной впадины ${hipSides[side]} тазобедренного сустава`
        : `${active[0]} поверхности вертлужной впадины ${hipSides[side]} тазобедренного сустава`,
    )
  })

  if (hips.left.gt && hips.right.gt) {
    parts.push('краям больших вертелов бедренных костей')
  } else if (hips.left.gt) {
    parts.push('краю большого вертела левой бедренной кости')
  } else if (hips.right.gt) {
    parts.push('краю большого вертела правой бедренной кости')
  }

  return parts.length === 1
    ? `Определяются краевые костные разрастания по ${parts[0]}.`
    : `Определяются краевые костные разрастания со стороны ${parts.join(' и ')}.`
}

export function generatePubicSymphysisDescription(state: PubicSymphysisState) {
  if (state.isNormal) {
    return 'Лонное сочленение симметрично.'
  }

  let description = 'Лонное сочленение'

  if (state.symmetry === 'Асимметричная') {
    description += ' асимметрично'
  } else if (state.symmetry === 'Симметрична') {
    description += ' симметрично'
  }

  const parts: string[] = []

  if (state.osteophytes.length > 0) {
    const mapping: Record<string, string> = {
      Верхние: 'верхнего',
      Нижние: 'нижнего',
    }
    const mapped = state.osteophytes.map((item) => mapping[item] ?? item)
    const osteophyteText =
      mapped.length === 1
        ? `${mapped[0]} края`
        : mapped.length === 2
          ? `${mapped[0]} и ${mapped[1]} края`
          : `${mapped.slice(0, -1).join(', ')} и ${mapped[mapped.length - 1]} края`
    parts.push(`имеются остеофиты в области ${osteophyteText}`)
  }

  if (state.surfaces && state.surfaces !== 'Не изменены') {
    parts.push(`суставные поверхности ${state.surfaces.toLowerCase()}`)
  }

  if (parts.length > 0) {
    description += `, ${parts.join(', ')}`
  }

  return `${description}.`
}
