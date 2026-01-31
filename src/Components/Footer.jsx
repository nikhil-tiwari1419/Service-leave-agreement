import React from 'react'
import { useTheme } from '../Context/Theme'

function Footer() {
  const { theme } = useTheme();
  const Ulr = ["Privacy", "Terms", "Support"]

  return (
    <footer
      className={`ubuntu-regular ${theme === "dark"
        ? "bg-gray-950 text-gray-400"
        : "bg-gray-50 text-gray-600"
        } border-t ${theme === "dark" ? "border-gray-800" : "border-gray-200"
        }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Top Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h2 className={`text-lg font-semibold tracking-wide  ${theme === "dark"
            ? "bg-gray-950 text-gray-400"
            : "bg-gray-50 text-gray-600"
            }`}>
            <h1 className={`text-xl font-bold transition-colors ${theme === "dark" ? "text-white" : "text-gray-900"
              }`}>
              Griev<span className={`${theme === "dark"
                  ? "bg-gradient-to-br from-gray-200 to-purple-600 group-hover:shadow-lg group-hover:shadow-blue-500/50"
                  : "bg-gradient-to-br from-blue-400 to-green-400 group-hover:shadow-lg group-hover:shadow-blue-400/50"
                } bg-clip-text text-transparent`}>Ease</span>
            </h1>
          </h2>

          <nav className="flex gap-6 text-sm">
            {Ulr.map((item) => (
              <a
                key={item}
                href="#"
                className="hover:text-blue-500 transition-colors duration-200"
              >
                {item}
              </a>
            ))}
          </nav>
        </div>

        {/* Divider */}
        <div className="my-6 border-t border-gray-200 dark:border-gray-800" />

        {/* Bottom Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <p className="opacity-80">
            © {new Date().getFullYear()} SLA Monitor. All rights reserved.
          </p>

          <p className="opacity-70">
            Crafted with ❤️ in India
          </p>
        </div>

      </div>
    </footer>
  )
}

export default Footer

