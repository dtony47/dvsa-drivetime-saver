import { useState, useEffect } from 'react'
import api from '../lib/api'

export default function InstructorProfile() {
  const [form, setForm] = useState({
    name: '',
    adiNumber: '',
    coverageAreas: '',
    hourlyRate: '',
    bio: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/instructor/profile')
        const p = res.data
        setForm({
          name: p.name || '',
          adiNumber: p.adiNumber || '',
          coverageAreas: Array.isArray(p.coverageAreas) ? p.coverageAreas.join(', ') : p.coverageAreas || '',
          hourlyRate: p.hourlyRate?.toString() || '',
          bio: p.bio || ''
        })
      } catch {
        // Profile might not exist yet
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)

    try {
      const payload = {
        name: form.name,
        adiNumber: form.adiNumber,
        coverageAreas: form.coverageAreas.split(',').map(s => s.trim()).filter(Boolean),
        hourlyRate: parseFloat(form.hourlyRate) || 0,
        bio: form.bio
      }
      await api.put('/instructor/profile', payload)
      setSuccess('Profile saved successfully!')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Instructor Profile</h1>
        <p className="text-gray-500 mt-1">
          Complete your profile so learners can find and book you.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-gray-900"
              placeholder="e.g. John Smith"
            />
          </div>

          <div>
            <label htmlFor="adiNumber" className="block text-sm font-medium text-gray-700 mb-1">
              ADI Number
            </label>
            <input
              id="adiNumber"
              name="adiNumber"
              type="text"
              value={form.adiNumber}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-gray-900"
              placeholder="Your Approved Driving Instructor number"
            />
            <p className="text-xs text-gray-400 mt-1">
              Your ADI badge number issued by the DVSA.
            </p>
          </div>

          <div>
            <label htmlFor="coverageAreas" className="block text-sm font-medium text-gray-700 mb-1">
              Coverage Areas
            </label>
            <input
              id="coverageAreas"
              name="coverageAreas"
              type="text"
              value={form.coverageAreas}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-gray-900"
              placeholder="e.g. N11, N22, EN4, NW7"
            />
            <p className="text-xs text-gray-400 mt-1">
              Comma-separated postcodes or areas you cover.
            </p>
          </div>

          <div>
            <label htmlFor="hourlyRate" className="block text-sm font-medium text-gray-700 mb-1">
              Hourly Rate (&pound;)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">&pound;</span>
              <input
                id="hourlyRate"
                name="hourlyRate"
                type="number"
                min="0"
                step="0.50"
                value={form.hourlyRate}
                onChange={handleChange}
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-gray-900"
                placeholder="35.00"
              />
            </div>
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={4}
              value={form.bio}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-gray-900 resize-none"
              placeholder="Tell learners about your experience, teaching style, and what makes you a great instructor..."
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  )
}
