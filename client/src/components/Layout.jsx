import { Link, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <nav className="bg-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xl font-bold tracking-tight">DriveTime Saver</span>
            </Link>

            {/* Nav Links */}
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/" className="hover:text-blue-100 transition-colors font-medium">
                Home
              </Link>
              <Link to="/centres" className="hover:text-blue-100 transition-colors font-medium">
                Find Centres
              </Link>

              {user ? (
                <>
                  <Link
                    to={user.role === 'instructor' ? '/instructor/dashboard' : '/learner/dashboard'}
                    className="hover:text-blue-100 transition-colors font-medium"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={logout}
                    className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-lg transition-colors font-medium"
                  >
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="hover:text-blue-100 transition-colors font-medium"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    className="bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors font-semibold"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <MobileMenu user={user} logout={logout} />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-white font-semibold text-lg mb-3">DriveTime Saver</h3>
              <p className="text-sm">
                Find driving test slots faster with our marketplace. Connect learners with
                instructors and available test centre appointments across the UK.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg mb-3">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/centres" className="hover:text-white transition-colors">Find Test Centres</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Create Account</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Log In</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg mb-3">Support</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Help Centre</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-700 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} DriveTime Saver. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function MobileMenu({ user, logout }) {
  return (
    <div className="md:hidden">
      <details className="relative">
        <summary className="list-none cursor-pointer p-2">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </summary>
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl z-50 py-2">
          <Link to="/" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Home</Link>
          <Link to="/centres" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Find Centres</Link>
          {user ? (
            <>
              <Link
                to={user.role === 'instructor' ? '/instructor/dashboard' : '/learner/dashboard'}
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                Dashboard
              </Link>
              <button
                onClick={logout}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Log In</Link>
              <Link to="/register" className="block px-4 py-2 text-blue-600 font-semibold hover:bg-gray-100">Register</Link>
            </>
          )}
        </div>
      </details>
    </div>
  )
}
