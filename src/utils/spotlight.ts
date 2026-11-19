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
