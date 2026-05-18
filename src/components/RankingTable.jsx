function RankingTable({ ranking }) {
  return (
    <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-2xl mb-10">
      <h2 className="text-3xl font-black mb-6">
        🏆 Tabla general
      </h2>

      {ranking.length === 0 ? (
        <div className="text-slate-400">
          Todavía no hay usuarios cargados.
        </div>
      ) : (
        <div className="space-y-3">
          {ranking.map((player, index) => (
            <div
              key={player.uid}
              className="bg-slate-800 rounded-2xl p-4 flex justify-between items-center border border-slate-700"
            >
              <div className="flex items-center gap-4">
                <div className="text-2xl font-black w-10">
                  {index === 0 && "🥇"}
                  {index === 1 && "🥈"}
                  {index === 2 && "🥉"}
                  {index > 2 && index + 1}
                </div>

                <div>
                  <div className="font-black text-xl">
                    {player.name} {player.lastname}
                  </div>

                  <div className="text-slate-400 text-sm">
                    {player.email}
                  </div>
                </div>
              </div>

              <div className="text-3xl font-black text-green-400">
                {player.points} pts
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default RankingTable