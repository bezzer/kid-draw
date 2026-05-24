import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import DrawingCanvas from './components/DrawingCanvas'
import type { CanvasHandle } from './components/DrawingCanvas'
import Toolbar from './components/Toolbar'
import StickerPanel from './components/StickerPanel'
import SplashScreen from './components/SplashScreen'
import type { DrawOp, ToolType, BrushSize } from './types'
import { BRUSH_SIZES } from './types'

const TOP_BTN: React.CSSProperties = {
  background: 'rgba(255,255,255,0.9)',
  border: 'none',
  borderRadius: 14,
  width: 46,
  height: 46,
  fontSize: 22,
  cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  flexShrink: 0,
  fontFamily: 'Nunito',
  fontWeight: 800,
  transition: 'transform 0.1s',
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [tool, setTool] = useState<ToolType>('brush')
  const [color, setColor] = useState('#FF1744')
  const [brushSize, setBrushSize] = useState<BrushSize>('medium')
  const [ops, setOps] = useState<DrawOp[]>([])
  const [stickerPanelOpen, setStickerPanelOpen] = useState(false)
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showIOSPrompt, setShowIOSPrompt] = useState(false)
  const canvasRef = useRef<CanvasHandle>(null)

  // Detect iOS/iPadOS — these don't support the Fullscreen API
  const isIOS = useMemo(() =>
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1),
  [])

  const addOp = useCallback((op: DrawOp) => {
    setOps((prev) => {
      const next = [...prev, op]
      // cap at 300 ops to keep memory sensible
      return next.length > 300 ? next.slice(next.length - 300) : next
    })
  }, [])

  const undo = useCallback(() => setOps((prev) => prev.slice(0, -1)), [])
  const clear = useCallback(() => { setOps([]); setShowClearConfirm(false) }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') { e.preventDefault(); undo() }
      if (e.key === 'Escape') { setSelectedSticker(null); setShowClearConfirm(false) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [undo])

  // Track fullscreen state
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}

      {/* ── Header ── */}
      <div
        style={{
          height: 54,
          flexShrink: 0,
          background: 'linear-gradient(90deg, #FF6B9D 0%, #FF9100 20%, #FFCA28 38%, #6BCB77 55%, #4D96FF 75%, #C77DFF 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 14px',
          boxShadow: '0 3px 12px rgba(0,0,0,0.2)',
          zIndex: 20,
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 28 }}>🎨</span>
          <span
            style={{
              fontFamily: '"Fredoka One", cursive',
              fontSize: 30,
              background: 'white',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: 'none',
              filter: 'drop-shadow(1px 2px 0 rgba(0,0,0,0.2))',
            }}
          >
            KiddDraw
          </span>
        </div>

        {/* Sticker mode badge */}
        {selectedSticker && (
          <div
            style={{
              background: 'rgba(255,255,255,0.95)',
              borderRadius: 20,
              padding: '6px 14px',
              fontFamily: 'Nunito',
              fontWeight: 800,
              fontSize: 14,
              color: '#FF1744',
              display: 'flex', alignItems: 'center', gap: 6,
              animation: 'popIn 0.3s ease-out',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}
          >
            🎯 Tap canvas to place sticker!
            <button
              onClick={() => setSelectedSticker(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: 0 }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 8 }}>
          <TopBtn
            label="↩️"
            title="Undo (Ctrl+Z)"
            disabled={ops.length === 0}
            onClick={undo}
          />
          <TopBtn label="🗑️" title="Clear canvas" onClick={() => setShowClearConfirm(true)} />
          <TopBtn label="💾" title="Save as PNG" onClick={() => canvasRef.current?.downloadImage()} />
          <TopBtn
            label={isFullscreen ? '⊡' : '⛶'}
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            onClick={() => isIOS ? setShowIOSPrompt(true) : canvasRef.current?.toggleFullscreen()}
          />
        </div>
      </div>

      {/* ── Main area ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
        <Toolbar
          tool={tool}
          setTool={(t) => { setTool(t); setSelectedSticker(null) }}
          color={color}
          setColor={setColor}
          brushSize={brushSize}
          setBrushSize={setBrushSize}
          onOpenStickers={() => setStickerPanelOpen(true)}
        />

        <DrawingCanvas
          ref={canvasRef}
          tool={tool}
          color={color}
          brushSizeValue={BRUSH_SIZES[brushSize]}
          ops={ops}
          addOp={addOp}
          selectedSticker={selectedSticker}
          onStickerPlaced={() => setSelectedSticker(null)}
        />
      </div>

      {/* ── Sticker panel ── */}
      <StickerPanel
        isOpen={stickerPanelOpen}
        onClose={() => setStickerPanelOpen(false)}
        onSelect={(url) => {
          setSelectedSticker(url)
          setStickerPanelOpen(false)
        }}
      />

      {/* ── iOS fullscreen prompt ── */}
      {showIOSPrompt && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            zIndex: 100, padding: '0 16px 40px',
          }}
          onClick={() => setShowIOSPrompt(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white', borderRadius: 28, padding: '32px 28px 28px',
              width: '100%', maxWidth: 420,
              boxShadow: '0 -8px 40px rgba(0,0,0,0.25)',
              animation: 'bounceIn 0.35s cubic-bezier(.36,.07,.19,.97)',
              fontFamily: 'Nunito',
            }}
          >
            <div style={{ fontSize: 48, textAlign: 'center', marginBottom: 12 }}>📱</div>
            <h2 style={{ fontFamily: '"Fredoka One"', fontSize: 24, color: '#333', margin: '0 0 10px', textAlign: 'center' }}>
              Go Fullscreen on iPad!
            </h2>
            <p style={{ fontSize: 16, color: '#555', lineHeight: 1.6, margin: '0 0 20px' }}>
              iPad doesn't allow fullscreen from inside the browser. To get the full experience:
            </p>
            <ol style={{ fontSize: 16, color: '#444', lineHeight: 2, paddingLeft: 24, margin: '0 0 24px' }}>
              <li>Tap the <strong>Share button</strong> <span style={{ fontSize: 18 }}>⬆️</span> in Safari</li>
              <li>Tap <strong>"Add to Home Screen"</strong> 📲</li>
              <li>Open KiddDraw from your Home Screen — it'll launch fullscreen! 🎉</li>
            </ol>
            <button
              onClick={() => setShowIOSPrompt(false)}
              style={{
                width: '100%', background: 'linear-gradient(135deg,#FF6B9D,#C77DFF)',
                color: 'white', border: 'none', borderRadius: 18,
                padding: '14px', fontSize: 18,
                fontFamily: '"Fredoka One"', cursor: 'pointer',
                boxShadow: '0 4px 0 rgba(0,0,0,0.15)',
              }}
            >
              Got it! 👍
            </button>
          </div>
        </div>
      )}

      {/* ── Clear confirm modal ── */}
      {showClearConfirm && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 100,
          }}
          onClick={() => setShowClearConfirm(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: 36,
              padding: '44px 52px 40px',
              textAlign: 'center',
              boxShadow: '0 24px 80px rgba(0,0,0,0.3)',
              animation: 'bounceIn 0.4s cubic-bezier(.36,.07,.19,.97)',
            }}
          >
            <div style={{ fontSize: 64, marginBottom: 12 }}>🗑️</div>
            <p style={{ fontFamily: '"Fredoka One"', fontSize: 28, color: '#333', margin: '0 0 8px' }}>
              Clear everything?
            </p>
            <p style={{ fontFamily: 'Nunito', fontSize: 16, color: '#888', margin: '0 0 28px' }}>
              This can't be undone!
            </p>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center' }}>
              <button
                onClick={clear}
                style={{
                  background: 'linear-gradient(135deg,#FF6B9D,#FF1744)',
                  color: 'white', border: 'none', borderRadius: 20,
                  padding: '14px 30px', fontSize: 18,
                  fontFamily: '"Fredoka One"', cursor: 'pointer',
                  boxShadow: '0 4px 0 #CC1144',
                  transition: 'transform 0.1s',
                }}
              >
                Yes, clear! 🗑️
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                style={{
                  background: 'linear-gradient(135deg,#6BCB77,#00C853)',
                  color: 'white', border: 'none', borderRadius: 20,
                  padding: '14px 30px', fontSize: 18,
                  fontFamily: '"Fredoka One"', cursor: 'pointer',
                  boxShadow: '0 4px 0 #009624',
                  transition: 'transform 0.1s',
                }}
              >
                Keep it! 🎨
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function TopBtn({
  label, title, onClick, disabled,
}: {
  label: string; title: string; onClick: () => void; disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        ...TOP_BTN,
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? 'default' : 'pointer',
      }}
      onMouseEnter={(e) => { if (!disabled) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.1)' }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = '' }}
    >
      {label}
    </button>
  )
}
