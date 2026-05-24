import { useEffect, useState } from 'react'

interface Props { onDone: () => void }

const PAINT_DROPS = [
  { color: '#FF1744', left: '8%',  delay: 0 },
  { color: '#FF9100', left: '22%', delay: 0.15 },
  { color: '#FFCA28', left: '36%', delay: 0.3 },
  { color: '#00E676', left: '50%', delay: 0.1 },
  { color: '#00BCD4', left: '65%', delay: 0.25 },
  { color: '#2979FF', left: '78%', delay: 0.05 },
  { color: '#D500F9', left: '91%', delay: 0.2 },
]

const EMOJIS = ['🎨','🖌️','✏️','⭐','🌈','🎉','🦋','🌸','🚀','🎈']

export default function SplashScreen({ onDone }: Props) {
  const [visible, setVisible] = useState(true)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Trigger entrance animation
    const t = setTimeout(() => setReady(true), 50)
    return () => clearTimeout(t)
  }, [])

  function handleStart() {
    setVisible(false)
    setTimeout(onDone, 400)
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', overflow: 'hidden',
        background: 'linear-gradient(135deg, #FF6B9D 0%, #FFD93D 25%, #6BCB77 50%, #4D96FF 75%, #C77DFF 100%)',
        transition: 'opacity 0.4s, transform 0.4s',
        opacity: visible ? 1 : 0,
        transform: visible ? 'scale(1)' : 'scale(1.05)',
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      {/* paint drops from top */}
      {PAINT_DROPS.map((d, i) => (
        <div
          key={i}
          style={{
            position: 'absolute', top: 0, left: d.left,
            width: 28, height: 0,
            background: d.color,
            borderRadius: '0 0 50% 50%',
            animation: `paintDrip 1.2s ease-in ${d.delay}s both`,
          }}
        />
      ))}

      {/* floating emojis background */}
      {EMOJIS.map((e, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            fontSize: 36 + (i % 3) * 16,
            left: `${(i * 9.7 + 5) % 90}%`,
            top: `${(i * 13.3 + 10) % 75}%`,
            opacity: 0.3,
            animation: `floatY ${2.5 + (i % 3) * 0.8}s ease-in-out ${i * 0.3}s infinite`,
            userSelect: 'none',
          }}
        >
          {e}
        </div>
      ))}

      {/* main card */}
      <div
        style={{
          background: 'rgba(255,255,255,0.92)',
          borderRadius: 40,
          padding: '48px 56px 40px',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
          transform: ready ? 'scale(1)' : 'scale(0.5)',
          opacity: ready ? 1 : 0,
          transition: 'transform 0.6s cubic-bezier(.36,.07,.19,.97), opacity 0.4s',
          position: 'relative', zIndex: 1,
          maxWidth: 420,
        }}
      >
        <div style={{ fontSize: 72, marginBottom: 8, animation: 'floatY 3s ease-in-out infinite' }}>🎨</div>

        <h1
          style={{
            fontFamily: '"Fredoka One", cursive',
            fontSize: 56,
            margin: '0 0 8px',
            background: 'linear-gradient(90deg,#FF1744,#FF9100,#FFCA28,#00E676,#00BCD4,#2979FF,#D500F9)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'shimmer 2.5s linear infinite',
          }}
        >
          KiddDraw
        </h1>

        <p style={{ fontFamily: 'Nunito', fontSize: 20, color: '#666', margin: '0 0 32px', fontWeight: 700 }}>
          Let's make something amazing! ✨
        </p>

        <button
          onClick={handleStart}
          style={{
            background: 'linear-gradient(135deg, #FF6B9D, #FF1744)',
            border: 'none',
            borderRadius: 24,
            padding: '18px 48px',
            fontSize: 24,
            fontFamily: '"Fredoka One", cursive',
            color: 'white',
            cursor: 'pointer',
            boxShadow: '0 6px 0 #CC1144, 0 8px 20px rgba(255,23,68,0.4)',
            transition: 'transform 0.1s, box-shadow 0.1s',
            letterSpacing: 1,
          }}
          onMouseDown={(e) => {
            ;(e.target as HTMLButtonElement).style.transform = 'translateY(4px)'
            ;(e.target as HTMLButtonElement).style.boxShadow = '0 2px 0 #CC1144'
          }}
          onMouseUp={(e) => {
            ;(e.target as HTMLButtonElement).style.transform = ''
            ;(e.target as HTMLButtonElement).style.boxShadow = '0 6px 0 #CC1144, 0 8px 20px rgba(255,23,68,0.4)'
          }}
        >
          Let's Draw! 🖌️
        </button>
      </div>
    </div>
  )
}
