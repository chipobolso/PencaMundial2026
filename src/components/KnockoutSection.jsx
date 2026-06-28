import MatchCard from "./MatchCard"

function KnockoutSection({
  title,
  matches,
  matchResults,
  user,
  calculateMatchPoints,
  showToast
}) {
  return (
    <div className="space-y-5">
      <div className="bg-slate-900 rounded-3xl p-5 md:p-6 border border-slate-800 shadow-2xl">
        <h2 className="text-2xl md:text-4xl font-black">
          {title}
        </h2>

        <p className="text-slate-400 mt-2 text-sm">
          Pronósticos habilitados hasta 15 minutos antes del inicio de cada partido.
        </p>
      </div>

      {matches.length === 0 ? (
        <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 text-slate-400">
          Todavía no hay partidos cargados en esta fase.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {matches.map((match) => {
            const result = matchResults[match.id]

            return (
              <MatchCard
                key={match.id}
                matchId={match.id}
                group={match.group}
                date={match.date}
                time={match.time}
                home={match.home}
                away={match.away}
                stadium={match.stadium}
                realHome={result?.realHome ?? ""}
                realAway={result?.realAway ?? ""}
                user={user}
                calculateMatchPoints={calculateMatchPoints}
                showToast={showToast}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

export default KnockoutSection