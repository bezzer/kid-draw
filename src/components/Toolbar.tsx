import type { ToolType, BrushSize } from '../types'
import { COLORS } from '../types'

interface Props {
  tool: ToolType
  setTool: (t: ToolType) => void
  color: string
  setColor: (c: string) => void
  brushSize: BrushSize
  setBrushSize: (s: BrushSize) => void
}

// Layout constants
const SWATCH = 26           // px
const SWATCH_GAP = 2        // px
const COLOR_COLS = 8
const COLOR_ROWS = 3
const COLOR_W = COLOR_COLS * SWATCH + (COLOR_COLS - 1) * SWATCH_GAP  // 222px
const COLOR_H = COLOR_ROWS * SWATCH + (COLOR_ROWS - 1) * SWATCH_GAP  // 82px

const TOOL_H = COLOR_H      // tools match color grid height
const TOOL_W = 64

const BRUSH_W = 50
const BRUSH_H = Math.floor((COLOR_H - 2 * 4) / 3)  // 3 buttons to fill COLOR_H

// ── SVG Icons ────────────────────────────────────────────────────────────────

function MoveIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
      <polygon points="12,3 15.5,8.5 8.5,8.5"/>
      <polygon points="12,21 15.5,15.5 8.5,15.5"/>
      <polygon points="21,12 15.5,8.5 15.5,15.5"/>
      <polygon points="3,12 8.5,8.5 8.5,15.5"/>
      <rect x="9.5" y="9.5" width="5" height="5" rx="1"/>
    </svg>
  )
}

function CrayonIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm17.71-9.37a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
    </svg>
  )
}

function BrushIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
      <path d="M7 14c-1.66 0-3 1.34-3 3 0 1.31-1.16 2-2 2 .92 1.22 2.49 2 4 2 2.21 0 4-1.79 4-4 0-1.66-1.34-3-3-3zm13.71-9.37l-1.34-1.34a1 1 0 00-1.41 0L9 12.25 11.75 15l8.96-8.96a1 1 0 000-1.41z"/>
    </svg>
  )
}

function MagicIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
      <path d="M7.5 5.6L10 7 8.6 4.5 10 2 7.5 3.4 5 2l1.4 2.5L5 7l2.5-1.4zm12 9.8L17 14l1.4 2.5L17 19l2.5-1.4L22 19l-1.4-2.5L22 14l-2.5 1.4zM22 2l-2.5 1.4L17 2l1.4 2.5L17 7l2.5-1.4L22 7l-1.4-2.5L22 2zM13.34 7.29a1 1 0 00-1.41 0L1.29 17.93a1 1 0 000 1.41l2.34 2.34a1 1 0 001.41 0L15.68 11.04a1 1 0 000-1.41l-2.34-2.34z"/>
    </svg>
  )
}

function EraserIcon() {
  return (
    <svg width="26" height="22" viewBox="0 0 26 22" fill="none">
      <rect x="1" y="3" width="24" height="14" rx="4" fill="rgba(255,255,255,0.25)"/>
      <rect x="1" y="3" width="10" height="14" rx="4" fill="rgba(255,255,255,0.55)"/>
      <line x1="11" y1="3" x2="11" y2="17" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5"/>
      <line x1="1" y1="20" x2="25" y2="20" stroke="rgba(255,255,255,0.55)" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

function StickerIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
    </svg>
  )
}

// ── Tool definitions ─────────────────────────────────────────────────────────

const DRAW_TOOLS: { id: ToolType; icon: React.ReactNode; label: string; bg: string }[] = [
  { id: 'crayon',  icon: <CrayonIcon />,  label: 'Crayon',   bg: 'linear-gradient(135deg,#FFD93D,#FF9100)' },
  { id: 'brush',   icon: <BrushIcon />,   label: 'Brush',    bg: 'linear-gradient(135deg,#4D96FF,#2979FF)' },
  { id: 'magic',   icon: <MagicIcon />,   label: 'Magic',    bg: 'linear-gradient(135deg,#FF6B9D,#C77DFF)' },
  { id: 'eraser',  icon: <EraserIcon />,  label: 'Eraser',   bg: 'linear-gradient(135deg,#90A4AE,#607D8B)' },
  { id: 'sticker', icon: <StickerIcon />, label: 'Stickers', bg: 'linear-gradient(135deg,#FF9100,#FF1744)' },
]

const BRUSH_SIZE_OPTIONS: { id: BrushSize; dot: number }[] = [
  { id: 'small',  dot: 9 },
  { id: 'medium', dot: 16 },
  { id: 'large',  dot: 25 },
]

// ── Shared button style factory ───────────────────────────────────────────────

function toolStyle(active: boolean, bg: string, w: number, h: number): React.CSSProperties {
  return {
    background: bg,
    border: 'none',
    borderRadius: 14,
    width: w,
    height: h,
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    boxShadow: active
      ? '0 0 0 3px white, 0 0 0 6px gold, 0 4px 16px rgba(255,200,0,0.5)'
      : '0 2px 6px rgba(0,0,0,0.18)',
    transform: active ? 'scale(1.07)' : '',
    transition: 'box-shadow 0.15s, transform 0.15s',
    flexShrink: 0,
  }
}

function Divider({ height }: { height: number }) {
  return (
    <div style={{
      width: 2,
      height,
      background: 'linear-gradient(180deg,transparent,#E0E0E0,transparent)',
      flexShrink: 0,
      margin: '0 6px',
    }} />
  )
}

// ── Main component ────────────────────────────────────────────────────────────

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
          borderRadius: 26,
          boxShadow: '0 8px 40px rgba(0,0,0,0.22), 0 2px 8px rgba(0,0,0,0.12)',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 0,
          pointerEvents: 'auto',
        }}
      >
        {/* ── Move tool (alone) ── */}
        <ToolBtn id="pan" icon={<MoveIcon />} label="Move" bg="linear-gradient(135deg,#80CBC4,#4DB6AC)" active={tool === 'pan'} onClick={() => setTool('pan')} />

        <Divider height={COLOR_H} />

        {/* ── 5 drawing tools in a row ── */}
        <div style={{ display: 'flex', gap: 5 }}>
          {DRAW_TOOLS.map((t) => (
            <ToolBtn key={t.id} id={t.id} icon={t.icon} label={t.label} bg={t.bg} active={tool === t.id} onClick={() => setTool(t.id)} />
          ))}
        </div>

        <Divider height={COLOR_H} />

        {/* ── Color grid: 8 cols × 3 rows ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${COLOR_COLS}, ${SWATCH}px)`,
            gridTemplateRows: `repeat(${COLOR_ROWS}, ${SWATCH}px)`,
            gap: SWATCH_GAP,
            width: COLOR_W,
            height: COLOR_H,
            flexShrink: 0,
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
                borderRadius: 7,
                width: SWATCH,
                height: SWATCH,
                cursor: 'pointer',
                padding: 0,
                boxShadow: color === c
                  ? '0 0 0 2px white inset, 0 0 8px rgba(0,0,0,0.3)'
                  : '0 1px 3px rgba(0,0,0,0.15)',
                transition: 'transform 0.1s',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.25)' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = '' }}
            />
          ))}
        </div>

        <Divider height={COLOR_H} />

        {/* ── Brush sizes stacked ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, height: COLOR_H, justifyContent: 'space-between' }}>
          {BRUSH_SIZE_OPTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setBrushSize(s.id)}
              title={s.id}
              style={{
                background: brushSize === s.id ? 'linear-gradient(135deg,#4D96FF,#2979FF)' : '#F0F4FF',
                border: 'none',
                borderRadius: 12,
                width: BRUSH_W,
                height: BRUSH_H,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: brushSize === s.id
                  ? '0 0 0 3px white, 0 0 0 5px #4D96FF'
                  : '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'all 0.15s',
                flexShrink: 0,
              }}
            >
              <div style={{
                width: s.dot,
                height: s.dot,
                borderRadius: '50%',
                background: brushSize === s.id ? 'white' : '#2979FF',
                flexShrink: 0,
              }} />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function ToolBtn({
  id, icon, label, bg, active, onClick,
}: {
  id: ToolType; icon: React.ReactNode; label: string; bg: string; active: boolean; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      style={toolStyle(active, bg, TOOL_W, TOOL_H)}
      onMouseEnter={(e) => {
        if (!active) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)'
      }}
      onMouseLeave={(e) => {
        if (!active) (e.currentTarget as HTMLButtonElement).style.transform = ''
      }}
    >
      {icon}
      <span style={{ fontSize: 9, color: 'white', fontFamily: 'Nunito', fontWeight: 800, lineHeight: 1 }}>
        {label}
      </span>
    </button>
  )
}
