import type { Checkin } from '../api/checkins'

interface QueueListProps {
  queue: Checkin[]
  loading: boolean
  error: string | null
}

function formatTime(isoDate: string): string {
  return new Date(isoDate).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function QueueList({ queue, loading, error }: QueueListProps) {
  return (
    <section className="card">
      <h2>
        Fila de hoje <span className="badge">{queue.length}</span>
      </h2>

      {error && (
        <p className="feedback feedback-error" role="alert">
          {error}
        </p>
      )}

      {loading && <p className="muted">Carregando fila...</p>}

      {!loading && !error && queue.length === 0 && (
        <p className="muted">Nenhum check-in realizado hoje.</p>
      )}

      {queue.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Paciente</th>
              <th>CPF</th>
              <th>Chegada</th>
            </tr>
          </thead>
          <tbody>
            {queue.map((checkin, index) => (
              <tr key={checkin.id}>
                <td>{index + 1}</td>
                <td>{checkin.name}</td>
                <td>{checkin.cpf}</td>
                <td>{formatTime(checkin.arrivedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}

export default QueueList
