import cs from 'classnames'

function TableTopPredictors({ color, colorName }) {
  return (
    <div className="flex w-full md:w-1/2">
      <div className="w-full border-b border-gray-200 dark:border-gray-900">
        <table className="min-w-full overflow-x-scroll divide-y divide-gray-200 dark:divide-gray-900">
          <caption className="text-lg font-bold text-gray-800 p-2 border-t dark:border-gray-900 dark:text-gray-200">
            {`Top 10 ${colorName} predictors`}
          </caption>
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th
                scope="col"
                className="w-1/2 px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                User
              </th>
              <th
                scope="col"
                className="w-1/2 px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Points
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:divide-gray-900 dark:border-gray-900">
            {color.topPredictors.map((predictor, index) => (
              <tr
                className={cs('transition-all dark:bg-gray-800', {
                  'bg-gray-100': Boolean(index % 2),
                })}
                key={index}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-gray-400">
                    {predictor.user.displayName}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-gray-400">
                    {predictor.points}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function ListeTopPredictors({ outcomes }) {
  const [blue, pink] = outcomes

  return (
    <div className="flex flex-grow divide-x dark:divide-gray-900 overflow-y-scroll">
      <TableTopPredictors color={blue} colorName="blue" />
      <TableTopPredictors color={pink} colorName="pink" />
    </div>
  )
}

export function DescriptionItem({ label, value }) {
  return (
    <div className="flex-none w-full mt-0.5 font-normal">
      <dt className="inline">{label}</dt> <dd className="inline">{value}</dd>
    </div>
  )
}
