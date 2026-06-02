'use client'

import { useEffect, useState } from 'react'
import { Copy, Check, ExternalLink } from 'lucide-react'
import { formatRupiah, getCurrentMonth, formatMonthYear } from '@/lib/utils'
import { getCategoryInfo } from '@/lib/categories'
import { formatMonthlyWhatsApp, formatDailyWhatsApp } from '@/lib/whatsapp-format'
import { SummaryData } from '@/types'
import { cn } from '@/lib/utils'

type ReportTab = 'bulanan' | 'harian'

export default function LaporanPage() {
  const [month, setMonth] = useState(getCurrentMonth())
  const [data, setData] = useState<SummaryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<ReportTab>('bulanan')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10))
  const [copiedKey, setCopiedKey] = useState('')

  useEffect(() => {
    setLoading(true)
    fetch(`/api/summary?month=${month}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
  }, [month])

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(''), 2000)
  }

  const CopyButton = ({ text, id }: { text: string; id: string }) => (
    <button
      onClick={() => copy(text, id)}
      className="flex items-center gap-1.5 text-white px-3 py-1.5 rounded-xl text-xs font-medium transition duration-200"
      style={{ backgroundColor: 'var(--acc)' }}
    >
      {copiedKey === id ? <Check size={13} /> : <Copy size={13} />}
      {copiedKey === id ? 'Tersalin!' : 'Salin'}
    </button>
  )

  const SendWAButton = ({ text }: { text: string }) => (
    <a
      href={`https://wa.me/?text=${encodeURIComponent(text)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition duration-200"
      style={{ backgroundColor: '#25D366', color: 'white' }}
    >
      <ExternalLink size={13} />
      Kirim WA
    </a>
  )

  if (loading) return <div className="p-4 text-center t3 pt-24 text-sm">Memuat...</div>
  if (!data) return null

  const categoryData = Object.entries(data.byCategory)
    .map(([id, value]) => ({ ...getCategoryInfo(id), value }))
    .sort((a, b) => b.value - a.value)

  const monthlyWaText = formatMonthlyWhatsApp(data.transactions, month)
  const dailyWaText   = formatDailyWhatsApp(data.transactions, selectedDate)
  const datesWithTx   = Array.from(new Set(data.transactions.map(t => t.date))).sort((a, b) => b.localeCompare(a))

  const activeTabStyle = {
    background: 'var(--border)',
    color: 'var(--t1)',
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-5 pt-2">
        <h2 className="font-serif font-semibold t1 text-lg">Laporan</h2>
        <input type="month" value={month} onChange={e => setMonth(e.target.value)}
          className="inp rounded-xl px-3 py-1.5 text-sm" />
      </div>

      {/* Tab */}
      <div className="flex rounded-2xl p-1 mb-5 glass">
        {(['bulanan', 'harian'] as ReportTab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="flex-1 py-2 rounded-xl text-sm font-semibold transition duration-200 t2"
            style={tab === t ? activeTabStyle : {}}
          >
            {t === 'bulanan' ? 'Rekap Bulanan' : 'Per Hari'}
          </button>
        ))}
      </div>

      {tab === 'bulanan' && (
        <>
          {/* Hero summary */}
          <div className="relative overflow-hidden rounded-2xl p-5 mb-4" style={{ background: 'var(--hero-gradient)' }}>
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl translate-x-12 -translate-y-10 pointer-events-none" style={{ background: 'var(--hero-glow1)' }} />
            <div className="relative">
              <p className="text-[10px] t3 uppercase tracking-widest mb-3">{formatMonthYear(month + '-01')}</p>
              <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="t2 text-sm">Total Pemasukan</span>
                  <span className="font-bold text-sm text-pos" style={{ color: 'var(--pos)' }}>{formatRupiah(data.totalIncome)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="t2 text-sm">Total Pengeluaran</span>
                  <span className="font-bold text-sm text-neg" style={{ color: 'var(--neg)' }}>{formatRupiah(data.totalExpense)}</span>
                </div>
                <div className="pt-2.5 flex justify-between items-center" style={{ borderTop: '1px solid var(--border-light)' }}>
                  <span className="font-semibold t1 text-sm">Sisa Bersih</span>
                  <span className="font-bold text-lg font-serif" style={{ color: data.balance >= 0 ? 'var(--pos)' : 'var(--neg)' }}>
                    {formatRupiah(data.balance)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Breakdown Kategori */}
          {categoryData.length > 0 && (
            <div className="glass rounded-2xl p-4 mb-4">
              <h3 className="font-semibold t1 text-sm mb-4">Breakdown Pengeluaran</h3>
              <div className="space-y-4">
                {categoryData.map(cat => (
                  <div key={cat.id}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="t2 text-sm">{cat.emoji} {cat.label}</span>
                      <span className="text-sm font-semibold t1">
                        {formatRupiah(cat.value)}
                        <span className="t3 font-normal ml-1.5 text-xs">{Math.round((cat.value / data.totalExpense) * 100)}%</span>
                      </span>
                    </div>
                    <div className="rounded-full h-1.5 overflow-hidden prog-track">
                      <div className="h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${(cat.value / data.totalExpense) * 100}%`, backgroundColor: cat.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* WhatsApp monthly */}
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold t1 text-sm">Kirim WhatsApp</h4>
              <div className="flex items-center gap-2">
                <CopyButton text={monthlyWaText} id="monthly" />
                <SendWAButton text={monthlyWaText} />
              </div>
            </div>
            <pre className="pre-block rounded-xl p-3 text-xs whitespace-pre-wrap font-mono leading-relaxed overflow-x-auto max-h-64 overflow-y-auto">
              {monthlyWaText || 'Belum ada data untuk bulan ini'}
            </pre>
          </div>
        </>
      )}

      {tab === 'harian' && (
        <>
          <div className="mb-4">
            <label className="block text-[10px] font-semibold t3 mb-2 uppercase tracking-widest">Pilih Tanggal</label>
            {datesWithTx.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {datesWithTx.map(d => {
                  const date = new Date(d + 'T00:00:00')
                  const label = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
                  const active = selectedDate === d
                  return (
                    <button key={d} onClick={() => setSelectedDate(d)}
                      className={cn('px-3 py-1.5 rounded-xl text-sm font-medium transition duration-200')}
                      style={active
                        ? { borderWidth: 1, borderStyle: 'solid', borderColor: 'var(--acc)', background: 'var(--acc-bg)', color: 'var(--acc)' }
                        : { borderWidth: 1, borderStyle: 'solid', borderColor: 'var(--border)', background: 'var(--bg-input)', color: 'var(--t2)' }
                      }
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            ) : <p className="t3 text-sm">Tidak ada transaksi bulan ini</p>}
          </div>

          {dailyWaText && (
            <div className="glass rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold t1 text-sm">Kirim WhatsApp</h4>
                <div className="flex items-center gap-2">
                  <CopyButton text={dailyWaText} id="daily" />
                  <SendWAButton text={dailyWaText} />
                </div>
              </div>
              <pre className="pre-block rounded-xl p-3 text-xs whitespace-pre-wrap font-mono leading-relaxed overflow-x-auto">
                {dailyWaText}
              </pre>
            </div>
          )}

          {!dailyWaText && datesWithTx.length > 0 && (
            <p className="text-center t3 text-sm py-8">Tidak ada transaksi pada tanggal ini</p>
          )}
        </>
      )}
    </div>
  )
}
