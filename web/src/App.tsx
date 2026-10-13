import { useCallback, useEffect, useState } from 'react'
import { fetchQueue, type Checkin } from './api/checkins'
import CheckinForm from './components/CheckinForm'
import QueueList from './components/QueueList'
import { mutedText } from './styles'

// The reception screen stays open all day, so the queue refreshes by itself.
const REFRESH_INTERVAL_MS = 10_000

function App() {
  const [queue, setQueue] = useState<Checkin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadQueue = useCallback(async () => {
    try {
      setQueue(await fetchQueue())
      setError(null)
    } catch (error) {
      setError((error as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // First load right away, then one refresh every few seconds.
    const firstLoad = setTimeout(loadQueue, 0)
    const refresh = setInterval(loadQueue, REFRESH_INTERVAL_MS)

    return () => {
      clearTimeout(firstLoad)
      clearInterval(refresh)
    }
  }, [loadQueue])

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-teal-800">
            Check-in de Pacientes
          </h1>
          <p className={mutedText}>
            Informe o seu CPF para entrar na fila de atendimento.
          </p>
        </header>

        {/* Form on the left, queue on the right. On small screens they stack. */}
        <main className="grid items-start gap-6 md:grid-cols-[340px_1fr]">
          <CheckinForm onCheckin={loadQueue} />
          <QueueList queue={queue} loading={loading} error={error} />
        </main>
      </div>
    </div>
  )
}

export default App
