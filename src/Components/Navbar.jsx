import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useTheme } from "../Context/Theme";
import { Menu, X, Moon, Sun, Sparkles } from "lucide-react";
import { useClerk, UserButton, useUser } from "@clerk/clerk-react";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const { user } = useUser();
  const { openSignIn } = useClerk();

  return (
    <nav
      className={`ubuntu-regular w-full fixed top-0 z-50 backdrop-blur-md transition-all duration-300
        ${theme === "dark"
          ? "bg-slate-900/95 text-white border-b border-gray-700"
          : "bg-white/95 text-black border-b border-gray-200"}
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2 group">
            <div className={`p-2 rounded-lg transition-all duration-300 ${theme === "dark"
                ? "bg-gradient-to-br from-gray-200 to-purple-600 group-hover:shadow-lg group-hover:shadow-blue-500/50"
                : "bg-gradient-to-br from-blue-400 to-green-400 group-hover:shadow-lg group-hover:shadow-blue-400/50"
              }`}>
              <Sparkles className="text-white" size={20} />
            </div>
            <h1 className={`text-xl font-bold transition-colors ${theme === "dark" ? "text-white" : "text-gray-900"
              }`}>
              Griev<span className={`${theme === "dark"
                  ? "bg-gradient-to-br from-gray-200 to-purple-600 group-hover:shadow-lg group-hover:shadow-blue-500/50"
                  : "bg-gradient-to-br from-blue-400 to-green-400 group-hover:shadow-lg group-hover:shadow-blue-400/50"
                } bg-clip-text text-transparent`}>Ease</span>
            </h1>
          </NavLink>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <ul className="flex gap-1 items-center">
              <NavItem to="/" label="Home" theme={theme} />
              <NavItem to="/dashboard" label="Dashboard" theme={theme} />
              <NavItem to="/review" label="Review" theme={theme} /> 
              <NavItem to="/contact" label="Contact" theme={theme} />
            </ul>

            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-all duration-300 ${theme === "dark"
                    ? "hover:bg-gray-700 text-gray-300 hover:text-white"
                    : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
                  }`}
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {/* Login / User */}
              {!user ? (
                <button
                  onClick={openSignIn}
                  className={`px-5 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${theme === "dark"
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg shadow-blue-500/30"
                      : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg shadow-blue-500/30"
                    }`}
                >
                  Login
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: "w-9 h-9 ring-2 ring-offset-2 ring-blue-500"
                      }
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Mobile Hamburger */}
          <button
            className={`md:hidden p-2 rounded-lg transition-colors ${theme === "dark"
                ? "hover:bg-gray-700 text-gray-300"
                : "hover:bg-gray-100 text-gray-600"
              }`}
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
      >
        <div
          className={`px-4 py-4 space-y-3 border-t ${theme === "dark"
              ? "bg-slate-800/95 border-gray-700"
              : "bg-gray-50/95 border-gray-200"
            }`}
        >
          <ul className="space-y-2">
            <MobileNavItem to="/" label="Home" theme={theme} onClick={() => setIsOpen(false)} />
            <MobileNavItem to="/dashboard" label="Dashboard" theme={theme} onClick={() => setIsOpen(false)} />
            <MobileNavItem to="/review" label="Review" theme={theme} onClick={() => setIsOpen(false)} />
            <MobileNavItem to="/contact" label="Contact" theme={theme} onClick={() => setIsOpen(false)} />
          </ul>

          <div className={`pt-3 space-y-3 border-t ${theme === "dark" ? "border-gray-700" : "border-gray-200"
            }`}>
            {/* Login / User (Mobile) */}
            {!user ? (
              <button
                onClick={() => {
                  openSignIn();
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2.5 rounded-lg font-medium transition-all ${theme === "dark"
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                    : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                  }`}
              >
                Login
              </button>
            ) : (
              <div className="flex items-center gap-3 px-2">
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "w-10 h-10"
                    }
                  }}
                />
                <span className={`text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}>
                  {user.firstName || "Account"}
                </span>
              </div>
            )}

            {/* Theme Toggle (Mobile) */}
            <button
              onClick={() => {
                toggleTheme();
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${theme === "dark"
                  ? "hover:bg-gray-700 text-gray-300"
                  : "hover:bg-gray-200 text-gray-700"
                }`}
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
              <span className="font-medium">
                {theme === "dark" ? "Light Mode" : "Dark Mode"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

const NavItem = ({ to, label, theme }) => (
  <li>
    <NavLink
      to={to}
      className={({ isActive }) =>
        `px-4 py-2 rounded-lg font-medium transition-all duration-200 block ${isActive
          ? theme === "dark"
            ? "bg-gray-700 text-white"
            : "bg-gray-100 text-gray-900"
          : theme === "dark"
            ? "text-gray-300 hover:bg-gray-700 hover:text-white"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        }`
      }
    >
      {label}
    </NavLink>
  </li>
);

const MobileNavItem = ({ to, label, onClick, theme }) => (
  <li>
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center px-4 py-3 rounded-lg font-medium transition-all duration-200 ${isActive
          ? theme === "dark"
            ? "bg-gradient-to-r from-blue-500/20 to-purple-600/20 text-white border-l-4 border-blue-500"
            : "bg-gradient-to-r from-blue-500/10 to-purple-600/10 text-gray-900 border-l-4 border-blue-500"
          : theme === "dark"
            ? "text-gray-300 hover:bg-gray-700 hover:text-white"
            : "text-gray-600 hover:bg-gray-200 hover:text-gray-900"
        }`
      }
    >
      {label}
    </NavLink>
  </li>
);

export default Navbar;