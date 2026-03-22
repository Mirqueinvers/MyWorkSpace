export type WristSide = 'left' | 'right'
export type WristDegree = 'незначительно' | 'умеренно' | 'выраженно' | 'резко'
export type WristPosition = 'равномерно' | 'медиально' | 'латерально'

export interface WristGapSurfaceState {
  selectedSides: WristSide[]
  selectedOptions: Record<WristSide, WristDegree[]>
  selectedPositions: Record<WristSide, '' | WristPosition>
}

export interface WristOsteophytesState {
  rightLateral: boolean
  rightMedial: boolean
  leftLateral: boolean
  leftMedial: boolean
}

export function createInitialWristGapSurfaceState(): WristGapSurfaceState {
  return {
    selectedSides: [],
    selectedOptions: {
      left: [],
      right: [],
    },
    selectedPositions: {
      left: '',
      right: '',
    },
  }
}

export function createInitialWristOsteophytesState(): WristOsteophytesState {
  return {
    rightLateral: false,
    rightMedial: false,
    leftLateral: false,
    leftMedial: false,
  }
}

export function generateWristGapSurfaceDescription({
  selectedOptions,
  selectedPositions,
  mode,
}: {
  selectedOptions: WristGapSurfaceState['selectedOptions']
  selectedPositions: WristGapSurfaceState['selectedPositions']
  mode: 'gaps' | 'surfaces'
}) {
  const jointNames = {
    plural: 'лучезапястных суставов',
    single: 'лучезапястного сустава',
  }
  const leftOpts = selectedOptions.left || []
  const rightOpts = selectedOptions.right || []
  const leftPos = selectedPositions.left || ''
  const rightPos = selectedPositions.right || ''
  const sides = { left: 'левого', right: 'правого' } as const

  const positionPhrase = (pos: string, plural = false) => {
    switch (pos) {
      case 'медиально':
        return plural ? 'медиальных' : 'медиальном'
      case 'латерально':
        return plural ? 'латеральных' : 'латеральном'
      case 'равномерно':
        return 'равномерно'
      default:
        return ''
    }
  }

  const addPosition = (pos: string, plural = false) => {
    if (!pos || pos === 'равномерно') return ''
    return `, преимущественно в ${positionPhrase(pos, plural)} отдел${plural ? 'ах' : 'е'}`
  }

  const normalText =
    mode === 'gaps'
      ? `Суставные щели ${jointNames.plural} сохранены, равномерные.`
      : `Суставные поверхности ${jointNames.plural} ровные, без деформации.`

  const actionText = (degree: string, plural = false) => {
    if (mode === 'gaps') return `${degree} ${plural ? 'сужены' : 'сужена'}`
    return `${degree} склерозированы`
  }

  if (!leftOpts.length && !rightOpts.length) return normalText

  if (leftOpts.length && rightOpts.length) {
    const sameDegree = leftOpts[0] === rightOpts[0]
    const samePos = leftPos === rightPos

    if (sameDegree && samePos) {
      const plural = mode === 'gaps'
      if (!leftPos || leftPos === 'равномерно') {
        return mode === 'gaps'
          ? `Суставные щели ${jointNames.plural} ${actionText(leftOpts[0], plural)}.`
          : `Суставные поверхности ${jointNames.plural} ${actionText(leftOpts[0], plural)}.`
      }
      return mode === 'gaps'
        ? `Суставные щели ${jointNames.plural} ${actionText(leftOpts[0], plural)}${addPosition(leftPos, plural)}.`
        : `Суставные поверхности ${jointNames.plural} ${actionText(leftOpts[0], plural)}${addPosition(leftPos, true)}.`
    }

    const rightPart = `${sides.right} ${jointNames.single} ${actionText(rightOpts[0])}${addPosition(rightPos)}`
    const leftPart = `${sides.left} ${jointNames.single} ${actionText(leftOpts[0])}${addPosition(leftPos)}`
    return `${mode === 'gaps' ? 'Суставная щель' : 'Суставные поверхности'} ${rightPart}; ${leftPart}.`
  }

  if (leftOpts.length) {
    return `${mode === 'gaps' ? 'Суставная щель' : 'Суставные поверхности'} ${sides.left} ${jointNames.single} ${actionText(leftOpts[0])}${addPosition(leftPos)}, правого ${mode === 'gaps' ? 'не изменена' : 'не изменены'}.`
  }

  if (rightOpts.length) {
    return `${mode === 'gaps' ? 'Суставная щель' : 'Суставные поверхности'} ${sides.right} ${jointNames.single} ${actionText(rightOpts[0])}${addPosition(rightPos)}, левого ${mode === 'gaps' ? 'не изменена' : 'не изменены'}.`
  }

  return 'Изменений не выявлено.'
}

export function generateWristOsteophytesDescription(selectedAreas: WristOsteophytesState) {
  const { rightLateral, rightMedial, leftLateral, leftMedial } = selectedAreas

  if (!rightLateral && !rightMedial && !leftLateral && !leftMedial) {
    return 'Краевые костные разрастания не выявлены.'
  }

  const combinedParts: string[] = []
  if (rightLateral && leftLateral) {
    combinedParts.push('на латеральных поверхностях лучезапястных суставов')
  }
  if (rightMedial && leftMedial) {
    combinedParts.push('на медиальных поверхностях лучезапястных суставов')
  }

  const separateParts: string[] = []
  if (rightLateral && !leftLateral) {
    separateParts.push('на латеральной поверхности правого лучезапястного сустава')
  }
  if (!rightLateral && leftLateral) {
    separateParts.push('на латеральной поверхности левого лучезапястного сустава')
  }
  if (rightMedial && !leftMedial) {
    separateParts.push('на медиальной поверхности правого лучезапястного сустава')
  }
  if (!rightMedial && leftMedial) {
    separateParts.push('на медиальной поверхности левого лучезапястного сустава')
  }

  const allParts = [...combinedParts, ...separateParts]
  if (allParts.length === 1) {
    return `Определяются краевые костные разрастания ${allParts[0]}.`
  }

  const last = allParts.pop()
  return `Определяются краевые костные разрастания ${allParts.join(' и ')} и ${last}.`
}
