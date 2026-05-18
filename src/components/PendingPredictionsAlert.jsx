function PendingPredictionsAlert({ pendingCount, onGoToPredictions }) {
  if (pendingCount === 0) return null

  return (
    <div className="bg-yellow-500/10 border border-yellow-500/40 rounded-3xl p-5 md:p-6 shadow-2xl mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-yellow-300 mb-2">
            ⚠️ Te faltan pronósticos próximos
          </h2>

          <p className="text-slate-300">
            Tenés {pendingCount} partido{pendingCount === 1 ? "" : "s"} por pronosticar que cierra{pendingCount === 1 ? "" : "n"} en menos de 24 horas.
          </p>
        </div>

        <button
          onClick={onGoToPredictions}
          className="bg-yellow-500 hover:bg-yellow-400 text-black px-5 py-3 rounded-2xl font-black"
        >
          Ir a Pronósticos
        </button>
      </div>
    </div>
  )
}

export default PendingPredictionsAlert