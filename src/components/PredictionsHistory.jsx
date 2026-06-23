import { useEffect, useState } from "react"
import { getPredictionsByMatchOptimized } from "../services/predictions"
import { getAllExtras } from "../services/extras"
import { db } from "../services/firebase"
import { collection, getDocs } from "firebase/firestore"
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
  const [expandedClosed, setExpandedClosed] = useState({})
  const [expandedFinished, setExpandedFinished] = useState({})
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [finishedVisibleCount, setFinishedVisibleCount] = useState(5)

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

  async function getUsersMap() {
    const snapshot = await getDocs(collection(db, "users"))
    const usersMap = {}

    snapshot.forEach((userDoc) => {
      const userData = userDoc.data()
      usersMap[userData.uid] = `${userData.name} ${userData.lastname}`
    })

    return usersMap
  }

  async function loadPredictionsForItems(items, setStateFunction) {
    if (items.length === 0) return

    const usersMap = await getUsersMap()

    const loadedItems = await Promise.all(
      items.map(async (item) => {
        if (item.predictionsLoaded) return item

        const predictions = await getPredictionsByMatchOptimized(item.match.id, usersMap)

        return {
          ...item,
          predictions,
          predictionsLoaded: true
        }
      })
    )

    setStateFunction((currentItems) =>
      currentItems.map((currentItem) => {
        const loadedItem = loadedItems.find(
          (item) => item.match.id === currentItem.match.id
        )

        return loadedItem || currentItem
      })
    )
  }

  useEffect(() => {
    async function loadHistory() {
      setLoadingHistory(true)

      const closedMatches = matches
        .filter(isMatchLocked)
        .sort((a, b) => parseMatchDate(b.date, b.time) - parseMatchDate(a.date, a.time))

      const closedWithoutResult = []
      const finishedWithResult = []

      closedMatches.forEach((match) => {
        const item = {
          match,
          predictions: [],
          predictionsLoaded: false
        }

        if (hasResult(match)) {
          finishedWithResult.push(item)
        } else {
          closedWithoutResult.push(item)
        }
      })

      setClosedHistory(closedWithoutResult)
      setFinishedHistory(finishedWithResult)

      await loadPredictionsForItems(closedWithoutResult, setClosedHistory)
      await loadPredictionsForItems(finishedWithResult.slice(0, 5), setFinishedHistory)

      if (extrasLocked()) {
        const allExtras = await getAllExtras()
        setExtras(allExtras)
      }

      setLoadingHistory(false)
    }

    loadHistory()
  }, [matches, matchResults])

  async function showMoreFinished() {
    const newCount = Math.min(finishedVisibleCount + 5, finishedHistory.length)
    const itemsToLoad = finishedHistory.slice(finishedVisibleCount, newCount)

    await loadPredictionsForItems(itemsToLoad, setFinishedHistory)
    setFinishedVisibleCount(newCount)
  }

  async function showAllFinished() {
    const itemsToLoad = finishedHistory.slice(finishedVisibleCount)

    await loadPredictionsForItems(itemsToLoad, setFinishedHistory)
    setFinishedVisibleCount(finishedHistory.length)
  }

  function toggleClosed(matchId) {
    setExpandedClosed((current) => ({
      ...current,
      [matchId]: !current[matchId]
    }))
  }

  function toggleFinished(matchId) {
    setExpandedFinished((current) => ({
      ...current,
      [matchId]: !current[matchId]
    }))
  }

  function expandAllClosed() {
    const next = {}
    closedHistory.forEach(({ match }) => {
      next[match.id] = true
    })
    setExpandedClosed(next)
  }

  function collapseAllClosed() {
    setExpandedClosed({})
  }

  function expandAllFinished() {
    const next = {}
    finishedHistory.slice(0, finishedVisibleCount).forEach(({ match }) => {
      next[match.id] = true
    })
    setExpandedFinished(next)
  }

  function collapseAllFinished() {
    setExpandedFinished({})
  }

  function renderPredictionList(predictions, match, predictionsLoaded) {
    if (!predictionsLoaded) {
      return (
        <div className="text-slate-400 bg-slate-950 rounded-2xl p-4 border border-slate-800">
          Cargando pronósticos...
        </div>
      )
    }

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
      <div className="grid md:grid-cols-2 gap-2 mt-4">
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
              className="bg-slate-950 rounded-xl p-3 border border-slate-800 flex justify-between items-center gap-3 text-sm"
            >
              <div className="font-bold truncate">
                {prediction.userName}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="font-black">
                  {prediction.homeScore} - {prediction.awayScore}
                </div>

                {matchHasResult && (
                  <div className="bg-blue-600 px-2 py-1 rounded-lg text-xs font-black">
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

  function renderMatchSummary({
    item,
    isExpanded,
    onToggle,
    showOfficialResult = false
  }) {
    const { match, predictions, predictionsLoaded } = item
    const result = matchResults[match.id]

    return (
      <div
        key={match.id}
        className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden"
      >
        <button
          type="button"
          onClick={onToggle}
          className="w-full p-4 md:p-5 text-left hover:bg-slate-800/60 transition"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg md:text-xl font-black">
                {isExpanded ? "▼" : "▶"} {match.home} vs {match.away}
              </h3>

              <p className="text-slate-400 text-xs md:text-sm mt-1">
                Grupo {match.group} · {match.date} · {match.time} UYT
              </p>

              {match.stadium && (
                <p className="text-slate-500 text-xs mt-1">
                  🏟️ {match.stadium}
                </p>
              )}
            </div>

            <div className="flex flex-wrap md:justify-end gap-2">
              <div className="bg-slate-800 border border-slate-700 text-slate-300 px-3 py-1 rounded-xl text-xs font-bold">
                👥 {predictionsLoaded ? `${predictions.length} pronósticos` : "Sin cargar"}
              </div>

              <div className="bg-gray-500/20 border border-gray-500 text-gray-300 px-3 py-1 rounded-xl text-xs font-bold">
                🔒 Cerrado
              </div>

              {showOfficialResult && result && (
                <div className="bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 px-3 py-1 rounded-xl text-xs font-black">
                  Resultado: {result.realHome} - {result.realAway}
                </div>
              )}
            </div>
          </div>
        </button>

        {isExpanded && (
          <div className="px-4 md:px-5 pb-5">
            {renderPredictionList(predictions, match, predictionsLoaded)}
          </div>
        )}
      </div>
    )
  }

  const visibleFinishedHistory = finishedHistory.slice(0, finishedVisibleCount)
  const hasMoreFinished = finishedVisibleCount < finishedHistory.length

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

      {loadingHistory && (
        <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800 text-slate-400">
          Cargando últimos pronósticos...
        </div>
      )}

      <section>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-black mb-2">
              🔒 Pronósticos cerrados
            </h2>

            <p className="text-slate-400 text-sm">
              Acá aparecen los partidos cuyo plazo ya cerró, pero que todavía no tienen resultado oficial cargado.
            </p>
          </div>

          {closedHistory.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={expandAllClosed}
                className="bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-xl text-xs font-black"
              >
                Expandir todos
              </button>

              <button
                onClick={collapseAllClosed}
                className="bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-xl text-xs font-black"
              >
                Contraer todos
              </button>
            </div>
          )}
        </div>

        {closedHistory.length === 0 ? (
          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 text-slate-400">
            No hay partidos cerrados pendientes de resultado.
          </div>
        ) : (
          <div className="space-y-3">
            {closedHistory.map((item) =>
              renderMatchSummary({
                item,
                isExpanded: !!expandedClosed[item.match.id],
                onToggle: () => toggleClosed(item.match.id),
                showOfficialResult: false
              })
            )}
          </div>
        )}
      </section>

      <section>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-black mb-2">
              📚 Historial de partidos finalizados
            </h2>

            <p className="text-slate-400 text-sm">
              Mostrando {Math.min(finishedVisibleCount, finishedHistory.length)} de {finishedHistory.length} partidos finalizados.
            </p>
          </div>

          {finishedHistory.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={expandAllFinished}
                className="bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-xl text-xs font-black"
              >
                Expandir visibles
              </button>

              <button
                onClick={collapseAllFinished}
                className="bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-xl text-xs font-black"
              >
                Contraer todos
              </button>
            </div>
          )}
        </div>

        {finishedHistory.length === 0 ? (
          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 text-slate-400">
            Todavía no hay partidos finalizados con resultado oficial.
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {visibleFinishedHistory.map((item) =>
                renderMatchSummary({
                  item,
                  isExpanded: !!expandedFinished[item.match.id],
                  onToggle: () => toggleFinished(item.match.id),
                  showOfficialResult: true
                })
              )}
            </div>

            <div className="mt-5 flex flex-col md:flex-row gap-3">
              {hasMoreFinished && (
                <button
                  onClick={showMoreFinished}
                  className="bg-blue-600 hover:bg-blue-500 px-5 py-3 rounded-2xl font-black w-full md:w-auto"
                >
                  Ver 5 más
                </button>
              )}

              {hasMoreFinished && (
                <button
                  onClick={showAllFinished}
                  className="bg-slate-800 hover:bg-slate-700 px-5 py-3 rounded-2xl font-black w-full md:w-auto"
                >
                  Ver todos
                </button>
              )}

              {finishedVisibleCount > 5 && (
                <button
                  onClick={() => {
                    setFinishedVisibleCount(5)
                    setExpandedFinished({})
                  }}
                  className="bg-slate-700 hover:bg-slate-600 px-5 py-3 rounded-2xl font-black w-full md:w-auto"
                >
                  Contraer historial
                </button>
              )}
            </div>
          </>
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