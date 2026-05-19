import { useState } from "react"
import { saveMatchResult, deleteMatchResult } from "../services/matches"
import { resetWorldCup } from "../services/admin"
import { downloadBackup } from "../services/backup"

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

  async function handleDeleteResult() {
    const confirmDelete = confirm("¿Seguro que querés borrar el resultado oficial de este partido?")

    if (!confirmDelete) return

    await deleteMatchResult(selectedMatchId)

    setRealHome("")
    setRealAway("")

    await refreshResults()

    alert("Resultado oficial eliminado. El partido volvió a quedar sin resultado.")
  }

  async function handleBackup() {
    await downloadBackup()
  }

  async function handleReset() {
    const firstConfirm = confirm("⚠️ Esto va a borrar pronósticos, resultados y extras. ¿Querés continuar?")

    if (!firstConfirm) return

    const secondConfirm = prompt('Para confirmar, escribí exactamente: RESET')

    if (secondConfirm !== "RESET") {
      alert("Reset cancelado.")
      return
    }

    await resetWorldCup()

    alert("🔥 Mundial reseteado correctamente")

    await refreshResults()
  }

  return (
    <div className="bg-slate-900 rounded-3xl p-6 border border-yellow-500/40 shadow-2xl mb-10">
      <h2 className="text-3xl font-black mb-2">
        👑 Panel Admin
      </h2>

      <p className="text-slate-400 mb-6">
        Cargar resultados, borrar resultados y descargar backup.
      </p>

      <div className="mb-6 bg-slate-950 border border-slate-800 rounded-2xl p-4">
        <button
          onClick={handleBackup}
          className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-2xl font-black w-full"
        >
          📥 Descargar backup JSON
        </button>

        <p className="text-xs text-slate-500 mt-2 text-center">
          Descarga usuarios, pronósticos, extras y resultados oficiales.
        </p>
      </div>

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
          Resultado guardado ✔
        </div>
      )}

      <div className="mt-5">
        <button
          onClick={handleDeleteResult}
          className="bg-slate-700 hover:bg-slate-600 px-6 py-3 rounded-2xl font-black w-full"
        >
          🧽 Borrar resultado del partido seleccionado
        </button>

        <p className="text-xs text-slate-500 mt-2 text-center">
          Esto no borra pronósticos. Solo elimina el resultado oficial del partido.
        </p>
      </div>

      <div className="mt-8 border-t border-slate-700 pt-6">
        <button
          onClick={handleReset}
          className="bg-red-700 hover:bg-red-600 px-6 py-3 rounded-2xl font-black w-full"
        >
          🧨 Reset Mundial
        </button>

        <p className="text-xs text-slate-500 mt-2 text-center">
          Para confirmar el reset te va a pedir escribir RESET.
        </p>
      </div>
    </div>
  )
}

export default AdminPanel