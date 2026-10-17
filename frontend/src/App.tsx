import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <header className="px-4 py-8 max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight">ThinkStack</h1>
        <p className="mt-2 text-gray-600">Think Better. Decide Smarter.</p>
      </header>
      <main className="px-4 py-12 max-w-7xl mx-auto">
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Welcome to ThinkStack</h2>
          <p className="text-gray-600 max-w-2xl">
            A modern full-stack decision intelligence platform that helps users compare alternatives, analyze trade-offs, and make confident, data-driven decisions.
          </p>
        </section>
      </main>
    </div>
  )
}

export default App
