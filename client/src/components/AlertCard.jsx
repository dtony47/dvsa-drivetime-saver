export default function AlertCard({ alert, onToggle, onDelete }) {
  const statusConfig = {
    active: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500', label: 'Active' },
    paused: { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500', label: 'Paused' },
    triggered: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', label: 'Triggered' },
    expired: { bg: 'bg-gray-50', text: 'text-gray-500', dot: 'bg-gray-400', label: 'Expired' }
  }

  const status = statusConfig[alert.status] || statusConfig.active

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${status.bg} ${status.text}`}>
            <span className={`w-2 h-2 rounded-full ${status.dot}`}></span>
            {status.label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggle?.(alert._id || alert.id)}
            className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
              alert.status === 'active'
                ? 'text-yellow-700 bg-yellow-50 hover:bg-yellow-100'
                : 'text-green-700 bg-green-50 hover:bg-green-100'
            }`}
          >
            {alert.status === 'active' ? 'Pause' : 'Resume'}
          </button>
          <button
            onClick={() => onDelete?.(alert._id || alert.id)}
            className="text-sm font-medium px-3 py-1.5 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Test Centres</p>
          <div className="flex flex-wrap gap-2">
            {(alert.centres || []).map((centre, i) => (
              <span key={i} className="px-2.5 py-1 bg-blue-50 text-blue-700 text-sm rounded-lg">
                {typeof centre === 'string' ? centre : centre.name}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">From</p>
            <p className="text-sm text-gray-900 font-medium">{formatDate(alert.dateFrom)}</p>
          </div>
          <div>
            <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">To</p>
            <p className="text-sm text-gray-900 font-medium">{formatDate(alert.dateTo)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
