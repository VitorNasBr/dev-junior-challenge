import { useState, type FormEvent } from 'react'
import { createCheckin } from '../api/checkins'
import { card, cardTitle, feedbackError, feedbackSuccess } from '../styles'
import { CPF_LENGTH, formatCpf, onlyDigits } from '../utils/cpf'

interface Feedback {
  type: 'success' | 'error'
  text: string
}

interface CheckinFormProps {
  // Called after a successful check-in so the parent can reload the queue.
  onCheckin: () => void
}

function CheckinForm({ onCheckin }: CheckinFormProps) {
  const [cpf, setCpf] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<Feedback | null>(null)

  const isComplete = onlyDigits(cpf).length === CPF_LENGTH

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setFeedback(null)

    try {
      const checkin = await createCheckin(onlyDigits(cpf))
      setFeedback({
        type: 'success',
        text: `Check-in realizado! ${checkin.name}, aguarde ser chamado(a).`,
      })
      setCpf('')
      onCheckin()
    } catch (error) {
      setFeedback({ type: 'error', text: (error as Error).message })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className={card} onSubmit={handleSubmit}>
      <h2 className={cardTitle}>Fazer check-in</h2>

      <label htmlFor="cpf" className="mb-1.5 block font-semibold">
        Digite o seu CPF
      </label>
      <input
        id="cpf"
        type="text"
        inputMode="numeric"
        autoComplete="off"
        autoFocus
        placeholder="000.000.000-00"
        value={cpf}
        onChange={(event) => setCpf(formatCpf(event.target.value))}
        className="w-full rounded-lg border border-slate-300 p-3 text-xl tracking-wide focus:outline-2 focus:outline-offset-1 focus:outline-teal-700"
      />

      <button
        type="submit"
        disabled={!isComplete || submitting}
        className="mt-3 w-full cursor-pointer rounded-lg bg-teal-700 p-3 font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-teal-700"
      >
        {submitting ? 'Enviando...' : 'Confirmar check-in'}
      </button>

      {feedback && (
        <p
          role="alert"
          className={`mt-4 ${feedback.type === 'success' ? feedbackSuccess : feedbackError}`}
        >
          {feedback.text}
        </p>
      )}
    </form>
  )
}

export default CheckinForm
