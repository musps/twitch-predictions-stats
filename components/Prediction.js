import { Fragment, useState } from 'react'
import cs from 'classnames'
import Link from 'next/link'
import { useRouter } from 'next/router'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { formatNumber, sumOutcomes } from 'lib/helpers'
import UserActionMessage from './UserActionMessage'
import { ListeTopPredictors, DescriptionItem } from './DataList'

dayjs.extend(relativeTime)

const IconBadgeCheck = () => (
  <span>
    <svg
      className="mx-1 w-4 h-4 text-gray-500 dark:text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
      />
    </svg>
  </span>
)

function NodeDescription({
  dir = 'left',
  color,
  totalPoints = 0,
  ratio = 0,
  totalUsers = 0,
  maxPoints = 0,
}) {
  return (
    <div className="flex flex-grow flex-col">
      <div
        className={cs(`flex items-center justify-end`, {
          'flex-row-reverse': dir === 'left',
          'flex-row': dir === 'right',
        })}>
        <span className="text-gray-400 text-sm">
          {formatNumber(totalPoints)}
        </span>
        <span>
          <svg
            className={cs(`w-4 h-4 text-gray-500`, {
              [`text-${color}-800`]: color,

              'pr-1': dir === 'left',
              'pl-1': dir === 'right',
            })}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </span>
      </div>
      <div
        className={cs(`flex items-center justify-end`, {
          'flex-row-reverse': dir === 'left',
          'flex-row': dir === 'right',
        })}>
        <span className="text-gray-400 text-sm">1:{ratio}</span>
        <span>
          <svg
            className={cs(`w-4 h-4 text-gray-500`, {
              [`text-${color}-800`]: color,

              'pr-1': dir === 'left',
              'pl-1': dir === 'right',
            })}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
            />
          </svg>
        </span>
      </div>
      <div
        className={cs(`flex items-center justify-end`, {
          'flex-row-reverse': dir === 'left',
          'flex-row': dir === 'right',
        })}>
        <span className="text-gray-400 text-sm">{totalUsers}</span>
        <span>
          <svg
            className={cs(`w-4 h-4 text-gray-500`, {
              [`text-${color}-800`]: color,
              'pr-1': dir === 'left',
              'pl-1': dir === 'right',
            })}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </span>
      </div>
      <div
        className={cs(`flex items-center justify-end`, {
          'flex-row-reverse': dir === 'left',
          'flex-row': dir === 'right',
        })}>
        <span className="text-gray-400 text-sm">{formatNumber(maxPoints)}</span>
        <span>
          <svg
            className={cs(`w-4 h-4 text-gray-500`, {
              [`text-${color}-800`]: color,
              'pr-1': dir === 'left',
              'pl-1': dir === 'right',
            })}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </span>
      </div>
    </div>
  )
}

const leftColor = 'blue'
const rightColor = 'pink'

function ToggleButton({ open, onClick }) {
  const IconChevronDown = (
    <svg
      className="w-4 h-4 text-gray-500"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  )

  const IconChevronUp = (
    <svg
      className="w-4 h-4 text-gray-500"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 15l7-7 7 7"
      />
    </svg>
  )

  return (
    <button
      onClick={onClick}
      title={`${open ? 'Close' : 'Open'} prediction detail`}
      className="inline-flex items-center justify-center px-4 py-1 space-x-1 bg-gray-200 rounded-tr-lg hover:bg-opacity-20 dark:bg-gray-800">
      {open ? IconChevronUp : IconChevronDown}
    </button>
  )
}

function PredictionNode({ node, fullMode = false }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const outcomes = sumOutcomes(node.outcomes)
  const pushToPredictionDetails = () => {
    const { login } = router.query

    router.push(`/user/${login}/prediction/${node.id}`, undefined, {
      shallow: true,
    })
  }

  const isOpen = fullMode || open
  const { createdBy, endedBy, lockedBy, game } = node

  return (
    <div className="bg-white my-4 border dark:border-gray-800 rounded-lg transition-shadow shadow-sm hover:shadow-lg dark:bg-gray-800">
      <div className="flex shadow rounded-t-lg">
        <h2 className="leading-5 flex flex-col flex-grow p-3 bg-gray-100 text-lg font-bold rounded-tl-lg cursor-pointer dark:bg-gray-800">
          {node.title}
          {game && (
            <span className="pt-1 text-xs font-medium">{game.name}</span>
          )}
          <span className="text-xs font-medium">
            {dayjs(node.createdAt).fromNow()}
          </span>
        </h2>

        {!fullMode && (
          <ToggleButton
            open={isOpen}
            onClick={() => (fullMode ? null : setOpen(!open))}
          />
        )}
      </div>
      <div className="flex pb-2">
        <div className="flex flex-grow w-1/2 flex-col">
          <div className="flex flex-row-reverse h-2">
            <div
              className={`h-2 rounded-bl bg-${leftColor}-800`}
              style={{
                width: `${outcomes.blue.percentage}%`,
              }}
            />
          </div>

          <div className="flex flex-grow flex-row px-2">
            <NodeDescription
              color={leftColor}
              totalPoints={outcomes.blue.totalPoints}
              ratio={outcomes.blue.ratio}
              totalUsers={outcomes.blue.totalUsers}
              maxPoints={outcomes.blue.maxPoints}
            />
            <div className="flex flex-grow flex-col items-end">
              <span
                className={`flex items-center lowercase text-${leftColor}-800 leading-5 pt-1`}>
                {outcomes.blue.winner && <IconBadgeCheck />}
                {outcomes.blue.title}
              </span>
              <span className={`font-bold text-xl text-${leftColor}-800`}>
                {outcomes.blue.percentage}%
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-grow w-1/2 flex-col">
          <div className="h-2">
            <div
              className={`h-2 rounded-br bg-${rightColor}-800`}
              style={{
                width: `${outcomes.pink.percentage}%`,
              }}
            />
          </div>

          <div className="flex flex-grow flex-row px-2">
            <div className="flex flex-grow flex-col">
              <span
                className={`flex items-center lowercase text-${rightColor}-800 leading-5 pt-1`}>
                {outcomes.pink.title}
                {outcomes.pink.winner && <IconBadgeCheck />}
              </span>
              <span className={`font-bold text-xl text-${rightColor}-800`}>
                {outcomes.pink.percentage}%
              </span>
            </div>
            <NodeDescription
              dir="right"
              color={rightColor}
              totalPoints={outcomes.pink.totalPoints}
              ratio={outcomes.pink.ratio}
              totalUsers={outcomes.pink.totalUsers}
              maxPoints={outcomes.pink.maxPoints}
            />
          </div>
        </div>
      </div>

      <div
        className={cs(
          'flex flex-col border-t dark:border-gray-900 transform transition-all duration-150 ease-out',
          {
            'scale-0': !isOpen,
            'scale-100': isOpen,
          }
        )}>
        {isOpen && (
          <Fragment>
            <div className="p-3">
              <DescriptionItem
                label="Created at"
                value={dayjs(node.createdAt).format('MMMM D YYYY, h:mm')}
              />

              {createdBy.id && (
                <DescriptionItem
                  label="Created by"
                  value={createdBy.displayName}
                />
              )}

              {endedBy.id && (
                <DescriptionItem label="Ended by" value={endedBy.displayName} />
              )}

              {lockedBy.id && (
                <DescriptionItem
                  label="Locked by"
                  value={lockedBy.displayName}
                />
              )}
            </div>

            <div className="flex flex-grow overflow-hidden overflow-y-scroll">
              <ListeTopPredictors outcomes={node.outcomes} />
            </div>

            {!fullMode && (
              <div className="flex justify-end p-4">
                <button
                  type="button"
                  onClick={() => pushToPredictionDetails()}
                  className="inline-flex items-center justify-center px-4 py-1 space-x-1 bg-gray-200 rounded-md shadow hover:bg-opacity-20 dark:bg-gray-900">
                  <span>Open in new page</span>
                </button>
              </div>
            )}
          </Fragment>
        )}
      </div>
    </div>
  )
}

export function PredictionNodes({ nodes = [], fullMode = false }) {
  return (
    <div>
      {nodes.map((node) => (
        <PredictionNode key={node.id} node={node} fullMode={fullMode} />
      ))}

      {!nodes.length && (
        <UserActionMessage message="No predictions available" />
      )}
    </div>
  )
}

export default PredictionNode
