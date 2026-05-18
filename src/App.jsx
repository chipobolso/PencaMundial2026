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

  const adminEmail = "chipomartin88@gmail.com"

  function showToast(message) {
    setToastMessage(message)

    setTimeout(() => {
      setToastMessage("")
    }, 2500)
  }

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

      const userPredictions = await getUserPredictions(user.uid)

      const completed = userPredictions.filter((prediction) =>
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
      const userPredictions = await getUserPredictions(user.uid)

      const completed = userPredictions.filter((prediction) =>
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
              Pronósticos
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
                  <div className="text-2xl md:text-3xl font-black text-purple-400">+1 c/u</div>
                </div>
              </div>

              <p className="text-slate-400 mt-4 text-sm">
                Si acertás marcador exacto, recibís 10 puntos y no se acumulan diferencia, ganador ni goles exactos.
              </p>

              <p className="text-slate-400 mt-2 text-sm">
                Campeón correcto suma 20 puntos. Goleador correcto suma 15 puntos.
              </p>
            </div>
          </>
        )}

        {activeTab === "ranking" && (
          <RankingTable ranking={ranking} currentUser={user} />
        )}

        {activeTab === "extras" && (
          <ExtrasPanel user={user} />
        )}

        {activeTab === "historial" && (
          <PredictionsHistory matches={allMatchesBase} />
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

            <AdminPanel matches={allMatchesBase} refreshResults={refreshResults} />

            <AdminExtrasPanel refreshResults={refreshResults} />
          </>
        )}

      </div>
    </div>
  )
}

export default App