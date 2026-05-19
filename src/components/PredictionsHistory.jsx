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
  const [closedHistory, setClosedHistory] = useState([])
  const [finishedHistory, setFinishedHistory] = useState([])
  const [extras, setExtras] = useState([])

  function isMatchLocked(match) {
    const matchDate = parseMatchDate(match.date, match.time)
    const lockTime = new Date(matchDate.getTime() - 15 * 60 * 1000)

    return new Date() >= lockTime
  }

  function hasResult(match) {
    const result = matchResults[match.id]

    return (
      result?.realHome !== "" &&
      result?.realAway !== "" &&
      result?.realHome !== undefined &&
      result?.realAway !== undefined
    )
  }

  function extrasLocked() {
    if (!matches || matches.length === 0) return false

    const orderedMatches = [...matches].sort((a, b) => {
      return parseMatchDate(a.date, a.time) - parseMatchDate(b.date, b.time)
    })

    const firstMatch = orderedMatches[0]
    const firstMatchDate = parseMatchDate(firstMatch.date, firstMatch.time)
    const lockTime = new Date(firstMatchDate.getTime() - 15 * 60 * 1000)

    return new Date() >= lockTime
  }

  useEffect(() => {
    async function loadHistory() {
      const closedMatches = matches
        .filter(isMatchLocked)
        .sort((a, b) => parseMatchDate(b.date, b.time) - parseMatchDate(a.date, a.time))

      const closedWithoutResult = []
      const finishedWithResult = []

      for (const match of closedMatches) {
        const predictions = await getPredictionsByMatch(match.id)

        const item = {
          match,
          predictions
        }

        if (hasResult(match)) {
          finishedWithResult.push(item)
        } else {
          closedWithoutResult.push(item)
        }
      }

      setClosedHistory(closedWithoutResult)
      setFinishedHistory(finishedWithResult)

      if (extrasLocked()) {
        const allExtras = await getAllExtras()
        setExtras(allExtras)
      }
    }

    loadHistory()
  }, [matches, matchResults])

  function renderPredictionList(predictions, match) {
    if (predictions.length === 0) {
      return (
        <div className="text-slate-400 bg-slate-950 rounded-2xl p-4 border border-slate-800">
          No hubo pronósticos para este partido.
        </div>
      )
    }

    const result = matchResults[match.id]
    const matchHasResult = hasResult(match)

    return (
      <div className="space-y-2">
        {predictions.map((prediction) => {
          const points = matchHasResult
            ? calculateMatchPoints(
                prediction.homeScore,
                prediction.awayScore,
                result.realHome,
                result.realAway
              )
            : null

          return (
            <div
              key={prediction.userId}
              className="bg-slate-950 rounded-2xl p-4 border border-slate-800 flex justify-between items-center gap-4"
            >
              <div className="font-bold truncate">
                {prediction.userName}
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-xl font-black">
                  {prediction.homeScore} - {prediction.awayScore}
                </div>

                {matchHasResult && (
                  <div className="bg-blue-600 px-3 py-1 rounded-xl text-sm font-black">
                    {points} pts
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  function renderMatchBlock({ match, predictions }, showOfficialResult = false) {
    const result = matchResults[match.id]

    return (
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

          <div className="flex flex-col md:items-end gap-2">
            <div className="bg-gray-500/20 border border-gray-500 text-gray-300 px-3 py-1 rounded-xl text-xs font-bold w-fit">
              🔒 Cerrado
            </div>

            {showOfficialResult && result && (
              <div className="bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 px-3 py-1 rounded-xl text-xs font-black w-fit">
                Resultado: {result.realHome} - {result.realAway}
              </div>
            )}
          </div>
        </div>

        {renderPredictionList(predictions, match)}
      </div>
    )
  }

  return (
    <div className="space-y-8">

      <UpcomingMatchesPanel
        matches={matches}
        user={user}
        calculateMatchPoints={calculateMatchPoints}
        matchResults={matchResults}
        showToast={showToast}
        userPredictions={userPredictions}
      />

      <section>
        <h2 className="text-2xl md:text-3xl font-black mb-3">
          🔒 Pronósticos cerrados
        </h2>

        <p className="text-slate-400 text-sm mb-4">
          Acá aparecen los partidos cuyo plazo ya cerró, pero que todavía no tienen resultado oficial cargado.
        </p>

        {closedHistory.length === 0 ? (
          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 text-slate-400">
            No hay partidos cerrados pendientes de resultado.
          </div>
        ) : (
          <div className="space-y-4">
            {closedHistory.map((item) => renderMatchBlock(item, false))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-2xl md:text-3xl font-black mb-3">
          📚 Historial de partidos finalizados
        </h2>

        <p className="text-slate-400 text-sm mb-4">
          Acá quedan todos los partidos que ya tienen resultado oficial cargado.
        </p>

        {finishedHistory.length === 0 ? (
          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 text-slate-400">
            Todavía no hay partidos finalizados con resultado oficial.
          </div>
        ) : (
          <div className="space-y-4">
            {finishedHistory.map((item) => renderMatchBlock(item, true))}
          </div>
        )}
      </section>

      <section className="bg-slate-900 rounded-3xl p-5 md:p-6 border border-slate-800 shadow-2xl">
        <h2 className="text-2xl md:text-3xl font-black mb-4">
          ⭐ Campeón y goleador
        </h2>

        {!extrasLocked() ? (
          <div className="text-slate-400 bg-slate-950 rounded-2xl p-4 border border-slate-800">
            Todavía no se muestran. Quedarán visibles cuando cierre el plazo de extras.
          </div>
        ) : extras.length === 0 ? (
          <div className="text-slate-400 bg-slate-950 rounded-2xl p-4 border border-slate-800">
            Nadie cargó campeón y goleador todavía.
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
      </section>

    </div>
  )
}

export default PredictionsHistory