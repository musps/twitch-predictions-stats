const IconExternalLink = () => (
  <span className="pl-1">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      className="w-4 h-4 text-gray-500"
      stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
      />
    </svg>
  </span>
)

const InformationCardRow = ({ title, value, description, onClick }) => (
  <div
    className="w-full flex flex-col px-4 py-2 hover:bg-gray-800 hover:bg-opacity-10 dark:hover:bg-gray-900 cursor-pointer"
    onClick={onClick}>
    <span className="inline-flex text-gray-400">
      {title} {onClick && <IconExternalLink />}
    </span>
    <span className="text-lg font-semibold">{value}</span>
    {description && <span className="text-sm">{description}</span>}
  </div>
)

export function InformationsCard({ data = [] }) {
  return (
    <div className="flex flex-col items-start py-2 transition-shadow border rounded-lg shadow-sm dark:border-gray-800 dark:bg-gray-800">
      {data.map((item) => (
        <InformationCardRow {...item} key={item.key} />
      ))}
    </div>
  )
}

export function InformationCard({ title, value }) {
  return (
    <a
      href="#"
      className="min-w-max p-4 transition-shadow border rounded-lg shadow-sm dark:border-gray-800 dark:bg-gray-800">
      <div className="flex items-start">
        <div className="flex flex-col flex-shrink-0 space-y-2">
          <span className="text-gray-400">{title}</span>
          <span className="text-lg font-semibold">{value}</span>
        </div>
      </div>
    </a>
  )
}
