// src/components/ui/InsightCard.tsx
type Color = 'red' | 'yellow' | 'green' | 'blue'

const BG: Record<Color, string> = {
  red:    'rgba(239,68,68,0.1)',
  yellow: 'rgba(245,158,11,0.1)',
  green:  'rgba(34,197,94,0.1)',
  blue:   'rgba(59,130,246,0.1)',
}

export function InsightCard({ icon, color, title, desc }: {
  icon: string; color: Color; title: string; desc: string
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border"
      style={{ background: 'var(--bg3)', borderColor: 'var(--border)' }}>
      <div className="w-7 h-7 rounded-md flex items-center justify-center text-sm flex-shrink-0 mt-0.5"
        style={{ background: BG[color] }}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text2)' }}>{desc}</p>
      </div>
    </div>
  )
}
