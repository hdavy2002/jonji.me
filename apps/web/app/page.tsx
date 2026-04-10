import { SearchBox } from '@/components/search/SearchBox'

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-6xl font-bold tracking-tight">
            Jonji
          </h1>
          <p className="text-lg text-gray-500 italic">
            Let your agent do the talking.
          </p>
        </div>
        <SearchBox />
        <div className="flex flex-wrap gap-2 justify-center text-sm text-gray-400">
          <span>Try:</span>
          {[
            'doctors in Dehradun',
            'cars Manchester',
            'CBT therapist online',
            'flat Leeds',
            'boiler repair',
          ].map(q => (
            <a
              key={q}
              href={`/search?q=${encodeURIComponent(q)}`}
              className="underline underline-offset-4 hover:text-gray-600 transition-colors"
            >
              {q}
            </a>
          ))}
        </div>
      </div>
    </main>
  )
}
