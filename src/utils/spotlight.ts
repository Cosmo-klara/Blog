export function setupSpotlights(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>('[data-spotlight]:not([data-spotlight-ready])').forEach((card) => {
    card.dataset.spotlightReady = 'true'
    card.addEventListener('pointermove', (event) => {
      const bounds = card.getBoundingClientRect()
      const x = ((event.clientX - bounds.left) / bounds.width) * 100
      const y = ((event.clientY - bounds.top) / bounds.height) * 100
      card.style.setProperty('--spotlight-x', `${x}%`)
      card.style.setProperty('--spotlight-y', `${y}%`)
    })
  })
}
export function setupNightSpotlight() {
  const light = document.getElementById('night-cursor-light')
  if (!light) return

  let frame = 0
  let pointerX = 0
  let pointerY = 0
  let lightX = 0
  let lightY = 0
  let lastFrameTime = 0

  function hide() {
    cancelAnimationFrame(frame)
    frame = 0
    lastFrameTime = 0
    light?.removeAttribute('data-visible')
  }

  const animate = (now: number) => {
    frame = 0
    const elapsed = lastFrameTime ? now - lastFrameTime : 1000 / 60
    lastFrameTime = now
    const follow = 1 - Math.exp(-elapsed / 80)
    lightX += (pointerX - lightX) * follow
    lightY += (pointerY - lightY) * follow

    const distance = Math.hypot(pointerX - lightX, pointerY - lightY)
    if (distance < 0.35) {
      lightX = pointerX
      lightY = pointerY
      lastFrameTime = 0
    }
    light.style.translate = `${lightX}px ${lightY}px`
    if (distance >= 0.35) frame = requestAnimationFrame(animate)
  }

  const follow = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return hide()
    pointerX = event.clientX
    pointerY = event.clientY
    if (!light.hasAttribute('data-visible')) {
      lightX = pointerX
      lightY = pointerY
      light.style.translate = `${lightX}px ${lightY}px`
      light.setAttribute('data-visible', '')
      return
    }
    if (!frame) frame = requestAnimationFrame(animate)
  }

  document.addEventListener('pointermove', follow, { passive: true })
  document.addEventListener('pointerdown', follow, { passive: true })
  document.documentElement.addEventListener('pointerleave', hide)
  window.addEventListener('blur', hide)
  window.addEventListener('pagehide', hide)
}

export function setupPointerStar() {
  const star = document.getElementById('pointer-star')
  if (!star) return

  const finePointer = window.matchMedia('(any-hover: hover) and (any-pointer: fine) and (forced-colors: none)')
  if (!finePointer.matches) return

  document.documentElement.classList.add('has-pointer-star')
  let burstTimer = 0
  let frame = 0
  let pointerX = 0
  let pointerY = 0

  const move = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') {
      star.removeAttribute('data-visible')
      return
    }
    pointerX = event.clientX
    pointerY = event.clientY
    star.setAttribute('data-visible', '')
    if (frame) return
    frame = requestAnimationFrame(() => {
      star.style.translate = `${pointerX}px ${pointerY}px`
      frame = 0
    })
  }

  const burst = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return
    move(event)
    star.removeAttribute('data-burst')
    requestAnimationFrame(() => star.setAttribute('data-burst', ''))
    window.clearTimeout(burstTimer)
    burstTimer = window.setTimeout(() => star.removeAttribute('data-burst'), 540)
  }

  document.addEventListener('pointermove', move, { passive: true })
  document.addEventListener('pointerdown', burst, { passive: true })
  document.documentElement.addEventListener('pointerleave', () => star.removeAttribute('data-visible'))
  window.addEventListener('blur', () => star.removeAttribute('data-visible'))
}
