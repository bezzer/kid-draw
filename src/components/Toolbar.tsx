import type { ToolType, BrushSize } from '../types'
import { COLORS, BRUSH_SIZES } from '../types'

interface Props {
  tool: ToolType
  setTool: (t: ToolType) => void
  color: string
  setColor: (c: string) => void
  brushSize: BrushSize
  setBrushSize: (s: BrushSize) => void
  onOpenStickers: () => void
}

const TOOLS: { id: ToolType; icon: string; label: string; bg: string }[] = [
  { id: 'crayon', icon: '✏️', label: 'Crayon',  bg: 'linear-gradient(135deg,#FFD93D,#FF9100)' },
  { id: 'brush',  icon: '🖌️', label: 'Brush',   bg: 'linear-gradient(135deg,#4D96FF,#2979FF)' },
  { id: 'magic',  icon: '✨', label: 'Magic',   bg: 'linear-gradient(135deg,#FF6B9D,#C77DFF)' },
  { id: 'eraser', icon: '🧹', label: 'Eraser',  bg: 'linear-gradient(135deg,#B0BEC5,#78909C)' },
  { id: 'pan',    icon: '✋', label: 'Move',    bg: 'linear-gradient(135deg,#80CBC4,#4DB6AC)' },
]

const BRUSH_SIZE_OPTIONS: { id: BrushSize; px: number }[] = [
  { id: 'small',  px: 10 },
  { id: 'medium', px: 18 },
  { id: 'large',  px: 28 },
]

export default function Toolbar({
  tool, setTool, color, setColor, brushSize, setBrushSize, onOpenStickers,
}: Props) {
  return (
    <div
      style={{
        width: 82,
        background: 'rgba(255,255,255,0.97)',
        boxShadow: '3px 0 18px rgba(0,0,0,0.12)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '10px 0 14px',
        gap: 0,
        overflowY: 'auto',
        overflowX: 'hidden',
        flexShrink: 0,
        zIndex: 10,
      }}
    >
      {/* ── Tools ── */}
      <Section label="Tools" />
      {TOOLS.map((t) => (
        <ToolBtn
          key={t.id}
          icon={t.icon}
          label={t.label}
          bg={t.bg}
          active={tool === t.id}
          onClick={() => setTool(t.id)}
        />
      ))}

      <Divider />

      {/* ── Brush Size ── */}
      <Section label="Size" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center', width: '100%', paddingBottom: 4 }}>
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
              width: 62,
              height: 42,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s',
              boxShadow: brushSize === s.id
                ? '0 0 0 3px white, 0 0 0 5px #4D96FF'
                : '0 2px 4px rgba(0,0,0,0.1)',
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

      <Divider />

      {/* ── Color Palette ── */}
      <Section label="Color" />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 5,
          padding: '0 6px',
          width: '100%',
        }}
      >
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            title={c}
            style={{
              background: c,
              border: color === c ? '3px solid #333' : '2px solid rgba(0,0,0,0.1)',
              borderRadius: 10,
              aspectRatio: '1',
              cursor: 'pointer',
              width: '100%',
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

      <Divider />

      {/* ── Stickers ── */}
      <button
        onClick={onOpenStickers}
        style={{
          background: 'linear-gradient(135deg, #FF6B9D, #FF9100)',
          border: 'none',
          borderRadius: 18,
          width: 62,
          height: 62,
          fontSize: 28,
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(255,107,157,0.4)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 1,
          marginTop: 2,
          transition: 'transform 0.12s',
        }}
        title="Stickers"
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.08)' }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = '' }}
      >
        🎯
        <span style={{ fontSize: 9, color: 'white', fontFamily: 'Nunito', fontWeight: 800, lineHeight: 1 }}>
          Stickers
        </span>
      </button>
    </div>
  )
}

function Section({ label }: { label: string }) {
  return (
    <div style={{
      fontFamily: 'Nunito',
      fontSize: 10,
      fontWeight: 800,
      color: '#AAA',
      textTransform: 'uppercase',
      letterSpacing: 1,
      paddingBottom: 4,
      paddingTop: 2,
    }}>
      {label}
    </div>
  )
}

function Divider() {
  return (
    <div style={{
      width: '60%',
      height: 2,
      background: 'linear-gradient(90deg,transparent,#E0E0E0,transparent)',
      margin: '8px 0',
    }} />
  )
}

function ToolBtn({
  icon, label, bg, active, onClick,
}: {
  icon: string; label: string; bg: string; active: boolean; onClick: () => void
}) {
  return (
    <button
      className={`tool-btn${active ? ' active' : ''}`}
      onClick={onClick}
      title={label}
      style={{
        background: bg,
        marginBottom: 6,
        boxShadow: active
          ? '0 0 0 3px white, 0 0 0 6px gold, 0 4px 16px rgba(255,200,0,0.5)'
          : '0 3px 8px rgba(0,0,0,0.18)',
        transform: active ? 'scale(1.08)' : '',
      }}
    >
      <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>{icon}</span>
    </button>
  )
}
