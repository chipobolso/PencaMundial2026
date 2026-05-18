import { useEffect, useState } from "react"
import { getPredictionsByMatch } from "../services/predictions"
import { getAllExtras } from "../services/extras"
import UpcomingMatches from "./UpcomingMatches"

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

function PredictionsHistory({
  matches,
  user,
  calculateMatchPoints,
  matchResults,
  showToast
}) {
  const [history, setHistory] = useState([])
  const [extras, setExtras] = useState([])

  function isMatchLocked(match) {
    const matchDate = parseMatchDate(match.date, match.time)
    const lockTime = new Date(matchDate.getTime() - 15 * 60 * 1000)
    return new Date() >= lockTime
  }

  function extrasLocked() {
    const firstMatch = parseMatchDate("11 Junio 2026", "16:00")
    const lockTime = new Date(firstMatch.getTime() - 15 * 60 * 1000)
    return new Date() >= lockTime
  }

  useEffect(() => {
    async function loadHistory() {
      const lockedMatches = matches.filter(isMatchLocked)

      const matchHistory = []

      for (const match of lockedMatches) {
        const predictions = await getPredictionsByMatch(match.id)

        matchHistory.push({
          match,
          predictions
        })
      }

      setHistory(matchHistory)

      if (extrasLocked()) {
        const allExtras = await getAllExtras()
        setExtras(allExtras)
      }
    }

    loadHistory()
  }, [matches])

  return (
    <div className="space-y-6">

      {/* 🔥 NUEVO BLOQUE */}
      <UpcomingMatches
        matches={matches}
        user={user}
        calculateMatchPoints={calculateMatchPoints}
        matchResults={matchResults}
        showToast={showToast}
      />

      <div className="bg-slate-900 rounded-3xl p-5 md:p-6 border border-slate-800 shadow-2xl">
        <h2 className="text-2xl md:text-3xl font-black mb-2">
          👀 Historial de pronósticos
        </h2>
      </div>

      {history.map(({ match, predictions }) => (
        <div key={match.id} className="bg-slate-900 rounded-3xl p-5 border border-slate-800">
          <h3 className="text-xl font-black mb-3">
            {match.home} vs {match.away}
          </h3>

          {predictions.map((p) => (
            <div key={p.userId} className="flex justify-between bg-slate-950 p-3 rounded-xl mb-2">
              <span>{p.userName}</span>
              <span>{p.homeScore} - {p.awayScore}</span>
            </div>
          ))}
        </div>
      ))}

    </div>
  )
}

export default PredictionsHistory