import React, { useState } from 'react'
import { useAuth } from '../Context/authContext'
import { Link, useNavigate } from 'react-router'
import { FiUser } from 'react-icons/fi'
import ThemeToggle from './ThemeToggle'
import { FiMenu, FiX } from 'react-icons/fi'
import { useTheme } from '../Context/ThemeContext'
import Logo from '../assets/Logo.svg'

export const Header = () => {
  const { isLoggedIn, profile, Logout } = useAuth()
  const { theme } = useTheme()
  const [isDropDownOpen, setIsDropDownOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)

  const navLinks = [
    { name: 'Check-in', path: 'visitor-form' },
    { name: 'Features', path: '#' },
    { name: 'Pricing', path: '#' },
    { name: 'Automation', path: '#' },
  ]

  return (
    <header
      className={`w-full border-b px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between ${
        isDark ? 'bg-[#141414] border-b-[#262626]' : 'bg-white border-b-gray-200'
      }`}
    >
      {/* Left: Logo */}
      <div className="flex items-center space-x-2">
        <Link to="/" className="flex items-center">
          <img
            className="h-8 w-auto"
            src={Logo}
            alt="Logo"
          />
          <span className={`ml-2 text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            VisitTrack 
          </span>
        </Link>
      </div>

      {/* Center: Desktop Navigation */}
      <nav className="hidden lg:flex space-x-6">
        {navLinks.map(link => (
          <Link
            key={link.name}
            to={link.path}
            className={`text-sm font-medium ${
              isDark ? 'text-white hover:text-gray-400' : 'text-gray-900 hover:text-gray-500'
            }`}
          >
            {link.name}
          </Link>
        ))}
      </nav>

      {/* Right: Theme + Auth */}
      <div className="flex items-center space-x-4">
        <ThemeToggle />

        {/* Auth */}
        {isLoggedIn ? (
          <div className="relative">
            <button
              onClick={() => setIsDropDownOpen(prev => !prev)}
              className="w-8 h-8 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
            >
              {profile?.avator_url ? (
                <img
                  src={profile.avator_url}
                  alt="Avatar"
                  className="w-8 h-8 object-cover border border-gray-200 rounded-full"
                />
              ) : (
                <FiUser className="w-8 h-8" />
              )}
            </button>

            {isDropDownOpen && (
              <div
                className={`absolute right-0 mt-2 w-48 rounded-md shadow z-10 ${
                  isDark ? 'bg-[#1f1f1f] border border-[#333]' : 'bg-white border border-gray-200'
                }`}
              >
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-[#2a2a2a]"
                >
                  Your Profile
                </Link>
                <Link
                  to="/dashboard"
                  className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-[#2a2a2a]"
                >
                  Dashboard
                </Link>
                <button
                  onClick={Logout}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-[#2a2a2a]"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="hidden sm:flex items-center space-x-2">
            <Link
              to="/login"
              className="px-4 py-2 text-sm text-white bg-orange-600 rounded-md hover:bg-orange-700"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 text-sm text-orange-600 border border-orange-600 bg-white rounded-md hover:bg-orange-50"
            >
              Sign Up
            </Link>
          </div>
        )}

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`lg:hidden text-xl  focus:outline-none ${isDark ? 'text-white' : 'text-gray-800'}`}
        >
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div
          className={`absolute top-16 inset-x-0 z-20 lg:hidden shadow-md ${
            isDark ? 'bg-[#141414] border-t border-[#262626]' : 'bg-white border-t border-gray-200'
          }`}
        >
          <nav className="flex flex-col px-4 py-6 space-y-4">
            {navLinks.map(link => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMenuOpen(false)}
                className={`text-sm ${
                  isDark ? 'text-white hover:text-gray-300' : 'text-gray-800 hover:text-gray-600'
                }`}
              >
                {link.name}
              </Link>
            ))}
            {!isLoggedIn ? (
              <>
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="text-sm text-orange-600"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMenuOpen(false)}
                  className="text-sm text-orange-600"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="text-sm"
                >
                  Your Profile
                </Link>
                <Link
                  to="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="text-sm"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    Logout()
                    setMenuOpen(false)
                  }}
                  className="text-sm text-left text-red-500"
                >
                  Sign Out
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
