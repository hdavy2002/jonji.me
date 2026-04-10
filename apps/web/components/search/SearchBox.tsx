'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function SearchBox({
  initialValue = '',
}: {
  initialValue?: string
}) {
  const router = useRouter()
  const [query, setQuery] = useState(initialValue)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    router.push(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="What are you looking for?"
          className="flex-1 h-14 px-5 text-lg rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-black"
          autoFocus
        />
        <button
          type="submit"
          className="h-14 px-6 rounded-xl bg-black text-white font-medium hover:bg-gray-800 transition-colors"
        >
          Search
        </button>
      </div>
    </form>
  )
}
