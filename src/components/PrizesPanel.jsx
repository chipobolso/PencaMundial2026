function PrizesPanel({ participantsCount }) {
  const entryFee = 1000
  const totalPot = participantsCount * entryFee

  const firstPrize = totalPot * 0.6
  const secondPrize = totalPot * 0.3
  const thirdPrize = totalPot * 0.1

  function formatMoney(amount) {
    return `$${amount.toLocaleString("es-UY")}`
  }

  return (
    <div className="bg-slate-900 rounded-3xl p-4 md:p-6 border border-slate-800 shadow-2xl mb-6">
      <h2 className="text-2xl md:text-3xl font-black mb-5">
        🏆 Premios
      </h2>

      <div className="grid md:grid-cols-3 gap-4 mb-5">
        <div className="bg-slate-800 rounded-2xl p-4">
          <div className="text-slate-400 text-sm">Valor participación</div>
          <div className="text-2xl md:text-3xl font-black text-green-400">
            {formatMoney(entryFee)}
          </div>
        </div>

        <div className="bg-slate-800 rounded-2xl p-4">
          <div className="text-slate-400 text-sm">Participantes aprobados</div>
          <div className="text-2xl md:text-3xl font-black text-blue-400">
            {participantsCount}
          </div>
        </div>

        <div className="bg-slate-800 rounded-2xl p-4">
          <div className="text-slate-400 text-sm">Pozo total</div>
          <div className="text-2xl md:text-3xl font-black text-yellow-400">
            {formatMoney(totalPot)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-yellow-500/10 border border-yellow-500/40 rounded-2xl p-3">
          <div className="text-xs text-yellow-300">1er puesto · 60%</div>
          <div className="text-xl md:text-2xl font-black text-yellow-400">
            {formatMoney(firstPrize)}
          </div>
        </div>

        <div className="bg-slate-400/10 border border-slate-400/40 rounded-2xl p-3">
          <div className="text-xs text-slate-300">2do puesto · 30%</div>
          <div className="text-xl md:text-2xl font-black text-slate-200">
            {formatMoney(secondPrize)}
          </div>
        </div>

        <div className="bg-orange-500/10 border border-orange-500/40 rounded-2xl p-3">
          <div className="text-xs text-orange-300">3er puesto · 10%</div>
          <div className="text-xl md:text-2xl font-black text-orange-400">
            {formatMoney(thirdPrize)}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PrizesPanel