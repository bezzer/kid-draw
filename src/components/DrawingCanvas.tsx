import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import type { DrawOp, PathOp, ToolType } from '../types'

interface Props {
  tool: ToolType
  color: string
  brushSizeValue: number
  ops: DrawOp[]
  addOp: (op: DrawOp) => void
  selectedSticker: string | null
}

export interface CanvasHandle {
  downloadImage: () => void
  toggleFullscreen: () => void
}

// ── deterministic pseudo-random (no flicker on re-renders) ──────────────────
function srand(seed: number) {
  const x = Math.sin(seed + 1.9) * 10000
  return x - Math.floor(x)
}

// ── smooth quadratic bezier path ────────────────────────────────────────────
function smoothPath(ctx: CanvasRenderingContext2D, pts: { x: number; y: number }[]) {
  if (pts.length < 2) return
  ctx.beginPath()
  ctx.moveTo(pts[0].x, pts[0].y)
  if (pts.length === 2) {
    ctx.lineTo(pts[1].x, pts[1].y)
  } else {
    for (let i = 1; i < pts.length - 1; i++) {
      const mx = (pts[i].x + pts[i + 1].x) / 2
      const my = (pts[i].y + pts[i + 1].y) / 2
      ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my)
    }
    ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y)
  }
  ctx.stroke()
}

// ── render a single drawing op ───────────────────────────────────────────────
function renderOp(
  ctx: CanvasRenderingContext2D,
  op: DrawOp,
  imgCache: Map<string, HTMLImageElement>,
  view?: { scale: number; panX: number; panY: number },
) {
  ctx.save()
  ctx.globalAlpha = 1
  ctx.globalCompositeOperation = 'source-over'

  if (op.type === 'sticker') {
    const img = imgCache.get(op.url)
    if (img?.complete && img.naturalWidth > 0) {
      const nomSz = 90
      if (view) {
        // Draw in screen space so SVG is rasterised at the exact pixel size needed
        const sx = op.x * view.scale + view.panX
        const sy = op.y * view.scale + view.panY
        const screenSz = nomSz * view.scale
        ctx.setTransform(1, 0, 0, 1, 0, 0)
        ctx.translate(sx, sy)
        ctx.rotate(op.rotation)
        ctx.drawImage(img, -screenSz / 2, -screenSz / 2, screenSz, screenSz)
      } else {
        ctx.translate(op.x, op.y)
        ctx.rotate(op.rotation)
        ctx.drawImage(img, -nomSz / 2, -nomSz / 2, nomSz, nomSz)
      }
    }
    ctx.restore()
    return
  }

  renderPath(ctx, op)
  ctx.restore()
}

function renderPath(ctx: CanvasRenderingContext2D, op: PathOp) {
  const { points: pts, color, size, tool } = op
  if (!pts.length) return

  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  if (pts.length === 1) {
    // dot
    ctx.beginPath()
    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.fillStyle = 'rgba(0,0,0,1)'
    } else {
      ctx.fillStyle = color
    }
    ctx.arc(pts[0].x, pts[0].y, size / 2, 0, Math.PI * 2)
    ctx.fill()
    return
  }

  switch (tool) {
    case 'eraser': {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.strokeStyle = 'rgba(0,0,0,1)'
      ctx.lineWidth = size
      smoothPath(ctx, pts)
      break
    }
    case 'crayon': {
      // 4 semi-transparent passes with fixed offsets for texture
      const offsets = [[0, 0], [1.2, 0.8], [-0.8, 1.2], [0.4, -1.0]]
      const alphas = [0.55, 0.28, 0.22, 0.18]
      for (let p = 0; p < 4; p++) {
        ctx.globalAlpha = alphas[p]
        ctx.strokeStyle = color
        ctx.lineWidth = size * (p === 0 ? 1 : 0.75)
        ctx.save()
        ctx.translate(offsets[p][0], offsets[p][1])
        smoothPath(ctx, pts)
        ctx.restore()
      }
      break
    }
    case 'brush': {
      ctx.strokeStyle = color
      ctx.lineWidth = size
      ctx.globalAlpha = 0.92
      smoothPath(ctx, pts)
      break
    }
    case 'magic': {
      let dist = 0
      for (let i = 1; i < pts.length; i++) {
        const dx = pts[i].x - pts[i - 1].x
        const dy = pts[i].y - pts[i - 1].y
        dist += Math.sqrt(dx * dx + dy * dy)
        const hue = (dist * 1.8) % 360

        ctx.strokeStyle = `hsl(${hue},100%,55%)`
        ctx.lineWidth = size
        ctx.beginPath()
        ctx.moveTo(pts[i - 1].x, pts[i - 1].y)
        ctx.lineTo(pts[i].x, pts[i].y)
        ctx.stroke()

        // deterministic sparkle dots
        if (srand(i * 5 + 7) < 0.28) {
          const r = srand(i * 5 + 8) * size * 0.55 + 2
          const sx = pts[i].x + (srand(i * 5 + 9) - 0.5) * size * 3.5
          const sy = pts[i].y + (srand(i * 5 + 10) - 0.5) * size * 3.5
          ctx.fillStyle = `hsl(${(hue + 60) % 360},100%,72%)`
          ctx.globalAlpha = 0.85
          ctx.beginPath()
          ctx.arc(sx, sy, r, 0, Math.PI * 2)
          ctx.fill()
        }
        // second smaller sparkle
        if (srand(i * 5 + 11) < 0.15) {
          const r2 = srand(i * 5 + 12) * size * 0.3 + 1
          const sx2 = pts[i].x + (srand(i * 5 + 13) - 0.5) * size * 5
          const sy2 = pts[i].y + (srand(i * 5 + 14) - 0.5) * size * 5
          ctx.fillStyle = `hsl(${(hue + 150) % 360},100%,80%)`
          ctx.globalAlpha = 0.7
          ctx.beginPath()
          ctx.arc(sx2, sy2, r2, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      break
    }
    case 'pan':
      break
  }
}

// ── dot grid background ──────────────────────────────────────────────────────
function drawBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  panX: number,
  panY: number,
  sc: number,
) {
  ctx.fillStyle = '#FFFEF5'
  ctx.fillRect(0, 0, w, h)

  const worldGrid = 40
  const screenGrid = worldGrid * sc
  if (screenGrid < 6) return

  const startX = ((panX % screenGrid) + screenGrid) % screenGrid
  const startY = ((panY % screenGrid) + screenGrid) % screenGrid
  const dotR = Math.max(1, Math.min(2.5, screenGrid / 18))

  ctx.fillStyle = 'rgba(0,0,0,0.10)'
  for (let x = startX; x < w; x += screenGrid) {
    for (let y = startY; y < h; y += screenGrid) {
      ctx.beginPath()
      ctx.arc(x, y, dotR, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

// ── cursor hint for sticker placement ────────────────────────────────────────
function drawStickerCursor(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | undefined,
  mx: number,
  my: number,
) {
  if (img?.complete && img.naturalWidth > 0) {
    ctx.globalAlpha = 0.7
    ctx.drawImage(img, mx - 45, my - 45, 90, 90)
    ctx.globalAlpha = 1
  }
}

// ────────────────────────────────────────────────────────────────────────────
const DrawingCanvas = forwardRef<CanvasHandle, Props>(
  ({ tool, color, brushSizeValue, ops, addOp, selectedSticker }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const offRef = useRef<HTMLCanvasElement | null>(null)

    // view state (refs — no re-renders needed)
    const panX = useRef(0)
    const panY = useRef(0)
    const scale = useRef(1)

    // draw state
    const isDrawing = useRef(false)
    const isPanning = useRef(false)
    const isPinching = useRef(false)
    const currentPath = useRef<{ x: number; y: number }[]>([])
    const activePointers = useRef(new Map<number, { x: number; y: number }>())
    const pinchState = useRef<{
      startDist: number; startScale: number
      startPanX: number; startPanY: number
      startMidX: number; startMidY: number
    } | null>(null)
    const panStart = useRef({ x: 0, y: 0, px: 0, py: 0 })

    // mouse position for sticker cursor
    const mousePos = useRef({ x: -999, y: -999 })

    // prop refs for stable event-handler access
    const toolRef = useRef(tool)
    const colorRef = useRef(color)
    const sizeRef = useRef(brushSizeValue)
    const selectedStickerRef = useRef(selectedSticker)
    const addOpRef = useRef(addOp)
    const isStickerDown = useRef(false)
    const lastStickerScreen = useRef({ x: 0, y: 0 })
    const opsRef = useRef(ops)
    const imgCache = useRef(new Map<string, HTMLImageElement>())
    const dirty = useRef(true)

    useEffect(() => { toolRef.current = tool; dirty.current = true }, [tool])
    useEffect(() => { colorRef.current = color }, [color])
    useEffect(() => { sizeRef.current = brushSizeValue }, [brushSizeValue])
    useEffect(() => { selectedStickerRef.current = selectedSticker; dirty.current = true }, [selectedSticker])
    useEffect(() => { addOpRef.current = addOp }, [addOp])

    useEffect(() => {
      opsRef.current = ops
      dirty.current = true
      for (const op of ops) {
        if (op.type === 'sticker' && !imgCache.current.has(op.url)) {
          preloadImage(op.url)
        }
      }
    }, [ops])

    // Preload sticker image
    useEffect(() => {
      if (selectedSticker && !imgCache.current.has(selectedSticker)) {
        preloadImage(selectedSticker)
      }
      dirty.current = true
    }, [selectedSticker])

    function preloadImage(url: string) {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => { dirty.current = true }
      img.src = url
      imgCache.current.set(url, img)
    }

    // Convert screen → world
    function toWorld(sx: number, sy: number) {
      const rect = canvasRef.current!.getBoundingClientRect()
      return {
        x: (sx - rect.left - panX.current) / scale.current,
        y: (sy - rect.top - panY.current) / scale.current,
      }
    }

    // ── render loop ──────────────────────────────────────────────────────────
    useEffect(() => {
      const canvas = canvasRef.current!
      const container = containerRef.current!
      offRef.current = document.createElement('canvas')

      const resize = () => {
        const { width, height } = container.getBoundingClientRect()
        canvas.width = width
        canvas.height = height
        offRef.current!.width = width
        offRef.current!.height = height
        dirty.current = true
      }

      const ro = new ResizeObserver(resize)
      ro.observe(container)
      resize()

      const mainCtx = canvas.getContext('2d')!
      const offCtx = offRef.current!.getContext('2d')!

      let rafId: number
      function render() {
        rafId = requestAnimationFrame(render)
        if (!dirty.current) return
        dirty.current = false

        const w = canvas.width
        const h = canvas.height
        const px = panX.current
        const py = panY.current
        const sc = scale.current

        // Background on main canvas
        drawBackground(mainCtx, w, h, px, py, sc)

        // Draw committed ops + current path on offscreen
        offCtx.clearRect(0, 0, w, h)
        offCtx.save()
        offCtx.setTransform(sc, 0, 0, sc, px, py)

        const view = { scale: sc, panX: px, panY: py }
        for (const op of opsRef.current) {
          renderOp(offCtx, op, imgCache.current, view)
        }

        // Current in-progress stroke
        if (isDrawing.current && currentPath.current.length >= 1) {
          renderOp(offCtx, {
            type: 'path',
            points: currentPath.current,
            color: colorRef.current,
            size: sizeRef.current,
            tool: toolRef.current,
          }, imgCache.current)
        }

        offCtx.restore()

        // Composite onto main
        mainCtx.drawImage(offRef.current!, 0, 0)

        // Sticker cursor overlay (in screen space)
        if (selectedStickerRef.current) {
          const img = imgCache.current.get(selectedStickerRef.current)
          drawStickerCursor(mainCtx, img, mousePos.current.x, mousePos.current.y)
        }
      }

      rafId = requestAnimationFrame(render)
      return () => { cancelAnimationFrame(rafId); ro.disconnect() }
    }, [])

    // ── pointer / wheel events ───────────────────────────────────────────────
    useEffect(() => {
      const canvas = canvasRef.current!

      function onPointerDown(e: PointerEvent) {
        e.preventDefault()
        canvas.setPointerCapture(e.pointerId)
        activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })

        if (activePointers.current.size >= 2) {
          // Cancel any in-progress drawing, start pinch
          if (isDrawing.current) {
            currentPath.current = []
            isDrawing.current = false
          }
          isPanning.current = false
          isPinching.current = true
          pinchState.current = null
          initPinchState()
          dirty.current = true
          return
        }

        // Place sticker
        if (selectedStickerRef.current) {
          const world = toWorld(e.clientX, e.clientY)
          const rotation = (Math.random() * 40 - 20) * (Math.PI / 180)
          addOpRef.current({ type: 'sticker', url: selectedStickerRef.current, x: world.x, y: world.y, rotation })
          isStickerDown.current = true
          lastStickerScreen.current = { x: e.clientX, y: e.clientY }
          return
        }

        // Pan tool or middle button
        if (toolRef.current === 'pan' || e.button === 1) {
          isPanning.current = true
          panStart.current = { x: e.clientX, y: e.clientY, px: panX.current, py: panY.current }
          return
        }

        // Draw
        const drawWorld = toWorld(e.clientX, e.clientY)
        isDrawing.current = true
        currentPath.current = [drawWorld]
        dirty.current = true
      }

      function onPointerMove(e: PointerEvent) {
        e.preventDefault()
        activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })

        // Update mouse pos for sticker cursor
        const rect = canvas.getBoundingClientRect()
        mousePos.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
        if (selectedStickerRef.current) dirty.current = true

        // Sticker trail while dragging
        if (isStickerDown.current && selectedStickerRef.current) {
          const dx = e.clientX - lastStickerScreen.current.x
          const dy = e.clientY - lastStickerScreen.current.y
          if (Math.hypot(dx, dy) >= 65) {
            const world = toWorld(e.clientX, e.clientY)
            const rotation = (Math.random() * 40 - 20) * (Math.PI / 180)
            addOpRef.current({ type: 'sticker', url: selectedStickerRef.current, x: world.x, y: world.y, rotation })
            lastStickerScreen.current = { x: e.clientX, y: e.clientY }
          }
        }

        if (isPinching.current && activePointers.current.size >= 2) {
          handlePinch()
          return
        }

        if (isPanning.current) {
          panX.current = panStart.current.px + (e.clientX - panStart.current.x)
          panY.current = panStart.current.py + (e.clientY - panStart.current.y)
          dirty.current = true
          return
        }

        if (isDrawing.current) {
          currentPath.current.push(toWorld(e.clientX, e.clientY))
          dirty.current = true
        }
      }

      function onPointerUp(e: PointerEvent) {
        activePointers.current.delete(e.pointerId)
        isStickerDown.current = false

        if (isDrawing.current && activePointers.current.size === 0) {
          if (currentPath.current.length >= 1) {
            addOpRef.current({
              type: 'path',
              points: [...currentPath.current],
              color: colorRef.current,
              size: sizeRef.current,
              tool: toolRef.current,
            })
          }
          currentPath.current = []
          isDrawing.current = false
          dirty.current = true
        }

        if (activePointers.current.size < 2) {
          isPinching.current = false
          pinchState.current = null
        }
        if (activePointers.current.size === 0) isPanning.current = false
      }

      function onWheel(e: WheelEvent) {
        e.preventDefault()
        const rect = canvas.getBoundingClientRect()
        const mx = e.clientX - rect.left
        const my = e.clientY - rect.top
        const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12
        const newScale = Math.max(0.08, Math.min(12, scale.current * factor))
        const wx = (mx - panX.current) / scale.current
        const wy = (my - panY.current) / scale.current
        scale.current = newScale
        panX.current = mx - wx * newScale
        panY.current = my - wy * newScale
        dirty.current = true
      }

      function initPinchState() {
        const pts = [...activePointers.current.values()]
        if (pts.length < 2) return
        const [p1, p2] = pts
        const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y)
        const midX = (p1.x + p2.x) / 2
        const midY = (p1.y + p2.y) / 2
        pinchState.current = {
          startDist: dist, startScale: scale.current,
          startPanX: panX.current, startPanY: panY.current,
          startMidX: midX, startMidY: midY,
        }
      }

      function handlePinch() {
        const pts = [...activePointers.current.values()]
        if (pts.length < 2) return
        const [p1, p2] = pts
        const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y)
        const midX = (p1.x + p2.x) / 2
        const midY = (p1.y + p2.y) / 2

        if (!pinchState.current) { initPinchState(); return }

        const { startDist, startScale, startPanX, startPanY, startMidX, startMidY } = pinchState.current
        const newScale = Math.max(0.08, Math.min(12, startScale * (dist / startDist)))
        const wx = (startMidX - startPanX) / startScale
        const wy = (startMidY - startPanY) / startScale
        scale.current = newScale
        panX.current = midX - wx * newScale
        panY.current = midY - wy * newScale
        dirty.current = true
      }

      canvas.addEventListener('pointerdown', onPointerDown, { passive: false })
      canvas.addEventListener('pointermove', onPointerMove, { passive: false })
      canvas.addEventListener('pointerup', onPointerUp)
      canvas.addEventListener('pointercancel', onPointerUp)
      canvas.addEventListener('wheel', onWheel, { passive: false })

      return () => {
        canvas.removeEventListener('pointerdown', onPointerDown)
        canvas.removeEventListener('pointermove', onPointerMove)
        canvas.removeEventListener('pointerup', onPointerUp)
        canvas.removeEventListener('pointercancel', onPointerUp)
        canvas.removeEventListener('wheel', onWheel)
      }
    }, [])

    // ── exposed handle ───────────────────────────────────────────────────────
    useImperativeHandle(ref, () => ({
      downloadImage() {
        const canvas = canvasRef.current!
        const a = document.createElement('a')
        a.download = `kiddraw-${Date.now()}.png`
        a.href = canvas.toDataURL('image/png')
        a.click()
      },
      toggleFullscreen() {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {})
        } else {
          document.exitFullscreen().catch(() => {})
        }
      },
    }))

    const cursor = selectedSticker
      ? 'none'
      : tool === 'pan' ? 'grab' : 'crosshair'

    return (
      <div
        ref={containerRef}
        style={{ flex: 1, position: 'relative', overflow: 'hidden', cursor, minWidth: 0 }}
      >
        <canvas
          ref={canvasRef}
          style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none' }}
        />
      </div>
    )
  },
)

DrawingCanvas.displayName = 'DrawingCanvas'
export default DrawingCanvas
