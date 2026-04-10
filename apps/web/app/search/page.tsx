import { SearchBox } from '@/components/search/SearchBox'

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams
  const query = q ?? ''

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
