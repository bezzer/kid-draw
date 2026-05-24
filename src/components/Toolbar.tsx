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

// Color grid: 3 cols × 8 rows, 28px swatches, 3px gap
const SWATCH = 28
const SWATCH_GAP = 3
const COLOR_COLS = 3
const COLOR_ROWS = 8
const COLOR_GRID_W = COLOR_COLS * SWATCH + (COLOR_COLS - 1) * SWATCH_GAP
const COLOR_GRID_H = COLOR_ROWS * SWATCH + (COLOR_ROWS - 1) * SWATCH_GAP

// Tool grid: 2 cols × 3 rows, height = COLOR_GRID_H
const TOOL_COLS = 2
const TOOL_ROWS = 3
const TOOL_GAP = 5
const TOOL_BTN_H = Math.floor((COLOR_GRID_H - (TOOL_ROWS - 1) * TOOL_GAP) / TOOL_ROWS)
const TOOL_BTN_W = 62

// Brush sizes: 3 stacked buttons matching COLOR_GRID_H
const BRUSH_BTN_H = Math.floor((COLOR_GRID_H - 2 * TOOL_GAP) / 3)
const BRUSH_BTN_W = 50

function EraserIcon() {
  return (
    <svg width="28" height="22" viewBox="0 0 28 22" fill="none">
      <rect x="1" y="3" width="26" height="14" rx="4" fill="rgba(255,255,255,0.25)"/>
      <rect x="1" y="3" width="11" height="14" rx="4" fill="rgba(255,255,255,0.55)"/>
      <line x1="12" y1="3" x2="12" y2="17" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5"/>
      <line x1="1" y1="20" x2="27" y2="20" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

const TOOLS: { id: ToolType; icon: React.ReactNode; label: string; bg: string }[] = [
  { id: 'crayon',  icon: '✏️', label: 'Crayon',   bg: 'linear-gradient(135deg,#FFD93D,#FF9100)' },
  { id: 'brush',   icon: '🖌️', label: 'Brush',    bg: 'linear-gradient(135deg,#4D96FF,#2979FF)' },
  { id: 'magic',   icon: '✨', label: 'Magic',    bg: 'linear-gradient(135deg,#FF6B9D,#C77DFF)' },
  { id: 'eraser',  icon: <EraserIcon />, label: 'Eraser', bg: 'linear-gradient(135deg,#90A4AE,#607D8B)' },
  { id: 'pan',     icon: '✋', label: 'Move',     bg: 'linear-gradient(135deg,#80CBC4,#4DB6AC)' },
  { id: 'sticker', icon: '🎯', label: 'Stickers', bg: 'linear-gradient(135deg,#FF9100,#FF1744)' },
]

const BRUSH_SIZE_OPTIONS: { id: BrushSize; px: number }[] = [
  { id: 'small',  px: 9 },
  { id: 'medium', px: 16 },
  { id: 'large',  px: 25 },
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
          borderRadius: 28,
          boxShadow: '0 8px 40px rgba(0,0,0,0.22), 0 2px 8px rgba(0,0,0,0.12)',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          pointerEvents: 'auto',
        }}
      >
        {/* ── Tools 2×3 grid ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${TOOL_COLS}, ${TOOL_BTN_W}px)`,
            gridTemplateRows: `repeat(${TOOL_ROWS}, ${TOOL_BTN_H}px)`,
            gap: TOOL_GAP,
          }}
        >
          {TOOLS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTool(t.id)}
              title={t.label}
              style={{
                background: t.bg,
                border: 'none',
                borderRadius: 14,
                width: TOOL_BTN_W,
                height: TOOL_BTN_H,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                fontSize: 22,
                boxShadow: tool === t.id
                  ? '0 0 0 3px white, 0 0 0 6px gold, 0 4px 16px rgba(255,200,0,0.5)'
                  : '0 2px 6px rgba(0,0,0,0.18)',
                transform: tool === t.id ? 'scale(1.07)' : '',
                transition: 'box-shadow 0.15s, transform 0.15s',
              }}
              onMouseEnter={(e) => {
                if (tool !== t.id) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)'
              }}
              onMouseLeave={(e) => {
                if (tool !== t.id) (e.currentTarget as HTMLButtonElement).style.transform = ''
              }}
            >
              <span style={{ lineHeight: 1 }}>{t.icon}</span>
              <span style={{ fontSize: 9, color: 'white', fontFamily: 'Nunito', fontWeight: 800, lineHeight: 1 }}>
                {t.label}
              </span>
            </button>
          ))}
        </div>

        {/* Divider */}
        <div style={{ width: 2, height: COLOR_GRID_H, background: 'linear-gradient(180deg,transparent,#E0E0E0,transparent)', flexShrink: 0 }} />

        {/* ── Color swatches 3×8 grid ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${COLOR_COLS}, ${SWATCH}px)`,
            gridTemplateRows: `repeat(${COLOR_ROWS}, ${SWATCH}px)`,
            gap: SWATCH_GAP,
            width: COLOR_GRID_W,
            height: COLOR_GRID_H,
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
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.25)' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = '' }}
            />
          ))}
        </div>

        {/* Divider */}
        <div style={{ width: 2, height: COLOR_GRID_H, background: 'linear-gradient(180deg,transparent,#E0E0E0,transparent)', flexShrink: 0 }} />

        {/* ── Brush sizes stacked ── */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: TOOL_GAP,
            height: COLOR_GRID_H,
            justifyContent: 'space-between',
          }}
        >
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
                borderRadius: 12,
                width: BRUSH_BTN_W,
                height: BRUSH_BTN_H,
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
                  flexShrink: 0,
                }}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
