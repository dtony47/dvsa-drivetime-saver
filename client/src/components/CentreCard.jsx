import { Link } from 'react-router-dom'

export default function CentreCard({ centre, onSetAlert }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{centre.name}</h3>
          <p className="text-gray-500 text-sm mt-1">{centre.address}</p>
          <p className="text-gray-400 text-sm">{centre.postcode}</p>
        </div>
        {centre.distance !== undefined && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 shrink-0 ml-4">
            {centre.distance} mi
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={() => onSetAlert?.(centre)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          Set Alert
        </button>
        <Link
          to={`/centres`}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          View Details
        </Link>
      </div>
    </div>
  )
}
