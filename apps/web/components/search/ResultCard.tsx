export function ResultCard({ result }: { result: any }) {
  return (
    <a href={result.url} className="block">
      <div className="border rounded-xl p-4 hover:border-black
                      hover:shadow-sm transition-all">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold truncate">{result.title}</h3>
              {result.verified && (
                <span className="text-xs bg-blue-50 text-blue-700
                                 px-2 py-0.5 rounded-full shrink-0">
                  ✓ Verified
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 line-clamp-2 mb-2">
              {result.description}
            </p>
            <div className="flex gap-3 text-xs text-gray-400">
              <span>📍 {result.locationText}</span>
              {result.priceMin && (
                <span>
                  {result.currency} {result.priceMin}
                  {result.priceMax > result.priceMin ? `–${result.priceMax}` : ''}
                </span>
              )}
            </div>
          </div>
          <span className={`shrink-0 text-xs px-3 py-1.5 rounded-full
                           font-medium ${
            result.agentMode === 'NEGOTIATE'
              ? 'bg-orange-50 text-orange-700'
              : 'bg-green-50 text-green-700'
          }`}>
            {result.agentMode === 'NEGOTIATE' ? 'Negotiate' : 'Book'}
          </span>
        </div>
      </div>
    </a>
  )
}