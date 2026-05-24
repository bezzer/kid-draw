import { useState } from 'react'
import { STICKER_CATEGORIES, emojiToTwemojiUrl } from '../types'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSelect: (url: string) => void
}

export default function StickerPanel({ isOpen, onClose, onSelect }: Props) {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.25)' }}
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: 300,
          background: 'white',
          zIndex: 50,
          display: 'flex', flexDirection: 'column',
          boxShadow: '-8px 0 40px rgba(0,0,0,0.2)',
          borderRadius: '24px 0 0 24px',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.35s cubic-bezier(.4,0,.2,1)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #FF6B9D, #C77DFF)',
            padding: '20px 20px 14px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <span style={{ fontFamily: '"Fredoka One"', fontSize: 24, color: 'white' }}>
            🎯 Stickers
          </span>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.3)', border: 'none', borderRadius: 12,
              width: 36, height: 36, fontSize: 20, cursor: 'pointer', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        {/* Category tabs */}
        <div style={{ display: 'flex', padding: '12px 12px 0', gap: 8, flexShrink: 0 }}>
          {STICKER_CATEGORIES.map((cat, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              style={{
                flex: 1,
                background: activeTab === i
                  ? 'linear-gradient(135deg, #FF6B9D, #C77DFF)'
                  : '#F0F0F0',
                color: activeTab === i ? 'white' : '#666',
                border: 'none',
                borderRadius: 12,
                padding: '8px 4px',
                fontSize: 13,
                fontFamily: 'Nunito',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: 22 }}>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Sticker grid */}
        <div
          style={{
            flex: 1, overflowY: 'auto', padding: 14,
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 10,
            alignContent: 'start',
          }}
        >
          {STICKER_CATEGORIES[activeTab].stickers.map((emoji, i) => {
            const url = emojiToTwemojiUrl(emoji)
            return (
              <button
                key={i}
                onClick={() => onSelect(url)}
                style={{
                  background: '#F8F6FF',
                  border: '2px solid transparent',
                  borderRadius: 16,
                  padding: 6,
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s',
                  aspectRatio: '1',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget
                  el.style.background = 'linear-gradient(135deg, #FFE4F0, #EEE4FF)'
                  el.style.borderColor = '#FF6B9D'
                  el.style.transform = 'scale(1.15)'
                  el.style.boxShadow = '0 4px 12px rgba(255,107,157,0.4)'
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget
                  el.style.background = '#F8F6FF'
                  el.style.borderColor = 'transparent'
                  el.style.transform = ''
                  el.style.boxShadow = ''
                }}
                title={emoji}
              >
                <img
                  src={url}
                  alt={emoji}
                  width={40}
                  height={40}
                  loading="lazy"
                  style={{ display: 'block', imageRendering: 'crisp-edges' }}
                  onError={(e) => {
                    // fallback to native emoji if Twemoji fails
                    const parent = (e.target as HTMLImageElement).parentElement!
                    ;(e.target as HTMLImageElement).style.display = 'none'
                    parent.textContent = emoji
                    parent.style.fontSize = '32px'
                  }}
                />
              </button>
            )
          })}
        </div>

        <div
          style={{
            padding: '12px 16px',
            background: '#FFF4F8',
            flexShrink: 0,
            fontFamily: 'Nunito',
            fontSize: 13,
            color: '#999',
            textAlign: 'center',
          }}
        >
          Click a sticker, then tap on the canvas to place it! 🎯
        </div>
      </div>
    </>
  )
}
