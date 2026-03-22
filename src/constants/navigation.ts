export const NAV_ITEMS = [
  'Главная',
  'Мед осмотры',
  'Больничные листы',
  'Школы',
  'X-ray',
  'Заметки',
  'Справки',
] as const

export type AppSection = (typeof NAV_ITEMS)[number]
