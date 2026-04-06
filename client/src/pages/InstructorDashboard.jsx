import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'

export default function InstructorDashboard() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, bookingsRes] = await Promise.allSettled([
          api.get('/instructors/profile'),
          api.get('/bookings')
        ])
        if (profileRes.status === 'fulfilled') setProfile(profileRes.value.data)
        if (bookingsRes.status === 'fulfilled') {
          const data = bookingsRes.value.data
          setBookings(Array.isArray(data) ? data : [])
        }
      } catch {
        // Dashboard still works if API is not running
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const profileFields = ['name', 'adiNumber', 'coverageAreas', 'hourlyRate', 'bio']
  const completedFields = profile
    ? profileFields.filter(f => profile[f] && (Array.isArray(profile[f]) ? profile[f].length > 0 : true)).length
    : 0
  const completionPct = Math.round((completedFields / profileFields.length) * 100)

  const upcomingBookings = bookings.filter(b => b.status !== 'cancelled')
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back{profile?.name ? `, ${profile.name}` : user?.email ? `, ${user.email.split('@')[0]}` : ''}!
        </h1>
        <p className="text-gray-500 mt-1">Manage your instructor profile and bookings.</p>
      </div>

      {/* Profile Completion */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Profile Completion</h2>
            <p className="text-sm text-gray-500">
              {completionPct === 100
                ? 'Your profile is complete! Learners can now find you.'
                : 'Complete your profile so learners can find and book you.'}
            </p>
          </div>
          <Link
            to="/instructor/profile"
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            Edit Profile
          </Link>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${
              completionPct === 100 ? 'bg-green-500' : 'bg-blue-600'
            }`}
            style={{ width: `${completionPct}%` }}
          />
        </div>
        <p className="text-sm text-gray-500 mt-2">{completionPct}% complete</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Bookings</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {loading ? '-' : bookings.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Confirmed</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {loading ? '-' : confirmedBookings.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Hourly Rate</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {profile?.hourlyRate ? `\u00A3${profile.hourlyRate}` : '-'}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Bookings */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Bookings</h2>
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : upcomingBookings.length > 0 ? (
          <div className="space-y-4">
            {upcomingBookings.map((booking) => (
              <Link
                key={booking.id}
                to={`/booking/${booking.id}`}
                className="block bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {booking.learnerEmail || 'Learner'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {booking.centreName || 'Test Centre'} &middot;{' '}
                      {new Date(booking.date).toLocaleDateString('en-GB', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short'
                      })}
                      {booking.time && ` at ${booking.time}`}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    booking.status === 'confirmed'
                      ? 'bg-green-50 text-green-700'
                      : 'bg-yellow-50 text-yellow-700'
                  }`}>
                    {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-500">No upcoming bookings yet.</p>
            <p className="text-sm text-gray-400 mt-1">Complete your profile to start receiving bookings.</p>
          </div>
        )}
      </div>
    </div>
  )
}
