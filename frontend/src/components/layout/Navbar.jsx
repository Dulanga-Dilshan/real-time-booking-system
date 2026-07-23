import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import useAuthStore from '@/store/authStore'
import useThemeStore from '@/store/themeStore'
import { logout } from '@/api/auth'

const LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'si', label: 'සි' },
  { code: 'ta', label: 'த' },
]

function BusIcon() {
  return (
    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8M8 11h4m-6 8h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z"/>
    </svg>
  )
}

function SunIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"/>
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
    </svg>
  )
}

export default function Navbar() {
  const { t, i18n }       = useTranslation()
  const { user, clearAuth } = useAuthStore()
  const { isDark, toggleTheme } = useThemeStore()
  const navigate          = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const isAdmin    = user?.role === 'admin'
  const isBusStaff = user?.role === 'bus_staff'

  const handleLogout = async () => {
    try { await logout() } catch {}
    clearAuth()
    navigate('/')
    setMenuOpen(false)
  }

  const homeLink = isAdmin ? '/admin' : isBusStaff ? '/staff' : '/'

  return (
    <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link to={homeLink} className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <BusIcon />
          </div>
          <span className="font-bold text-slate-800 dark:text-white">BusBook</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1">
          {!isAdmin && !isBusStaff && (
            <>
              <Link to="/track" className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                {t('nav.track')}
              </Link>
              <Link to="/cancel-booking" className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                {t('nav.cancel_booking')}
              </Link>
            </>
          )}
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          {/* Language switcher */}
          <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => i18n.changeLanguage(lang.code)}
                className={`px-2 py-1 text-xs font-medium transition-colors ${
                  i18n.language === lang.code
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 transition-colors"
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>

          {/* Auth buttons desktop */}
          {user ? (
            <div className="hidden md:flex items-center gap-2">
              {!isAdmin && !isBusStaff && (
                <Link
                  to="/profile"
                  className="text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {user.name}
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="text-sm text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {t('common.logout')}
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="hidden md:inline-flex text-sm bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {t('nav.login_register')}
            </Link>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 space-y-1">
          {!isAdmin && !isBusStaff && (
            <>
              <Link to="/track" onClick={() => setMenuOpen(false)} className="block text-sm text-slate-600 dark:text-slate-300 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                {t('nav.track')}
              </Link>
              <Link to="/cancel-booking" onClick={() => setMenuOpen(false)} className="block text-sm text-slate-600 dark:text-slate-300 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                {t('nav.cancel_booking')}
              </Link>
            </>
          )}
          {user ? (
            <>
              {!isAdmin && !isBusStaff && (
                <Link to="/profile" onClick={() => setMenuOpen(false)} className="block text-sm text-slate-600 dark:text-slate-300 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                  {user.name}
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="w-full text-left text-sm text-red-500 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                {t('common.logout')}
              </button>
            </>
          ) : (
            <Link to="/auth" onClick={() => setMenuOpen(false)} className="block text-sm text-blue-600 font-medium px-3 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20">
              {t('nav.login_register')}
            </Link>
          )}
        </div>
      )}
    </nav>
  )
}