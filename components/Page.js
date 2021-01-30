import Head from 'next/head'
import { useRouter } from 'next/router'
import cs from 'classnames'
import DarkMode from './DarkMode'

const FastLink = ({ href, title, count, current }) => (
  <li className="flex px-3 mx-1 text-center cursor-pointer last:mr-0 hover:bg-gray-200 dark:hover:bg-gray-800">
    <a
      href={href}
      className={cs(
        'flex items-center justify-center block px-2 py-2 text-xs font-semibold leading-normal tracking-wide border-b-2',
        {
          'border-blue-500': current,
          'border-transparent': !current,
        }
      )}>
      {title}
      {count && (
        <span className="flex items-center justify-center w-5 h-5 ml-1 text-xs text-white bg-blue-500 rounded-full">
          {count}
        </span>
      )}
    </a>
  </li>
)

function Page({ title, children }) {
  const router = useRouter()

  const searchUser = (event) => {
    if (event.key === 'Enter') {
      const { value } = document.querySelector(
        'input[name="search-twitch-account"]'
      )

      if (value) {
        router.push(`/user/${value}`, undefined, { shallow: true })
      }
    }
  }

  return (
    <div className="container mx-auto max-w-screen-xl min-h-screen flex flex-col">
      <Head>
        <title>Twitch Predictions Stats{title && `: ${title}`}</title>
      </Head>

      <header className="flex-shrink-0 border-b dark:border-gray-800">
        <div className="border-b shadow-bot dark:border-gray-800">
          <ul className="flex flex-row px-2 list-none select-none overflow-y-scroll">
            <FastLink title="Top winners" current={false} href="/top-winners" />
            <FastLink
              title="Top total predictions"
              current={false}
              href="/top-total-predictions"
            />
            <FastLink title="Channels" current={false} href="/channels" />
          </ul>
        </div>

        <div className="grid grid-cols-3 space-y-2 p-4 items-center">
          <a
            href="/"
            className="col-span-2 md:col-span-1 items-center text-black dark:text-white">
            Twitch Predictions Stats
          </a>

          <div className="col-span-3 md:col-span-1 order-3 md:order-none col-span-1 items-center space-x-2 flex-1 flex mr-auto md:ml-5 w-full">
            <div className="flex w-full">
              <div className="w-10 z-10 pl-1 text-center pointer-events-none flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-gray-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>

              <input
                type="text"
                onKeyDown={searchUser}
                className="w-full -ml-10 pl-10 pr-3 py-2 rounded-lg border-2 border-gray-200 outline-none focus:border-indigo-500 dark:bg-gray-800 dark:focus:bg-gray-900 dark:border-gray-800 dark:text-gray-200"
                name="search-twitch-account"
                aria-label="Search channel by name"
                placeholder="Search channel"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <DarkMode />
          </div>
        </div>
      </header>

      <main className="flex-1 max-h-full p-5">{children}</main>

      <footer className="mt-5 p-5 border-t flex flex-row justify-between dark:border-gray-800">
        <a
          className="text-gray-500"
          href="https://github.com/musps/twitch-predictions-stats"
          target="_blank">
          @github
        </a>
        <p className="text-gray-500">Twitch Predictions Stats © 2020</p>
      </footer>
    </div>
  )
}

export default Page
