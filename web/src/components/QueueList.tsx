import type { Checkin } from '../api/checkins'
import { card, cardTitle, feedbackError, mutedText } from '../styles'

interface QueueListProps {
  queue: Checkin[]
  loading: boolean
  error: string | null
}

const headerCell =
  'border-b border-slate-300 px-2 py-2.5 text-left text-sm font-semibold uppercase text-slate-500'
const bodyCell = 'px-2 py-2.5'

function formatTime(isoDate: string): string {
  return new Date(isoDate).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function QueueList({ queue, loading, error }: QueueListProps) {
  return (
    <section className={card}>
      <h2 className={cardTitle}>
        Fila de hoje{' '}
        <span className="rounded-full bg-teal-700 px-2.5 py-0.5 text-sm text-white">
          {queue.length}
        </span>
      </h2>

      {error && (
        <p role="alert" className={`mb-4 ${feedbackError}`}>
          {error}
        </p>
      )}

      {loading && <p className={mutedText}>Carregando fila...</p>}

      {!loading && !error && queue.length === 0 && (
        <p className={mutedText}>Nenhum check-in realizado hoje.</p>
      )}

      {queue.length > 0 && (
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className={headerCell}>#</th>
              <th className={headerCell}>Paciente</th>
              <th className={headerCell}>CPF</th>
              <th className={headerCell}>Chegada</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {queue.map((checkin, index) => (
              <tr key={checkin.id}>
                <td className={bodyCell}>{index + 1}</td>
                <td className={bodyCell}>{checkin.name}</td>
                <td className={bodyCell}>{checkin.cpf}</td>
                <td className={bodyCell}>{formatTime(checkin.arrivedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}

export default QueueList
