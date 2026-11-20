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

  function hide() {
    cancelAnimationFrame(frame)
    frame = 0
    light?.removeAttribute('data-visible')
  }

  const follow = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return hide()
    pointerX = event.clientX
    pointerY = event.clientY
    if (frame) return

    frame = requestAnimationFrame(() => {
      light.style.translate = `${pointerX}px ${pointerY}px`
      light.toggleAttribute('data-visible', true)
      frame = 0
    })
  }

  document.addEventListener('pointermove', follow, { passive: true })
  document.addEventListener('pointerdown', follow, { passive: true })
  document.documentElement.addEventListener('pointerleave', hide)
  window.addEventListener('blur', hide)
  window.addEventListener('pagehide', hide)
}
