import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../api/client'
import type { Wizard } from '../api/types'

export default function Wizard() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const [wizard, setWizard] = useState<Wizard | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [current, setCurrent] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!sessionId) return
    api.get(`/decisions/${sessionId}`)
      .then(res => {
        const session = res.data.data
        return api.get(`/wizards/by-category/${session.categorySlug}`)
      })
      .then(res => setWizard(res.data.data))
      .catch(() => navigate('/dashboard'))
      .finally(() => setLoading(false))
  }, [sessionId, navigate])

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  if (!wizard) return <div className="min-h-screen flex items-center justify-center text-gray-500">Wizard not found</div>

  const questions = wizard.questions
  const question = questions[current]
  const progress = ((current + 1) / questions.length) * 100

  const parseOptions = (raw: string | null): string[] => {
    if (!raw) return []
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed.map(String)
      if (typeof parsed === 'object') return Object.keys(parsed)
    } catch {}
    return []
  }

  const handleAnswer = (value: string) => {
    setAnswers(prev => ({ ...prev, [question.questionKey]: value }))
  }

  const handleNext = () => {
    if (current < questions.length - 1) {
      setCurrent(current + 1)
    } else {
      handleSubmit()
    }
  }

  const handleSubmit = async () => {
    if (!sessionId) return
    setSubmitting(true)
    try {
      const payload = Object.entries(answers).map(([questionKey, answerValue]) => ({
        questionKey,
        answerValue,
      }))
      await api.post(`/decisions/${sessionId}/answers`, payload)
      await api.post(`/decisions/${sessionId}/recommendations`)
      navigate(`/decisions/${sessionId}/recommendations`)
    } catch {
      alert('Failed to submit answers. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const renderInput = () => {
    const value = answers[question.questionKey] || ''

    switch (question.questionType) {
      case 'NUMBER':
      case 'RANGE':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleAnswer(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter a number..."
            autoFocus
          />
        )

      case 'SLIDER': {
        const opts = parseOptions(question.options)
        const min = Number(opts[0] || 0)
        const max = Number(opts[1] || 10)
        const currentVal = Number(value || min)
        return (
          <div>
            <input
              type="range"
              min={min}
              max={max}
              value={currentVal}
              onChange={(e) => handleAnswer(e.target.value)}
              className="w-full"
            />
            <div className="text-center mt-2 text-2xl font-bold text-indigo-600">{currentVal}</div>
          </div>
        )
      }

      case 'SINGLE_SELECT': {
        const opts = parseOptions(question.options)
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {opts.map(opt => (
              <button
                key={opt}
                onClick={() => handleAnswer(opt)}
                className={`px-4 py-3 text-left rounded-lg border-2 transition-colors ${
                  value === opt
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )
      }

      case 'MULTI_SELECT': {
        const opts = parseOptions(question.options)
        const selected = value ? value.split(',') : []
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {opts.map(opt => {
              const isSelected = selected.includes(opt)
              return (
                <button
                  key={opt}
                  onClick={() => {
                    const next = isSelected
                      ? selected.filter(s => s !== opt)
                      : [...selected, opt]
                    handleAnswer(next.join(','))
                  }}
                  className={`px-4 py-3 text-left rounded-lg border-2 transition-colors ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {opt}
                </button>
              )
            })}
          </div>
        )
      }

      case 'BOOLEAN':
        return (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleAnswer('true')}
              className={`px-4 py-3 rounded-lg border-2 font-medium ${
                value === 'true' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200'
              }`}
            >
              Yes
            </button>
            <button
              onClick={() => handleAnswer('false')}
              className={`px-4 py-3 rounded-lg border-2 font-medium ${
                value === 'false' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200'
              }`}
            >
              No
            </button>
          </div>
        )

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleAnswer(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Type your answer..."
            autoFocus
          />
        )
    }
  }

  const canProceed = question.required ? (answers[question.questionKey] || '').trim() !== '' : true

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <Link to="/dashboard" className="text-xl font-bold text-indigo-600">ThinkStack</Link>
          <span className="text-sm text-gray-600">{wizard.name}</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Question {current + 1} of {questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{question.questionText}</h2>
          {question.helpText && (
            <p className="mt-2 text-gray-600">{question.helpText}</p>
          )}

          <div className="mt-6">
            {renderInput()}
          </div>

          <div className="mt-8 flex justify-between">
            <button
              onClick={() => setCurrent(Math.max(0, current - 1))}
              disabled={current === 0}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-40"
            >
              ← Back
            </button>
            <button
              onClick={handleNext}
              disabled={!canProceed || submitting}
              className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : current < questions.length - 1 ? 'Next →' : 'Get Recommendations'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
