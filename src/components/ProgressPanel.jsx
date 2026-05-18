function ProgressPanel({ completed, total }) {
  const pending = total - completed
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100)

  return (
    <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-2xl mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

        <div>
          <h2 className="text-3xl font-black mb-1">
            📋 Tu avance
          </h2>

          <p className="text-slate-400">
            Completaste {completed} de {total} partidos.
          </p>
        </div>

        <div className="text-right">
          {pending === 0 ? (
            <div className="text-green-400 font-black text-2xl">
              Todo completo 🔥
            </div>
          ) : (
            <div className="text-yellow-400 font-black text-2xl">
              Te faltan {pending}
            </div>
          )}
        </div>

      </div>

      <div className="mt-5 bg-slate-800 rounded-full h-4 overflow-hidden">
        <div
          className="bg-green-500 h-full rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>

      <div className="text-slate-400 text-sm mt-2">
        {percentage}% completado
      </div>
    </div>
  )
}

export default ProgressPanel