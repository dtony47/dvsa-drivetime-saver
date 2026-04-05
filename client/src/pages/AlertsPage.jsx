import { useState, useEffect } from 'react'
import api from '../lib/api'
import AlertCard from '../components/AlertCard'

const SAMPLE_CENTRES = [
  { id: '1', name: 'Wood Green' },
  { id: '2', name: 'Hendon' },
  { id: '3', name: 'Mill Hill' },
  { id: '4', name: 'Barnet' },
  { id: '5', name: 'Enfield' },
  { id: '6', name: 'Tottenham' },
  { id: '7', name: 'Wanstead' },
  { id: '8', name: 'Goodmayes' },
]

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form state
  const [selectedCentres, setSelectedCentres] = useState([])
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  useEffect(() => {
    fetchAlerts()
  }, [])

  const fetchAlerts = async () => {
    try {
      const res = await api.get('/alerts')
      setAlerts(res.data)
    } catch {
      // API might not be running
    } finally {
      setLoading(false)
    }
  }

  const toggleCentre = (centreId) => {
    setSelectedCentres(prev =>
      prev.includes(centreId)
        ? prev.filter(id => id !== centreId)
        : [...prev, centreId]
    )
  }

  const handleCreateAlert = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (selectedCentres.length === 0) {
      setError('Please select at least one test centre.')
      return
    }
    if (!dateFrom || !dateTo) {
      setError('Please select both start and end dates.')
      return
    }
    if (new Date(dateFrom) >= new Date(dateTo)) {
      setError('End date must be after start date.')
      return
    }

    setCreating(true)
    try {
      const centreNames = selectedCentres.map(id =>
        SAMPLE_CENTRES.find(c => c.id === id)?.name || id
      )
      const res = await api.post('/alerts', {
        centres: centreNames,
        dateFrom,
        dateTo
      })
      setAlerts(prev => [res.data, ...prev])
      setSelectedCentres([])
      setDateFrom('')
      setDateTo('')
      setSuccess('Alert created successfully! You will be notified when slots become available.')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create alert. Please try again.')
    } finally {
      setCreating(false)
    }
  }

  const handleToggle = async (alertId) => {
    try {
      const res = await api.patch(`/alerts/${alertId}/toggle`)
      setAlerts(prev => prev.map(a =>
        (a._id || a.id) === alertId ? { ...a, status: res.data.status } : a
      ))
    } catch {
      // Toggle locally as fallback
      setAlerts(prev => prev.map(a =>
        (a._id || a.id) === alertId
          ? { ...a, status: a.status === 'active' ? 'paused' : 'active' }
          : a
      ))
    }
  }

  const handleDelete = async (alertId) => {
    if (!window.confirm('Are you sure you want to delete this alert?')) return
    try {
      await api.delete(`/alerts/${alertId}`)
      setAlerts(prev => prev.filter(a => (a._id || a.id) !== alertId))
    } catch {
      setAlerts(prev => prev.filter(a => (a._id || a.id) !== alertId))
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Slot Alerts</h1>
        <p className="text-gray-500 mt-1">
          Set up alerts to be notified when test slots become available at your chosen centres.
        </p>
      </div>

      {/* Create Alert Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Alert</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleCreateAlert} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Test Centres
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SAMPLE_CENTRES.map(centre => (
                <button
                  key={centre.id}
                  type="button"
                  onClick={() => toggleCentre(centre.id)}
                  className={`py-2.5 px-3 rounded-lg border-2 text-sm font-medium transition-all ${
                    selectedCentres.includes(centre.id)
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {centre.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="dateFrom" className="block text-sm font-medium text-gray-700 mb-1">
                Earliest Date
              </label>
              <input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-gray-900"
                required
              />
            </div>
            <div>
              <label htmlFor="dateTo" className="block text-sm font-medium text-gray-700 mb-1">
                Latest Date
              </label>
              <input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                min={dateFrom || new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-gray-900"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={creating}
            className="w-full sm:w-auto bg-blue-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-blue-700 transition-colors focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creating ? 'Creating...' : 'Create Alert'}
          </button>
        </form>
      </div>

      {/* Alerts List */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Alerts</h2>
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : alerts.length > 0 ? (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <AlertCard
                key={alert._id || alert.id}
                alert={alert}
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p className="text-gray-500">No alerts yet. Create one above to get started!</p>
          </div>
        )}
      </div>
    </div>
  )
}
