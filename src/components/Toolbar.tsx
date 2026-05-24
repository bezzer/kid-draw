import type { ToolType, BrushSize } from '../types'
import { COLORS, BRUSH_SIZES } from '../types'

interface Props {
  tool: ToolType
  setTool: (t: ToolType) => void
  color: string
  setColor: (c: string) => void
  brushSize: BrushSize
  setBrushSize: (s: BrushSize) => void
}

const TOOLS: { id: ToolType; icon: string; label: string; bg: string }[] = [
  { id: 'crayon',  icon: '✏️', label: 'Crayon',   bg: 'linear-gradient(135deg,#FFD93D,#FF9100)' },
  { id: 'brush',   icon: '🖌️', label: 'Brush',    bg: 'linear-gradient(135deg,#4D96FF,#2979FF)' },
  { id: 'magic',   icon: '✨', label: 'Magic',    bg: 'linear-gradient(135deg,#FF6B9D,#C77DFF)' },
  { id: 'eraser',  icon: '🧹', label: 'Eraser',   bg: 'linear-gradient(135deg,#B0BEC5,#78909C)' },
  { id: 'pan',     icon: '✋', label: 'Move',     bg: 'linear-gradient(135deg,#80CBC4,#4DB6AC)' },
  { id: 'sticker', icon: '🎯', label: 'Stickers', bg: 'linear-gradient(135deg,#FF9100,#FF1744)' },
]

const BRUSH_SIZE_OPTIONS: { id: BrushSize; px: number }[] = [
  { id: 'small',  px: 10 },
  { id: 'medium', px: 17 },
  { id: 'large',  px: 26 },
]

export default function Toolbar({ tool, setTool, color, setColor, brushSize, setBrushSize }: Props) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 14,
        left: 12,
        right: 12,
        zIndex: 20,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          background: 'rgba(255,255,255,0.97)',
          borderRadius: 36,
          boxShadow: '0 8px 40px rgba(0,0,0,0.22), 0 2px 8px rgba(0,0,0,0.12)',
          padding: '10px 18px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          maxWidth: 820,
          width: '100%',
          pointerEvents: 'auto',
        }}
      >
        {/* Color swatches row */}
        <div
          style={{
            display: 'flex',
            gap: 6,
            overflowX: 'auto',
            paddingBottom: 2,
            scrollbarWidth: 'none',
          }}
        >
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              title={c}
              style={{
                background: c,
                border: color === c ? '3px solid #333' : '2px solid rgba(0,0,0,0.12)',
                borderRadius: 10,
                width: 34,
                height: 34,
                flexShrink: 0,
                cursor: 'pointer',
                boxShadow: color === c
                  ? '0 0 0 2px white inset, 0 0 10px rgba(0,0,0,0.3)'
                  : '0 1px 3px rgba(0,0,0,0.15)',
                transition: 'transform 0.1s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.2)' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = '' }}
            />
          ))}
        </div>

        {/* Tools + brush sizes row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* Tools */}
          {TOOLS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTool(t.id)}
              title={t.label}
              style={{
                background: t.bg,
                border: 'none',
                borderRadius: 16,
                width: 52,
                height: 52,
                flexShrink: 0,
                fontSize: 22,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                boxShadow: tool === t.id
                  ? '0 0 0 3px white, 0 0 0 6px gold, 0 4px 16px rgba(255,200,0,0.5)'
                  : '0 3px 8px rgba(0,0,0,0.18)',
                transform: tool === t.id ? 'scale(1.1)' : '',
                transition: 'box-shadow 0.15s, transform 0.15s',
              }}
              onMouseEnter={(e) => {
                if (tool !== t.id) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.08)'
              }}
              onMouseLeave={(e) => {
                if (tool !== t.id) (e.currentTarget as HTMLButtonElement).style.transform = ''
              }}
            >
              <span style={{ lineHeight: 1 }}>{t.icon}</span>
              <span style={{ fontSize: 8, color: 'white', fontFamily: 'Nunito', fontWeight: 800, lineHeight: 1 }}>
                {t.label}
              </span>
            </button>
          ))}

          {/* Divider */}
          <div style={{ width: 2, height: 44, background: 'linear-gradient(180deg,transparent,#E0E0E0,transparent)', margin: '0 4px', flexShrink: 0 }} />

          {/* Brush sizes */}
          {BRUSH_SIZE_OPTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setBrushSize(s.id)}
              title={s.id}
              style={{
                background: brushSize === s.id
                  ? 'linear-gradient(135deg, #4D96FF, #2979FF)'
                  : '#F0F4FF',
                border: 'none',
                borderRadius: 14,
                width: 48,
                height: 48,
                flexShrink: 0,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: brushSize === s.id
                  ? '0 0 0 3px white, 0 0 0 5px #4D96FF'
                  : '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'all 0.15s',
              }}
            >
              <div
                style={{
                  width: s.px,
                  height: s.px,
                  borderRadius: '50%',
                  background: brushSize === s.id ? 'white' : '#2979FF',
                }}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
