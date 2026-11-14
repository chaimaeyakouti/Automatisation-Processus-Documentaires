import { useEffect, useState } from 'react'

function App() {
  const [data, setData] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    fetch('/api/ping')
      .then((r) => r.json())
      .then(setData)
      .catch((e) => setError(e.message))
  }, [])

  return (
    <div style={{ padding: 24 }}>
      <h1>Gestion documentaire</h1>
      {data && <p>Backend : {data.status}</p>}
      {error && <p>Erreur : {error}</p>}
      {!data && !error && <p>Chargement…</p>}
    </div>
  )
}

export default App