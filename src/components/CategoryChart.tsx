'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { formatRupiah } from '@/lib/utils'
import { useTheme } from '@/components/ThemeProvider'

interface CategoryData {
  name: string
  value: number
  color: string
  emoji: string
}

export function CategoryChart({ data, total }: { data: CategoryData[]; total: number }) {
  const { theme } = useTheme()
  const tooltipBg   = theme === 'dark' ? '#2E3448' : '#FFFFFF'
  const tooltipBdr  = theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(44,37,35,0.10)'
  const tooltipText = theme === 'dark' ? '#CBD5E1' : '#2C2523'

  return (
    <div>
      <ResponsiveContainer width="100%" height={170}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={52}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
            startAngle={90}
            endAngle={-270}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} opacity={0.88} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [formatRupiah(value), 'Jumlah']}
            contentStyle={{
              borderRadius: '12px',
              border: `1px solid ${tooltipBdr}`,
              fontSize: '12px',
              backgroundColor: tooltipBg,
              color: tooltipText,
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="space-y-2.5 mt-1">
        {data.map((cat, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
              <span className="text-sm t2">{cat.emoji} {cat.name}</span>
            </div>
            <div className="flex items-center gap-3 ml-2">
              <span className="text-xs t3">{Math.round((cat.value / total) * 100)}%</span>
              <span className="text-sm font-semibold t1">{formatRupiah(cat.value)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
