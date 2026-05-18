import { useEffect, useState } from "react"
import { getUserExtras, saveUserExtras } from "../services/extras"
import { teams } from "../data/fixtures"

function ExtrasPanel({ user }) {
  const [champion, setChampion] = useState("")
  const [topScorer, setTopScorer] = useState("")
  const [saved, setSaved] = useState(false)

  const firstMatchDate = new Date("2026-06-11T16:00:00-03:00")
  const lockTime = new Date(firstMatchDate.getTime() - 15 * 60 * 1000)
  const isLocked = new Date() >= lockTime

  useEffect(() => {
    async function loadExtras() {
      const extras = await getUserExtras(user.uid)

      if (extras) {
        setChampion(extras.champion || "")
        setTopScorer(extras.topScorer || "")
      }
    }

    loadExtras()
  }, [user.uid])

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

    setTimeout(() => {
      setSaved(false)
    }, 2500)
  }

  return (
    <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-2xl mb-10">
      <div className="flex justify-between items-start gap-4 mb-2">
        <h2 className="text-3xl font-black">
          ⭐ Extras
        </h2>

        {isLocked ? (
          <div className="bg-gray-500/20 border border-gray-500 text-gray-300 px-3 py-1 rounded-xl text-xs font-bold">
            🔒 CERRADO
          </div>
        ) : (
          <div className="bg-green-500/20 border border-green-500 text-green-300 px-3 py-1 rounded-xl text-xs font-bold">
            ABIERTO
          </div>
        )}
      </div>

      <p className="text-slate-400 mb-6">
        Campeón suma 20 puntos. Goleador suma 15 puntos. Se bloquean 15 minutos antes del primer partido.
      </p>

      <form onSubmit={handleSave} className="grid md:grid-cols-3 gap-4 items-end">

        <div>
          <label className="block text-slate-400 mb-2">
            Campeón del Mundial
          </label>

          <select
            value={champion}
            disabled={isLocked}
            onChange={(e) => setChampion(e.target.value)}
            className="w-full p-4 rounded-xl bg-slate-800 border border-slate-700 disabled:opacity-50"
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
          <label className="block text-slate-400 mb-2">
            Goleador del Mundial
          </label>

          <input
            type="text"
            value={topScorer}
            disabled={isLocked}
            onChange={(e) => setTopScorer(e.target.value)}
            placeholder="Ej: Mbappé"
            className="w-full p-4 rounded-xl bg-slate-800 border border-slate-700 disabled:opacity-50"
            required
          />
        </div>

        {!isLocked && (
          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-500 p-4 rounded-xl font-black"
          >
            Guardar extras
          </button>
        )}

      </form>

      {saved && (
        <div className="mt-4 bg-green-500/20 border border-green-500 text-green-300 rounded-xl p-3 font-bold">
          Extras guardados ✔
        </div>
      )}
    </div>
  )
}

export default ExtrasPanel