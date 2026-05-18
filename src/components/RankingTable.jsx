function RankingTable({ ranking, currentUser }) {
  return (
    <div className="bg-slate-900 rounded-3xl p-4 md:p-6 border border-slate-800 shadow-2xl mb-6">
      <h2 className="text-2xl md:text-3xl font-black mb-6">
        🏆 Tabla general
      </h2>

      {ranking.length === 0 ? (
        <div className="text-slate-400">
          Todavía no hay usuarios cargados.
        </div>
      ) : (
        <div className="space-y-3">
          {ranking.map((player, index) => {
            const isMe = currentUser?.uid === player.uid

            return (
              <div
                key={player.uid}
                className={
                  isMe
                    ? "bg-blue-600/30 rounded-2xl p-4 flex justify-between items-center border border-blue-400 shadow-xl"
                    : "bg-slate-800 rounded-2xl p-4 flex justify-between items-center border border-slate-700"
                }
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="text-xl md:text-2xl font-black w-9 shrink-0">
                    {index === 0 && "🥇"}
                    {index === 1 && "🥈"}
                    {index === 2 && "🥉"}
                    {index > 2 && index + 1}
                  </div>

                  <div className="min-w-0">
                    <div className="font-black text-base md:text-xl truncate">
                      {player.name} {player.lastname} {isMe && "(vos)"}
                    </div>

                    <div className="text-slate-400 text-xs md:text-sm truncate">
                      {player.email}
                    </div>
                  </div>
                </div>

                <div className="text-xl md:text-3xl font-black text-green-400 shrink-0 ml-3">
                  {player.points} pts
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default RankingTable