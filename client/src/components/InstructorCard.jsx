export default function InstructorCard({ instructor, onBook }) {
  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating || 0)
    const hasHalf = (rating || 0) - fullStars >= 0.5

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        )
      } else if (i === fullStars && hasHalf) {
        stars.push(
          <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <defs>
              <linearGradient id={`half-${i}`}>
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="#D1D5DB" />
              </linearGradient>
            </defs>
            <path fill={`url(#half-${i})`} d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        )
      } else {
        stars.push(
          <svg key={i} className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        )
      }
    }
    return stars
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
          <span className="text-blue-600 text-xl font-bold">
            {(instructor.name || 'I')[0].toUpperCase()}
          </span>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{instructor.name}</h3>
          <p className="text-sm text-gray-500">ADI: {instructor.adiNumber}</p>
          <div className="flex items-center mt-1">
            {renderStars(instructor.rating)}
            <span className="ml-2 text-sm text-gray-500">
              ({instructor.rating?.toFixed(1) || 'N/A'})
            </span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-2xl font-bold text-gray-900">
            &pound;{instructor.hourlyRate}
          </p>
          <p className="text-xs text-gray-500">per hour</p>
        </div>
      </div>

      {instructor.coverageAreas && (
        <div className="mt-4">
          <p className="text-sm text-gray-500 mb-2">Coverage Areas:</p>
          <div className="flex flex-wrap gap-2">
            {instructor.coverageAreas.map((area, i) => (
              <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                {area}
              </span>
            ))}
          </div>
        </div>
      )}

      {instructor.bio && (
        <p className="mt-3 text-sm text-gray-600 line-clamp-2">{instructor.bio}</p>
      )}

      <button
        onClick={() => onBook?.(instructor)}
        className="mt-4 w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        Book This Instructor
      </button>
    </div>
  )
}
