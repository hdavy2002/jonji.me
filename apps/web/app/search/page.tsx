'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { SearchBox } from '@/components/search/SearchBox'

function SearchResults() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') ?? ''

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="w-full max-w-2xl mx-auto space-y-6">
        <a href="/" className="text-2xl font-bold tracking-tight">
          Jonji
        </a>
        <SearchBox initialValue={query} />
        {query ? (
          <p className="text-gray-500">
            Searching for: <strong>{query}</strong> — results coming soon.
          </p>
        ) : (
          <p className="text-gray-400">Enter a search query above.</p>
        )}
      </div>
    </main>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SearchResults />
    </Suspense>
  )
}
