import { render, fireEvent, screen } from '@testing-library/react'
import { ListeTopPredictors, DescriptionItem } from '../DataList'
import channel from './__mocks__/channel'

test('DataList::ListeTopPredictors', async () => {
  const predictions = channel.stats.mostWonEvent
  const view = render(<ListeTopPredictors outcomes={predictions.outcomes} />)

  screen.getByText(/Top 10 blue predictors/i)
  screen.getByText(/Top 10 pink predictors/i)
  screen.getByText(/Undefined user/i)
})

test('DataList::DescriptionItem', async () => {
  const view = render(<DescriptionItem label="label" value="value" />)

  expect(view.container.textContent).toEqual('label value')
})
