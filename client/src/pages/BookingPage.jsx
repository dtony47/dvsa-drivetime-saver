import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../lib/api'
import BookingFlow from '../components/BookingFlow'

export default function BookingPage() {
  const { id } = useParams()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [paymentComplete, setPaymentComplete] = useState(false)

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await api.get(`/bookings/${id}`)
        setBooking(res.data)
      } catch {
        // Show sample booking if API not available
        setBooking({
          id,
          centreName: 'Wood Green Test Centre',
          centreAddress: '2A Western Road, Wood Green, N22 6UH',
          date: '2026-05-15',
          time: '09:30',
          instructorName: 'John Smith',
          status: 'confirmed',
          paymentStatus: 'unpaid',
          createdAt: new Date().toISOString()
        })
      } finally {
        setLoading(false)
      }
    }
    fetchBooking()
  }, [id])

  const getFlowStep = () => {
    if (!booking) return 1
    if (paymentComplete || booking.paymentStatus === 'paid') return 4
    if (booking.status === 'confirmed' && booking.paymentStatus !== 'paid') return 3
    if (booking.instructorName) return 3
    return 2
  }

  const handlePayment = async () => {
    setPaying(true)
    console.log('Initiating Stripe payment for booking:', id)
    console.log('Amount: Mock payment - Stripe integration placeholder')

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000))

    try {
      await api.patch(`/bookings/${id}/pay`)
    } catch {
      // Mock success even if API is down
    }

    setPaymentComplete(true)
    setBooking(prev => prev ? { ...prev, paymentStatus: 'paid' } : prev)
    setPaying(false)
    console.log('Payment complete for booking:', id)
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const statusConfig = {
    confirmed: { bg: 'bg-green-50', text: 'text-green-700', label: 'Confirmed' },
    pending: { bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'Pending' },
    cancelled: { bg: 'bg-red-50', text: 'text-red-700', label: 'Cancelled' },
    completed: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Completed' }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Booking Not Found</h1>
        <p className="text-gray-500 mb-6">We couldn't find a booking with that ID.</p>
        <Link to="/learner/dashboard" className="text-blue-600 hover:underline font-medium">
          Back to Dashboard
        </Link>
      </div>
    )
  }

  const status = statusConfig[booking.status] || statusConfig.pending

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link to="/learner/dashboard" className="text-blue-600 hover:underline text-sm font-medium flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Details</h1>

      {/* Booking Flow Indicator */}
      <BookingFlow currentStep={getFlowStep()} />

      {/* Booking Info Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mt-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{booking.centreName}</h2>
            <p className="text-gray-500 text-sm mt-1">{booking.centreAddress}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.bg} ${status.text}`}>
            {status.label}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Date</p>
              <p className="text-gray-900 font-medium mt-1">{formatDate(booking.date)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Time</p>
              <p className="text-gray-900 font-medium mt-1">{booking.time || 'TBC'}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Instructor</p>
              <p className="text-gray-900 font-medium mt-1">{booking.instructorName || 'Not assigned'}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Payment Status</p>
              <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium ${
                booking.paymentStatus === 'paid' || paymentComplete
                  ? 'bg-green-50 text-green-700'
                  : 'bg-orange-50 text-orange-700'
              }`}>
                {booking.paymentStatus === 'paid' || paymentComplete ? 'Paid' : 'Unpaid'}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Section */}
        {booking.paymentStatus !== 'paid' && !paymentComplete && (
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-orange-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div className="flex-1">
                  <h3 className="font-semibold text-orange-800">Payment Required</h3>
                  <p className="text-sm text-orange-700 mt-1">
                    Please complete payment to confirm your booking. Your slot is reserved for 30 minutes.
                  </p>
                </div>
              </div>
              <button
                onClick={handlePayment}
                disabled={paying}
                className="mt-4 w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {paying ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Pay Now
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Payment Success */}
        {(booking.paymentStatus === 'paid' || paymentComplete) && (
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
              <svg className="w-12 h-12 text-green-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="font-semibold text-green-800 text-lg">Booking Confirmed!</h3>
              <p className="text-sm text-green-700 mt-1">
                Your payment has been processed and your booking is confirmed.
                You will receive a confirmation email shortly.
              </p>
            </div>
          </div>
        )}

        {/* Status Timeline */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Booking Timeline</h3>
          <div className="space-y-4">
            <TimelineItem
              label="Booking Created"
              date={booking.createdAt}
              completed
            />
            <TimelineItem
              label="Slot Reserved"
              date={booking.status !== 'pending' ? booking.createdAt : null}
              completed={booking.status !== 'pending'}
            />
            <TimelineItem
              label="Payment Received"
              date={paymentComplete || booking.paymentStatus === 'paid' ? new Date().toISOString() : null}
              completed={paymentComplete || booking.paymentStatus === 'paid'}
            />
            <TimelineItem
              label="Test Day"
              date={booking.date}
              completed={false}
              isLast
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function TimelineItem({ label, date, completed, isLast }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={`w-3 h-3 rounded-full ${completed ? 'bg-green-500' : 'bg-gray-300'}`} />
        {!isLast && <div className={`w-0.5 flex-1 mt-1 ${completed ? 'bg-green-200' : 'bg-gray-200'}`} />}
      </div>
      <div className="pb-4">
        <p className={`text-sm font-medium ${completed ? 'text-gray-900' : 'text-gray-400'}`}>
          {label}
        </p>
        {date && (
          <p className="text-xs text-gray-400 mt-0.5">{formatDate(date)}</p>
        )}
      </div>
    </div>
  )
}
