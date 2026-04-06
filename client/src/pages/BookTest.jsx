import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import api from '../lib/api'
import BookingFlow from '../components/BookingFlow'

const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00'
]

export default function BookTest() {
  const location = useLocation()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)

  // Step 1: Centre selection
  const [centres, setCentres] = useState([])
  const [centresLoading, setCentresLoading] = useState(true)
  const [selectedCentre, setSelectedCentre] = useState(location.state?.centre || null)
  const [searchPostcode, setSearchPostcode] = useState('')
  const [searchRadius, setSearchRadius] = useState('25')

  // Step 2: Date/time
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')

  // Step 3: Confirm
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [bookingResult, setBookingResult] = useState(null)

  useEffect(() => {
    if (selectedCentre) {
      setCentresLoading(false)
      setStep(2)
    } else {
      fetchCentres()
    }
  }, [])

  const fetchCentres = async (postcode, radius) => {
    setCentresLoading(true)
    try {
      const params = {}
      if (postcode) {
        params.postcode = postcode
        params.radius = radius || '25'
      }
      const res = await api.get('/centres/search', { params })
      setCentres(Array.isArray(res.data) ? res.data : [])
    } catch {
      setCentres([])
    } finally {
      setCentresLoading(false)
    }
  }

  const handleCentreSearch = (e) => {
    e.preventDefault()
    if (searchPostcode.trim()) {
      fetchCentres(searchPostcode.trim(), searchRadius)
    }
  }

  const handleSelectCentre = (centre) => {
    setSelectedCentre(centre)
    setStep(2)
    setError('')
  }

  const handleSelectSlot = () => {
    if (!selectedDate) {
      setError('Please select a date.')
      return
    }
    if (!selectedTime) {
      setError('Please select a time.')
      return
    }
    setError('')
    setStep(3)
  }

  const handleConfirmBooking = async () => {
    setSubmitting(true)
    setError('')
    try {
      const res = await api.post('/bookings', {
        centre_id: selectedCentre.id,
        slot_date: selectedDate,
        slot_time: selectedTime,
      })
      setBookingResult(res.data)
      setStep(4)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create booking. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Generate available dates (next 28 days, excluding Sundays)
  const availableDates = []
  const now = new Date()
  for (let d = 1; d <= 28; d++) {
    const date = new Date(now)
    date.setDate(date.getDate() + d)
    if (date.getDay() !== 0) {
      availableDates.push(date.toISOString().split('T')[0])
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Book a Driving Test</h1>
        <p className="text-gray-500 mt-1">Select a centre, date, and time for your test.</p>
      </div>

      <BookingFlow currentStep={step} />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      {/* Step 1: Select Centre */}
      {step === 1 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Test Centre</h2>

          <form onSubmit={handleCentreSearch} className="flex gap-3 mb-6">
            <input
              type="text"
              value={searchPostcode}
              onChange={(e) => setSearchPostcode(e.target.value.toUpperCase())}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 uppercase"
              placeholder="Search by postcode..."
            />
            <select
              value={searchRadius}
              onChange={(e) => setSearchRadius(e.target.value)}
              className="px-3 py-2.5 border border-gray-300 rounded-lg text-gray-900 bg-white"
            >
              <option value="10">10 mi</option>
              <option value="25">25 mi</option>
              <option value="50">50 mi</option>
            </select>
            <button
              type="submit"
              className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
          </form>

          {centresLoading ? (
            <div className="py-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-400 mt-3">Loading centres...</p>
            </div>
          ) : centres.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {centres.map((centre) => (
                <button
                  key={centre.id}
                  onClick={() => handleSelectCentre(centre)}
                  className="w-full text-left p-4 rounded-lg border-2 border-gray-100 hover:border-blue-300 hover:bg-blue-50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{centre.name}</p>
                      <p className="text-sm text-gray-500">{centre.address || centre.postcode}</p>
                    </div>
                    {centre.distance !== undefined && (
                      <span className="text-sm text-blue-600 font-medium shrink-0 ml-3">
                        {centre.distance} mi
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-6">
              {searchPostcode ? 'No centres found. Try a different postcode or wider radius.' : 'Enter a postcode to find nearby centres.'}
            </p>
          )}
        </div>
      )}

      {/* Step 2: Select Date & Time */}
      {step === 2 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Select Date & Time</h2>
              <p className="text-sm text-gray-500 mt-1">
                {selectedCentre?.name} &middot; {selectedCentre?.postcode}
              </p>
            </div>
            <button
              onClick={() => { setStep(1); setSelectedCentre(null) }}
              className="text-sm text-blue-600 hover:underline font-medium"
            >
              Change centre
            </button>
          </div>

          {/* Date picker */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-48 overflow-y-auto">
              {availableDates.map((date) => {
                const d = new Date(date + 'T00:00:00')
                const dayName = d.toLocaleDateString('en-GB', { weekday: 'short' })
                const dayNum = d.getDate()
                const month = d.toLocaleDateString('en-GB', { month: 'short' })
                return (
                  <button
                    key={date}
                    type="button"
                    onClick={() => setSelectedDate(date)}
                    className={`py-3 px-2 rounded-lg border-2 text-center transition-all ${
                      selectedDate === date
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-100 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-xs font-medium">{dayName}</div>
                    <div className="text-lg font-bold">{dayNum}</div>
                    <div className="text-xs">{month}</div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Time picker */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {TIME_SLOTS.map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setSelectedTime(time)}
                  className={`py-2.5 px-3 rounded-lg border-2 text-sm font-medium transition-all ${
                    selectedTime === time
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-100 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSelectSlot}
            disabled={!selectedDate || !selectedTime}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 3 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Confirm Your Booking</h2>

          <div className="space-y-4 mb-8">
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-gray-500">Test Centre</span>
              <span className="font-medium text-gray-900">{selectedCentre?.name}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-gray-500">Address</span>
              <span className="font-medium text-gray-900 text-right">{selectedCentre?.address || selectedCentre?.postcode}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-gray-500">Date</span>
              <span className="font-medium text-gray-900">
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-GB', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-gray-500">Time</span>
              <span className="font-medium text-gray-900">{selectedTime}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleConfirmBooking}
              disabled={submitting}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Booking...' : 'Confirm Booking'}
            </button>
            <button
              onClick={() => setStep(2)}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Confirmed */}
      {step === 4 && bookingResult && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
          <p className="text-gray-500 mb-6">
            Your driving test has been booked at {bookingResult.centreName} on{' '}
            {new Date(bookingResult.date).toLocaleDateString('en-GB', {
              weekday: 'long',
              day: 'numeric',
              month: 'long'
            })} at {bookingResult.time}.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate(`/booking/${bookingResult.id}`)}
              className="bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              View Booking
            </button>
            <button
              onClick={() => navigate('/learner/dashboard')}
              className="border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
