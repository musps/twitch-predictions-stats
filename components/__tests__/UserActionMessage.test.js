import { render, screen } from '@testing-library/react'
import UserActionMessage, {
  UserNotFound,
  UserError,
  UserLoading,
} from '../UserActionMessage'

test('renders UserActionMessage', async () => {
  const message = 'Hello world!'
  const view = render(<UserActionMessage message={message} />)

  screen.getByText(message)

  render(<UserNotFound />)
  render(<UserError />)
  render(<UserLoading />)
})
