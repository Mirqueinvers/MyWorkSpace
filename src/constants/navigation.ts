export const NAV_ITEMS = [
  'Главная',
  'Мед осмотры',
  'Больничные листы',
  'Школы',
  'Справки',
] as const

export type AppSection = (typeof NAV_ITEMS)[number]
