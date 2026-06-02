import { Transaction } from '@/types'
import { getCategoryInfo } from '@/lib/categories'
import { formatRupiah } from '@/lib/utils'

export function RecentTransactions({ transactions }: { transactions: Transaction[] }) {
  if (transactions.length === 0) {
    return <p className="t3 text-sm text-center py-6">Belum ada transaksi bulan ini</p>
  }

  return (
    <div className="space-y-3">
      {transactions.slice(0, 8).map(t => {
        const cat = getCategoryInfo(t.category)
        const d = new Date(t.date + 'T00:00:00')
        const dayLabel = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })

        return (
          <div key={t.id} className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
              style={{ background: 'var(--prog-track)', border: '1px solid var(--border-light)' }}
            >
              {cat.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium t1 truncate">{t.description}</p>
              <p className="text-xs t3">{t.who} · {dayLabel}</p>
            </div>
            <div
              className="text-sm font-semibold flex-shrink-0"
              style={{ color: t.type === 'income' ? 'var(--pos)' : 'var(--neg)' }}
            >
              {t.type === 'income' ? '+' : '-'}{formatRupiah(t.amount)}
            </div>
          </div>
        )
      })}
    </div>
  )
}
