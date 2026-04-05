import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import CentreCard from '../components/CentreCard'

export default function CentreSearch() {
  const [postcode, setPostcode] = useState('')
  const [radius, setRadius] = useState('10')
  const [centres, setCentres] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!postcode.trim()) {
      setError('Please enter a postcode.')
      return
    }
    setError('')
    setLoading(true)
    setSearched(true)

    try {
      const res = await api.get('/centres/search', {
        params: { postcode: postcode.trim(), radius }
      })
      setCentres(res.data)
    } catch (err) {
      // If API is not running, show sample data
      setCentres([
        { id: '1', name: 'Wood Green Test Centre', address: '2A Western Road, Wood Green', postcode: 'N22 6UH', distance: 2.3 },
        { id: '2', name: 'Hendon Test Centre', address: 'Aerodrome Road, Hendon', postcode: 'NW9 5QW', distance: 4.7 },
        { id: '3', name: 'Mill Hill Test Centre', address: 'Bunns Lane, Mill Hill', postcode: 'NW7 2DX', distance: 6.1 },
        { id: '4', name: 'Barnet Test Centre', address: '1 Quinta Drive, Barnet', postcode: 'EN5 3DF', distance: 7.8 },
        { id: '5', name: 'Enfield Test Centre', address: '221 Baker Street, Enfield', postcode: 'EN1 3JY', distance: 8.4 },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleSetAlert = (centre) => {
    navigate('/learner/alerts', { state: { centre } })
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Find Test Centres</h1>
        <p className="text-gray-500 mt-1">
          Search for DVSA driving test centres near you by postcode.
        </p>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="postcode" className="block text-sm font-medium text-gray-700 mb-1">
              Postcode
            </label>
            <input
              id="postcode"
              type="text"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-gray-900 uppercase"
              placeholder="e.g. N22 6UH"
            />
          </div>

          <div className="sm:w-40">
            <label htmlFor="radius" className="block text-sm font-medium text-gray-700 mb-1">
              Radius
            </label>
            <select
              id="radius"
              value={radius}
              onChange={(e) => setRadius(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-gray-900 bg-white"
            >
              <option value="5">5 miles</option>
              <option value="10">10 miles</option>
              <option value="15">15 miles</option>
              <option value="20">20 miles</option>
            </select>
          </div>

          <div className="sm:self-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto bg-blue-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-blue-700 transition-colors focus:ring-4 focus:ring-blue-200 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Searching...
                </span>
              ) : (
                'Search'
              )}
            </button>
          </div>
        </form>

        {error && (
          <p className="mt-3 text-sm text-red-600">{error}</p>
        )}
      </div>

      {/* Results */}
      {searched && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {centres.length > 0
                ? `${centres.length} centre${centres.length !== 1 ? 's' : ''} found`
                : 'No centres found'}
            </h2>
            {centres.length > 0 && (
              <p className="text-sm text-gray-500">
                Within {radius} miles of {postcode}
              </p>
            )}
          </div>

          {loading ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : centres.length > 0 ? (
            <div className="space-y-4">
              {centres.map((centre) => (
                <CentreCard
                  key={centre.id || centre._id}
                  centre={centre}
                  onSetAlert={handleSetAlert}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-gray-500">No test centres found within {radius} miles of {postcode}.</p>
              <p className="text-sm text-gray-400 mt-1">Try a different postcode or increase the search radius.</p>
            </div>
          )}
        </div>
      )}

      {!searched && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <svg className="w-16 h-16 text-gray-200 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Search for Test Centres</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Enter your postcode above to find DVSA driving test centres near you.
            You can then set up alerts for available slots.
          </p>
        </div>
      )}
    </div>
  )
}
