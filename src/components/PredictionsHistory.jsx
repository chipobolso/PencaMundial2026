import { useEffect, useState } from "react"
import { getPredictionsByMatch } from "../services/predictions"
import { getAllExtras } from "../services/extras"
import UpcomingMatchesPanel from "./UpcomingMatchesPanel"

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

function PredictionsHistory({
  matches,
  user,
  calculateMatchPoints,
  matchResults,
  showToast,
  userPredictions
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

      <UpcomingMatchesPanel
        matches={matches}
        user={user}
        calculateMatchPoints={calculateMatchPoints}
        matchResults={matchResults}
        showToast={showToast}
        userPredictions={userPredictions}
      />

      <div className="bg-slate-900 rounded-3xl p-5 md:p-6 border border-slate-800 shadow-2xl">
        <h2 className="text-2xl md:text-3xl font-black mb-2">
          👀 Historial de pronósticos
        </h2>

        <p className="text-slate-400 text-sm">
          Los pronósticos de cada partido se muestran cuando vence el plazo de edición: 15 minutos antes del inicio.
        </p>
      </div>

      <div className="bg-slate-900 rounded-3xl p-5 md:p-6 border border-slate-800 shadow-2xl">
        <h3 className="text-xl md:text-2xl font-black mb-4">
          ⭐ Campeón y goleador
        </h3>

        {!extrasLocked() ? (
          <div className="text-slate-400 bg-slate-950 rounded-2xl p-4 border border-slate-800">
            Todavía no se muestran. Quedarán visibles cuando cierre el plazo de extras.
          </div>
        ) : extras.length === 0 ? (
          <div className="text-slate-400 bg-slate-950 rounded-2xl p-4 border border-slate-800">
            Nadie cargó extras todavía.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-800 text-slate-300">
                <tr>
                  <th className="p-3 text-left">Usuario</th>
                  <th className="p-3 text-left">Campeón</th>
                  <th className="p-3 text-left">Goleador</th>
                </tr>
              </thead>

              <tbody>
                {extras.map((item) => (
                  <tr key={item.userId} className="border-t border-slate-800">
                    <td className="p-3 font-bold">{item.userName}</td>
                    <td className="p-3">{item.champion}</td>
                    <td className="p-3">{item.topScorer}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {history.length === 0 ? (
        <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 text-slate-400">
          Todavía no hay partidos cerrados.
        </div>
      ) : (
        history.map(({ match, predictions }) => (
          <div
            key={match.id}
            className="bg-slate-900 rounded-3xl p-5 md:p-6 border border-slate-800 shadow-2xl"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-xl md:text-2xl font-black">
                  {match.home} vs {match.away}
                </h3>

                <p className="text-slate-400 text-sm">
                  Grupo {match.group} · {match.date} · {match.time} UYT
                </p>

                {match.stadium && (
                  <p className="text-slate-500 text-xs mt-1">
                    🏟️ {match.stadium}
                  </p>
                )}
              </div>

              <div className="bg-gray-500/20 border border-gray-500 text-gray-300 px-3 py-1 rounded-xl text-xs font-bold w-fit">
                🔒 Cerrado
              </div>
            </div>

            {predictions.length === 0 ? (
              <div className="text-slate-400 bg-slate-950 rounded-2xl p-4 border border-slate-800">
                No hubo pronósticos para este partido.
              </div>
            ) : (
              <div className="space-y-2">
                {predictions.map((prediction) => (
                  <div
                    key={prediction.userId}
                    className="bg-slate-950 rounded-2xl p-4 border border-slate-800 flex justify-between items-center gap-4"
                  >
                    <div className="font-bold truncate">
                      {prediction.userName}
                    </div>

                    <div className="text-xl font-black shrink-0">
                      {prediction.homeScore} - {prediction.awayScore}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}

    </div>
  )
}

export default PredictionsHistory