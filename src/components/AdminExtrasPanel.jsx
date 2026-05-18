import { useState } from "react"
import { saveMatchResult } from "../services/matches"

function AdminExtrasPanel({ refreshResults }) {
  const [champion, setChampion] = useState("")
  const [topScorer, setTopScorer] = useState("")
  const [saved, setSaved] = useState(false)

  async function handleSave(e) {
    e.preventDefault()

    await saveMatchResult("EXTRAS_FINAL", {
      realHome: champion,
      realAway: topScorer
    })

    await refreshResults()

    setSaved(true)

    setTimeout(() => {
      setSaved(false)
    }, 2500)
  }

  return (
    <div className="bg-slate-900 rounded-3xl p-6 border border-purple-500/40 shadow-2xl mb-10">
      <h2 className="text-3xl font-black mb-2">
        👑 Admin Extras Finales
      </h2>

      <p className="text-slate-400 mb-6">
        Cargar campeón y goleador oficiales al terminar el Mundial.
      </p>

      <form onSubmit={handleSave} className="grid md:grid-cols-3 gap-4 items-end">

        <div>
          <label className="block text-slate-400 mb-2">
            Campeón oficial
          </label>

          <input
            type="text"
            value={champion}
            onChange={(e) => setChampion(e.target.value)}
            placeholder="Ej: Argentina"
            className="w-full p-4 rounded-xl bg-slate-800 border border-slate-700"
            required
          />
        </div>

        <div>
          <label className="block text-slate-400 mb-2">
            Goleador oficial
          </label>

          <input
            type="text"
            value={topScorer}
            onChange={(e) => setTopScorer(e.target.value)}
            placeholder="Ej: Mbappé"
            className="w-full p-4 rounded-xl bg-slate-800 border border-slate-700"
            required
          />
        </div>

        <button
          type="submit"
          className="bg-purple-600 hover:bg-purple-500 p-4 rounded-xl font-black"
        >
          Guardar oficiales
        </button>

      </form>

      {saved && (
        <div className="mt-4 bg-green-500/20 border border-green-500 text-green-300 rounded-xl p-3 font-bold">
          Extras oficiales guardados ✔
        </div>
      )}
    </div>
  )
}

export default AdminExtrasPanel