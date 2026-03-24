interface Props {
  current: number
  total: number
  goTo: (i: number) => void
  goPrev: () => void
  goNext: () => void
}

export function Navigation({ current, total, goTo, goPrev, goNext }: Props) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4">
      <button
        onClick={goPrev}
        disabled={current === 0}
        className="text-cream-dim hover:text-gold disabled:opacity-20 transition-colors text-xl px-3 py-1"
      >
        ←
      </button>

      <div className="flex gap-2 items-center">
        {Array.from({ length: total }, (_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`rounded-full transition-all duration-300 ${
              i === current
                ? 'w-6 h-2 bg-gold'
                : 'w-2 h-2 bg-cream-dim/30 hover:bg-cream-dim/60'
            }`}
          />
        ))}
      </div>

      <div className="flex items-center gap-4">
        <span className="text-cream-dim text-sm font-sans tabular-nums">
          {String(current + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
        <button
          onClick={goNext}
          disabled={current === total - 1}
          className="text-cream-dim hover:text-gold disabled:opacity-20 transition-colors text-xl px-3 py-1"
        >
          →
        </button>
      </div>
    </div>
  )
}
