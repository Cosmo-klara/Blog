export type ThemePreference = 'dark' | 'light'

export function getTheme(): ThemePreference | null {
  const theme = localStorage.getItem('theme')
  return theme === 'dark' || theme === 'light' ? theme : null
}

export function getSystemTheme(): ThemePreference {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => { finished: Promise<void> }
}

export function setTheme(
  theme?: ThemePreference,
  save = false,
  transitionOrigin?: HTMLElement
): ThemePreference {
  let selectedTheme = theme
  if (selectedTheme) {
    if (save) localStorage.setItem('theme', selectedTheme)
  } else if (save) {
    const currentTheme = getTheme() ?? getSystemTheme()
    selectedTheme = currentTheme === 'dark' ? 'light' : 'dark'
    localStorage.setItem('theme', selectedTheme)
  } else {
    selectedTheme = getTheme() ?? getSystemTheme()
  }

  const targetTheme = selectedTheme ?? getSystemTheme()
  const applyTheme = () => {
    document.documentElement.classList.toggle('dark', targetTheme === 'dark')
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', targetTheme === 'dark' ? '#16171D' : '#FCFCFD')
  }

  const transitionDocument = document as ViewTransitionDocument
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (transitionOrigin && transitionDocument.startViewTransition && !reduceMotion) {
    const bounds = transitionOrigin.getBoundingClientRect()
    const root = document.documentElement
    root.style.setProperty('--theme-transition-x', `${bounds.left + bounds.width / 2}px`)
    root.classList.add('theme-transitioning')
    transitionOrigin.dataset.themeMotion = targetTheme

    const cleanupTransition = () => {
      root.classList.remove('theme-transitioning')
      transitionOrigin.removeAttribute('data-theme-motion')
    }

    try {
      const transition = transitionDocument.startViewTransition(applyTheme)
      void transition.finished.then(
        cleanupTransition,
        cleanupTransition
      )
    } catch {
      cleanupTransition()
      applyTheme()
    }
  } else {
    applyTheme()
  }

  return targetTheme
}
