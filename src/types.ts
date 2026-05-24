export type ToolType = 'crayon' | 'brush' | 'magic' | 'eraser' | 'pan'
export type BrushSize = 'small' | 'medium' | 'large'

export interface Point { x: number; y: number }

export interface PathOp {
  type: 'path'
  points: Point[]
  color: string
  size: number
  tool: ToolType
}

export interface StickerOp {
  type: 'sticker'
  url: string
  x: number
  y: number
}

export type DrawOp = PathOp | StickerOp

export const BRUSH_SIZES: Record<BrushSize, number> = {
  small: 5,
  medium: 16,
  large: 40,
}

export const COLORS = [
  '#FF1744', '#FF6B35', '#FFCA28', '#C6E02A',
  '#00E676', '#00BCD4', '#2979FF', '#7C4DFF',
  '#FF4081', '#FF9100', '#FFE57F', '#69F0AE',
  '#40C4FF', '#64B5F6', '#B388FF', '#FF80AB',
  '#8D6E63', '#78909C', '#212121', '#FFFFFF',
  '#FF6D00', '#AEEA00', '#00E5FF', '#D500F9',
]

export const STICKER_CATEGORIES = [
  {
    name: 'Animals',
    icon: '🐶',
    stickers: ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐸','🐵','🐔','🐧','🐦','🦋','🐛','🦀','🐠','🐟','🐬','🐳','🦓','🦒','🐘'],
  },
  {
    name: 'Food',
    icon: '🍕',
    stickers: ['🍕','🍦','🍰','🍩','🍪','🎂','🍭','🍬','🍫','🍎','🍓','🍒','🍑','🥕','🌽','🧁','🍿','🥑','🍌','🍉'],
  },
  {
    name: 'Fun',
    icon: '⭐',
    stickers: ['⭐','🌈','🌸','🌺','🌻','🌼','🎈','🎉','🎊','🎁','🎀','🏆','🎨','🚀','🌙','☀️','⚡','🔥','💎','❤️','🦄','🎠','🪄','🌟'],
  },
]

export function emojiToTwemojiUrl(emoji: string): string {
  const codePoints: string[] = []
  for (const char of emoji) {
    const cp = char.codePointAt(0)
    if (cp !== undefined && cp !== 0xFE0F) {
      codePoints.push(cp.toString(16))
    }
  }
  const path = codePoints.join('-')
  return `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/${path}.png`
}
