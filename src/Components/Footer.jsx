import React from 'react'
import { useTheme } from '../Context/Theme'

function Footer() {
  const { theme } = useTheme();

  return (
    <footer
      className={`ubuntu-regular${
        theme === "dark"
          ? "bg-gray-900 text-gray-300"
          : "bg-gray-100 text-gray-700"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-6">

        {/* Top row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <h2 className="font-semibold text-lg">
            SLA Monitor
          </h2>

          <div className="flex gap-4 text-sm">
            <a href="#" className="hover:underline">Privacy</a>
            <a href="#" className="hover:underline">Terms</a>
            <a href="#" className="hover:underline">Support</a>
          </div>
        </div>

        {/* Divider */}
        <div className="my-4 border-t border-gray-500/30"></div>

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs gap-2">
          <p>
            © {new Date().getFullYear()} SLA Monitor. All rights reserved.
          </p>

          <p className="opacity-70">
            Built with ❤️ & ☕ of india
          </p>
        </div>

      </div>
    </footer>
  )
}

export default Footer
