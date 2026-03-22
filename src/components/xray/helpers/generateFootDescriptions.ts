export interface FootJointMeta {
  key: string
  label: string
  side: 'left' | 'right'
  group: 'Tmt' | 'Mtp' | 'PIP' | 'DIP' | 'IP'
}

export const FOOT_JOINTS: FootJointMeta[] = [
  { key: 'rightTmt1', label: 'I', side: 'right', group: 'Tmt' },
  { key: 'rightTmt2', label: 'II', side: 'right', group: 'Tmt' },
  { key: 'rightTmt3', label: 'III', side: 'right', group: 'Tmt' },
  { key: 'rightTmt4', label: 'IV', side: 'right', group: 'Tmt' },
  { key: 'rightTmt5', label: 'V', side: 'right', group: 'Tmt' },
  { key: 'rightMtp1', label: 'I', side: 'right', group: 'Mtp' },
  { key: 'rightMtp2', label: 'II', side: 'right', group: 'Mtp' },
  { key: 'rightMtp3', label: 'III', side: 'right', group: 'Mtp' },
  { key: 'rightMtp4', label: 'IV', side: 'right', group: 'Mtp' },
  { key: 'rightMtp5', label: 'V', side: 'right', group: 'Mtp' },
  { key: 'rightPIP2', label: 'II', side: 'right', group: 'PIP' },
  { key: 'rightPIP3', label: 'III', side: 'right', group: 'PIP' },
  { key: 'rightPIP4', label: 'IV', side: 'right', group: 'PIP' },
  { key: 'rightPIP5', label: 'V', side: 'right', group: 'PIP' },
  { key: 'rightDIP2', label: 'II', side: 'right', group: 'DIP' },
  { key: 'rightDIP3', label: 'III', side: 'right', group: 'DIP' },
  { key: 'rightDIP4', label: 'IV', side: 'right', group: 'DIP' },
  { key: 'rightDIP5', label: 'V', side: 'right', group: 'DIP' },
  { key: 'rightIP1', label: 'I', side: 'right', group: 'IP' },
  { key: 'leftTmt1', label: 'I', side: 'left', group: 'Tmt' },
  { key: 'leftTmt2', label: 'II', side: 'left', group: 'Tmt' },
  { key: 'leftTmt3', label: 'III', side: 'left', group: 'Tmt' },
  { key: 'leftTmt4', label: 'IV', side: 'left', group: 'Tmt' },
  { key: 'leftTmt5', label: 'V', side: 'left', group: 'Tmt' },
  { key: 'leftMtp1', label: 'I', side: 'left', group: 'Mtp' },
  { key: 'leftMtp2', label: 'II', side: 'left', group: 'Mtp' },
  { key: 'leftMtp3', label: 'III', side: 'left', group: 'Mtp' },
  { key: 'leftMtp4', label: 'IV', side: 'left', group: 'Mtp' },
  { key: 'leftMtp5', label: 'V', side: 'left', group: 'Mtp' },
  { key: 'leftPIP2', label: 'II', side: 'left', group: 'PIP' },
  { key: 'leftPIP3', label: 'III', side: 'left', group: 'PIP' },
  { key: 'leftPIP4', label: 'IV', side: 'left', group: 'PIP' },
  { key: 'leftPIP5', label: 'V', side: 'left', group: 'PIP' },
  { key: 'leftDIP2', label: 'II', side: 'left', group: 'DIP' },
  { key: 'leftDIP3', label: 'III', side: 'left', group: 'DIP' },
  { key: 'leftDIP4', label: 'IV', side: 'left', group: 'DIP' },
  { key: 'leftDIP5', label: 'V', side: 'left', group: 'DIP' },
  { key: 'leftIP1', label: 'I', side: 'left', group: 'IP' },
] as const

export const FOOT_DEGREES = [
  'Не изменены',
  'Незначительно',
  'Умеренно',
  'Выраженно',
  'Резко',
] as const

export type FootDegree = (typeof FOOT_DEGREES)[number]
export type FootJointKey = (typeof FOOT_JOINTS)[number]['key']

export type FootJointSelection = Partial<Record<FootDegree | 'selected', boolean>>
export type FootSelectionState = Record<FootJointKey, FootJointSelection>

export function createInitialFootSelectionState(): FootSelectionState {
  return Object.fromEntries(FOOT_JOINTS.map((joint) => [joint.key, {}])) as FootSelectionState
}

const GROUP_NAMES = {
  Mtp: {
    plural: 'плюснефаланговых суставах',
    single: 'плюснефаланговом суставе',
    singleGenitive: 'плюснефалангового сустава',
  },
  PIP: {
    plural: 'проксимальных межфаланговых суставах',
    single: 'проксимальном межфаланговом суставе',
    singleGenitive: 'проксимального межфалангового сустава',
  },
  DIP: {
    plural: 'дистальных межфаланговых суставах',
    single: 'дистальном межфаланговом суставе',
    singleGenitive: 'дистального межфалангового сустава',
  },
  Tmt: {
    plural: 'предплюсне-плюсневых суставах',
    single: 'предплюсне-плюсневом суставе',
    singleGenitive: 'предплюсне-плюсневого сустава',
  },
  IP: {
    plural: 'межфаланговых суставах I пальца',
    single: 'межфаланговом суставе I пальца',
    singleGenitive: 'межфалангового сустава I пальца',
  },
} as const

const SIDE_NAMES = { right: 'правой', left: 'левой' } as const

const ROMAN_TO_NUM = { I: 1, II: 2, III: 3, IV: 4, V: 5 } as const
const NUM_TO_ROMAN = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V' } as const

function compressFingerLabels(labels: string[]) {
  const nums = labels
    .map((label) => ROMAN_TO_NUM[label as keyof typeof ROMAN_TO_NUM])
    .filter(Boolean)
    .sort((a, b) => a - b)
  if (!nums.length) return ''

  const ranges: string[] = []
  let start = nums[0]
  let end = nums[0]

  for (let index = 1; index <= nums.length; index += 1) {
    if (nums[index] === end + 1) {
      end = nums[index]
      continue
    }
    ranges.push(
      start === end
        ? NUM_TO_ROMAN[start as keyof typeof NUM_TO_ROMAN]
        : `${NUM_TO_ROMAN[start as keyof typeof NUM_TO_ROMAN]}–${NUM_TO_ROMAN[end as keyof typeof NUM_TO_ROMAN]}`,
    )
    start = nums[index]
    end = nums[index]
  }

  return ranges.join(', ')
}

function getSelectedByDegree(state: FootSelectionState, degree: FootDegree | 'selected') {
  const grouped: Record<string, Record<string, string[]>> = {}

  FOOT_JOINTS.forEach((joint) => {
    const selected = state[joint.key]?.[degree]
    if (!selected) return
    grouped[joint.side] ??= {}
    grouped[joint.side][joint.group] ??= []
    grouped[joint.side][joint.group].push(joint.label)
  })

  return grouped
}

export function generateFootJointDescription(
  state: FootSelectionState,
  mode: 'gaps' | 'surfaces',
) {
  const hasAnyDegree = FOOT_DEGREES.some((degree) =>
    Object.values(state).some((joint) => joint[degree]),
  )

  if (!hasAnyDegree) {
    return mode === 'gaps'
      ? 'Суставные щели стоп равномерной высоты.'
      : 'Суставные поверхности стоп ровные, без деформации.'
  }

  const specialParts: string[] = []
  const degreeParts: string[] = []

  ;(['Незначительно', 'Умеренно', 'Выраженно', 'Резко'] as const).forEach((degree) => {
    const grouped = getSelectedByDegree(state, degree)

    ;(['right', 'left'] as const).forEach((side) => {
      const types = grouped[side]
      if (!types) return

      Object.entries(types).forEach(([groupKey, labels]) => {
        const group = GROUP_NAMES[groupKey as keyof typeof GROUP_NAMES]
        if (!group || !labels.length) return

        const action =
          mode === 'gaps'
            ? `${degree.toLowerCase()} сужены в`
            : `${degree.toLowerCase()} склерозированы в`

        if (labels.length === 1 || groupKey === 'IP') {
          const finger = labels[0]
          degreeParts.push(
            `${action} ${group.single} ${finger} пальца ${SIDE_NAMES[side]} стопы`,
          )
          return
        }

        const fingers = compressFingerLabels(labels)
        degreeParts.push(
          `${action} ${group.plural} ${fingers} пальцев ${SIDE_NAMES[side]} стопы`,
        )
      })
    })

    const right = grouped.right?.Mtp?.slice().sort().join(',')
    const left = grouped.left?.Mtp?.slice().sort().join(',')
    if (right && left && right === left) {
      const fingers = compressFingerLabels(grouped.right.Mtp)
      specialParts.push(
        `${
          mode === 'gaps'
            ? `${degree.toLowerCase()} сужены в плюснефаланговых суставах`
            : `${degree.toLowerCase()} склерозированы в плюснефаланговых суставах`
        } ${fingers} пальцев стоп`,
      )
      delete grouped.right.Mtp
      delete grouped.left.Mtp
    }
  })

  const parts: string[] = []
  if (specialParts.length) {
    parts.push(
      `${mode === 'gaps' ? 'Суставные щели' : 'Суставные поверхности'} ${specialParts.join('; ')}.`,
    )
  }
  if (degreeParts.length) {
    parts.push(
      `${mode === 'gaps' ? 'Суставные щели' : 'Суставные поверхности'} ${degreeParts.join('; ')}.`,
    )
  }

  return parts.join(' ')
}

export function generateFootOsteophytesDescription(state: FootSelectionState) {
  const grouped = getSelectedByDegree(state, 'selected')
  const parts: string[] = []

  ;(['right', 'left'] as const).forEach((side) => {
    const types = grouped[side]
    if (!types) return
    Object.entries(types).forEach(([groupKey, labels]) => {
      const group = GROUP_NAMES[groupKey as keyof typeof GROUP_NAMES]
      if (!group || !labels.length) return

      if (labels.length === 1 || groupKey === 'IP') {
        const finger = labels[0]
        parts.push(`${group.singleGenitive} ${finger} пальца ${SIDE_NAMES[side]} стопы`)
        return
      }

      const fingers = compressFingerLabels(labels)
      parts.push(`${fingers} ${group.plural} ${SIDE_NAMES[side]} стопы`)
    })
  })

  if (!parts.length) {
    return 'Краевые костные разрастания не выявлены.'
  }

  return `Определяются краевые костные разрастания по боковым поверхностям ${parts.join('; ')}.`
}

export function generateFootCongruencyDescription(state: FootSelectionState) {
  const grouped = getSelectedByDegree(state, 'selected')
  const parts: string[] = []

  ;(['right', 'left'] as const).forEach((side) => {
    const types = grouped[side]
    if (!types) return
    Object.entries(types).forEach(([groupKey, labels]) => {
      const group = GROUP_NAMES[groupKey as keyof typeof GROUP_NAMES]
      if (!group || !labels.length) return

      if (labels.length === 1 || groupKey === 'IP') {
        const finger = labels[0]
        parts.push(`${group.single} ${finger} пальца ${SIDE_NAMES[side]} стопы`)
        return
      }

      const fingers = compressFingerLabels(labels)
      parts.push(`${fingers} ${group.plural} ${SIDE_NAMES[side]} стопы`)
    })
  })

  if (!parts.length) {
    return 'Конгруэнтность суставных поверхностей не нарушена.'
  }

  return `Нарушена конгруэнтность в ${parts.join('; ')}.`
}
