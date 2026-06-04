'use client'

import { useEffect, useState } from 'react'
import { Transaction } from '@/types'
import { getCategoryInfo, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/lib/categories'
import { formatRupiah, getCurrentMonth } from '@/lib/utils'
import { Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type FilterType = 'all' | 'income' | 'expense'

const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES]

export default function TransaksiPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [month, setMonth] = useState(getCurrentMonth())
  const [typeFilter, setTypeFilter] = useState<FilterType>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const params = new URLSearchParams({ month })
    if (typeFilter !== 'all') params.append('type', typeFilter)
    const res = await fetch(`/api/transactions?${params}`)
    setTransactions(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [month, typeFilter])

  // Reset category filter when type changes
  useEffect(() => { setCategoryFilter('all') }, [typeFilter])

  async function handleDelete(id: string) {
    if (!confirm('Hapus transaksi ini?')) return
    await fetch(`/api/transactions/${id}`, { method: 'DELETE' })
    setTransactions(prev => prev.filter(t => t.id !== id))
  }

  // Category chips based on current type filter
  const visibleCategories = typeFilter === 'expense'
    ? EXPENSE_CATEGORIES
    : typeFilter === 'income'
      ? INCOME_CATEGORIES
      : ALL_CATEGORIES

  // Apply category filter client-side
  const filtered = categoryFilter === 'all'
    ? transactions
    : transactions.filter(t => t.category === categoryFilter)

  const grouped = filtered.reduce((acc, t) => {
    if (!acc[t.date]) acc[t.date] = []
    acc[t.date].push(t)
    return acc
  }, {} as Record<string, Transaction[]>)

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a))
  const totalIncome  = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="font-serif font-semibold t1 text-lg mb-4 pt-2">Transaksi</h2>

      {/* Month + Type Filter */}
      <div className="flex gap-2 mb-3">
        <input type="month" value={month} onChange={e => setMonth(e.target.value)}
          className="inp rounded-xl px-3 py-2 text-sm" />
        <div className="flex rounded-xl p-1 text-xs flex-1 glass">
          {(['all', 'income', 'expense'] as FilterType[]).map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={cn('flex-1 px-2 py-1.5 rounded-lg transition duration-200 font-medium', typeFilter === t ? 't1' : 't3')}
              style={typeFilter === t ? { background: 'var(--border)', color: 'var(--t1)' } : {}}
            >
              {t === 'all' ? 'Semua' : t === 'income' ? 'Masuk' : 'Keluar'}
            </button>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-hide">
        <button
          onClick={() => setCategoryFilter('all')}
          className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition duration-200"
          style={categoryFilter === 'all'
            ? { background: 'var(--acc)', color: 'white' }
            : { background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--t2)' }
          }
        >
          Semua Kategori
        </button>
        {visibleCategories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setCategoryFilter(categoryFilter === cat.id ? 'all' : cat.id)}
            className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition duration-200"
            style={categoryFilter === cat.id
              ? { background: 'var(--acc)', color: 'white' }
              : { background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--t2)' }
            }
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Summary bar */}
      {!loading && filtered.length > 0 && (
        <div className="glass rounded-2xl p-3 mb-4 flex justify-around text-center">
          {[
            { label: 'Pemasukan', val: totalIncome, color: 'var(--pos)' },
            { label: 'Pengeluaran', val: totalExpense, color: 'var(--neg)' },
            { label: 'Sisa', val: totalIncome - totalExpense, color: totalIncome - totalExpense >= 0 ? 'var(--bal)' : 'var(--warn)' },
          ].map((item, i, arr) => (
            <div key={item.label} className="flex items-center gap-3">
              <div>
                <p className="text-[10px] t3 uppercase tracking-wide mb-1">{item.label}</p>
                <p className="text-sm font-bold" style={{ color: item.color }}>{formatRupiah(item.val)}</p>
              </div>
              {i < arr.length - 1 && <div className="w-px h-8" style={{ background: 'var(--border-light)' }} />}
            </div>
          ))}
        </div>
      )}

      {loading && <p className="text-center t3 py-12 text-sm">Memuat...</p>}
      {!loading && filtered.length === 0 && <p className="text-center t3 py-12 text-sm">Belum ada transaksi</p>}

      {sortedDates.map(date => {
        const dayTxs = grouped[date]
        const dayNet = dayTxs.reduce((s, t) => t.type === 'income' ? s + t.amount : s - t.amount, 0)
        const d = new Date(date + 'T00:00:00')
        const dayLabel = d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })

        return (
          <div key={date} className="mb-4">
            <div className="flex justify-between items-center mb-2 px-1">
              <span className="text-[10px] font-semibold t3 uppercase tracking-wide">{dayLabel}</span>
              <span className="text-xs font-semibold" style={{ color: dayNet >= 0 ? 'var(--pos)' : 'var(--neg)' }}>
                {dayNet >= 0 ? '+' : ''}{formatRupiah(dayNet)}
              </span>
            </div>
            <div className="glass rounded-2xl overflow-hidden" style={{ borderTop: 'none' }}>
              {dayTxs.map((t, i) => {
                const cat = getCategoryInfo(t.category)
                return (
                  <div key={t.id} className="transition duration-150"
                    style={{ borderTop: i > 0 ? '1px solid var(--border-light)' : 'none' }}>
                    <div className="flex items-center gap-3 px-4 py-3.5">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                        style={{ background: 'var(--prog-track)', border: '1px solid var(--border-light)' }}>
                        {cat.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium t1 truncate">{t.description}</p>
                        <p className="text-xs t3">{cat.label} · {t.who}</p>
                      </div>
                      <div className="text-sm font-bold flex-shrink-0" style={{ color: t.type === 'income' ? 'var(--pos)' : 'var(--neg)' }}>
                        {t.type === 'income' ? '+' : '-'}{formatRupiah(t.amount)}
                      </div>
                      <button onClick={() => handleDelete(t.id)} className="p-1.5 t3 transition duration-200 ml-1 flex-shrink-0">
                        <Trash2 size={13} strokeWidth={1.5} />
                      </button>
                    </div>
                    {t.notes && (
                      <div className="px-4 pb-3 flex items-start gap-2">
                        <div className="w-9 flex-shrink-0" />
                        <p className="text-xs t3 italic">{t.notes}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
