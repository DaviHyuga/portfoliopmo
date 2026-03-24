// src/components/ui/KpiCard.tsx
interface KpiCardProps {
  label: string
  value: string | number
  meta?: string
  accent: 'accent' | 'green' | 'yellow' | 'red'
  icon?: string
}

const ACCENT_COLORS: Record<string, string> = {
  accent: 'linear-gradient(90deg, #6366f1, #a855f7)',
  green: '#22c55e',
  yellow: '#f59e0b',
  red: '#ef4444',
}

export function KpiCard({ label, value, meta, accent, icon }: KpiCardProps) {
  return (
    <div className="relative rounded-xl border overflow-hidden"
      style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
      <div className="absolute top-0 left-0 right-0 h-0.5"
        style={{ background: ACCENT_COLORS[accent] }} />
      {icon && (
        <span className="absolute top-4 right-4 text-xl opacity-30">{icon}</span>
      )}
      <div className="px-5 py-5">
        <p className="text-xs uppercase tracking-widest font-medium mb-2.5" style={{ color: 'var(--text3)' }}>
          {label}
        </p>
        <p className="text-3xl font-semibold font-mono" style={{ letterSpacing: '-1.5px' }}>
          {value}
        </p>
        {meta && (
          <p className="text-xs mt-1.5" style={{ color: 'var(--text3)' }}>{meta}</p>
        )}
      </div>
    </div>
  )
}
