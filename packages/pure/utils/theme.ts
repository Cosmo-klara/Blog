export type ThemePreference = 'dark' | 'light'

let systemThemeListenerRegistered = false

export function getTheme(): ThemePreference | null {
  const theme = localStorage.getItem('theme')
  return theme === 'dark' || theme === 'light' ? theme : null
}

export function getSystemTheme(): ThemePreference {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function listenThemeChange(theme: ThemePreference | null = getTheme()) {
  // Follow the system until the user picks a theme.
  if (theme) return
  if (systemThemeListenerRegistered) return

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQuery.addEventListener('change', () => {
    if (!getTheme()) {
      const theme = getSystemTheme()
      setTheme(theme)
      document.querySelector('#toggleDarkMode')?.setAttribute('data-theme', theme)
    }
  })
  systemThemeListenerRegistered = true
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

    try {
      const transition = transitionDocument.startViewTransition(applyTheme)
      void transition.finished.then(
        () => root.classList.remove('theme-transitioning'),
        () => root.classList.remove('theme-transitioning')
      )
    } catch {
      root.classList.remove('theme-transitioning')
      applyTheme()
    }
  } else {
    applyTheme()
  }

  return targetTheme
}
