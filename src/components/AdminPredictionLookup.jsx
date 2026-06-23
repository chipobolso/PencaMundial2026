import { useEffect, useState } from "react"
import { db } from "../services/firebase"
import { collection, getDocs } from "firebase/firestore"
import { getUserPredictions } from "../services/predictions"

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

function isMatchOpen(match) {
  const matchDate = parseMatchDate(match.date, match.time)
  const lockTime = new Date(matchDate.getTime() - 15 * 60 * 1000)

  return new Date() < lockTime
}

function formatUpdatedAt(updatedAt) {
  if (!updatedAt) return "Sin fecha"

  if (updatedAt.toDate) {
    return updatedAt.toDate().toLocaleString("es-UY")
  }

  return "Sin fecha"
}

function AdminPredictionLookup({ matches }) {
  const [users, setUsers] = useState([])
  const [selectedUserId, setSelectedUserId] = useState("")
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function loadUsers() {
      const snapshot = await getDocs(collection(db, "users"))
      const approvedUsers = []

      snapshot.forEach((docSnap) => {
        const user = docSnap.data()

        if (user.status === "approved") {
          approvedUsers.push(user)
        }
      })

      approvedUsers.sort((a, b) => {
        const nameA = `${a.name} ${a.lastname}`.toLowerCase()
        const nameB = `${b.name} ${b.lastname}`.toLowerCase()
        return nameA.localeCompare(nameB)
      })

      setUsers(approvedUsers)

      if (approvedUsers.length > 0) {
        setSelectedUserId(approvedUsers[0].uid)
      }
    }

    loadUsers()
  }, [])

  async function handleSearch() {
    if (!selectedUserId) return

    setLoading(true)

    const userPredictions = await getUserPredictions(selectedUserId)
    const openMatches = matches.filter(isMatchOpen)

    const predictionsByMatch = {}

    userPredictions.forEach((prediction) => {
      predictionsByMatch[prediction.matchId] = prediction
    })

    const openPredictions = openMatches
      .map((match) => {
        const prediction = predictionsByMatch[match.id]

        if (!prediction) return null

        return {
          match,
          prediction
        }
      })
      .filter(Boolean)

    setResults(openPredictions)
    setLoading(false)
  }

  const selectedUser = users.find((user) => user.uid === selectedUserId)

  return (
    <div className="bg-slate-900 rounded-3xl p-6 border border-blue-500/40 shadow-2xl mb-10">
      <h2 className="text-3xl font-black mb-2">
        🔍 Consultar pronósticos abiertos
      </h2>

      <p className="text-slate-400 mb-6">
        Herramienta admin para ver qué pronósticos tiene cargados un usuario en partidos que todavía no cerraron.
      </p>

      <div className="grid md:grid-cols-3 gap-4 items-end">
        <div className="md:col-span-2">
          <label className="block text-slate-400 mb-2">
            Usuario
          </label>

          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="w-full p-4 rounded-xl bg-slate-800 border border-slate-700"
          >
            {users.map((user) => (
              <option key={user.uid} value={user.uid}>
                {user.name} {user.lastname} - {user.email}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleSearch}
          className="bg-blue-600 hover:bg-blue-500 px-6 py-4 rounded-xl font-black"
        >
          Buscar
        </button>
      </div>

      {loading && (
        <div className="mt-5 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-slate-400">
          Buscando pronósticos...
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="mt-6">
          <div className="mb-4 text-slate-300 font-bold">
            Pronósticos abiertos de {selectedUser?.name} {selectedUser?.lastname}: {results.length}
          </div>

          <div className="space-y-3">
            {results.map(({ match, prediction }) => (
              <div
                key={match.id}
                className="bg-slate-950 border border-slate-800 rounded-2xl p-4"
              >
                <div className="flex flex-col md:flex-row md:justify-between gap-3">
                  <div>
                    <div className="font-black text-lg">
                      {match.home} vs {match.away}
                    </div>

                    <div className="text-slate-400 text-sm">
                      Grupo {match.group} · {match.date} · {match.time} UYT
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-black text-blue-300">
                      {prediction.homeScore} - {prediction.awayScore}
                    </div>

                    <div className="text-xs text-slate-500">
                      Última modificación: {formatUpdatedAt(prediction.updatedAt)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && results.length === 0 && selectedUserId && (
        <div className="mt-5 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-slate-400">
          No hay pronósticos abiertos cargados para este usuario, o todavía no buscaste.
        </div>
      )}
    </div>
  )
}

export default AdminPredictionLookup