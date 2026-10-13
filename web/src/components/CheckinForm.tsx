import { useState, type FormEvent } from 'react'
import { createCheckin } from '../api/checkins'
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
    <form className="card" onSubmit={handleSubmit}>
      <h2>Fazer check-in</h2>

      <label htmlFor="cpf">Digite o seu CPF</label>
      <input
        id="cpf"
        type="text"
        inputMode="numeric"
        autoComplete="off"
        autoFocus
        placeholder="000.000.000-00"
        value={cpf}
        onChange={(event) => setCpf(formatCpf(event.target.value))}
      />

      <button type="submit" disabled={!isComplete || submitting}>
        {submitting ? 'Enviando...' : 'Confirmar check-in'}
      </button>

      {feedback && (
        <p className={`feedback feedback-${feedback.type}`} role="alert">
          {feedback.text}
        </p>
      )}
    </form>
  )
}

export default CheckinForm
