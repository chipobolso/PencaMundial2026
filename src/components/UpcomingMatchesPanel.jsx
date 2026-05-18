import MatchCard from "./MatchCard"

function parseMatchDate(dateText, timeText) {
  const months = {
    Enero: 0,
    Febrero: 1,
    Marzo: 2,
    Abril: 3,
    Mayo: 4,
    Junio: 5,
    Julio: 6,
    Agosto: 7,
    Septiembre: 8,
    Octubre: 9,
    Noviembre: 10,
    Diciembre: 11
  }

  const [day, monthName, year] = dateText.split(" ")
  const [hour, minute] = timeText.split(":")

  return new Date(
    Number(year),
    months[monthName],
    Number(day),
    Number(hour),
    Number(minute)
  )
}

function UpcomingMatchesPanel({
  matches,
  user,
  calculateMatchPoints,
  matchResults,
  showToast,
  userPredictions = []
}) {
  const now = new Date()

  const predictedMatchIds = userPredictions
    .filter((prediction) =>
      prediction.homeScore !== "" &&
      prediction.awayScore !== "" &&
      prediction.homeScore !== undefined &&
      prediction.awayScore !== undefined
    )
    .map((prediction) => prediction.matchId)

  const upcoming = matches
    .map((match) => {
      const matchDate = parseMatchDate(match.date, match.time)
      const lockTime = new Date(matchDate.getTime() - 15 * 60 * 1000)
      const diff = lockTime - now
      const alreadyPredicted = predictedMatchIds.includes(match.id)

      return {
        ...match,
        diff,
        alreadyPredicted
      }
    })
    .filter((match) => match.diff > 0 && match.diff <= 24 * 60 * 60 * 1000)
    .sort((a, b) => {
      if (a.alreadyPredicted !== b.alreadyPredicted) {
        return a.alreadyPredicted ? 1 : -1
      }

      return a.diff - b.diff
    })

  if (upcoming.length === 0) {
    return (
      <div className="bg-slate-900 rounded-3xl p-5 md:p-6 border border-slate-800 shadow-2xl">
        <h2 className="text-2xl md:text-3xl font-black mb-2">
          ⏳ Partidos próximos
        </h2>

        <p className="text-slate-400 text-sm">
          No hay partidos que cierren pronóstico en las próximas 24 horas.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-slate-900 rounded-3xl p-5 md:p-6 border border-slate-800 shadow-2xl">
      <h2 className="text-2xl md:text-3xl font-black mb-2">
        ⏳ Partidos próximos
      </h2>

      <p className="text-slate-400 text-sm mb-4">
        Primero aparecen los partidos que todavía no pronosticaste.
      </p>

      <div className="grid md:grid-cols-2 gap-4">
        {upcoming.map((match) => {
          const result = matchResults[match.id]

          return (
            <div
              key={match.id}
              className={
                match.alreadyPredicted
                  ? "rounded-3xl border border-slate-700"
                  : "rounded-3xl border-2 border-yellow-400 shadow-2xl shadow-yellow-500/10"
              }
            >
              {!match.alreadyPredicted && (
                <div className="bg-yellow-500 text-black rounded-t-2xl px-4 py-2 text-sm font-black text-center">
                  ⚠️ Falta pronosticar
                </div>
              )}

              {match.alreadyPredicted && (
                <div className="bg-green-600/20 text-green-300 border-b border-green-500/30 rounded-t-2xl px-4 py-2 text-sm font-black text-center">
                  ✔ Ya pronosticado
                </div>
              )}

              <MatchCard
                matchId={match.id}
                user={user}
                date={match.date}
                time={match.time}
                stadium={match.stadium}
                home={match.home}
                away={match.away}
                realHome={result?.realHome ?? ""}
                realAway={result?.realAway ?? ""}
                calculateMatchPoints={calculateMatchPoints}
                showToast={showToast}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default UpcomingMatchesPanel