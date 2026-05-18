import MatchCard from "./MatchCard"
import GroupTable from "./GroupTable"
import { teams } from "../data/fixtures"

function GroupSection({
  groupName,
  matches,
  matchResults,
  user,
  calculateMatchPoints,
  showToast
}) {
  const groupTeams = teams.filter((team) =>
    matches.some((match) => match.home === team || match.away === team)
  )

  return (
    <div className="mb-8 bg-slate-900/70 border border-slate-800 rounded-3xl p-4 md:p-5 shadow-2xl">

      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-2xl md:text-3xl font-black">
            Grupo {groupName}
          </h2>

          <p className="text-slate-400 text-xs md:text-sm">
            Completá tus 6 pronósticos del grupo
          </p>
        </div>

        <div className="bg-blue-600 px-4 py-2 rounded-xl font-black">
          {groupName}
        </div>
      </div>

      <div className="grid xl:grid-cols-5 gap-5">

        <div className="xl:col-span-2 overflow-x-auto">
          <GroupTable
            teams={groupTeams}
            matches={matches}
            matchResults={matchResults}
          />
        </div>

        <div className="xl:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
          {matches.map((match) => {
            const result = matchResults[match.id]

            return (
              <MatchCard
                key={match.id}
                matchId={match.id}
                user={user}
                date={match.date}
                time={match.time}
                home={match.home}
                away={match.away}
                realHome={result?.realHome ?? ""}
                realAway={result?.realAway ?? ""}
                calculateMatchPoints={calculateMatchPoints}
                showToast={showToast}
              />
            )
          })}
        </div>

      </div>

    </div>
  )
}

export default GroupSection