import { Link } from 'react-router-dom'

const Breadcrumb = ({ links }) => {
  return (
    <nav className="w-full overflow-hidden" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1 md:space-x-2 w-full overflow-hidden">
        {links?.map((link, index) => (
          <li
            key={index}
            className="flex items-center min-w-0 max-w-[140px]"
          >
            <Link
              to={link?.path}
              className="block text-xs md:text-sm font-medium text-gray-500 hover:text-black truncate overflow-hidden whitespace-nowrap min-w-0"
              title={link?.title}
            >
              {link?.title}
            </Link>

            {(links.length - 1) !== index && (
              <svg
                className="w-3 h-3 text-gray-400 mx-1 flex-shrink-0"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 6 10"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 9 4-4-4-4"
                />
              </svg>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export default Breadcrumb
