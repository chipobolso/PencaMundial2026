import { useEffect, useState } from "react"
import Login from "./pages/Login"
import RankingTable from "./components/RankingTable"
import AdminPanel from "./components/AdminPanel"
import AdminUsersPanel from "./components/AdminUsersPanel"
import ExtrasPanel from "./components/ExtrasPanel"
import AdminExtrasPanel from "./components/AdminExtrasPanel"
import GroupSection from "./components/GroupSection"
import ProgressPanel from "./components/ProgressPanel"
import Toast from "./components/Toast"
import PrizesPanel from "./components/PrizesPanel"
import PredictionsHistory from "./components/PredictionsHistory"
import PendingPredictionsAlert from "./components/PendingPredictionsAlert"
import { calculateMatchPoints } from "./services/scoring"
import { getRanking } from "./services/ranking"
import { getMatchResults } from "./services/matches"
import { getUserPredictions } from "./services/predictions"
import { groups, allMatchesBase } from "./data/fixtures"

function App() {
  const [user, setUser] = useState(null)
  const [ranking, setRanking] = useState([])
  const [matchResults, setMatchResults] = useState({})
  const [completedPredictions, setCompletedPredictions] = useState(0)
  const [activeTab, setActiveTab] = useState("inicio")
  const [toastMessage, setToastMessage] = useState("")
  const [userPredictions, setUserPredictions] = useState([])

  const adminEmail = "chipomartin88@gmail.com"

  function showToast(message) {
    setToastMessage(message)
    setTimeout(() => setToastMessage(""), 2500)
  }

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

  function getPendingUpcomingCount() {
    const now = new Date()

    const predictionMatchIds = userPredictions
      .filter((prediction) =>
        prediction.homeScore !== "" &&
        prediction.awayScore !== "" &&
        prediction.homeScore !== undefined &&
        prediction.awayScore !== undefined
      )
      .map((prediction) => prediction.matchId)

    return allMatchesBase.filter((match) => {
      const matchDate = parseMatchDate(match.date, match.time)
      const lockTime = new Date(matchDate.getTime() - 15 * 60 * 1000)
      const diff = lockTime - now

      const closesWithin24h = diff > 0 && diff <= 24 * 60 * 60 * 1000
      const alreadyPredicted = predictionMatchIds.includes(match.id)

      return closesWithin24h && !alreadyPredicted
    }).length
  }

  const pendingUpcomingCount = getPendingUpcomingCount()

  useEffect(() => {
    const savedUser = localStorage.getItem("user")

    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  useEffect(() => {
    if (!user) return

    async function loadData() {
      const results = await getMatchResults()
      setMatchResults(results)

      const matchesWithResults = allMatchesBase.map((match) => {
        const result = results[match.id]

        return {
          ...match,
          realHome: result?.realHome ?? "",
          realAway: result?.realAway ?? ""
        }
      })

      const rankingData = await getRanking(matchesWithResults)
      setRanking(rankingData)

      const predictions = await getUserPredictions(user.uid)
      setUserPredictions(predictions)

      const completed = predictions.filter((prediction) =>
        prediction.homeScore !== "" &&
        prediction.awayScore !== "" &&
        prediction.homeScore !== undefined &&
        prediction.awayScore !== undefined
      ).length

      setCompletedPredictions(completed)
    }

    loadData()

    const interval = setInterval(() => {
      loadData()
    }, 10000)

    return () => clearInterval(interval)
  }, [user])

  function handleLogout() {
    localStorage.removeItem("user")
    setUser(null)
  }

  async function refreshResults() {
    const results = await getMatchResults()
    setMatchResults(results)

    const matchesWithResults = allMatchesBase.map((match) => {
      const result = results[match.id]

      return {
        ...match,
        realHome: result?.realHome ?? "",
        realAway: result?.realAway ?? ""
      }
    })

    const rankingData = await getRanking(matchesWithResults)
    setRanking(rankingData)

    if (user) {
      const predictions = await getUserPredictions(user.uid)
      setUserPredictions(predictions)

      const completed = predictions.filter((prediction) =>
        prediction.homeScore !== "" &&
        prediction.awayScore !== "" &&
        prediction.homeScore !== undefined &&
        prediction.awayScore !== undefined
      ).length

      setCompletedPredictions(completed)
    }
  }

  function tabClass(tab) {
    return activeTab === tab
      ? "bg-blue-600 text-white"
      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
  }

  if (!user) {
    return <Login onLogin={setUser} />
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-3 md:p-5">
      <Toast message={toastMessage} />

      <div className="max-w-7xl mx-auto">

        <div className="bg-gradient-to-r from-sky-900 to-blue-600 rounded-3xl p-5 md:p-6 shadow-2xl mb-5 md:mb-6">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-5xl font-black mb-2">
                🏆 PENCA MUNDIAL 2026
              </h1>

              <p className="text-base md:text-lg text-slate-200">
                Bienvenido: {user.name} {user.lastname}
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-500 px-5 py-3 rounded-2xl font-black w-full md:w-auto"
            >
              Cerrar sesión
            </button>
          </div>
        </div>

        <div className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur border border-slate-800 rounded-3xl p-3 md:p-4 mb-5 md:mb-6 shadow-2xl overflow-x-auto">
          <div className="flex gap-2 min-w-max">

            <button onClick={() => setActiveTab("inicio")} className={`${tabClass("inicio")} px-4 py-2 rounded-xl font-black text-sm`}>
              Inicio
            </button>

            <button onClick={() => setActiveTab("ranking")} className={`${tabClass("ranking")} px-4 py-2 rounded-xl font-black text-sm`}>
              Ranking
            </button>

            <button onClick={() => setActiveTab("extras")} className={`${tabClass("extras")} px-4 py-2 rounded-xl font-black text-sm`}>
              Extras
            </button>

            <button onClick={() => setActiveTab("historial")} className={`${tabClass("historial")} px-4 py-2 rounded-xl font-black text-sm`}>
              Pronósticos {pendingUpcomingCount > 0 && `(${pendingUpcomingCount})`}
            </button>

            {Object.keys(groups).map((groupName) => (
              <button
                key={groupName}
                onClick={() => setActiveTab(groupName)}
                className={`${tabClass(groupName)} px-4 py-2 rounded-xl font-black text-sm`}
              >
                Grupo {groupName}
              </button>
            ))}

            {user.email === adminEmail && (
              <button onClick={() => setActiveTab("admin")} className={`${tabClass("admin")} px-4 py-2 rounded-xl font-black text-sm`}>
                Admin
              </button>
            )}

          </div>
        </div>

        {activeTab === "inicio" && (
          <>
            <PendingPredictionsAlert
              pendingCount={pendingUpcomingCount}
              onGoToPredictions={() => setActiveTab("historial")}
            />

            <ProgressPanel completed={completedPredictions} total={allMatchesBase.length} />

            <PrizesPanel participantsCount={ranking.length} />

            <div className="bg-slate-900 rounded-3xl p-4 md:p-6 border border-slate-800 shadow-2xl mb-6">
              <h2 className="text-2xl md:text-3xl font-black mb-5">
                🧮 Sistema de puntajes
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <div className="bg-slate-800 rounded-2xl p-4">
                  <div className="text-slate-400 text-sm">Marcador exacto</div>
                  <div className="text-2xl md:text-3xl font-black text-green-400">10 pts</div>
                </div>

                <div className="bg-slate-800 rounded-2xl p-4">
                  <div className="text-slate-400 text-sm">Diferencia</div>
                  <div className="text-2xl md:text-3xl font-black text-yellow-400">5 pts</div>
                </div>

                <div className="bg-slate-800 rounded-2xl p-4">
                  <div className="text-slate-400 text-sm">Ganador/Empate</div>
                  <div className="text-2xl md:text-3xl font-black text-blue-400">3 pts</div>
                </div>

                <div className="bg-slate-800 rounded-2xl p-4">
                  <div className="text-slate-400 text-sm">Goles exactos</div>
                  <div className="text-2xl md:text-3xl font-black text-purple-400">1 punto</div>
                </div>
              </div>

              <p className="text-slate-400 mt-4 text-sm">
                Si acertás marcador exacto, recibís 10 puntos y no se acumulan diferencia, ganador ni goles exactos.
              </p>

              <p className="text-slate-400 mt-2 text-sm">
                Campeón correcto suma 20 puntos. Goleador correcto suma 15 puntos.
              </p>
            </div>

            <div className="bg-slate-900 rounded-3xl p-4 md:p-6 border border-slate-800 shadow-2xl mb-6">
              <h2 className="text-2xl md:text-3xl font-black mb-5">
                📜 Reglas
              </h2>

              <div className="space-y-3 text-sm md:text-base text-slate-300">
                <p>• Se podrá pronosticar cada partido hasta <b>15 minutos antes</b> de su inicio.</p>
                <p>• Se podrá modificar el pronóstico las veces que se desee mientras esté abierto.</p>
                <p>• Vencido el plazo, el partido quedará bloqueado automáticamente.</p>
                <p>• Se podrá elegir <b>Campeón y Goleador</b> hasta 15 minutos antes del partido inaugural.</p>
                <p>• Una vez cerrado ese plazo, Campeón y Goleador quedarán bloqueados indefectiblemente y serán visibles para todos en la pestaña <b>“Pronósticos”</b>, sección <b>“Campeón y Goleador”</b>.</p>
                <p>• Los pronósticos de todos los usuarios serán visibles 15 minutos antes del inicio de cada partido en la pestaña <b>“Pronósticos”</b>, sección <b>“Pronósticos cerrados”</b>.</p>
                <p>• En la sección <b>“Historial de partidos finalizados”</b> quedarán todos los partidos ya concluidos, junto con el pronóstico de cada usuario.</p>

                <div className="pt-4 border-t border-slate-700">
                  <p className="font-black text-white mb-2">
                    En caso de empate en la tabla final, se definirá por:
                  </p>

                  <ol className="list-decimal list-inside space-y-1 text-slate-300">
                    <li>Mayor cantidad de aciertos exactos.</li>
                    <li>Mayor cantidad de aciertos de resultado.</li>
                    <li>Quien haya acertado al Campeón.</li>
                    <li>Quien haya acertado al Goleador.</li>
                    <li>Sorteo o acuerdo de división entre las partes.</li>
                  </ol>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === "ranking" && (
          <RankingTable ranking={ranking} currentUser={user} />
        )}

        {activeTab === "extras" && (
          <ExtrasPanel user={user} matches={allMatchesBase} />
        )}

        {activeTab === "historial" && (
          <PredictionsHistory
            matches={allMatchesBase}
            user={user}
            calculateMatchPoints={calculateMatchPoints}
            matchResults={matchResults}
            showToast={showToast}
            userPredictions={userPredictions}
          />
        )}

        {Object.entries(groups).map(([groupName, matches]) => (
          activeTab === groupName && (
            <GroupSection
              key={groupName}
              groupName={groupName}
              matches={matches}
              matchResults={matchResults}
              user={user}
              calculateMatchPoints={calculateMatchPoints}
              showToast={showToast}
            />
          )
        ))}

        {activeTab === "admin" && user.email === adminEmail && (
          <>
            <AdminUsersPanel />

            <AdminPanel
              matches={allMatchesBase}
              matchResults={matchResults}
              refreshResults={refreshResults}
            />

            <AdminExtrasPanel
              refreshResults={refreshResults}
            />
          </>
        )}

      </div>
    </div>
  )
}

export default App