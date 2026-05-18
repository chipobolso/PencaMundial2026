import { useEffect, useState } from "react"
import { getUserExtras, saveUserExtras } from "../services/extras"

function ExtrasPanel({ user }) {
  const [champion, setChampion] = useState("")
  const [topScorer, setTopScorer] = useState("")
  const [saved, setSaved] = useState(false)

  // 🔥 LISTA DE SELECCIONES (base fuerte)
  const teams = [
    "Argentina",
    "Brasil",
    "Uruguay",
    "Francia",
    "España",
    "Inglaterra",
    "Portugal",
    "Alemania",
    "Países Bajos",
    "Italia",
    "Bélgica",
    "Croacia",
    "México",
    "Estados Unidos",
    "Colombia",
    "Chile",
    "Perú",
    "Ecuador",
    "Paraguay",
    "Venezuela",
    "Japón",
    "Corea del Sur",
    "Arabia Saudita",
    "Irán",
    "Australia",
    "Marruecos",
    "Senegal",
    "Nigeria",
    "Camerún",
    "Ghana",
    "Egipto",
    "Canadá",
    "Costa Rica",
    "Panamá",
    "Polonia",
    "Suiza",
    "Dinamarca",
    "Suecia",
    "Noruega",
    "Austria",
    "Serbia",
    "Turquía",
    "República Checa",
    "Grecia",
    "Ucrania",
    "Rumania",
    "Escocia",
    "Gales"
  ]

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
      <h2 className="text-3xl font-black mb-2">
        ⭐ Extras
      </h2>

      <p className="text-slate-400 mb-6">
        Campeón suma 20 puntos. Goleador suma 15 puntos.
      </p>

      <form onSubmit={handleSave} className="grid md:grid-cols-3 gap-4 items-end">

        <div>
          <label className="block text-slate-400 mb-2">
            Campeón del Mundial
          </label>

          <select
            value={champion}
            onChange={(e) => setChampion(e.target.value)}
            className="w-full p-4 rounded-xl bg-slate-800 border border-slate-700"
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
          Guardar extras
        </button>

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