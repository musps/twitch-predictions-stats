import { render, screen, fireEvent } from '@testing-library/react'
import { InformationsCard, InformationCard } from '../InformationCards'

test('renders InformationsCard', async () => {
  const data = [
    {
      key: 'card',
      title: 'card1',
      value: 1000,
      description: 'card 1 description',
      onClick: jest.fn(),
    },
    {
      key: 'card2',
      title: 'card2',
      value: 1001,
      description: 'card 2 description',
    },
  ]

  const view = render(<InformationsCard data={data} />)

  fireEvent.click(screen.getByText(/card1/i))
  expect(data[0].onClick).toHaveBeenCalled()

  view.rerender(<InformationsCard />)
})

test('renders InformationCard', async () => {
  const data = {
    title: 'test card',
    value: 1000,
  }

  const view = render(<InformationCard {...data} />)
})
