import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Landing() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-purple-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-indigo-600">ThinkStack</div>
        <div className="flex gap-4">
          {user ? (
            <Link to="/dashboard" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="px-4 py-2 text-indigo-600 hover:text-indigo-800">
                Login
              </Link>
              <Link to="/register" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
        <div className="text-center">
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight">
            <span className="block text-gray-900">Think Better.</span>
            <span className="block text-indigo-600">Decide Smarter.</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-600">
            ThinkStack helps you compare alternatives, analyze trade-offs, and make confident, data-driven decisions.
            Never recommend without explaining why.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link
              to={user ? '/dashboard' : '/register'}
              className="px-8 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 shadow-lg"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="px-8 py-3 border-2 border-indigo-600 text-indigo-600 font-medium rounded-lg hover:bg-indigo-50"
            >
              Sign In
            </Link>
          </div>
        </div>

        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="text-3xl mb-4">🎯</div>
            <h3 className="text-lg font-semibold text-gray-900">Personalized Recommendations</h3>
            <p className="mt-2 text-gray-600">
              Every recommendation is tailored to your needs, budget, and priorities — not popularity.
            </p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="text-3xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-gray-900">Transparent Scoring</h3>
            <p className="mt-2 text-gray-600">
              See exactly why a product was recommended and why others scored lower. No black boxes.
            </p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-lg font-semibold text-gray-900">Side-by-Side Comparison</h3>
            <p className="mt-2 text-gray-600">
              Compare products feature by feature with clear explanations of what matters most.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-200 py-8 text-center text-gray-500">
        <p>&copy; 2026 ThinkStack. Think Better. Decide Smarter.</p>
      </footer>
    </div>
  )
}
