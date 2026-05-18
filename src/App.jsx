import { useEffect, useState } from "react"
import Login from "./pages/Login"
import RankingTable from "./components/RankingTable"
import AdminPanel from "./components/AdminPanel"
import AdminUsersPanel from "./components/AdminUsersPanel"
import ExtrasPanel from "./components/ExtrasPanel"
import AdminExtrasPanel from "./components/AdminExtrasPanel"
import GroupSection from "./components/GroupSection"
import { calculateMatchPoints } from "./services/scoring"
import { getRanking } from "./services/ranking"
import { getMatchResults } from "./services/matches"
import { groups, allMatchesBase } from "./data/fixtures"

function App() {
  const [user, setUser] = useState(null)
  const [ranking, setRanking] = useState([])
  const [matchResults, setMatchResults] = useState({})

  const adminEmail = "chipomartin88@gmail.com"

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
  }

  if (!user) {
    return <Login onLogin={setUser} />
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-5">
      <div className="max-w-7xl mx-auto">

        <div className="bg-gradient-to-r from-sky-900 to-blue-600 rounded-3xl p-6 shadow-2xl mb-6">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-black mb-2">
                🏆 PENCA MUNDIAL 2026
              </h1>

              <p className="text-lg text-slate-200">
                Bienvenido: {user.name} {user.lastname}
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-500 px-5 py-3 rounded-2xl font-black"
            >
              Cerrar sesión
            </button>
          </div>
        </div>

        {user.email === adminEmail && (
          <>
            <AdminUsersPanel />

            <AdminPanel
              matches={allMatchesBase}
              refreshResults={refreshResults}
            />

            <AdminExtrasPanel
              refreshResults={refreshResults}
            />
          </>
        )}

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <RankingTable ranking={ranking} />
          <ExtrasPanel user={user} />
        </div>

        {Object.entries(groups).map(([groupName, matches]) => (
          <GroupSection
            key={groupName}
            groupName={groupName}
            matches={matches}
            matchResults={matchResults}
            user={user}
            calculateMatchPoints={calculateMatchPoints}
          />
        ))}

      </div>
    </div>
  )
}

export default App