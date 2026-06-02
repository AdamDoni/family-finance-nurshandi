'use client'

import { signOut, useSession } from 'next-auth/react'
import { LogOut } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'

export default function Header() {
  const { data: session } = useSession()

  return (
    <header
      className="backdrop-blur-xl border-b px-4 py-3.5 sticky top-0 z-40"
      style={{ background: 'var(--nav-bg)', borderColor: 'var(--nav-border)' }}
    >
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div>
          <h1 className="font-serif font-bold t1 text-base leading-none tracking-wide">
            Keuangan Keluarga
          </h1>
          <p className="t3 text-xs mt-1">Halo, {session?.user?.name}</p>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="p-2 t2 rounded-xl transition duration-200"
            title="Keluar"
          >
            <LogOut size={17} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </header>
  )
}
