import { useEffect, useState } from "react"
import { getPendingUsers, approveUser, denyUser } from "../services/users"

function AdminUsersPanel() {
  const [users, setUsers] = useState([])

  async function loadUsers() {
    const pending = await getPendingUsers()
    setUsers(pending)
  }

  useEffect(() => {
    loadUsers()
  }, [])

  async function handleApprove(userId) {
    await approveUser(userId)
    await loadUsers()
  }

  async function handleDeny(userId) {
    const confirmDeny = confirm("¿Seguro que querés denegar este usuario?")

    if (!confirmDeny) return

    await denyUser(userId)
    await loadUsers()
  }

  return (
    <div className="bg-slate-900 rounded-3xl p-6 border border-yellow-500/40 shadow-2xl mb-10">
      <h2 className="text-3xl font-black mb-4">
        👥 Usuarios pendientes
      </h2>

      {users.length === 0 ? (
        <p className="text-slate-400">
          No hay usuarios pendientes
        </p>
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <div
              key={user.uid}
              className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800"
            >
              <div>
                <div className="font-bold">
                  {user.name} {user.lastname}
                </div>

                <div className="text-sm text-slate-400">
                  {user.email}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(user.uid)}
                  className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-xl font-black"
                >
                  Aprobar
                </button>

                <button
                  onClick={() => handleDeny(user.uid)}
                  className="bg-red-700 hover:bg-red-600 px-4 py-2 rounded-xl font-black"
                >
                  Denegar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminUsersPanel