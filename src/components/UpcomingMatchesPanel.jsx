import MatchCard from "./MatchCard"

function parseMatchDate(dateText, timeText) {
  const months = {
    Enero: 0, Febrero: 1, Marzo: 2, Abril: 3, Mayo: 4, Junio: 5,
    Julio: 6, Agosto: 7, Septiembre: 8, Octubre: 9, Noviembre: 10, Diciembre: 11
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

function UpcomingMatches({
  matches,
  user,
  calculateMatchPoints,
  matchResults,
  showToast
}) {
  const now = new Date()

  const upcoming = matches
    .map((match) => {
      const matchDate = parseMatchDate(match.date, match.time)
      const lockTime = new Date(matchDate.getTime() - 15 * 60 * 1000)
      const diff = lockTime - now

      return {
        ...match,
        diff,
        lockTime
      }
    })
    .filter((match) => match.diff > 0 && match.diff <= 24 * 60 * 60 * 1000)
    .sort((a, b) => a.diff - b.diff)

  if (upcoming.length === 0) return null

  return (
    <div className="bg-slate-900 rounded-3xl p-5 md:p-6 border border-slate-800 shadow-2xl">
      <h2 className="text-2xl md:text-3xl font-black mb-2">
        ⏳ Partidos próximos
      </h2>

      <p className="text-slate-400 text-sm mb-4">
        Estos partidos están por cerrar pronóstico (menos de 24h).
      </p>

      <div className="grid md:grid-cols-2 gap-4">
        {upcoming.map((match) => {
          const result = matchResults[match.id]

          return (
            <MatchCard
              key={match.id}
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
          )
        })}
      </div>
    </div>
  )
}

export default UpcomingMatches