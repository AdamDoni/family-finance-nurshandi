import { Transaction } from '@/types'
import { getCategoryInfo } from './categories'
import { formatRupiah, formatDate, formatMonthYear } from './utils'

export function formatEntryWhatsApp(transaction: Transaction): string {
  const cat = getCategoryInfo(transaction.category)
  const typeLabel = transaction.type === 'income' ? '💚 Pemasukan' : '❤️ Pengeluaran'
  const lines = [
    `${typeLabel} — ${formatDate(transaction.date)}`,
    '',
    `${cat.emoji} *${cat.label}*`,
    `• ${transaction.description} — *${formatRupiah(transaction.amount)}*`,
    `_Dicatat oleh: ${transaction.who}_`,
  ]
  return lines.join('\n')
}

export function formatDailyWhatsApp(transactions: Transaction[], date: string): string {
  const dayTxs = transactions.filter(t => t.date === date)
  if (dayTxs.length === 0) return ''

  const expenses = dayTxs.filter(t => t.type === 'expense')
  const incomes = dayTxs.filter(t => t.type === 'income')
  const lines: string[] = []

  lines.push(`📊 *Catatan Keuangan — ${formatDate(date)}*`)
  lines.push('')

  if (incomes.length > 0) {
    lines.push('💚 *Pemasukan:*')
    for (const t of incomes) {
      const cat = getCategoryInfo(t.category)
      lines.push(`${cat.emoji} ${cat.label}`)
      lines.push(`• ${t.description} — ${formatRupiah(t.amount)}`)
    }
    lines.push(`*Subtotal: ${formatRupiah(incomes.reduce((s, t) => s + t.amount, 0))}*`)
    lines.push('')
  }

  if (expenses.length > 0) {
    lines.push('❤️ *Pengeluaran:*')
    const grouped = expenses.reduce((acc, t) => {
      if (!acc[t.category]) acc[t.category] = []
      acc[t.category].push(t)
      return acc
    }, {} as Record<string, Transaction[]>)

    for (const [catId, txs] of Object.entries(grouped)) {
      const cat = getCategoryInfo(catId)
      lines.push(`${cat.emoji} *${cat.label}*`)
      for (const t of txs) {
        lines.push(`• ${t.description} — ${formatRupiah(t.amount)}`)
      }
    }
    lines.push(`*Subtotal: ${formatRupiah(expenses.reduce((s, t) => s + t.amount, 0))}*`)
  }

  const totalIncome = incomes.reduce((s, t) => s + t.amount, 0)
  const totalExpense = expenses.reduce((s, t) => s + t.amount, 0)
  lines.push('')
  lines.push('━━━━━━━━━━━━━━━━')
  if (totalIncome > 0) lines.push(`💚 Pemasukan   : ${formatRupiah(totalIncome)}`)
  if (totalExpense > 0) lines.push(`❤️ Pengeluaran : ${formatRupiah(totalExpense)}`)
  if (totalIncome > 0 && totalExpense > 0) {
    lines.push(`💰 Sisa        : ${formatRupiah(totalIncome - totalExpense)}`)
  }

  return lines.join('\n')
}

export function formatMonthlyWhatsApp(transactions: Transaction[], month: string): string {
  const monthTxs = transactions.filter(t => t.date.startsWith(month))
  const expenses = monthTxs.filter(t => t.type === 'expense')
  const incomes = monthTxs.filter(t => t.type === 'income')

  const totalIncome = incomes.reduce((s, t) => s + t.amount, 0)
  const totalExpense = expenses.reduce((s, t) => s + t.amount, 0)
  const balance = totalIncome - totalExpense

  const lines: string[] = []
  lines.push(`📋 *Rekap Keuangan ${formatMonthYear(month + '-01')}*`)
  lines.push('')
  lines.push(`💚 Pemasukan   : ${formatRupiah(totalIncome)}`)
  lines.push(`❤️ Pengeluaran : ${formatRupiah(totalExpense)}`)
  lines.push(`💰 Sisa        : ${formatRupiah(balance)}`)
  lines.push('')

  if (expenses.length > 0) {
    lines.push('📂 *Breakdown Pengeluaran:*')
    const grouped = expenses.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount
      return acc
    }, {} as Record<string, number>)

    const sorted = Object.entries(grouped).sort((a, b) => b[1] - a[1])
    for (const [catId, amount] of sorted) {
      const cat = getCategoryInfo(catId)
      const pct = Math.round((amount / totalExpense) * 100)
      const label = `${cat.emoji} ${cat.label}`
      lines.push(`${label.padEnd(22)} ${formatRupiah(amount)} (${pct}%)`)
    }
  }

  const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  lines.push('')
  lines.push(`📅 Data per ${today}`)

  return lines.join('\n')
}
