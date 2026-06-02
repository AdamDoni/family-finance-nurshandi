'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, PlusCircle, List, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/tambah', icon: PlusCircle, label: 'Tambah' },
  { href: '/transaksi', icon: List, label: 'Transaksi' },
  { href: '/laporan', icon: FileText, label: 'Laporan' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 backdrop-blur-xl border-t px-2 pb-safe z-50"
      style={{ background: 'var(--nav-bg)', borderColor: 'var(--nav-border)' }}
    >
      <div className="max-w-md mx-auto flex justify-around">
        {navItems.map(item => {
          const Icon = item.icon
          const active = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 py-3 px-4 rounded-xl transition duration-200',
                active ? 'text-acc' : 't2'
              )}
              style={active ? { color: 'var(--acc)' } : {}}
            >
              <Icon size={21} strokeWidth={active ? 2 : 1.5} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
