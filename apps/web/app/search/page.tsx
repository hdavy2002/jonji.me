'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { SearchBox } from '@/components/search/SearchBox'
import { ResultCard } from '@/components/search/ResultCard'

function SearchResults() {
  const searchParams = useSearchParams()
  const q = searchParams.get('q') || ''
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    if (!q) return
    setLoading(true)
    setSearched(true)
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/search?q=${encodeURIComponent(q)}`)
      .then(r => r.json())
      .then(d => setResults(d.results || []))
      .catch(() => setResults([]))
      .finally(() => setLoading(false))
  }, [q])

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <SearchBox initialValue={q} />
      </div>
      {loading && <p className="text-center text-gray-400 py-12">Searching...</p>}
      {!loading && searched && (
        <p className="text-sm text-gray-400 mb-4">
          {results.length} result{results.length !== 1 ? 's' : ''} for "{q}"
        </p>
      )}
      <div className="space-y-4">
        {results.map(r => <ResultCard key={r.siteId} result={r} />)}
        {!loading && searched && results.length === 0 && (
          <p className="text-center text-gray-400 py-12">
            No results found. Try different keywords.
          </p>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<p className="text-center py-12 text-gray-400">Loading...</p>}>
      <SearchResults />
    </Suspense>
  )
}