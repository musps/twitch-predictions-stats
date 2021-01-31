import { render, fireEvent, screen } from '@testing-library/react'
import DarkMode, { THEME, LS_KEY } from '../DarkMode'

test('Dark mode themes', async () => {
  const view = render(<DarkMode />)

  // Should be dark mode
  expect(global.localStorage.getItem(LS_KEY)).toBe(THEME.DARK)

  // Should be light mode
  fireEvent.click(screen.getByRole('button'))
  expect(global.localStorage.getItem(LS_KEY)).toBe(THEME.LIGHT)

  view.debug()
})

test('Set current theme from localstorage', async () => {
  global.localStorage.setItem(LS_KEY, THEME.LIGHT)
  const view = render(<DarkMode />)

  expect(global.localStorage.getItem('theme')).toBe(THEME.LIGHT)
})