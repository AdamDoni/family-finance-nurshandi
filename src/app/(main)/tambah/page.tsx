'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/lib/categories'
import { formatEntryWhatsApp } from '@/lib/whatsapp-format'
import { cn, formatInputRupiah } from '@/lib/utils'
import { Transaction } from '@/types'
import { Copy, Check, RotateCcw, ExternalLink } from 'lucide-react'
import { Spinner } from '@/components/Spinner'

export default function TambahPage() {
  const { data: session } = useSession()
  const [type, setType] = useState<'expense' | 'income'>('expense')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [who, setWho] = useState<'Adam' | 'Rifda'>((session?.user?.name as 'Adam' | 'Rifda') || 'Adam')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [savedTransaction, setSavedTransaction] = useState<Transaction | null>(null)
  const [copied, setCopied] = useState(false)

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES

  function resetForm() {
    setDescription(''); setAmount(''); setNotes(''); setCategory(''); setSavedTransaction(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!category || !description || !amount) return
    setLoading(true)
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, category, description, amount: parseFloat(amount.replace(/\./g, '')), date, who, notes }),
    })
    const saved = await res.json()
    setLoading(false)
    setSavedTransaction(saved)
  }

  function copyWhatsApp() {
    if (!savedTransaction) return
    navigator.clipboard.writeText(formatEntryWhatsApp(savedTransaction))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (savedTransaction) {
    const waText = formatEntryWhatsApp(savedTransaction)
    return (
      <div className="p-4 max-w-md mx-auto">
        <div className="glass rounded-2xl p-6 text-center mb-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: 'var(--pos-bg)', border: '1px solid var(--border)' }}>
            <span className="text-2xl">✓</span>
          </div>
          <h3 className="font-serif font-bold t1 text-lg">Tersimpan!</h3>
          <p className="t2 text-sm mt-1">{savedTransaction.description}</p>
        </div>

        <div className="glass rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold t1 text-sm">Kirim WhatsApp</h4>
            <div className="flex items-center gap-2">
              <button
                onClick={copyWhatsApp}
                className="flex items-center gap-1.5 text-white px-3 py-1.5 rounded-xl text-xs font-medium transition duration-200"
                style={{ backgroundColor: 'var(--acc)' }}
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? 'Tersalin!' : 'Salin'}
              </button>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(waText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition duration-200"
                style={{ backgroundColor: '#25D366', color: 'white' }}
              >
                <ExternalLink size={13} />
                Kirim WA
              </a>
            </div>
          </div>
          <pre className="pre-block rounded-xl p-3 text-xs whitespace-pre-wrap font-mono leading-relaxed">{waText}</pre>
        </div>

        <button onClick={resetForm} className="w-full flex items-center justify-center gap-2 glass t2 py-3 rounded-2xl font-medium transition duration-200">
          <RotateCcw size={15} strokeWidth={1.5} /> Tambah Transaksi Lagi
        </button>
      </div>
    )
  }

  const typeActiveStyle = (t: 'expense' | 'income') => ({
    background: type === t ? (t === 'expense' ? 'var(--neg-bg)' : 'var(--pos-bg)') : 'transparent',
    color: type === t ? (t === 'expense' ? 'var(--neg)' : 'var(--pos)') : 'var(--t3)',
    border: type === t ? `1px solid ${t === 'expense' ? 'var(--neg)' : 'var(--pos)'}` : '1px solid transparent',
  })

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="font-serif font-semibold t1 text-lg mb-5 pt-2">Tambah Transaksi</h2>

      {/* Type Toggle */}
      <div className="flex rounded-2xl p-1 mb-6 glass">
        {(['expense', 'income'] as const).map(t => (
          <button key={t} onClick={() => { setType(t); setCategory('') }}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition duration-200"
            style={typeActiveStyle(t)}
          >
            {t === 'expense' ? 'Pengeluaran' : 'Pemasukan'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Nominal */}
        <div>
          <label className="block text-[10px] font-semibold t3 mb-2 uppercase tracking-widest">Nominal</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 t2 font-semibold text-base">Rp</span>
            <input
              type="text" inputMode="numeric" value={amount}
              onChange={e => setAmount(formatInputRupiah(e.target.value))}
              className="inp w-full rounded-xl pl-12 pr-4 py-4 text-2xl font-bold"
              placeholder="0" required
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-[10px] font-semibold t3 mb-2 uppercase tracking-widest">Kategori</label>
          <div className="grid grid-cols-2 gap-2">
            {categories.map(cat => {
              const selected = category === cat.id
              const activeColor = type === 'expense' ? 'var(--neg)' : 'var(--pos)'
              const activeBg = type === 'expense' ? 'var(--neg-bg)' : 'var(--pos-bg)'
              return (
                <button key={cat.id} type="button" onClick={() => setCategory(cat.id)}
                  className="flex items-center gap-2.5 p-3 rounded-xl text-left transition duration-200"
                  style={selected
                    ? { borderWidth: 1, borderStyle: 'solid', borderColor: activeColor, background: activeBg }
                    : { borderWidth: 1, borderStyle: 'solid', borderColor: 'var(--border)', background: 'var(--bg-input)' }
                  }
                >
                  <span className="text-xl">{cat.emoji}</span>
                  <span className={cn('text-xs font-medium leading-tight', selected ? '' : 't2')}
                    style={selected ? { color: activeColor } : {}}
                  >{cat.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-[10px] font-semibold t3 mb-2 uppercase tracking-widest">Keterangan</label>
          <input type="text" value={description} onChange={e => setDescription(e.target.value)}
            className="inp w-full rounded-xl px-4 py-3 text-sm" placeholder="contoh: Beli susu untuk Heizen" required />
        </div>

        {/* Date & Who */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-semibold t3 mb-2 uppercase tracking-widest">Tanggal</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="inp w-full rounded-xl px-3 py-3 text-sm" />
          </div>
          <div>
            <label className="block text-[10px] font-semibold t3 mb-2 uppercase tracking-widest">Dicatat oleh</label>
            <select value={who} onChange={e => setWho(e.target.value as 'Adam' | 'Rifda')}
              className="inp-select w-full rounded-xl px-3 py-3 text-sm">
              <option value="Adam">Adam</option>
              <option value="Rifda">Rifda</option>
            </select>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-[10px] font-semibold t3 mb-2 uppercase tracking-widest">
            Catatan <span className="t3 font-normal normal-case tracking-normal">(opsional)</span>
          </label>
          <input type="text" value={notes} onChange={e => setNotes(e.target.value)}
            className="inp w-full rounded-xl px-4 py-3 text-sm" placeholder="Catatan tambahan..." />
        </div>

        <button
          type="submit"
          disabled={loading || !category || !description || !amount}
          className="w-full py-4 rounded-xl font-bold text-white text-sm tracking-wide transition duration-200 flex items-center justify-center gap-2"
          style={{
            backgroundColor: 'var(--acc)',
            opacity: (loading || !category || !description || !amount) ? 0.35 : 1,
            cursor: (loading || !category || !description || !amount) ? 'not-allowed' : 'pointer',
          }}
        >
          {loading && <Spinner size={15} />}
          {loading ? 'Menyimpan...' : `Simpan ${type === 'expense' ? 'Pengeluaran' : 'Pemasukan'}`}
        </button>
      </form>
    </div>
  )
}
