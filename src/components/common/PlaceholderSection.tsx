interface PlaceholderSectionProps {
  title: string
}

export function PlaceholderSection({ title }: PlaceholderSectionProps) {
  return (
    <section className="content-card placeholder-card">
      <p className="section-kicker">Раздел</p>
      <h2>{title}</h2>
      <p className="section-copy">
        Этот экран ещё не настроен. Сейчас полностью рабочим сделан раздел
        «Мед осмотры» с сохранением пациентов в SQLite.
      </p>
    </section>
  )
}
