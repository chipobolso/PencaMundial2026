function GroupTable({ teams, matches, matchResults }) {
  function getStats(team) {
    const stats = {
      team,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDiff: 0,
      points: 0
    }

    matches.forEach((match) => {
      const result = matchResults[match.id]

      if (!result) return
      if (result.realHome === "" || result.realAway === "") return

      const homeGoals = Number(result.realHome)
      const awayGoals = Number(result.realAway)

      if (match.home !== team && match.away !== team) return

      stats.played += 1

      const isHome = match.home === team
      const goalsFor = isHome ? homeGoals : awayGoals
      const goalsAgainst = isHome ? awayGoals : homeGoals

      stats.goalsFor += goalsFor
      stats.goalsAgainst += goalsAgainst

      if (goalsFor > goalsAgainst) {
        stats.won += 1
        stats.points += 3
      } else if (goalsFor === goalsAgainst) {
        stats.drawn += 1
        stats.points += 1
      } else {
        stats.lost += 1
      }
    })

    stats.goalDiff = stats.goalsFor - stats.goalsAgainst

    return stats
  }

  const standings = teams
    .map(getStats)
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points
      if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff
      return b.goalsFor - a.goalsFor
    })

  return (
    <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-800 text-slate-300">
          <tr>
            <th className="p-2 text-left">Equipo</th>
            <th className="p-2">PJ</th>
            <th className="p-2">G</th>
            <th className="p-2">E</th>
            <th className="p-2">P</th>
            <th className="p-2">GF</th>
            <th className="p-2">GC</th>
            <th className="p-2">DG</th>
            <th className="p-2">Pts</th>
          </tr>
        </thead>

        <tbody>
          {standings.map((row, index) => (
            <tr
              key={row.team}
              className={
                index < 2
                  ? "border-t border-slate-800 bg-green-500/10"
                  : index === 2
                    ? "border-t border-slate-800 bg-yellow-500/10"
                    : "border-t border-slate-800"
              }
            >
              <td className="p-2 font-bold">{row.team}</td>
              <td className="p-2 text-center">{row.played}</td>
              <td className="p-2 text-center">{row.won}</td>
              <td className="p-2 text-center">{row.drawn}</td>
              <td className="p-2 text-center">{row.lost}</td>
              <td className="p-2 text-center">{row.goalsFor}</td>
              <td className="p-2 text-center">{row.goalsAgainst}</td>
              <td className="p-2 text-center">{row.goalDiff}</td>
              <td className="p-2 text-center font-black text-green-400">
                {row.points}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="text-xs text-slate-500 p-2">
        Verde: clasificación directa. Amarillo: posible mejor tercero.
      </div>
    </div>
  )
}

export default GroupTable