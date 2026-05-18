function Toast({ message }) {
  if (!message) return null

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] bg-green-600 text-white px-6 py-3 rounded-2xl shadow-2xl font-black border border-green-400">
      {message}
    </div>
  )
}

export default Toast