import { useEffect, useState } from "react"
import {
  getPrediction,
  savePrediction,
  getPredictionsByMatch
} from "../services/predictions"

function MatchCard(props) {
  const [homeScore, setHomeScore] = useState("")
  const [awayScore, setAwayScore] = useState("")
  const [saved, setSaved] = useState(false)
  const [isLocked, setIsLocked] = useState(false)
  const [allPredictions, setAllPredictions] = useState([])
  const [timeLeft, setTimeLeft] = useState("")

  const hasRealResult =
    props.realHome !== "" &&
    props.realAway !== "" &&
    props.realHome !== undefined &&
    props.realAway !== undefined

  // ⏱️ Contador
  useEffect(() => {
    const matchDateTime = new Date(`${props.date} ${props.time}`)
    const lockTime = new Date(matchDateTime.getTime() - 15 * 60 * 1000)

    function updateTimer() {
      const now = new Date()
      const diff = lockTime - now

      if (diff <= 0) {
        setIsLocked(true)
        setTimeLeft("00:00:00")
        return
      }

      const hours = String(Math.floor(diff / 1000 / 60 / 60)).padStart(2, "0")
      const minutes = String(Math.floor((diff / 1000 / 60) % 60)).padStart(2, "0")
      const seconds = String(Math.floor((diff / 1000) % 60)).padStart(2, "0")

      setTimeLeft(`${hours}:${minutes}:${seconds}`)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [props.date, props.time])

  useEffect(() => {
    async function loadPrediction() {
      const prediction = await getPrediction(props.user.uid, props.matchId)

      if (prediction) {
        setHomeScore(prediction.homeScore)
        setAwayScore(prediction.awayScore)
      }
    }

    loadPrediction()
  }, [props.user.uid, props.matchId])

  useEffect(() => {
    async function loadAllPredictions() {
      if (!isLocked) return

      const predictions = await getPredictionsByMatch(props.matchId)
      setAllPredictions(predictions)
    }

    loadAllPredictions()
  }, [isLocked, props.matchId])

  async function handleSave() {
    if (isLocked) return

    await savePrediction(props.user.uid, props.matchId, {
      home: props.home,
      away: props.away,
      homeScore,
      awayScore
    })

    setSaved(true)

    setTimeout(() => {
      setSaved(false)
    }, 1800)
  }

  return (
    <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 shadow-lg">

      {/* Header */}
      <div className="flex justify-between items-start gap-3 mb-4">
        <div>
          <div className="text-sm font-black">
            {props.date}
          </div>

          <div className="text-xs text-slate-400">
            {props.time} UYT
          </div>
        </div>

        {isLocked ? (
          <div className="bg-gray-500/20 border border-gray-500 text-gray-300 px-3 py-1 rounded-xl text-xs font-bold">
            🔒 CERRADO
          </div>
        ) : (
          <div className="bg-red-500/20 border border-red-500 text-red-300 px-3 py-1 rounded-xl text-xs font-bold">
            ⏳ {timeLeft}
          </div>
        )}
      </div>

      {hasRealResult && (
        <div className="mb-3 bg-emerald-500/10 border border-emerald-500/40 rounded-xl p-2 text-center">
          <div className="text-xs text-slate-400">Resultado oficial</div>
          <div className="text-lg font-black text-emerald-400">
            {props.realHome} - {props.realAway}
          </div>
        </div>
      )}

      <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">

        <div className="font-black text-sm text-right break-words">
          {props.home}
        </div>

        <div className="flex items-center justify-center gap-1">
          <input
            type="number"
            min="0"
            value={homeScore}
            disabled={isLocked}
            onChange={(e) => setHomeScore(e.target.value)}
            className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-700 text-center text-xl font-black disabled:opacity-50"
          />

          <span>-</span>

          <input
            type="number"
            min="0"
            value={awayScore}
            disabled={isLocked}
            onChange={(e) => setAwayScore(e.target.value)}
            className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-700 text-center text-xl font-black disabled:opacity-50"
          />
        </div>

        <div className="font-black text-sm text-left break-words">
          {props.away}
        </div>

      </div>

      <div className="mt-4 flex justify-between items-center">
        {!isLocked ? (
          <button
            onClick={handleSave}
            className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-xl font-black text-sm"
          >
            Guardar
          </button>
        ) : (
          <div className="text-xs text-slate-500">
            Pronóstico cerrado
          </div>
        )}

        {saved && (
          <div className="text-green-400 text-xs font-bold">
            ✔ Guardado
          </div>
        )}
      </div>

      {isLocked && (
        <div className="mt-4 bg-slate-900 rounded-xl border border-slate-800 p-3">
          <h3 className="text-sm font-black mb-2">
            👀 Pronósticos
          </h3>

          {allPredictions.length === 0 ? (
            <div className="text-slate-400 text-xs">
              Sin pronósticos.
            </div>
          ) : (
            <div className="space-y-2">
              {allPredictions.map((prediction, index) => {
                const points = hasRealResult
                  ? props.calculateMatchPoints(
                      prediction.homeScore,
                      prediction.awayScore,
                      props.realHome,
                      props.realAway
                    )
                  : null

                return (
                  <div
                    key={index}
                    className="bg-slate-950 rounded-lg p-2 flex justify-between items-center border border-slate-800 text-xs"
                  >
                    <span className="font-bold">
                      {prediction.userName}
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="font-black">
                        {prediction.homeScore} - {prediction.awayScore}
                      </span>

                      {hasRealResult && (
                        <span className="bg-blue-600 px-2 py-1 rounded-lg font-black">
                          {points} pts
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

    </div>
  )
}

export default MatchCard