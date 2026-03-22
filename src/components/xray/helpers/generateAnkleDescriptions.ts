export interface AnkleGapSurfaceSideState {
  degree: string
  position: string
}

export interface AnkleGapSurfaceState {
  left: AnkleGapSurfaceSideState
  right: AnkleGapSurfaceSideState
}

export interface AnkleOsteophytesState {
  rightLateral: boolean
  rightMedial: boolean
  leftLateral: boolean
  leftMedial: boolean
}

export function createInitialAnkleGapSurfaceState(): AnkleGapSurfaceState {
  return {
    left: { degree: '', position: '' },
    right: { degree: '', position: '' },
  }
}

export function createInitialAnkleOsteophytesState(): AnkleOsteophytesState {
  return {
    rightLateral: false,
    rightMedial: false,
    leftLateral: false,
    leftMedial: false,
  }
}

function getPositionPhrase(position: string, plural = false) {
  switch (position) {
    case 'Медиально':
      return plural ? 'в медиальных отделах' : 'в медиальном отделе'
    case 'Латерально':
      return plural ? 'в латеральных отделах' : 'в латеральном отделе'
    default:
      return ''
  }
}

function getJointNames() {
  return {
    plural: 'голеностопных суставов',
    singular: 'голеностопного сустава',
  }
}

export function generateAnkleGapSurfaceDescription(
  state: AnkleGapSurfaceState,
  mode: 'gaps' | 'surfaces',
) {
  const jointNames = getJointNames()
  const left = state.left
  const right = state.right

  const normalText =
    mode === 'gaps'
      ? 'Суставные щели голеностопных суставов сохранены, равномерные.'
      : 'Суставные поверхности голеностопных суставов ровные, без деформации.'

  if (!left.degree && !right.degree) {
    return normalText
  }

  const formatPart = (side: 'left' | 'right', value: AnkleGapSurfaceSideState) => {
    const sideName = side === 'left' ? 'левого' : 'правого'
    const predicate =
      mode === 'gaps'
        ? `${value.degree.toLowerCase()} сужена`
        : `${value.degree.toLowerCase()} склерозированы`
    const positionText =
      value.position && value.position !== 'Равномерно'
        ? `, преимущественно ${getPositionPhrase(value.position)}`
        : ''

    return `${sideName} ${jointNames.singular} ${predicate}${positionText}`
  }

  if (left.degree && right.degree) {
    const sameDegree = left.degree === right.degree
    const samePosition = left.position === right.position

    if (sameDegree && samePosition) {
      const predicate =
        mode === 'gaps'
          ? `${left.degree.toLowerCase()} сужены`
          : `${left.degree.toLowerCase()} склерозированы`
      const positionText =
        left.position && left.position !== 'Равномерно'
          ? `, преимущественно ${getPositionPhrase(left.position, true)}`
          : ''
      const subject =
        mode === 'gaps'
          ? `Суставные щели ${jointNames.plural}`
          : `Суставные поверхности ${jointNames.plural}`

      return `${subject} ${predicate}${positionText}.`
    }

    const subject =
      mode === 'gaps' ? 'Суставная щель' : 'Суставные поверхности'
    return `${subject} ${formatPart('right', right)}; ${formatPart('left', left)}.`
  }

  if (left.degree) {
    return mode === 'gaps'
      ? `Суставная щель ${formatPart('left', left)}, правого голеностопного сустава не изменена.`
      : `Суставные поверхности ${formatPart('left', left)}, правого голеностопного сустава без патологических изменений.`
  }

  return mode === 'gaps'
    ? `Суставная щель ${formatPart('right', right)}, левого голеностопного сустава не изменена.`
    : `Суставные поверхности ${formatPart('right', right)}, левого голеностопного сустава без патологических изменений.`
}

export function generateAnkleOsteophytesDescription(state: AnkleOsteophytesState) {
  const { rightLateral, rightMedial, leftLateral, leftMedial } = state

  if (!rightLateral && !rightMedial && !leftLateral && !leftMedial) {
    return 'Краевые костные разрастания не выявлены.'
  }

  const jointNames = getJointNames()
  const combinedParts: string[] = []
  if (rightLateral && leftLateral) {
    combinedParts.push(`на латеральных поверхностях ${jointNames.plural}`)
  }
  if (rightMedial && leftMedial) {
    combinedParts.push(`на медиальных поверхностях ${jointNames.plural}`)
  }

  const separateParts: string[] = []
  if (rightLateral && !leftLateral) {
    separateParts.push(`на латеральной поверхности правого ${jointNames.singular}`)
  }
  if (!rightLateral && leftLateral) {
    separateParts.push(`на латеральной поверхности левого ${jointNames.singular}`)
  }
  if (rightMedial && !leftMedial) {
    separateParts.push(`на медиальной поверхности правого ${jointNames.singular}`)
  }
  if (!rightMedial && leftMedial) {
    separateParts.push(`на медиальной поверхности левого ${jointNames.singular}`)
  }

  const allParts = [...combinedParts, ...separateParts]
  if (allParts.length === 1) {
    return `Определяются краевые костные разрастания ${allParts[0]}.`
  }

  const last = allParts.pop()
  return `Определяются краевые костные разрастания ${allParts.join(' и ')} и ${last}.`
}
