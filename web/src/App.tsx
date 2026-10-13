import { useCallback, useEffect, useState } from 'react'
import { fetchQueue, type Checkin } from './api/checkins'
import CheckinForm from './components/CheckinForm'
import QueueList from './components/QueueList'

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
    void loadQueue()
  }, [loadQueue])

  return (
    <main>
      <h1>Check-in de Pacientes</h1>
      <CheckinForm onCheckin={loadQueue} />
      <QueueList queue={queue} loading={loading} error={error} />
    </main>
  )
}

export default App
