import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Logo } from '../components/Logo'
import { Button } from '../components/ui'
import {
  IconArrowRight,
  IconBook,
  IconChart,
  IconCompass,
  IconDna,
  IconScale,
  IconSparkles,
  IconTarget,
  IconCheck,
} from '../components/icons'

const features = [
  {
    icon: IconTarget,
    title: 'Personalised recommendations',
    body: 'Every pick is tailored to your needs, budget and priorities — never ranked by popularity alone.',
  },
  {
    icon: IconScale,
    title: 'Transparent scoring',
    body: 'See the exact weighted factors behind each score, with strengths, weaknesses and trade-offs spelled out.',
  },
  {
    icon: IconChart,
    title: 'Side-by-side comparison',
    body: 'Compare shortlisted products spec-by-feature, with the differences that actually matter highlighted.',
  },
  {
    icon: IconChart,
    title: 'Live price intelligence',
    body: 'Track best prices across sellers, watch price history trends and set alerts for the price you want.',
  },
  {
    icon: IconDna,
    title: 'Your Decision DNA',
    body: 'ThinkStack learns the patterns behind your choices and sharpens future recommendations over time.',
  },
  {
    icon: IconBook,
    title: 'Decision journal',
    body: 'Record what you bought and how it worked out, so you can reflect and improve future decisions.',
  },
]

type Step = { n: string; title: string; body: string; icon: typeof IconTarget }

const steps: Step[] = [
  { n: '01', title: 'Tell us what you need', body: 'Answer a short, category-specific wizard about your budget, must-haves and preferences.', icon: IconCompass },
  { n: '02', title: 'We score every option', body: 'A transparent engine ranks products on value, features, performance and real review sentiment.', icon: IconSparkles },
  { n: '03', title: 'Compare and decide', body: 'See side-by-side trade-offs, an AI summary, then track the purchase in your journal.', icon: IconScale },
]

export default function Landing() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo />
          <div className="flex items-center gap-2">
            {user ? (
              <Link to="/dashboard">
                <Button size="sm">Go to dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Sign in
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Get started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
              <IconSparkles className="h-3.5 w-3.5" />
              AI-assisted decision intelligence
            </span>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
              Think better.{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Decide smarter.
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
              ThinkStack compares alternatives, analyses trade-offs and explains exactly why one option wins — so you
              can make confident, data-driven decisions.
            </p>
            <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
              <Link to={user ? '/wizard' : '/register'}>
                <Button size="lg" fullWidth className="sm:w-auto">
                  {user ? 'Start a new decision' : 'Get started free'}
                  <IconArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to={user ? '/dashboard' : '/login'}>
                <Button variant="outline" size="lg" fullWidth className="sm:w-auto">
                  {user ? 'View dashboard' : 'I already have an account'}
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-500">
              {['No black boxes', 'Budget-aware', 'Every score explained'].map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5">
                  <IconCheck className="h-4 w-4 text-emerald-500" />
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-100 bg-slate-50/60">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">How it works</h2>
            <p className="mt-3 text-slate-600">
              From a blank slate to a confident choice in three transparent steps.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.n} className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-extrabold text-slate-200">{step.n}</span>
                  {step.icon && <step.icon className="h-6 w-6 text-indigo-600" />}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Everything you need to decide well</h2>
          <p className="mt-3 text-slate-600">
            A complete toolkit for high-stakes purchases and everyday choices.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-indigo-200 hover:shadow-md">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-700 px-8 py-14 text-center shadow-xl sm:px-16">
          <IconBook className="mx-auto h-8 w-8 text-indigo-200" />
          <h2 className="mt-5 text-2xl font-bold text-white sm:text-3xl">
            We never recommend without explaining why.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-indigo-100">
            Transparency is the whole point. Every score, strength, weakness and trade-off is shown to you in plain
            language.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to={user ? '/wizard' : '/register'}>
              <Button size="lg" className="bg-white text-indigo-700 hover:bg-indigo-50" fullWidth>
                {user ? 'Start a new decision' : 'Create your free account'}
              </Button>
            </Link>
            <Link to="/products">
              <Button size="lg" variant="ghost" className="text-white hover:bg-white/10" fullWidth>
                Browse the catalogue
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-100 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
          <Logo />
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <IconDna className="h-4 w-4 text-slate-400" />
            Built for thoughtful decisions.
          </div>
          <p className="text-sm text-slate-400">&copy; {new Date().getFullYear()} ThinkStack</p>
        </div>
      </footer>
    </div>
  )
}
