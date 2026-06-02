'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts'
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'
import { formatRupiah } from '@/lib/utils'
import { useTheme } from '@/components/ThemeProvider'

export interface CompareEntry {
  id: string
  name: string
  emoji: string
  current: number
  prev: number
  color: string
  pct: number | null
}

function shortVal(v: number) {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}jt`
  if (v >= 1_000) return `${Math.round(v / 1_000)}rb`
  return String(v)
}

function PctBadge({ pct }: { pct: number | null }) {
  if (pct === null) return <span className="t3 text-xs">—</span>
  if (pct === 0) return (
    <span className="t2 text-xs flex items-center gap-0.5"><Minus size={11} /> Sama</span>
  )
  const up = pct > 0
  return (
    <span
      className="flex items-center gap-0.5 text-xs font-semibold"
      style={{ color: up ? 'var(--neg)' : 'var(--pos)' }}
    >
      {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
      {Math.abs(Math.round(pct))}%
      <span className="font-normal t3 ml-0.5">{up ? 'naik' : 'turun'}</span>
    </span>
  )
}

export function CategoryCompareChart({ data }: { data: CompareEntry[] }) {
  const { theme } = useTheme()
  if (data.length === 0) return null

  const chartHeight = data.length * 52 + 48
  const axisColor   = theme === 'dark' ? '#475569' : '#B5ACA4'
  const tooltipBg   = theme === 'dark' ? '#2E3448' : '#FFFFFF'
  const tooltipBdr  = theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(44,37,35,0.10)'
  const tooltipText = theme === 'dark' ? '#CBD5E1' : '#2C2523'
  const prevBar     = theme === 'dark' ? '#334155' : '#D6CFC7'
  const cursorFill  = theme === 'dark' ? 'rgba(255,255,255,0.025)' : 'rgba(44,37,35,0.04)'

  return (
    <div>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart layout="vertical" data={data} margin={{ top: 4, right: 12, bottom: 4, left: 4 }} barSize={9} barCategoryGap="32%">
          <YAxis
            dataKey="name"
            type="category"
            width={100}
            tick={{ fontSize: 11, fill: axisColor }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(val: string, idx: number) => `${data[idx]?.emoji ?? ''} ${val}`}
          />
          <XAxis
            type="number"
            tick={{ fontSize: 10, fill: axisColor }}
            tickFormatter={shortVal}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value: number, key: string) => [
              formatRupiah(value),
              key === 'current' ? 'Bulan ini' : 'Bulan lalu',
            ]}
            contentStyle={{
              borderRadius: '12px',
              border: `1px solid ${tooltipBdr}`,
              fontSize: '12px',
              backgroundColor: tooltipBg,
              color: tooltipText,
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            }}
            cursor={{ fill: cursorFill }}
          />
          <Legend
            iconSize={7}
            iconType="circle"
            wrapperStyle={{ fontSize: '11px', color: axisColor, paddingTop: 6 }}
            formatter={(value: string) => value === 'current' ? 'Bulan ini' : 'Bulan lalu'}
          />
          <Bar dataKey="prev" name="prev" fill={prevBar} radius={[0, 3, 3, 0]} opacity={0.55} />
          <Bar dataKey="current" name="current" radius={[0, 3, 3, 0]}>
            {data.map((entry, i) => <Cell key={i} fill={entry.color} opacity={0.88} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* % change table */}
      <div className="mt-4 space-y-2.5 pt-4" style={{ borderTop: '1px solid var(--border-light)' }}>
        <p className="text-[10px] t3 uppercase tracking-widest mb-3">Perubahan vs Bulan Lalu</p>
        {data.map(cat => (
          <div key={cat.id} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm">{cat.emoji}</span>
              <span className="text-xs t2">{cat.name}</span>
            </div>
            <div className="flex items-center gap-3">
              {cat.prev > 0 && (
                <span className="text-[10px] t3 hidden sm:block">
                  {formatRupiah(cat.prev)} → {formatRupiah(cat.current)}
                </span>
              )}
              <PctBadge pct={cat.pct} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
