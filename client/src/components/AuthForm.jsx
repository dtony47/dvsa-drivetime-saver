import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function AuthForm({ mode, onSubmit, error }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState('learner')
  const [validationError, setValidationError] = useState('')

  const isRegister = mode === 'register'

  const handleSubmit = (e) => {
    e.preventDefault()
    setValidationError('')

    if (!email || !password) {
      setValidationError('Please fill in all fields.')
      return
    }

    if (isRegister && password !== confirmPassword) {
      setValidationError('Passwords do not match.')
      return
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters.')
      return
    }

    onSubmit({ email, password, role })
  }

  const displayError = validationError || error

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {isRegister ? 'Create Your Account' : 'Welcome Back'}
            </h1>
            <p className="text-gray-500 mt-2">
              {isRegister
                ? 'Join DriveTime Saver and find your test slot faster'
                : 'Log in to manage your bookings and alerts'}
            </p>
          </div>

          {displayError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
              {displayError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-gray-900"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-gray-900"
                placeholder="At least 6 characters"
                required
              />
            </div>

            {isRegister && (
              <>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-gray-900"
                    placeholder="Re-enter your password"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    I am a...
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('learner')}
                      className={`py-3 px-4 rounded-lg border-2 font-medium transition-all ${
                        role === 'learner'
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      Learner Driver
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('instructor')}
                      className={`py-3 px-4 rounded-lg border-2 font-medium transition-all ${
                        role === 'instructor'
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      Instructor
                    </button>
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors focus:ring-4 focus:ring-blue-200"
            >
              {isRegister ? 'Create Account' : 'Log In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            {isRegister ? (
              <>Already have an account?{' '}<Link to="/login" className="text-blue-600 hover:underline font-medium">Log in</Link></>
            ) : (
              <>Don&apos;t have an account?{' '}<Link to="/register" className="text-blue-600 hover:underline font-medium">Register</Link></>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
