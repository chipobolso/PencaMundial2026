import { useEffect, useState } from "react"
import { getUserExtras, saveUserExtras } from "../services/extras"
import { teams } from "../data/fixtures"

function ExtrasPanel({ user }) {
  const [champion, setChampion] = useState("")
  const [topScorer, setTopScorer] = useState("")
  const [saved, setSaved] = useState(false)
  const [isLocked, setIsLocked] = useState(false)
  const [showCountdown, setShowCountdown] = useState(false)
  const [timeLeft, setTimeLeft] = useState("")

  useEffect(() => {
    async function loadExtras() {
      const extras = await getUserExtras(user.uid)

      if (extras) {
        setChampion(extras.champion || "")
        setTopScorer(extras.topScorer || "")
        setSaved(true)
      }
    }

    loadExtras()
  }, [user.uid])

  useEffect(() => {
    const firstMatchDate = new Date("2026-06-11T16:00:00-03:00")
    const lockTime = new Date(firstMatchDate.getTime() - 15 * 60 * 1000)

    function updateTimer() {
      const now = new Date()
      const diff = lockTime - now

      if (diff <= 0) {
        setIsLocked(true)
        setShowCountdown(false)
        setTimeLeft("00:00:00")
        return
      }

      if (diff <= 24 * 60 * 60 * 1000) {
        setShowCountdown(true)

        const hours = String(Math.floor(diff / 1000 / 60 / 60)).padStart(2, "0")
        const minutes = String(Math.floor((diff / 1000 / 60) % 60)).padStart(2, "0")
        const seconds = String(Math.floor((diff / 1000) % 60)).padStart(2, "0")

        setTimeLeft(`${hours}:${minutes}:${seconds}`)
      } else {
        setShowCountdown(false)
      }
    }

    updateTimer()

    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [])

  async function handleSave(e) {
    e.preventDefault()

    if (isLocked) {
      alert("Los extras ya están cerrados.")
      return
    }

    await saveUserExtras(user.uid, {
      champion,
      topScorer
    })

    setSaved(true)
  }

  return (
    <div className="bg-slate-900 rounded-3xl p-5 md:p-6 border border-slate-800 shadow-2xl">

      <div className="flex justify-between items-start gap-4 mb-2">
        <h2 className="text-2xl md:text-3xl font-black">
          ⭐ Extras
        </h2>

        {isLocked ? (
          <div className="bg-gray-500/20 border border-gray-500 text-gray-300 px-3 py-1 rounded-xl text-xs font-bold">
            🔒 CERRADO
          </div>
        ) : showCountdown ? (
          <div className="bg-red-500/20 border border-red-500 text-red-300 px-3 py-1 rounded-xl text-xs font-bold">
            ⏳ {timeLeft}
          </div>
        ) : (
          <div className="bg-green-500/20 border border-green-500 text-green-300 px-3 py-1 rounded-xl text-xs font-bold">
            🟢 ABIERTO
          </div>
        )}
      </div>

      <p className="text-slate-400 text-sm mb-6">
        Campeón suma 20 puntos. Goleador suma 15 puntos. Se bloquea 15 minutos antes del primer partido.
      </p>

      <form onSubmit={handleSave} className="space-y-4">

        <div>
          <label className="block text-slate-400 text-sm mb-2">
            Campeón del Mundial
          </label>

          <select
            value={champion}
            disabled={isLocked}
            onChange={(e) => setChampion(e.target.value)}
            className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 outline-none focus:border-blue-500 disabled:opacity-50"
            required
          >
            <option value="">Seleccionar campeón</option>

            {teams.map((team) => (
              <option key={team} value={team}>
                {team}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-slate-400 text-sm mb-2">
            Goleador del Mundial
          </label>

          <input
            type="text"
            value={topScorer}
            disabled={isLocked}
            onChange={(e) => setTopScorer(e.target.value)}
            placeholder="Ej: Mbappé"
            className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 outline-none focus:border-blue-500 disabled:opacity-50"
            required
          />
        </div>

        {!isLocked && (
          <button
            type="submit"
            className={
              saved
                ? "w-full bg-blue-600 hover:bg-blue-500 p-3 rounded-xl font-black"
                : "w-full bg-purple-600 hover:bg-purple-500 p-3 rounded-xl font-black"
            }
          >
            {saved ? "Modificar extras" : "Guardar extras"}
          </button>
        )}

      </form>

      {saved && (
        <div className="mt-4 bg-green-500/20 border border-green-500 text-green-300 rounded-xl p-3 text-center text-sm font-bold">
          Extras guardados ✔
        </div>
      )}

    </div>
  )
}

export default ExtrasPanel