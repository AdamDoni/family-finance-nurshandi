'use client'

import { useEffect, useState } from 'react'
import { formatRupiah, formatMonthYear, getCurrentMonth } from '@/lib/utils'
import { getCategoryInfo, EXPENSE_CATEGORIES } from '@/lib/categories'
import { CategoryChart } from '@/components/CategoryChart'
import { TrendChart } from '@/components/TrendChart'
import { CategoryCompareChart, CompareEntry } from '@/components/CategoryCompareChart'
import { RecentTransactions } from '@/components/RecentTransactions'
import { SummaryData } from '@/types'
import { ArrowUpRight, ArrowDownRight, Users, CalendarDays, PlusCircle } from 'lucide-react'

export default function DashboardPage() {
  const [data, setData] = useState<SummaryData | null>(null)
  const [month, setMonth] = useState(getCurrentMonth())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/summary?month=${month}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
  }, [month])

  if (loading) {
    return (
      <div className="flex items-center justify-center pt-32">
        <div className="t3 text-sm">Memuat data...</div>
      </div>
    )
  }
  if (!data) return null

  const hasExpense = data.totalExpense > 0

  const categoryData = hasExpense
    ? Object.entries(data.byCategory)
        .map(([id, value]) => {
          const cat = getCategoryInfo(id)
          const prev = data.prevByCategory?.[id] || 0
          const pct = prev > 0 ? ((value - prev) / prev) * 100 : null
          return { id: cat.id, name: cat.label, label: cat.label, value, color: cat.color, emoji: cat.emoji, prev, pct }
        })
        .sort((a, b) => b.value - a.value)
    : []

  const compareEntries: CompareEntry[] = categoryData.map(c => ({ ...c, current: c.value }))
  const spendRatio = data.totalIncome > 0 ? Math.round((data.totalExpense / data.totalIncome) * 100) : 0

  const [yr, mo] = month.split('-').map(Number)
  const daysInMonth = new Date(yr, mo, 0).getDate()
  const today = new Date()
  const isCurrentMonth = today.getFullYear() === yr && today.getMonth() + 1 === mo
  const daysElapsed = isCurrentMonth ? today.getDate() : daysInMonth
  const avgPerDay = daysElapsed > 0 && hasExpense ? Math.round(data.totalExpense / daysElapsed) : 0

  const adamExp  = data.transactions.filter(t => t.type === 'expense' && t.who === 'Adit').reduce((s, t) => s + t.amount, 0)
  const rifdaExp = data.transactions.filter(t => t.type === 'expense' && t.who === 'Lulu').reduce((s, t) => s + t.amount, 0)

  const sectionLabel = "text-[10px] font-semibold t3 uppercase tracking-widest px-1 pt-1"

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto">

      {/* Month selector */}
      <div className="flex items-center justify-between pt-2">
        <h2 className="font-serif font-semibold t1 text-lg">{formatMonthYear(month + '-01')}</h2>
        <input
          type="month" value={month} onChange={e => setMonth(e.target.value)}
          className="inp text-sm rounded-xl px-3 py-1.5 transition"
        />
      </div>

      {/* ── Hero Card ── */}
      <div className="relative overflow-hidden rounded-2xl p-5" style={{ background: 'var(--hero-gradient)' }}>
        <div className="absolute top-0 right-0 w-52 h-52 rounded-full blur-3xl translate-x-16 -translate-y-14 pointer-events-none" style={{ background: 'var(--hero-glow1)' }} />
        <div className="absolute bottom-0 left-0 w-36 h-36 rounded-full blur-2xl -translate-x-8 translate-y-8 pointer-events-none" style={{ background: 'var(--hero-glow2)' }} />
        <div className="relative">
          <p className="text-[10px] t2 uppercase tracking-widest font-medium mb-3">Keuangan Bulan Ini</p>
          <p className="text-3xl font-serif font-bold t1 mb-0.5 leading-tight">{formatRupiah(data.totalIncome)}</p>
          <p className="t3 text-xs mb-5">Total Pemasukan</p>
          <div className="flex gap-5 flex-wrap">
            <div>
              <p className="text-[10px] t3 uppercase tracking-wide mb-1">Pengeluaran</p>
              <p className="font-semibold text-sm text-neg">{formatRupiah(data.totalExpense)}</p>
              {data.totalIncome > 0 && <p className="text-[10px] t3 mt-0.5">{spendRatio}% dari pemasukan</p>}
            </div>
            <div className="w-px" style={{ background: 'var(--border-light)' }} />
            <div>
              <p className="text-[10px] t3 uppercase tracking-wide mb-1">Sisa</p>
              <p className="font-semibold text-sm" style={{ color: data.balance >= 0 ? 'var(--pos)' : 'var(--warn)' }}>
                {formatRupiah(Math.abs(data.balance))}
              </p>
              <p className="text-[10px] t3 mt-0.5">{data.balance >= 0 ? 'surplus' : 'defisit'}</p>
            </div>
            <div className="w-px" style={{ background: 'var(--border-light)' }} />
            <div>
              <p className="text-[10px] t3 uppercase tracking-wide mb-1">Rata/Hari</p>
              <p className="font-semibold text-sm text-warn">{formatRupiah(avgPerDay)}</p>
              <p className="text-[10px] t3 mt-0.5">{daysElapsed} hari</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick Stats ── */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users size={13} strokeWidth={1.5} className="t3" />
            <p className="text-[10px] t3 uppercase tracking-widest">Siapa Lebih Boros</p>
          </div>
          {(adamExp > 0 || rifdaExp > 0) ? (
            <div className="space-y-2.5">
              {[
                { name: 'Adit', val: adamExp, pct: data.totalExpense > 0 ? (adamExp / data.totalExpense) * 100 : 0, color: 'var(--bal)' },
                { name: 'Lulu', val: rifdaExp, pct: data.totalExpense > 0 ? (rifdaExp / data.totalExpense) * 100 : 0, color: 'var(--neg)' },
              ].map(p => (
                <div key={p.name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="t2">{p.name}</span>
                    <span className="t1 font-semibold">{Math.round(p.pct)}%</span>
                  </div>
                  <div className="rounded-full h-1.5 prog-track">
                    <div className="h-1.5 rounded-full transition-all duration-500" style={{ width: `${Math.min(p.pct, 100)}%`, backgroundColor: p.color }} />
                  </div>
                  <p className="text-[10px] t3 mt-0.5">{formatRupiah(p.val)}</p>
                </div>
              ))}
            </div>
          ) : <p className="text-xs t3 mt-2">Belum ada data</p>}
        </div>

        <div className="glass rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays size={13} strokeWidth={1.5} className="t3" />
            <p className="text-[10px] t3 uppercase tracking-widest">Laju Pengeluaran</p>
          </div>
          {hasExpense ? (
            <>
              <p className="text-xl font-serif font-bold t1 mb-0.5">{formatRupiah(avgPerDay)}</p>
              <p className="text-[10px] t3 mb-3">rata-rata per hari</p>
              <div>
                <div className="flex justify-between text-[10px] t3 mb-1">
                  <span>Progress bulan</span>
                  <span>{daysElapsed}/{daysInMonth} hari</span>
                </div>
                <div className="rounded-full h-1.5 prog-track">
                  <div className="h-1.5 rounded-full transition-all duration-500 text-warn" style={{ width: `${(daysElapsed / daysInMonth) * 100}%`, backgroundColor: 'var(--warn)' }} />
                </div>
              </div>
              {data.totalIncome > 0 && (
                <p className="text-[10px] t3 mt-2.5">
                  Proyeksi:{' '}
                  <span className="font-semibold" style={{ color: (avgPerDay * daysInMonth) > data.totalIncome ? 'var(--neg)' : 'var(--pos)' }}>
                    {formatRupiah(avgPerDay * daysInMonth)}
                  </span>
                </p>
              )}
            </>
          ) : <p className="text-xs t3 mt-2">Belum ada data</p>}
        </div>
      </div>

      {/* ── Category KPI Grid ── */}
      <p className={sectionLabel}>Pengeluaran per Kategori</p>
      {hasExpense ? (
        <div className="grid grid-cols-2 gap-3">
          {categoryData.map(cat => {
            const isUp = cat.pct !== null && cat.pct > 0
            const pctOfExp = data.totalExpense > 0 ? (cat.value / data.totalExpense) * 100 : 0
            return (
              <div key={cat.id} className="glass rounded-2xl p-4 transition duration-200">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xl">{cat.emoji}</span>
                  {cat.pct !== null && (
                    <span
                      className="flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-lg"
                      style={{
                        color: isUp ? 'var(--neg)' : 'var(--pos)',
                        background: isUp ? 'var(--neg-bg)' : 'var(--pos-bg)',
                      }}
                    >
                      {isUp ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                      {Math.abs(Math.round(cat.pct))}%
                    </span>
                  )}
                </div>
                <p className="text-[10px] t3 uppercase tracking-wide mb-1">{cat.label}</p>
                <p className="text-base font-bold t1 leading-tight">{formatRupiah(cat.value)}</p>
                {cat.prev > 0 && <p className="text-[10px] t3 mt-0.5">vs {formatRupiah(cat.prev)} bln lalu</p>}
                <div className="mt-2.5 flex items-center gap-2">
                  <div className="flex-1 rounded-full h-1.5 prog-track">
                    <div className="h-1.5 rounded-full transition-all duration-500" style={{ width: `${Math.min(pctOfExp, 100)}%`, backgroundColor: cat.color }} />
                  </div>
                  <span className="text-[10px] t3 flex-shrink-0">{Math.round(pctOfExp)}%</span>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="glass rounded-2xl p-8 text-center">
          <p className="text-3xl mb-3">📊</p>
          <p className="t2 text-sm font-medium">Belum ada data pengeluaran</p>
          <p className="t3 text-xs mt-1 mb-4">Catat transaksi untuk melihat analisis kategori</p>
          <a href="/tambah" className="inline-flex items-center gap-2 text-white px-4 py-2 rounded-xl text-sm font-medium transition" style={{ backgroundColor: 'var(--acc)' }}>
            <PlusCircle size={15} /> Tambah Transaksi
          </a>
        </div>
      )}

      {/* ── Grafik Perbandingan ── */}
      <div className="glass rounded-2xl p-4">
        <h3 className="font-semibold t1 text-sm mb-0.5">Grafik Pengeluaran per Kategori</h3>
        <p className="text-[10px] t3 mb-4">Bulan ini vs bulan lalu</p>
        {compareEntries.length > 0 ? (
          <CategoryCompareChart data={compareEntries} />
        ) : (
          <div className="py-8 text-center">
            <div className="flex justify-center gap-1 mb-3">
              {EXPENSE_CATEGORIES.slice(0, 5).map(c => (
                <div key={c.id} className="w-5 h-8 rounded-sm opacity-20" style={{ backgroundColor: c.color }} />
              ))}
            </div>
            <p className="t3 text-xs">Grafik muncul setelah ada transaksi</p>
          </div>
        )}
      </div>

      {/* ── Donut ── */}
      <div className="glass rounded-2xl p-4">
        <h3 className="font-semibold t1 text-sm mb-3">Komposisi Pengeluaran</h3>
        {categoryData.length > 0 ? (
          <CategoryChart data={categoryData} total={data.totalExpense} />
        ) : (
          <div className="py-8 text-center">
            <div className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center prog-track">
              <div className="w-10 h-10 rounded-full" style={{ background: 'var(--border-light)' }} />
            </div>
            <p className="t3 text-xs">Donut chart tampil setelah ada pengeluaran</p>
          </div>
        )}
      </div>

      {/* ── Tren 6 Bulan ── */}
      <div className="glass rounded-2xl p-4">
        <h3 className="font-semibold t1 text-sm mb-3">Tren 6 Bulan</h3>
        <TrendChart data={data.trend} />
      </div>

      {/* ── Transaksi Terbaru ── */}
      <div className="glass rounded-2xl p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold t1 text-sm">Transaksi Bulan Ini</h3>
          <a href="/transaksi" className="text-xs font-medium text-acc" style={{ color: 'var(--acc)' }}>Lihat semua →</a>
        </div>
        <RecentTransactions transactions={data.transactions} />
      </div>

    </div>
  )
}
