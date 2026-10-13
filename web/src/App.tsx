import { useCallback, useEffect, useState } from 'react'
import { fetchQueue, type Checkin } from './api/checkins'
import CheckinForm from './components/CheckinForm'
import QueueList from './components/QueueList'
import './App.css'

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
    <div className="page">
      <header className="header">
        <h1>Check-in de Pacientes</h1>
        <p>Informe o seu CPF para entrar na fila de atendimento.</p>
      </header>

      <main className="content">
        <CheckinForm onCheckin={loadQueue} />
        <QueueList queue={queue} loading={loading} error={error} />
      </main>
    </div>
  )
}

export default App
