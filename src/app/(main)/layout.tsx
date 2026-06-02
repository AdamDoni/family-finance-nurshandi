'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'
import { Spinner } from '@/components/Spinner'
import { InstallPrompt } from '@/components/InstallPrompt'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return }
    if (status === 'authenticated' && (session?.user as { mustChangePassword?: boolean })?.mustChangePassword) {
      router.push('/ganti-password')
    }
  }, [status, session, router])

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-app gap-3">
        <Spinner size={28} />
        <p className="t3 text-xs">Memuat sesi...</p>
      </div>
    )
  }

  if (status === 'unauthenticated') return null

  return (
    <div className="min-h-screen bg-app">
      <Header />
      <main className="pb-24">{children}</main>
      <InstallPrompt />
      <BottomNav />
    </div>
  )
}
