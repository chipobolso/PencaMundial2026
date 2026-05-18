import { useState } from "react"
import { saveMatchResult } from "../services/matches"

function AdminPanel({ matches, refreshResults }) {
  const [selectedMatchId, setSelectedMatchId] = useState(matches[0]?.id || "")
  const [realHome, setRealHome] = useState("")
  const [realAway, setRealAway] = useState("")
  const [saved, setSaved] = useState(false)

  const selectedMatch = matches.find((match) => match.id === selectedMatchId)

  async function handleSave(e) {
    e.preventDefault()

    await saveMatchResult(selectedMatchId, {
      realHome,
      realAway
    })

    await refreshResults()

    setSaved(true)

    setTimeout(() => {
      setSaved(false)
    }, 2500)
  }

  return (
    <div className="bg-slate-900 rounded-3xl p-6 border border-yellow-500/40 shadow-2xl mb-10">
      <h2 className="text-3xl font-black mb-2">
        👑 Panel Admin
      </h2>

      <p className="text-slate-400 mb-6">
        Cargar resultados reales de los partidos.
      </p>

      <form onSubmit={handleSave} className="grid md:grid-cols-5 gap-4 items-end">

        <div className="md:col-span-2">
          <label className="block text-slate-400 mb-2">
            Partido
          </label>

          <select
            value={selectedMatchId}
            onChange={(e) => setSelectedMatchId(e.target.value)}
            className="w-full p-4 rounded-xl bg-slate-800 border border-slate-700"
          >
            {matches.map((match) => (
              <option key={match.id} value={match.id}>
                {match.id} - {match.home} vs {match.away}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-slate-400 mb-2">
            {selectedMatch?.home}
          </label>

          <input
            type="number"
            min="0"
            value={realHome}
            onChange={(e) => setRealHome(e.target.value)}
            className="w-full p-4 rounded-xl bg-slate-800 border border-slate-700 text-center text-2xl font-black"
            required
          />
        </div>

        <div>
          <label className="block text-slate-400 mb-2">
            {selectedMatch?.away}
          </label>

          <input
            type="number"
            min="0"
            value={realAway}
            onChange={(e) => setRealAway(e.target.value)}
            className="w-full p-4 rounded-xl bg-slate-800 border border-slate-700 text-center text-2xl font-black"
            required
          />
        </div>

        <button
          type="submit"
          className="bg-yellow-500 hover:bg-yellow-400 text-black p-4 rounded-xl font-black"
        >
          Guardar resultado
        </button>

      </form>

      {saved && (
        <div className="mt-4 bg-green-500/20 border border-green-500 text-green-300 rounded-xl p-3 font-bold">
          Resultado guardado y ranking actualizado ✔
        </div>
      )}
    </div>
  )
}

export default AdminPanel