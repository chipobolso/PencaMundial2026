import { useEffect, useState } from "react"
import { savePrediction, getUserPrediction } from "../services/predictions"

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

function MatchCard({
  matchId,
  user,
  home,
  away,
  date,
  time,
  stadium,
  realHome,
  realAway,
  calculateMatchPoints,
  showToast
}) {
  const [homeScore, setHomeScore] = useState("")
  const [awayScore, setAwayScore] = useState("")
  const [isLocked, setIsLocked] = useState(false)

  useEffect(() => {
    async function loadPrediction() {
      const prediction = await getUserPrediction(user.uid, matchId)

      if (prediction) {
        setHomeScore(prediction.homeScore)
        setAwayScore(prediction.awayScore)
      }
    }

    loadPrediction()
  }, [user.uid, matchId])

  useEffect(() => {
    const matchDate = parseMatchDate(date, time)
    const lockTime = new Date(matchDate.getTime() - 15 * 60 * 1000)

    function checkLock() {
      if (new Date() >= lockTime) {
        setIsLocked(true)
      }
    }

    checkLock()

    const interval = setInterval(checkLock, 1000)

    return () => clearInterval(interval)
  }, [date, time])

  async function handleSave() {
    if (isLocked) return

    await savePrediction(user.uid, matchId, {
      homeScore,
      awayScore
    })

    showToast("Pronóstico guardado")
  }

  const hasPrediction =
    homeScore !== "" &&
    awayScore !== "" &&
    homeScore !== undefined &&
    awayScore !== undefined

  const isFinished =
    realHome !== "" &&
    realAway !== "" &&
    realHome !== undefined &&
    realAway !== undefined

  const points = isFinished && hasPrediction
    ? calculateMatchPoints(homeScore, awayScore, realHome, realAway)
    : null

  return (
    <div className="bg-slate-900 rounded-3xl p-4 border border-slate-800 shadow-2xl">

      {/* HEADER */}
      <div className="flex justify-between items-start mb-2">

        <div>
          <div className="font-black text-lg">
            {home} vs {away}
          </div>

          <div className="text-slate-400 text-sm">
            {date} · {time}
          </div>

          {stadium && (
            <div className="text-slate-500 text-xs">
              🏟️ {stadium}
            </div>
          )}
        </div>

        {/* 🔥 CHECK VERDE */}
        {(hasPrediction || isFinished) && (
          <div className="bg-green-500/20 border border-green-500 text-green-300 px-2 py-1 rounded-xl text-xs font-bold">
            ✔
          </div>
        )}

      </div>

      {/* INPUTS */}
      <div className="flex items-center justify-center gap-3 my-3">

        <input
          type="number"
          value={homeScore}
          disabled={isLocked}
          onChange={(e) => setHomeScore(e.target.value)}
          className="w-14 text-center p-2 rounded-xl bg-slate-800 border border-slate-700"
        />

        <span className="font-black">-</span>

        <input
          type="number"
          value={awayScore}
          disabled={isLocked}
          onChange={(e) => setAwayScore(e.target.value)}
          className="w-14 text-center p-2 rounded-xl bg-slate-800 border border-slate-700"
        />

      </div>

      {/* RESULTADO REAL */}
      {isFinished && (
        <div className="text-center text-sm text-slate-400">
          Resultado: {realHome} - {realAway}
        </div>
      )}

      {/* PUNTOS */}
      {points !== null && (
        <div className="text-center text-green-400 font-bold mt-2">
          +{points} pts
        </div>
      )}

      {/* BOTÓN */}
      {!isLocked && (
        <button
          onClick={handleSave}
          className="w-full mt-3 bg-blue-600 hover:bg-blue-500 p-2 rounded-xl font-bold"
        >
          {hasPrediction ? "Modificar" : "Guardar"}
        </button>
      )}

    </div>
  )
}

export default MatchCard