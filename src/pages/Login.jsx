import { useState } from "react"
import { login, register } from "../services/auth"

function Login({ onLogin }) {
  const [name, setName] = useState("")
  const [lastname, setLastname] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isRegister, setIsRegister] = useState(false)
  const [message, setMessage] = useState("")

  async function handleSubmit(e) {
    e.preventDefault()
    setMessage("")

    try {
      if (isRegister) {
        await register(email, password, name, lastname)

        setMessage("Usuario creado. Quedó pendiente de aprobación del administrador.")
        setIsRegister(false)
        setPassword("")
      } else {
        const userData = await login(email, password)

        localStorage.setItem("user", JSON.stringify(userData))
        onLogin(userData)
      }
    } catch (error) {
      setMessage(error.message)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 p-10 rounded-3xl w-full max-w-md shadow-2xl border border-slate-800"
      >
        <h2 className="text-4xl font-black mb-8 text-center">
          {isRegister ? "Registrarse" : "Iniciar sesión"}
        </h2>

        {isRegister && (
          <>
            <input
              type="text"
              placeholder="Nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mb-4 p-4 rounded-xl bg-slate-800 border border-slate-700"
              required
            />

            <input
              type="text"
              placeholder="Apellido"
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
              className="w-full mb-4 p-4 rounded-xl bg-slate-800 border border-slate-700"
              required
            />
          </>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 p-4 rounded-xl bg-slate-800 border border-slate-700"
          required
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-6 p-4 rounded-xl bg-slate-800 border border-slate-700"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-500 p-4 rounded-xl font-black"
        >
          {isRegister ? "Crear usuario" : "Ingresar"}
        </button>

        {message && (
          <div className="mt-5 text-center text-slate-300 bg-slate-800 rounded-xl p-3">
            {message}
          </div>
        )}

        <p
          className="text-center mt-6 cursor-pointer text-slate-400"
          onClick={() => {
            setIsRegister(!isRegister)
            setMessage("")
          }}
        >
          {isRegister
            ? "Ya tenés cuenta? Iniciar sesión"
            : "No tenés cuenta? Registrate"}
        </p>
      </form>
    </div>
  )
}

export default Login