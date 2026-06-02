'use client'

import { useState } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { Eye, EyeOff, Lock, CheckCircle } from 'lucide-react'
import { Spinner } from '@/components/Spinner'

export default function GantiPasswordPage() {
  const { data: session } = useSession()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNext, setShowNext] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const isFirstTime = (session?.user as { mustChangePassword?: boolean })?.mustChangePassword

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (next.length < 6) { setError('Password baru minimal 6 karakter'); return }
    if (next !== confirm) { setError('Konfirmasi password tidak cocok'); return }
    setLoading(true)
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: current, newPassword: next }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error || 'Terjadi kesalahan'); return }
    setDone(true)
  }

  if (done) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center p-4">
        <div className="glass rounded-2xl p-8 max-w-sm w-full text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'var(--pos-bg)', border: '1px solid var(--border)' }}>
            <CheckCircle size={32} style={{ color: 'var(--pos)' }} />
          </div>
          <h2 className="font-serif font-bold t1 text-xl mb-2">Password Berhasil Diganti!</h2>
          <p className="t2 text-sm mb-6">Silakan login kembali dengan password baru Anda.</p>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full py-3 rounded-xl font-bold text-white text-sm"
            style={{ backgroundColor: 'var(--acc)' }}
          >
            Login Sekarang
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-app flex items-center justify-center p-4">
      <div className="glass rounded-2xl p-6 max-w-sm w-full">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: 'var(--acc)', opacity: 0.9 }}>
          <Lock size={26} color="white" />
        </div>

        <h2 className="font-serif font-bold t1 text-xl mb-1">
          {isFirstTime ? 'Buat Password Baru' : 'Ganti Password'}
        </h2>
        <p className="t2 text-sm mb-6">
          {isFirstTime
            ? 'Password default adalah 123456. Silakan buat password baru untuk keamanan akun Anda.'
            : `Halo, ${session?.user?.name}. Masukkan password lama dan password baru Anda.`}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current password */}
          <div>
            <label className="block text-[10px] font-semibold t3 mb-2 uppercase tracking-widest">
              {isFirstTime ? 'Password Saat Ini (default: 123456)' : 'Password Lama'}
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={current}
                onChange={e => setCurrent(e.target.value)}
                className="inp w-full rounded-xl px-4 py-3 pr-12 text-sm"
                placeholder={isFirstTime ? '123456' : 'Password lama'}
                required
              />
              <button type="button" onClick={() => setShowCurrent(v => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 t3">
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* New password */}
          <div>
            <label className="block text-[10px] font-semibold t3 mb-2 uppercase tracking-widest">Password Baru</label>
            <div className="relative">
              <input
                type={showNext ? 'text' : 'password'}
                value={next}
                onChange={e => setNext(e.target.value)}
                className="inp w-full rounded-xl px-4 py-3 pr-12 text-sm"
                placeholder="Minimal 6 karakter"
                required
              />
              <button type="button" onClick={() => setShowNext(v => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 t3">
                {showNext ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm */}
          <div>
            <label className="block text-[10px] font-semibold t3 mb-2 uppercase tracking-widest">Konfirmasi Password Baru</label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              className="inp w-full rounded-xl px-4 py-3 text-sm"
              placeholder="Ulangi password baru"
              required
            />
          </div>

          {error && <p className="text-xs rounded-xl px-3 py-2" style={{ background: 'var(--neg-bg)', color: 'var(--neg)' }}>{error}</p>}

          <button
            type="submit"
            disabled={loading || !current || !next || !confirm}
            className="w-full py-3.5 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition duration-200"
            style={{
              backgroundColor: 'var(--acc)',
              opacity: (loading || !current || !next || !confirm) ? 0.4 : 1,
            }}
          >
            {loading && <Spinner size={15} />}
            {loading ? 'Menyimpan...' : 'Simpan Password Baru'}
          </button>
        </form>
      </div>
    </div>
  )
}
