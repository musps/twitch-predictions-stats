import { render, fireEvent, screen, act } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import Router from 'next/router'
import Channel, { GET_CHANNEL_QUERY, openPrediction } from '../Channel'
import channel from './__mocks__/channel.json'

const mockQueryResponse = (login, channelData) => [
  {
    request: {
      query: GET_CHANNEL_QUERY,
      variables: {
        login,
      },
    },
    result: {
      data: !channelData
        ? null
        : {
            channel: channelData,
          },
    },
  },
]

test('renders Channel', async () => {
  const login = 'LIRIK'
  const view = render(
    <MockedProvider
      mocks={mockQueryResponse(login, channel)}
      addTypename={false}>
      <Channel login={login} children={null} />
    </MockedProvider>
  )

  await act(() => new Promise((resolve) => setTimeout(resolve, 0)))
  screen.getByRole('heading', {
    name: new RegExp(login, 'i'),
  })

  fireEvent.click(screen.getByText(/Most won/i))
  fireEvent.click(screen.getByText(/Max pink ratio/i))
  fireEvent.click(screen.getByText(/Max blue ratio/i))
  fireEvent.click(screen.getByText(/View on Twitch/i))
})

test('renders Channel without stats', async () => {
  const login = 'LIRIK'
  const view = render(
    <MockedProvider
      mocks={mockQueryResponse(login, {
        ...channel,
        stats: null,
      })}
      addTypename={false}>
      <Channel login={login} children={null} />
    </MockedProvider>
  )

  await act(() => new Promise((resolve) => setTimeout(resolve, 0)))
  expect(
    screen.getByRole('heading', {
      name: new RegExp(login, 'i'),
    })
  )
})

test('renders Channel not found', async () => {
  const login = 'MUPORASH'
  const view = render(
    <MockedProvider mocks={mockQueryResponse(login, null)} addTypename={false}>
      <Channel login={login} children={null} />
    </MockedProvider>
  )

  await act(() => new Promise((resolve) => setTimeout(resolve, 0)))
  screen.getByText(/Channel not tracked/i)
})

jest.mock('next/router', () => ({
  router: {
    push: jest.fn(),
  },
}))

test('openPrediction', async () => {
  openPrediction('LIRIK', '8fbbc351-b9ac-4d9a-b6cb-66892765bf66')

  expect(
    Router.router.push
  ).toHaveBeenCalledWith(
    '/user/LIRIK/prediction/8fbbc351-b9ac-4d9a-b6cb-66892765bf66',
    undefined,
    { shallow: true }
  )
})
