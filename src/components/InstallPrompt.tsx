'use client'

import { useEffect, useState } from 'react'
import { Download, X, Share } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isIOS, setIsIOS] = useState(false)
  const [dismissed, setDismissed] = useState(true)
  const [isStandalone, setIsStandalone] = useState(true)

  useEffect(() => {
    const alreadyDismissed = localStorage.getItem('pwa-dismissed')
    const standalone = window.matchMedia('(display-mode: standalone)').matches
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !(navigator as any).standalone

    setIsStandalone(standalone)
    setIsIOS(ios)

    if (alreadyDismissed || standalone) return
    if (ios) { setDismissed(false); return }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setDismissed(false)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  function dismiss() {
    localStorage.setItem('pwa-dismissed', '1')
    setDismissed(true)
  }

  async function installAndroid() {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted' || outcome === 'dismissed') {
      setDeferredPrompt(null)
      setDismissed(true)
    }
  }

  if (dismissed || isStandalone) return null
  if (!isIOS && !deferredPrompt) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto z-40 animate-in slide-in-from-bottom-4 duration-300">
      <div className="glass rounded-2xl p-4 shadow-lg" style={{ border: '1px solid var(--acc)', borderColor: 'var(--acc)' }}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'var(--acc-bg)' }}>
            <Download size={18} style={{ color: 'var(--acc)' }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold t1 mb-0.5">Install Aplikasi</p>
            {isIOS ? (
              <>
                <p className="text-xs t3 mb-3">Tap <Share size={11} className="inline -mt-0.5" /> lalu <strong>"Add to Home Screen"</strong> untuk install di iPhone/iPad</p>
              </>
            ) : (
              <>
                <p className="text-xs t3 mb-3">Tambahkan ke layar utama untuk akses lebih cepat</p>
                <button
                  onClick={installAndroid}
                  className="text-white px-4 py-1.5 rounded-xl text-xs font-semibold transition duration-200"
                  style={{ background: 'var(--acc)' }}
                >
                  Install Sekarang
                </button>
              </>
            )}
          </div>
          <button onClick={dismiss} className="p-1 t3 flex-shrink-0 -mt-0.5">
            <X size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}
