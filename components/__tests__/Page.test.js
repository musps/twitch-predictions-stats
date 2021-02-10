import { render, fireEvent, screen, waitFor } from '@testing-library/react'
import Page, { FastLink } from '../Page'
import channel from './__mocks__/channel'

test('FastLink works as expected', async () => {
  const view = render(
    <FastLink
      href="/user/muporash"
      title="Go to page"
      count={null}
      current={false}
    />
  )

  fireEvent.click(screen.getByRole('link', { name: /Go to page/i }))

  const countSpan = view.container.querySelector('span')
  expect(countSpan).not.toBeInTheDocument()

  view.rerender(
    <FastLink
      href="/user/muporash"
      title="Go to page"
      count={10}
      current={false}
    />
  )

  expect(screen.getByText(/10/i)).toBeInTheDocument()
})

test('Page works as expected', async () => {
  const push = jest.fn()
  const useRouter = jest
    .spyOn(require('next/router'), 'useRouter')
    .mockImplementationOnce(() => ({ push }))

  const view = render(<Page title="Test page" />)

  const search = screen.getByRole('textbox', {
    name: /Search channel by name/i,
  })

  // Other key than `Enter` should not trigger searchUser
  fireEvent.keyDown(search, { key: 'A', code: 'A' })

  // Empty search should not trigger searchUser
  fireEvent.keyDown(search, { key: 'Enter', code: 'Enter' })
  expect(push).toHaveBeenCalledTimes(0)

  // On type name
  fireEvent.change(search, { target: { value: 'muporash' } })
  expect(search.value).toBe('muporash')

  // On Click submit
  fireEvent.keyDown(search, { key: 'Enter', code: 'Enter' })
  expect(push).toHaveBeenCalledWith('/user/muporash', undefined, {
    shallow: true,
  })
})
