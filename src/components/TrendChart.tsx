'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { formatRupiah } from '@/lib/utils'
import { useTheme } from '@/components/ThemeProvider'

interface TrendData {
  month: string
  income: number
  expense: number
}

function shortMonth(month: string) {
  const [year, m] = month.split('-')
  const date = new Date(parseInt(year), parseInt(m) - 1, 1)
  return date.toLocaleDateString('id-ID', { month: 'short' })
}

function shortValue(v: number) {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}jt`
  if (v >= 1_000) return `${Math.round(v / 1_000)}rb`
  return `${v}`
}

export function TrendChart({ data }: { data: TrendData[] }) {
  const { theme } = useTheme()
  const formatted = data.map(d => ({ ...d, label: shortMonth(d.month) }))

  const axisColor   = theme === 'dark' ? '#475569' : '#B5ACA4'
  const tooltipBg   = theme === 'dark' ? '#2E3448' : '#FFFFFF'
  const tooltipBdr  = theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(44,37,35,0.10)'
  const tooltipText = theme === 'dark' ? '#CBD5E1' : '#2C2523'
  const legendColor = theme === 'dark' ? '#475569' : '#8C827A'
  const cursorFill  = theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(44,37,35,0.04)'

  const incomeColor  = theme === 'dark' ? '#10B981' : '#606C38'
  const expenseColor = theme === 'dark' ? '#F43F5E' : '#C27052'

  return (
    <ResponsiveContainer width="100%" height={190}>
      <BarChart data={formatted} margin={{ top: 5, right: 5, bottom: 5, left: 0 }} barSize={12}>
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: axisColor }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: axisColor }} tickFormatter={shortValue} axisLine={false} tickLine={false} width={36} />
        <Tooltip
          formatter={(value: number) => formatRupiah(value)}
          contentStyle={{
            borderRadius: '12px',
            border: `1px solid ${tooltipBdr}`,
            fontSize: '12px',
            backgroundColor: tooltipBg,
            color: tooltipText,
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          }}
          labelStyle={{ color: axisColor, marginBottom: 4 }}
          cursor={{ fill: cursorFill }}
        />
        <Legend iconSize={7} iconType="circle" wrapperStyle={{ fontSize: '11px', color: legendColor }} />
        <Bar dataKey="income" name="Pemasukan" fill={incomeColor} radius={[4, 4, 0, 0]} opacity={0.85} />
        <Bar dataKey="expense" name="Pengeluaran" fill={expenseColor} radius={[4, 4, 0, 0]} opacity={0.85} />
      </BarChart>
    </ResponsiveContainer>
  )
}
