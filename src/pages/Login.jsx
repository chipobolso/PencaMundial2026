import { useState } from "react"
import { login, register, resetPassword } from "../services/auth"

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

  async function handleResetPassword() {
    setMessage("")

    if (!email) {
      setMessage("Ingresá tu email y luego tocá 'Olvidé mi contraseña'.")
      return
    }

    try {
      await resetPassword(email)
      setMessage("Te enviamos un correo para restablecer tu contraseña.")
    } catch (error) {
      setMessage("No pudimos enviar el correo. Verificá que el email sea correcto.")
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-8 flex items-center justify-center">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">

        <div className="bg-gradient-to-br from-blue-700 via-sky-700 to-slate-900 rounded-3xl p-8 md:p-10 shadow-2xl border border-blue-400/30">
          <div className="mb-6 flex justify-center lg:justify-start">
            <img
              src="/worldcup.png"
              alt="Copa del Mundo"
              className="w-28 md:w-40 drop-shadow-2xl hover:scale-110 transition-transform duration-300"
            />
          </div>

          <h1 className="text-4xl md:text-6xl font-black leading-tight mb-4">
            PENCA MUNDIAL 2026
          </h1>

          <p className="text-xl md:text-2xl text-slate-100 font-bold mb-6">
            Estados Unidos · Canadá · México
          </p>

          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="bg-white/10 border border-white/20 rounded-2xl p-4 text-center">
              <div className="text-2xl mb-1">🇺🇸</div>
              <div className="text-xs font-bold">EEUU</div>
            </div>

            <div className="bg-white/10 border border-white/20 rounded-2xl p-4 text-center">
              <div className="text-2xl mb-1">🇨🇦</div>
              <div className="text-xs font-bold">Canadá</div>
            </div>

            <div className="bg-white/10 border border-white/20 rounded-2xl p-4 text-center">
              <div className="text-2xl mb-1">🇲🇽</div>
              <div className="text-xs font-bold">México</div>
            </div>
          </div>

          <div className="space-y-3 text-sm md:text-base text-slate-200">
            <div className="bg-black/20 rounded-2xl p-4">
              ⚽ Completá tus pronósticos de la fase de grupos.
            </div>

            <div className="bg-black/20 rounded-2xl p-4">
              🔒 Cada partido se bloquea 15 minutos antes del inicio.
            </div>

            <div className="bg-black/20 rounded-2xl p-4">
              🏆 Ranking, premios, campeón y goleador incluidos.
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-slate-900 p-8 md:p-10 rounded-3xl w-full shadow-2xl border border-slate-800"
        >
          <h2 className="text-3xl md:text-4xl font-black mb-2 text-center">
            {isRegister ? "Crear cuenta" : "Iniciar sesión"}
          </h2>

          <p className="text-slate-400 text-center mb-8">
            {isRegister
              ? "Registrate y esperá aprobación del administrador."
              : "Ingresá para completar tus pronósticos."}
          </p>

          {isRegister && (
            <>
              <input
                type="text"
                placeholder="Nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mb-4 p-4 rounded-xl bg-slate-800 border border-slate-700 outline-none focus:border-blue-500"
                required
              />

              <input
                type="text"
                placeholder="Apellido"
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
                className="w-full mb-4 p-4 rounded-xl bg-slate-800 border border-slate-700 outline-none focus:border-blue-500"
                required
              />
            </>
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mb-4 p-4 rounded-xl bg-slate-800 border border-slate-700 outline-none focus:border-blue-500"
            required
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mb-4 p-4 rounded-xl bg-slate-800 border border-slate-700 outline-none focus:border-blue-500"
            required
          />

          {!isRegister && (
            <button
              type="button"
              onClick={handleResetPassword}
              className="w-full mb-6 text-sm text-blue-300 hover:text-blue-200 font-bold"
            >
              Olvidé mi contraseña
            </button>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 p-4 rounded-xl font-black text-lg transition-all"
          >
            {isRegister ? "Registrarme" : "Ingresar"}
          </button>

          {message && (
            <div className="mt-5 text-center text-slate-200 bg-slate-800 rounded-xl p-3 border border-slate-700">
              {message}
            </div>
          )}

          <p
            className="text-center mt-6 cursor-pointer text-slate-400 hover:text-white"
            onClick={() => {
              setIsRegister(!isRegister)
              setMessage("")
            }}
          >
            {isRegister
              ? "Ya tengo cuenta. Iniciar sesión"
              : "No tengo cuenta. Registrarme"}
          </p>
        </form>
      </div>
    </div>
  )
}

export default Login