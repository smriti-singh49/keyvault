import { useEffect, useState } from "react"

function App() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [token, setToken] = useState("")
  const [keys, setKeys] = useState([])
  const [auditLogs, setAuditLogs] = useState([])
  const [usageLogs, setUsageLogs] = useState([])
  const [keyName, setKeyName] = useState("")
  const [environment, setEnvironment] = useState("development")
  const [expiresInDays, setExpiresInDays] = useState("")
  const [scopes, setScopes] = useState([])

  const handleLogin = async (event) => {
    event.preventDefault()

    const response = await fetch("http://127.0.0.1:8000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: username,
        password: password
      })
    })

    const data = await response.json()

    if (response.ok) {
      setToken(data.access_token)
      console.log("Login successful")
    } else {
      console.log(data.detail)
    }
  }

  const fetchKeys = async () => {
    const response = await fetch("http://127.0.0.1:8000/keys", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    const data = await response.json()
    setKeys(data)
  }

  const fetchAuditLogs = async () => {
    const response = await fetch(
      "http://127.0.0.1:8000/audit-logs",
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    const data = await response.json()
    setAuditLogs(data)
  }

  const fetchUsageLogs = async () => {
    const response = await fetch(
      "http://127.0.0.1:8000/usage",
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    const data = await response.json()
    setUsageLogs(data)
  }

  const handleRevokeKey = async (keyId) => {
    const response = await fetch(
      `http://127.0.0.1:8000/keys/${keyId}/revoke`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    const data = await response.json()

    if (response.ok) {
      alert("API key revoked")

      fetchKeys()
      fetchAuditLogs()
    } else {
      alert(data.detail)
    }
  }


  const handleRotateKey = async (keyId) => {
    const response = await fetch(
      `http://127.0.0.1:8000/keys/${keyId}/rotate`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    const data = await response.json()

    if (response.ok) {
      alert(`Your new API key is:\n\n${data.api_key}`)

      fetchKeys()
      fetchAuditLogs()
    } else {
      alert(data.detail)
    }
  }


  const handleCreateKey = async (event) => {
  event.preventDefault()

  const response = await fetch("http://127.0.0.1:8000/keys", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      name: keyName,
      environment: environment,
      expires_in_days: expiresInDays
        ? Number(expiresInDays)
        : null,
      scopes: scopes
    })
  })

  const data = await response.json()

  if (response.ok) {
    alert(`Your new API key is:\n\n${data.api_key}`)

    setKeyName("")
    setExpiresInDays("")
    setScopes([])

    fetchKeys()
    fetchAuditLogs()
  }
}

useEffect(() => {
  if (!token) {
    return
  }

  fetchKeys()
  fetchAuditLogs()
  fetchUsageLogs()
}, [token])

  return (
    <div>
      <h1>KeyVault</h1>

      {!token ? (
        <>
          <h2>Login</h2>

          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />

            <br />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />

            <br />

            <button type="submit">
              Login
            </button>
          </form>
        </>
      ) : (
        <>
          <p>Logged in successfully</p>

          <button onClick={() => setToken("")}>
            Logout
          </button>
        </>
      )}
      
      
      {token && (
        <>
          <h2>Create API Key</h2>

          <form onSubmit={handleCreateKey}>
            <input
              type="text"
              placeholder="Key name"
              value={keyName}
              onChange={(event) => setKeyName(event.target.value)}
            />

            <br />

            <select
              value={environment}
              onChange={(event) => setEnvironment(event.target.value)}
            >
              <option value="development">Development</option>
              <option value="production">Production</option>
            </select>

            <br />

            <input
              type="number"
              placeholder="Expires in days"
              value={expiresInDays}
              onChange={(event) => setExpiresInDays(event.target.value)}
            />

            <br />
            <div>
              <p>Permissions</p>

              <label>
                <input
                  type="checkbox"
                  checked={scopes.includes("read")}
                  onChange={(event) => {
                    if (event.target.checked) {
                      setScopes([...scopes, "read"])
                    } else {
                      setScopes(scopes.filter((scope) => scope !== "read"))
                    }
                  }}
                />
                Read
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={scopes.includes("write")}
                  onChange={(event) => {
                    if (event.target.checked) {
                      setScopes([...scopes, "write"])
                    } else {
                      setScopes(scopes.filter((scope) => scope !== "write"))
                    }
                  }}
                />
                Write
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={scopes.includes("delete")}
                  onChange={(event) => {
                    if (event.target.checked) {
                      setScopes([...scopes, "delete"])
                    } else {
                      setScopes(scopes.filter((scope) => scope !== "delete"))
                    }
                  }}
                />
                Delete
              </label>
            </div>

            <button type="submit">
              Create API Key
            </button>
          </form>

          <h2>My API Keys</h2>

          {keys.map((key) => (
            <div key={key.id}>
              <h3>{key.name}</h3>

              <p>Environment: {key.environment}</p>

              <p>Status: {key.status}</p>

              <p>Scopes:</p>

              <div>
                {key.scopes.map((scope) => (
                  <span key={scope} className="scope-badge">
                    {scope}
                  </span>
                ))}
              </div>

              {key.status === "active" && (
                <>
                  <button onClick={() => handleRevokeKey(key.id)}>
                    Revoke
                  </button>

                  <button onClick={() => handleRotateKey(key.id)}>
                    Rotate
                  </button>
                </>
              )}

              <p>
                Expires:{" "}
                {key.expires_at
                  ? new Date(key.expires_at).toLocaleDateString()
                  : "Never"}
              </p>
            </div>
          ))}

          <h2>Recent Activity</h2>

          {auditLogs.map((log) => (
            <div key={log.id}>
              <h3>{log.action}</h3>

              <p>{log.details}</p>

              <p>
                {new Date(log.created_at).toLocaleString()}
              </p>
            </div>
          ))}

          <h2>API Usage</h2>

          {usageLogs.map((usage) => (
            <div key={usage.id}>
              <p>
                API Key ID: {usage.api_key_id}
              </p>

              <p>
                Endpoint: {usage.endpoint}
              </p>

              <p>
                Used at:{" "}
                {new Date(usage.used_at).toLocaleString()}
              </p>
            </div>
          ))}

        </>
      )}
    </div>
  )
}

export default App