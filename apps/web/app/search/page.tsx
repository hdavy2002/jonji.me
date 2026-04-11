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
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!q) return
    setLoading(true)
    setSearched(true)
    setError(null)
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/search?q=${encodeURIComponent(q)}`)
      .then(async r => {
        if (!r.ok) {
          const body = await r.json().catch(() => ({}))
          throw new Error(body.error || `Error ${r.status}`)
        }
        return r.json()
      })
      .then(d => {
        setResults(d.results || [])
      })
      .catch((err) => {
        console.error('Search error:', err)
        setError(err.message)
        setResults([])
      })
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
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg text-sm text-center">
            {error}. Make sure your API is configured correctly.
          </div>
        )}
        {results.map(r => <ResultCard key={r.siteId} result={r} />)}
        {!loading && searched && !error && results.length === 0 && (
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