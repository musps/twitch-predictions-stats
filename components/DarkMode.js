import { useState, useEffect } from 'react'

const THEME = {
  DARK: 'dark',
  LIGHT: 'light',
}

const setTheme = (enabled) => {
  if (enabled) {
    localStorage.setItem('theme', THEME.DARK)
    document.querySelector('html').classList.add(THEME.DARK)
  } else {
    localStorage.setItem('theme', THEME.LIGHT)
    document.querySelector('html').classList.remove(THEME.DARK)
  }
}

function DarkMode() {
  const [enabled, setEnabled] = useState(true)

  const toggle = () => {
    setEnabled(!enabled)
    setTheme(!enabled)
  }

  useEffect(() => {
    const theme = localStorage.getItem('theme') || THEME.DARK
    const nextTheme = theme === THEME.DARK

    setEnabled(nextTheme)
    setTheme(nextTheme)
  }, [])

  const mode = enabled ? THEME.DARK : THEME.LIGHT

  return (
    <div className="flex items-center space-x-4">
      <button title={`Toggle ${mode} mode`} type="button" onClick={toggle}>
        <svg
          className={`w-8 h-8 text-${enabled ? 'gray' : 'yellow'}-500`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor">
          <path
            fillRule="evenodd"
            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  )
}

export default DarkMode
