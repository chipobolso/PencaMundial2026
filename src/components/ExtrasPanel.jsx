import { useEffect, useState } from "react"
import { saveUserExtras, getUserExtras } from "../services/extras"

function ExtrasPanel({ user }) {
  const [champion, setChampion] = useState("")
  const [topScorer, setTopScorer] = useState("")
  const [saved, setSaved] = useState(false)
  const [isLocked, setIsLocked] = useState(false)

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

  useEffect(() => {
    async function loadExtras() {
      const data = await getUserExtras(user.uid)

      if (data) {
        setChampion(data.champion || "")
        setTopScorer(data.topScorer || "")
        setSaved(true)
      }
    }

    loadExtras()
  }, [user.uid])

  useEffect(() => {
    const firstMatch = parseMatchDate("11 Junio 2026", "16:00")
    const lockTime = new Date(firstMatch.getTime() - 15 * 60 * 1000)

    function checkLock() {
      if (new Date() >= lockTime) {
        setIsLocked(true)
      }
    }

    checkLock()

    const interval = setInterval(checkLock, 1000)

    return () => clearInterval(interval)
  }, [])

  async function handleSave() {
    if (isLocked) return

    await saveUserExtras(user.uid, {
      champion,
      topScorer
    })

    setSaved(true)
  }

  return (
    <div className="bg-slate-900 rounded-3xl p-5 md:p-6 border border-slate-800 shadow-2xl max-w-2xl mx-auto">

      <h2 className="text-2xl md:text-3xl font-black mb-4 text-center">
        ⭐ Extras
      </h2>

      <p className="text-slate-400 text-sm text-center mb-6">
        Elegí el campeón del mundo y el goleador del torneo.
      </p>

      {isLocked && (
        <div className="bg-red-500/10 border border-red-500 text-red-300 p-3 rounded-xl mb-5 text-center text-sm font-bold">
          🔒 Pronósticos cerrados
        </div>
      )}

      <div className="space-y-4">

        <div>
          <label className="text-sm text-slate-400 block mb-1">
            Campeón
          </label>

          <input
            type="text"
            value={champion}
            onChange={(e) => setChampion(e.target.value)}
            disabled={isLocked}
            className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 outline-none focus:border-blue-500 disabled:opacity-50"
            placeholder="Ej: Argentina"
          />
        </div>

        <div>
          <label className="text-sm text-slate-400 block mb-1">
            Goleador
          </label>

          <input
            type="text"
            value={topScorer}
            onChange={(e) => setTopScorer(e.target.value)}
            disabled={isLocked}
            className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 outline-none focus:border-blue-500 disabled:opacity-50"
            placeholder="Ej: Mbappé"
          />
        </div>

        {!isLocked && (
          <button
            onClick={handleSave}
            className="w-full bg-blue-600 hover:bg-blue-500 p-3 rounded-xl font-black mt-3"
          >
            {saved ? "Modificar" : "Guardar"}
          </button>
        )}

        {saved && (
          <div className="text-green-400 text-center text-sm mt-2">
            ✔ Guardado correctamente
          </div>
        )}

      </div>

    </div>
  )
}

export default ExtrasPanel