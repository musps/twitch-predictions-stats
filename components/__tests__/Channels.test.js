import { render, fireEvent, screen, act } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import Channels, { GET_CHANNELS_QUERY } from '../Channels'
import channels from './__mocks__/channels.json'

const mockQueryResponse = () => [
  {
    request: {
      query: GET_CHANNELS_QUERY,
      variables: {
        page: 1,
        limit: 5,
      },
    },
    result: {
      data: {
        channels: channels.response1,
      },
    },
  },
  {
    request: {
      query: GET_CHANNELS_QUERY,
      variables: {
        page: 2,
        limit: 5,
      },
    },
    result: {
      data: {
        channels: channels.response2,
      },
    },
  },
]

test('renders Channels with error', async () => {
  const response = [
    {
      request: {
        query: GET_CHANNELS_QUERY,
        variables: {
          page: 1,
          limit: 5,
        },
      },
      error: new Error('An error occurred'),
    },
  ]

  const view = render(
    <MockedProvider mocks={response} addTypename={false}>
      <Channels limit={5} />
    </MockedProvider>
  )

  // Initial render
  await act(() => new Promise((resolve) => setTimeout(resolve, 0)))
  expect(view.getByText(/Error!/i)).not.toBeNull()
})

test('renders Channels', async () => {
  const view = render(
    <MockedProvider mocks={mockQueryResponse()} addTypename={false}>
      <Channels limit={5} />
    </MockedProvider>
  )

  // Initial render
  await act(() => new Promise((resolve) => setTimeout(resolve, 0)))

  // Load more render
  fireEvent.click(screen.getByRole('button', { text: /Load more/i }))
  await act(() => new Promise((resolve) => setTimeout(resolve, 0)))

  // Max attempts. Can't load more
  expect(screen.queryByRole('button', { text: /Load more/i })).toBeNull()
  // view.debug()
})
