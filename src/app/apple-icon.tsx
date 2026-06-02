import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  const s = 180
  const r = (v: number) => Math.round(v * s / 512)

  return new ImageResponse(
    <div style={{
      width: s, height: s,
      background: 'linear-gradient(145deg, #C084FC 0%, #F472B6 55%, #FB7185 100%)',
      borderRadius: r(96),
      display: 'flex', position: 'relative',
    }}>
      <div style={{ position: 'absolute', top: r(148), left: r(82), width: r(78), height: r(78), borderRadius: '50%', background: 'linear-gradient(145deg, #FFB3D9 0%, #FF85C0 100%)', border: `${Math.max(1,r(2))}px solid rgba(255,255,255,0.55)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: r(42), height: r(42), borderRadius: '50%', background: 'rgba(230,80,150,0.40)', display: 'flex' }} />
      </div>
      <div style={{ position: 'absolute', top: r(148), left: r(352), width: r(78), height: r(78), borderRadius: '50%', background: 'linear-gradient(145deg, #FFB3D9 0%, #FF85C0 100%)', border: `${Math.max(1,r(2))}px solid rgba(255,255,255,0.55)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: r(42), height: r(42), borderRadius: '50%', background: 'rgba(230,80,150,0.40)', display: 'flex' }} />
      </div>
      <div style={{ position: 'absolute', top: r(162), left: r(56), width: r(400), height: r(272), borderRadius: `${r(160)}px ${r(160)}px ${r(140)}px ${r(140)}px`, background: 'linear-gradient(150deg,rgba(255,228,242,0.97) 0%,rgba(255,192,225,0.93) 45%,rgba(255,160,210,0.90) 100%)', border: `${Math.max(1,r(2))}px solid rgba(255,255,255,0.72)`, boxShadow: `0 ${r(14)}px ${r(48)}px rgba(180,50,130,0.38)`, overflow: 'hidden', display: 'flex' }}>
        <div style={{ position: 'absolute', top: r(12), left: r(28), width: r(160), height: r(95), borderRadius: '50%', background: 'rgba(255,255,255,0.32)', display: 'flex' }} />
      </div>
      <div style={{ position: 'absolute', top: r(155), left: r(211), width: r(90), height: r(13), borderRadius: r(7), background: 'rgba(110,25,75,0.72)', display: 'flex' }} />
      <div style={{ position: 'absolute', top: r(115), left: r(232), width: r(48), height: r(48), borderRadius: '50%', background: 'linear-gradient(145deg,#FDE68A 0%,#F59E0B 60%,#B45309 100%)', border: `${Math.max(1,r(2))}px solid rgba(255,255,255,0.55)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: r(26), height: r(26), borderRadius: '50%', border: `${Math.max(1,r(2))}px solid rgba(255,255,255,0.40)`, display: 'flex' }} />
      </div>
      <div style={{ position: 'absolute', top: r(232), left: r(158), width: r(34), height: r(34), borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: r(18), height: r(18), borderRadius: '50%', background: '#2D1040', display: 'flex' }} />
      </div>
      <div style={{ position: 'absolute', top: r(232), left: r(320), width: r(34), height: r(34), borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: r(18), height: r(18), borderRadius: '50%', background: '#2D1040', display: 'flex' }} />
      </div>
      <div style={{ position: 'absolute', top: r(284), left: r(181), width: r(150), height: r(105), borderRadius: '50%', background: 'linear-gradient(155deg,rgba(255,168,210,0.92) 0%,rgba(240,120,178,0.88) 100%)', border: `${Math.max(1,r(2))}px solid rgba(255,255,255,0.42)`, display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
        <div style={{ width: r(30), height: r(22), borderRadius: '50%', background: 'rgba(195,65,130,0.52)', marginLeft: r(18), display: 'flex' }} />
        <div style={{ width: r(30), height: r(22), borderRadius: '50%', background: 'rgba(195,65,130,0.52)', marginRight: r(18), display: 'flex' }} />
      </div>
      <div style={{ position: 'absolute', top: r(396), left: r(98), width: r(50), height: r(62), borderRadius: `0 0 ${r(18)}px ${r(18)}px`, background: 'linear-gradient(180deg,rgba(255,195,225,0.95) 0%,rgba(255,160,205,0.92) 100%)', display: 'flex' }} />
      <div style={{ position: 'absolute', top: r(396), left: r(162), width: r(50), height: r(62), borderRadius: `0 0 ${r(18)}px ${r(18)}px`, background: 'linear-gradient(180deg,rgba(255,195,225,0.95) 0%,rgba(255,160,205,0.92) 100%)', display: 'flex' }} />
      <div style={{ position: 'absolute', top: r(396), left: r(300), width: r(50), height: r(62), borderRadius: `0 0 ${r(18)}px ${r(18)}px`, background: 'linear-gradient(180deg,rgba(255,195,225,0.95) 0%,rgba(255,160,205,0.92) 100%)', display: 'flex' }} />
      <div style={{ position: 'absolute', top: r(396), left: r(364), width: r(50), height: r(62), borderRadius: `0 0 ${r(18)}px ${r(18)}px`, background: 'linear-gradient(180deg,rgba(255,195,225,0.95) 0%,rgba(255,160,205,0.92) 100%)', display: 'flex' }} />
      <div style={{ position: 'absolute', top: r(295), left: r(436), width: r(28), height: r(28), borderRadius: '50%', border: `${Math.max(2,r(7))}px solid rgba(255,170,215,0.92)`, display: 'flex' }} />
    </div>,
    { width: s, height: s }
  )
}
