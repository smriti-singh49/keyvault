import { useEffect, useMemo, useState } from "react"

const API = "http://localhost:8000"

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "grid" },
  { id: "keys", label: "API Keys", icon: "key" },
  { id: "usage", label: "Usage", icon: "activity" },
  { id: "audit", label: "Audit Logs", icon: "shield" }
]

const SCOPE_OPTIONS = ["read", "write", "delete"]

// TODO: replace with your real repository URL before deploying.
const GITHUB_URL = "https://github.com/smriti-singh49/keyvault"

function Icon({ name, size = 17 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }

  const paths = {
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),
    key: (
      <>
        <circle cx="8" cy="15" r="4" />
        <path d="m11 12 8-8" />
        <path d="m16 5 3 3" />
        <path d="m13 10 3 3" />
      </>
    ),
    activity: (
      <>
        <path d="M3 12h4l3-8 4 16 3-8h4" />
      </>
    ),
    shield: (
      <>
        <path d="M12 3 20 6v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    plus: (
      <>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="6.5" />
        <path d="m16 16 4.5 4.5" />
      </>
    ),
    more: (
      <>
        <circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" />
        <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
        <circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" />
      </>
    ),
    eye: (
      <>
        <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
        <circle cx="12" cy="12" r="2.5" />
      </>
    ),
    eyeOff: (
      <>
        <path d="m3 3 18 18" />
        <path d="M10.6 6.2A10.7 10.7 0 0 1 12 6c6 0 9.5 6 9.5 6a17 17 0 0 1-3.1 3.8" />
        <path d="M6.2 6.8C3.8 8.4 2.5 12 2.5 12S6 18 12 18a10 10 0 0 0 3-.5" />
      </>
    ),
    copy: (
      <>
        <rect x="8" y="8" width="11" height="12" rx="2" />
        <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h2" />
      </>
    ),
    check: (
      <>
        <path d="m5 12 4 4L19 6" />
      </>
    ),
    close: (
      <>
        <path d="m6 6 12 12" />
        <path d="m18 6-12 12" />
      </>
    ),
    logout: (
      <>
        <path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4" />
        <path d="M14 16l4-4-4-4" />
        <path d="M9 12h9" />
      </>
    ),
    menu: (
      <>
        <path d="M4 7h16" />
        <path d="M4 12h16" />
        <path d="M4 17h16" />
      </>
    ),
    rotate: (
      <>
        <path d="M20 11a8 8 0 0 0-14-4L4 9" />
        <path d="M4 5v4h4" />
        <path d="M4 13a8 8 0 0 0 14 4l2-2" />
        <path d="M20 19v-4h-4" />
      </>
    ),
    revoke: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M7 7l10 10" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    book: (
      <>
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15Z" />
        <path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5" />
      </>
    )
  }

  return <svg {...common}>{paths[name] || null}</svg>
}


function BrandMark({ size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="1.5"
        y="1.5"
        width="13"
        height="13"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="8" cy="6.6" r="1.7" fill="currentColor" />
      <path d="M7.2 8h1.6l.5 3.4H6.7L7.2 8Z" fill="currentColor" />
    </svg>
  )
}


/* -------------------------------------------------------
   SMALL REUSABLE UI
------------------------------------------------------- */

function Button({
  children,
  variant = "primary",
  size = "medium",
  icon,
  disabled = false,
  onClick,
  type = "button"
}) {
  return (
    <button
      type={type}
      className={`button button-${variant} button-${size}`}
      disabled={disabled}
      onClick={onClick}
    >
      {icon && <Icon name={icon} size={15} />}
      {children}
    </button>
  )
}


function Badge({ children, type = "neutral" }) {
  return (
    <span className={`badge badge-${type}`}>
      <span className="badge-dot" />
      {children}
    </span>
  )
}


function Modal({ title, children, onClose, width = "480px" }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [onClose])

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div
        className="modal"
        style={{ maxWidth: width }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <h2 id="modal-title">{title}</h2>

          <button
            className="icon-button"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        <div className="modal-content">
          {children}
        </div>
      </div>
    </div>
  )
}


function Toast({ toast }) {
  if (!toast) {
    return null
  }

  return (
    <div className={`toast toast-${toast.type}`} role="status">
      <Icon
        name={toast.type === "error" ? "close" : "check"}
        size={16}
      />
      <span>{toast.message}</span>
    </div>
  )
}


/* -------------------------------------------------------
   SECRET DISPLAY
------------------------------------------------------- */

function SecretDisplay({ secret, onClose }) {
  const [copied, setCopied] = useState(false)
  const [seconds, setSeconds] = useState(30)

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((previous) => {
        if (previous <= 1) {
          clearInterval(interval)
          onClose()
          return 0
        }

        return previous - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [onClose])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(secret)
      setCopied(true)

      setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="secret-display">
      <div className="secret-top">
        <span className="secret-label">Secret value</span>

        <span className="secret-timer">
          Hides in {seconds}s
        </span>
      </div>

      <code className="secret-value">{secret}</code>

      <div className="secret-actions">
        <Button
          variant="secondary"
          size="small"
          icon={copied ? "check" : "copy"}
          onClick={handleCopy}
        >
          {copied ? "Copied" : "Copy"}
        </Button>

        <Button
          variant="ghost"
          size="small"
          icon="eyeOff"
          onClick={onClose}
        >
          Hide
        </Button>
      </div>

      <div className="secret-progress">
        <div
          className="secret-progress-bar"
          style={{ width: `${(seconds / 30) * 100}%` }}
        />
      </div>
    </div>
  )
}


/* -------------------------------------------------------
   MAIN APP
------------------------------------------------------- */

function App() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isRegistering, setIsRegistering] = useState(false)
  const [usernameStatus, setUsernameStatus] = useState(null)
  const [checkingUsername, setCheckingUsername] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)
  const [loadingSession, setLoadingSession] = useState(true)
  // Public pages: "landing" | "docs" | null.
  // null means the normal app: sign-in/register when logged out,
  // the dashboard when logged in.
  const [publicView, setPublicView] = useState("landing")

  const [activePage, setActivePage] = useState("dashboard")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const [keys, setKeys] = useState([])
  const [auditLogs, setAuditLogs] = useState([])
  const [usageLogs, setUsageLogs] = useState([])

  const [loadingKeys, setLoadingKeys] = useState(false)
  const [loadingLogs, setLoadingLogs] = useState(false)

  const [toast, setToast] = useState(null)

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [environmentFilter, setEnvironmentFilter] = useState("all")
  const [sortBy, setSortBy] = useState("recent")

  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [revealModalKey, setRevealModalKey] = useState(null)
  const [rotateModalKey, setRotateModalKey] = useState(null)
  const [revokeModalKey, setRevokeModalKey] = useState(null)

  const [revealedSecret, setRevealedSecret] = useState(null)
  const [revealPassword, setRevealPassword] = useState("")
  const [revealLoading, setRevealLoading] = useState(false)

  const [createLoading, setCreateLoading] = useState(false)
  const [rotateLoading, setRotateLoading] = useState(false)
  const [revokeLoading, setRevokeLoading] = useState(false)

  const [keyName, setKeyName] = useState("")
  const [environment, setEnvironment] = useState("development")
  const [expiresInDays, setExpiresInDays] = useState("90")
  const [scopes, setScopes] = useState(["read"])

  const showToast = (message, type = "success") => {
    setToast({ message, type })

    setTimeout(() => {
      setToast(null)
    }, 3000)
  }


  /* -------------------------------------------------------
     SESSION
  ------------------------------------------------------- */

  /* -------------------------------------------------------
     SESSION
  ------------------------------------------------------- */

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch(`${API}/me`, {
          credentials: "include"
        })

        if (response.ok) {
          const data = await response.json()

          setUsername(data.username)
          setAuthenticated(true)
          setPublicView(null)
        }
      } catch {
        // Backend may not be running.
      } finally {
        setLoadingSession(false)
      }
    }

    checkSession()
  }, [])


  /* -------------------------------------------------------
     DATA
  ------------------------------------------------------- */

  const fetchKeys = async () => {
    setLoadingKeys(true)

    try {
      const response = await fetch(`${API}/keys`, {
        credentials: "include"
      })

      if (response.status === 401) {
        handleSessionExpired()
        return
      }

      const data = await response.json()

      if (response.ok) {
        setKeys(data)
      }
    } catch {
      showToast("Could not load API keys", "error")
    } finally {
      setLoadingKeys(false)
    }
  }


  const fetchAuditLogs = async () => {
    try {
      const response = await fetch(`${API}/audit-logs`, {
        credentials: "include"
      })

      if (response.status === 401) {
        handleSessionExpired()
        return
      }

      const data = await response.json()

      if (response.ok) {
        setAuditLogs(data)
      }
    } catch {
      showToast("Could not load audit logs", "error")
    }
  }


  const fetchUsageLogs = async () => {
    try {
      const response = await fetch(`${API}/usage`, {
        credentials: "include"
      })

      if (response.status === 401) {
        handleSessionExpired()
        return
      }

      const data = await response.json()

      if (response.ok) {
        setUsageLogs(data)
      }
    } catch {
      showToast("Could not load usage data", "error")
    }
  }


  useEffect(() => {
    if (!authenticated) {
      return
    }

    fetchKeys()
    fetchAuditLogs()
    fetchUsageLogs()
  }, [authenticated])


  /* -------------------------------------------------------
     AUTH
  ------------------------------------------------------- */

  const handleLogin = async (event) => {
    event.preventDefault()

    try {
      const response = await fetch(`${API}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          username,
          password
        })
      })

      const data = await response.json()

      if (response.ok) {
        setAuthenticated(true)
        setPublicView(null)
        setPassword("")
        showToast("Signed in successfully")
      } else {
        showToast(data.detail || "Login failed", "error")
      }
    } catch {
      showToast("Could not connect to KeyVault", "error")
    }
  }


  const handleRegister = async (event) => {
    event.preventDefault()

    try {
      const response = await fetch(`${API}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username,
          password
        })
      })

      const data = await response.json()

      if (response.ok) {
        setIsRegistering(false)
        setPassword("")
        showToast("Account created successfully")
      } else {
        showToast(data.detail || "Registration failed", "error")
      }
    } catch {
      showToast("Could not connect to KeyVault", "error")
    }
  }

  
  useEffect(() => {
    if (!isRegistering) {
      setUsernameStatus(null)
      return
    }

    const value = username.trim()

    if (!value) {
      setUsernameStatus(null)
      return
    }

    if (value.length < 3) {
      setUsernameStatus({
        available: false,
        message: "Username must be at least 3 characters"
      })
      return
    }

    if (value.length > 20) {
      setUsernameStatus({
        available: false,
        message: "Username must be at most 20 characters"
      })
      return
    }

    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      setUsernameStatus({
        available: false,
        message: "Use only letters, numbers, and underscores"
      })
      return
    }

    const timer = setTimeout(async () => {
      try {
        setCheckingUsername(true)

        const response = await fetch(
          `${API}/check-username?username=${encodeURIComponent(value)}`
        )

        const data = await response.json()

        setUsernameStatus(data)
      } catch {
        setUsernameStatus(null)
      } finally {
        setCheckingUsername(false)
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [username, isRegistering])


  const handleLogout = async () => {
    setRevealedSecret(null)

    try {
      await fetch(`${API}/logout`, {
        method: "POST",
        credentials: "include"
      })
    } catch {
      // Still clear local session state.
    }

    setAuthenticated(false)
    setKeys([])
    setAuditLogs([])
    setUsageLogs([])
    setActivePage("dashboard")
    setPublicView("landing")
    showToast("Signed out")
  }


  const handleSessionExpired = () => {
    setRevealedSecret(null)
    setAuthenticated(false)
    setCreateModalOpen(false)
    setRevealModalKey(null)
    setRotateModalKey(null)
    setRevokeModalKey(null)
    showToast("Your session expired. Please sign in again.", "error")
  }


  /* -------------------------------------------------------
     KEY HELPERS
  ------------------------------------------------------- */

  const getKeyStatus = (key) => {
    if (key.status === "revoked") {
      return "revoked"
    }

    if (key.expires_at) {
      const expiration = new Date(key.expires_at)

      if (expiration < new Date()) {
        return "expired"
      }

      const days =
        (expiration.getTime() - Date.now()) /
        (1000 * 60 * 60 * 24)

      if (days <= 7) {
        return "expiring"
      }
    }

    return "active"
  }


  const statusLabel = (status) => {
    const labels = {
      active: "Active",
      expiring: "Expiring soon",
      expired: "Expired",
      revoked: "Revoked"
    }

    return labels[status] || status
  }


  const statusType = (status) => {
    const types = {
      active: "success",
      expiring: "warning",
      expired: "danger",
      revoked: "neutral"
    }

    return types[status] || "neutral"
  }


  const formatExpiration = (date) => {
    if (!date) {
      return "Never"
    }

    const expiration = new Date(date)
    const diff = expiration.getTime() - Date.now()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))

    if (days < 0) {
      return `Expired ${Math.abs(days)}d ago`
    }

    if (days === 0) {
      return "Expires today"
    }

    if (days <= 30) {
      return `In ${days} days`
    }

    return expiration.toLocaleDateString()
  }


  const formatRelativeTime = (date) => {
    if (!date) {
      return "Never"
    }

    const diff = Date.now() - new Date(date).getTime()
    const minutes = Math.floor(diff / 60000)

    if (minutes < 1) {
      return "Just now"
    }

    if (minutes < 60) {
      return `${minutes}m ago`
    }

    const hours = Math.floor(minutes / 60)

    if (hours < 24) {
      return `${hours}h ago`
    }

    const days = Math.floor(hours / 24)

    if (days < 30) {
      return `${days}d ago`
    }

    return new Date(date).toLocaleDateString()
  }


  const maskedKey = "kv_••••••••••••••••"


  /* -------------------------------------------------------
     FILTERED KEYS
  ------------------------------------------------------- */

  const filteredKeys = useMemo(() => {
    const filtered = keys.filter((key) => {
      const status = getKeyStatus(key)

      const matchesSearch =
        key.name?.toLowerCase().includes(search.toLowerCase())

      const matchesStatus =
        statusFilter === "all" ||
        status === statusFilter

      const matchesEnvironment =
        environmentFilter === "all" ||
        key.environment === environmentFilter

      return (
        matchesSearch &&
        matchesStatus &&
        matchesEnvironment
      )
    })

    return [...filtered].sort((a, b) => {
      if (sortBy === "recent") {
        return b.id - a.id
      }

      if (sortBy === "oldest") {
        return a.id - b.id
      }

      if (sortBy === "name-asc") {
        return (a.name || "").localeCompare(
          b.name || "",
          undefined,
          { sensitivity: "base" }
        )
      }

      if (sortBy === "name-desc") {
        return (b.name || "").localeCompare(
          a.name || "",
          undefined,
          { sensitivity: "base" }
        )
      }

      if (sortBy === "expiring") {
        const aTime = a.expires_at
          ? new Date(a.expires_at).getTime()
          : Number.POSITIVE_INFINITY

        const bTime = b.expires_at
          ? new Date(b.expires_at).getTime()
          : Number.POSITIVE_INFINITY

        return aTime - bTime
      }

      return 0
    })
  }, [
    keys,
    search,
    statusFilter,
    environmentFilter,
    sortBy
  ])


  /* -------------------------------------------------------
     CREATE
  ------------------------------------------------------- */

  const handleCreateKey = async (event) => {
    event.preventDefault()

    if (!keyName.trim()) {
      showToast("Enter a key name", "error")
      return
    }

    if (scopes.length === 0) {
      showToast("Select at least one permission", "error")
      return
    }

    setCreateLoading(true)

    try {
      const response = await fetch(`${API}/keys`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          name: keyName.trim(),
          environment,
          expires_in_days:
            expiresInDays === ""
              ? null
              : Number(expiresInDays),
          scopes
        })
      })

      const data = await response.json()

      if (response.status === 401) {
        handleSessionExpired()
        return
      }

      if (!response.ok) {
        showToast(data.detail || "Could not create key", "error")
        return
      }

      setCreateModalOpen(false)

      setKeyName("")
      setEnvironment("development")
      setExpiresInDays("90")
      setScopes(["read"])

      setRevealedSecret({
        title: "API key created",
        secret: data.api_key
      })

      await fetchKeys()
      await fetchAuditLogs()

      showToast("API key created")
    } catch {
      showToast("Could not create API key", "error")
    } finally {
      setCreateLoading(false)
    }
  }


  /* -------------------------------------------------------
     REVEAL
  ------------------------------------------------------- */

  const openReveal = (key) => {
    setRevealModalKey(key)
    setRevealPassword("")
  }


  const closeReveal = () => {
    setRevealModalKey(null)
    setRevealPassword("")
    setRevealLoading(false)
  }


  const handleRevealKey = async (event) => {
    event.preventDefault()

    if (!revealPassword) {
      return
    }

    setRevealLoading(true)

    try {
      const response = await fetch(
        `${API}/keys/${revealModalKey.id}/reveal`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include",
          body: JSON.stringify({
            password: revealPassword
          })
        }
      )

      const data = await response.json()

      if (response.status === 401) {
        showToast(
          data.detail || "Incorrect password",
          "error"
        )

        await fetchAuditLogs()
        return
      }

      if (!response.ok) {
        showToast(
          data.detail || "Could not reveal key",
          "error"
        )
        return
      }

      closeReveal()

      setRevealedSecret({
        title: revealModalKey.name,
        secret: data.api_key
      })

      await fetchAuditLogs()

      showToast("Key revealed")
    } catch {
      showToast("Could not reveal API key", "error")
    } finally {
      setRevealLoading(false)
    }
  }


  /* -------------------------------------------------------
     ROTATE
  ------------------------------------------------------- */

  const handleRotateKey = async () => {
    if (!rotateModalKey) {
      return
    }

    setRotateLoading(true)

    try {
      const response = await fetch(
        `${API}/keys/${rotateModalKey.id}/rotate`,
        {
          method: "PATCH",
          credentials: "include"
        }
      )

      const data = await response.json()

      if (response.status === 401) {
        handleSessionExpired()
        return
      }

      if (!response.ok) {
        showToast(data.detail || "Could not rotate key", "error")
        return
      }

      setRotateModalKey(null)

      setRevealedSecret({
        title: "API key rotated",
        secret: data.api_key
      })

      await fetchKeys()
      await fetchAuditLogs()

      showToast("API key rotated")
    } catch {
      showToast("Could not rotate API key", "error")
    } finally {
      setRotateLoading(false)
    }
  }


  /* -------------------------------------------------------
     REVOKE
  ------------------------------------------------------- */

  const handleRevokeKey = async () => {
    if (!revokeModalKey) {
      return
    }

    setRevokeLoading(true)

    try {
      const response = await fetch(
        `${API}/keys/${revokeModalKey.id}/revoke`,
        {
          method: "PATCH",
          credentials: "include"
        }
      )

      const data = await response.json()

      if (response.status === 401) {
        handleSessionExpired()
        return
      }

      if (!response.ok) {
        showToast(data.detail || "Could not revoke key", "error")
        return
      }

      setRevokeModalKey(null)

      await fetchKeys()
      await fetchAuditLogs()

      showToast("API key revoked")
    } catch {
      showToast("Could not revoke API key", "error")
    } finally {
      setRevokeLoading(false)
    }
  }


  /* -------------------------------------------------------
     DASHBOARD STATS
  ------------------------------------------------------- */

  const dashboardStats = useMemo(() => {
    const active = keys.filter(
      (key) => getKeyStatus(key) === "active"
    ).length

    const expiring = keys.filter(
      (key) => getKeyStatus(key) === "expiring"
    ).length

    const expired = keys.filter(
      (key) => getKeyStatus(key) === "expired"
    ).length

    const revoked = keys.filter(
      (key) => getKeyStatus(key) === "revoked"
    ).length

    return {
      total: keys.length,
      active,
      expiring,
      expired,
      revoked
    }
  }, [keys])


  /* -------------------------------------------------------
     NAVIGATION
  ------------------------------------------------------- */

  const navigate = (page) => {
    setActivePage(page)
    setMobileMenuOpen(false)
  }


  // Opens the public landing or documentation page. This never signs
  // the user out; the session cookie and authenticated state are kept.
  const openPublicView = (view) => {
    // Never leave a revealed secret waiting behind the public pages.
    setRevealedSecret(null)
    setRevealPassword("")
    setMobileMenuOpen(false)
    setPublicView(view)
    window.scrollTo({ top: 0 })
  }


  // Returns an authenticated user to the dashboard they left.
  const openDashboard = () => {
    setPublicView(null)
    window.scrollTo({ top: 0 })
  }


  // Opens the existing sign-in or registration form.
  const openAuth = (registering) => {
    setIsRegistering(registering)
    setPassword("")
    setPublicView(null)
  }


  /* -------------------------------------------------------
     LOGIN
  ------------------------------------------------------- */

  if (loadingSession) {
    return (
      <div className="session-loading">
        <div className="loading-mark">
          <span />
        </div>
        <p>Checking session…</p>
      </div>
    )
  }


  if (publicView === "landing") {
    return (
      <LandingPage
        authenticated={authenticated}
        onHome={() => openPublicView("landing")}
        onDocs={() => openPublicView("docs")}
        onSignIn={() => openAuth(false)}
        onGetStarted={() => openAuth(true)}
        onDashboard={openDashboard}
      />
    )
  }


  if (publicView === "docs") {
    return (
      <DocsPage
        authenticated={authenticated}
        onHome={() => openPublicView("landing")}
        onDocs={() => openPublicView("docs")}
        onSignIn={() => openAuth(false)}
        onGetStarted={() => openAuth(true)}
        onDashboard={openDashboard}
      />
    )
  }


  if (!authenticated) {
    return (
      <div className="login-page">
        <div className="login-panel">

          <button
            type="button"
            className="login-brand login-brand-button"
            onClick={() => openPublicView("landing")}
            aria-label="Back to KeyVault home"
          >
            <img
              src="/Keyvault.png"
              alt="KeyVault"
              className="brand-logo"
            />

            <span>KeyVault</span>
          </button>

          <div className="login-heading">
            <p className="eyebrow">
              Developer credential manager
            </p>

            <h1>
              {isRegistering ? "Create your account" : "Sign in"}
            </h1>

            <p>
              {isRegistering
                ? "Create an account to manage your API credentials, permissions and security activity."
                : "Manage API credentials, permissions, usage and security activity."}
            </p>
          </div>

          <form
            onSubmit={isRegistering ? handleRegister : handleLogin}
            className="login-form"
          >

            <label>
              Username

              <input
                type="text"
                value={username}
                onChange={(event) => {
                  setUsername(event.target.value)
                }}
                autoComplete="username"
                placeholder={isRegistering ? "e.g. gauri_123" : ""}
                required
              />

              {isRegistering && (
                <div className="username-status">
                  {checkingUsername ? (
                    <span className="username-checking">
                      Checking username…
                    </span>
                  ) : usernameStatus ? (
                    <span
                      className={
                        usernameStatus.available
                          ? "username-available"
                          : "username-taken"
                      }
                    >
                      {usernameStatus.available ? "✓" : "✕"}{" "}
                      {usernameStatus.message}
                    </span>
                  ) : (
                    <span className="field-help">
                      3–20 characters. Use letters, numbers and underscores.
                    </span>
                  )}
                </div>
              )}
            </label>

            <label>
              Password

              <input
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                autoComplete={
                  isRegistering
                    ? "new-password"
                    : "current-password"
                }
                required
              />

              {isRegistering && (
                <span className="field-help">
                  Use a strong password with uppercase, lowercase,
                  numbers and special characters. This is recommended,
                  not required.
                </span>
              )}
            </label>

            <Button
              type="submit"
              size="large"
              disabled={
                isRegistering &&
                (
                  checkingUsername ||
                  !usernameStatus?.available
                )
              }
            >
              {isRegistering
                ? "Create account"
                : "Sign in"}
            </Button>

          </form>

          <p className="login-switch">
            {isRegistering
              ? "Already have an account?"
              : "Don't have an account?"}

            <button
              type="button"
              className="text-button"
              onClick={() => {
                setIsRegistering(!isRegistering)
                setPassword("")
              }}
            >
              {isRegistering
                ? "Sign in"
                : "Create one"}
            </button>
          </p>

          <p className="login-footnote">
            Access is protected by an HttpOnly session cookie.
          </p>

          <p className="login-docs-link">
            <button
              type="button"
              className="text-button"
              onClick={() => openPublicView("docs")}
            >
              Read the documentation
            </button>
          </p>

        </div>
      </div>
    )
  }


  return (
    <div className="app-shell">

      {/* MOBILE TOP BAR */}
      <header className="mobile-topbar">

        <button
          type="button"
          className="brand brand-button"
          onClick={() => openPublicView("landing")}
          aria-label="KeyVault home"
        >
          <img
            src="/Keyvault.png"
            alt=""
            className="brand-logo"
          />

          <span>KeyVault</span>
        </button>

        <button
          className="icon-button"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open navigation"
        >
          <Icon name="menu" size={20} />
        </button>

      </header>


      {/* SIDEBAR */}
      <aside
        className={`sidebar ${
          mobileMenuOpen ? "sidebar-open" : ""
        }`}
        aria-label="Sidebar"
      >

        <div className="sidebar-top">

          <button
            type="button"
            className="brand brand-button"
            onClick={() => openPublicView("landing")}
            aria-label="KeyVault home"
          >
            <img
              src="/Keyvault.png"
              alt=""
              className="brand-logo"
            />

            <span>KeyVault</span>
          </button>

          <nav aria-label="Primary">

            <div className="nav-group">

              <span className="nav-label">
                Overview
              </span>

              <button
                className={
                  activePage === "dashboard"
                    ? "nav-item active"
                    : "nav-item"
                }
                onClick={() => navigate("dashboard")}
                aria-current={
                  activePage === "dashboard" ? "page" : undefined
                }
              >
                <Icon name="grid" size={16} />
                Dashboard
              </button>

            </div>


            <div className="nav-group">

              <span className="nav-label">
                Manage
              </span>

              {NAV_ITEMS.slice(1).map((item) => (
                <button
                  key={item.id}
                  className={
                    activePage === item.id
                      ? "nav-item active"
                      : "nav-item"
                  }
                  onClick={() => navigate(item.id)}
                  aria-current={
                    activePage === item.id ? "page" : undefined
                  }
                >
                  <Icon name={item.icon} size={16} />
                  {item.label}
                </button>
              ))}

            </div>


            <div className="nav-group">

              <span className="nav-label">
                Resources
              </span>

              <button
                type="button"
                className="nav-item"
                onClick={() => openPublicView("docs")}
              >
                <Icon name="book" size={16} />
                Documentation
              </button>

            </div>

          </nav>

        </div>


        <div className="sidebar-account">

          <div className="account-info">
            <div className="account-avatar">
              {username
                ? username.charAt(0).toUpperCase()
                : "U"}
            </div>

            <div className="account-text">
              <span
                className="account-name"
                title={username || "User"}
              >
                {username || "User"}
              </span>

              <span className="account-role">
                Account
              </span>
            </div>
          </div>

          <button
            className="logout-button"
            onClick={handleLogout}
            aria-label="Logout"
            title="Logout"
          >
            <Icon name="logout" size={16} />
          </button>

        </div>

      </aside>


      {/* MOBILE BACKDROP */}
      {mobileMenuOpen && (
        <div
          className="mobile-sidebar-backdrop"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}


      {/* MAIN */}
      <main className="main-content">

        {activePage === "dashboard" && (
          <Dashboard
            keys={keys}
            auditLogs={auditLogs}
            usageLogs={usageLogs}
            stats={dashboardStats}
            loading={loadingKeys}
            getKeyStatus={getKeyStatus}
            statusLabel={statusLabel}
            statusType={statusType}
            formatExpiration={formatExpiration}
            onCreate={() => setCreateModalOpen(true)}
            onReveal={openReveal}
            onNavigate={navigate}
          />
        )}


        {activePage === "keys" && (
          <ApiKeysPage
            keys={keys}
            filteredKeys={filteredKeys}
            search={search}
            setSearch={setSearch}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            environmentFilter={environmentFilter}
            setEnvironmentFilter={setEnvironmentFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
            loading={loadingKeys}
            getKeyStatus={getKeyStatus}
            statusLabel={statusLabel}
            statusType={statusType}
            formatExpiration={formatExpiration}
            maskedKey={maskedKey}
            onCreate={() => setCreateModalOpen(true)}
            onReveal={openReveal}
            onRotate={setRotateModalKey}
            onRevoke={setRevokeModalKey}
          />
        )}


        {activePage === "usage" && (
          <UsagePage
            usageLogs={usageLogs}
            keys={keys}
          />
        )}


        {activePage === "audit" && (
          <AuditPage auditLogs={auditLogs} />
        )}

      </main>


      {/* CREATE MODAL */}
      {createModalOpen && (
        <Modal
          title="Create API key"
          onClose={() => setCreateModalOpen(false)}
        >
          <form
            className="modal-form"
            onSubmit={handleCreateKey}
          >

            <label>
              Key name
              <input
                type="text"
                placeholder="e.g. Billing service"
                value={keyName}
                onChange={(event) =>
                  setKeyName(event.target.value)
                }
                autoFocus
              />
              <span className="field-help">
                Give this credential a clear purpose.
              </span>
            </label>


            <label>
              Environment
              <select
                value={environment}
                onChange={(event) =>
                  setEnvironment(event.target.value)
                }
              >
                <option value="development">
                  Development
                </option>
                <option value="production">
                  Production
                </option>
              </select>
            </label>


            <label>
              Expiration
              <select
                value={expiresInDays}
                onChange={(event) =>
                  setExpiresInDays(event.target.value)
                }
              >
                <option value="90">90 days</option>
                <option value="30">30 days</option>
                <option value="7">7 days</option>
                <option value="">No expiration</option>
              </select>

              {expiresInDays === "" && (
                <span className="warning-text">
                  Keys without an expiration require more
                  manual lifecycle management.
                </span>
              )}
            </label>


            <div className="scope-field">

              <span className="field-label">
                Permissions
              </span>

              <span className="field-help">
                Start with the minimum permissions required.
              </span>

              <div className="scope-options">

                {SCOPE_OPTIONS.map((scope) => (
                  <label
                    className="scope-option"
                    key={scope}
                  >

                    <input
                      type="checkbox"
                      checked={scopes.includes(scope)}
                      onChange={(event) => {

                        if (event.target.checked) {
                          setScopes([
                            ...scopes,
                            scope
                          ])
                        } else {
                          setScopes(
                            scopes.filter(
                              (item) =>
                                item !== scope
                            )
                          )
                        }

                      }}
                    />

                    <span>{scope}</span>

                  </label>
                ))}

              </div>

            </div>


            <div className="modal-security-note">

              <Icon name="shield" size={17} />

              <p>
                The key will be hashed for verification
                and encrypted for recovery. You can reveal
                it later by confirming your account password.
              </p>

            </div>


            <div className="modal-footer">

              <Button
                variant="secondary"
                onClick={() =>
                  setCreateModalOpen(false)
                }
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={
                  createLoading ||
                  !keyName.trim() ||
                  scopes.length === 0
                }
              >
                {createLoading
                  ? "Creating…"
                  : "Create API key"}
              </Button>

            </div>

          </form>
        </Modal>
      )}


      {/* REVEAL MODAL */}
      {revealModalKey && (
        <Modal
          title={`Reveal "${revealModalKey.name}"`}
          onClose={closeReveal}
        >
          <form
            className="modal-form"
            onSubmit={handleRevealKey}
          >

            <div className="reveal-context">

              <div className="reveal-context-top">

                <Badge
                  type={
                    revealModalKey.environment === "production"
                      ? "production"
                      : "neutral"
                  }
                >
                  {revealModalKey.environment}
                </Badge>

                <Badge
                  type={statusType(
                    getKeyStatus(revealModalKey)
                  )}
                >
                  {statusLabel(
                    getKeyStatus(revealModalKey)
                  )}
                </Badge>

              </div>

              <code>{maskedKey}</code>

            </div>


            <div className="reveal-explanation">

              <p>
                KeyVault stores keys encrypted. To decrypt
                this key, confirm your account password.
              </p>

              <p>
                This action is recorded in your audit log.
              </p>

            </div>


            <label>
              Account password

              <input
                type="password"
                value={revealPassword}
                onChange={(event) =>
                  setRevealPassword(event.target.value)
                }
                autoComplete="current-password"
                autoFocus
              />
            </label>


            <div className="modal-security-note compact">

              <Icon name="shield" size={16} />

              <p>
                Stored as a hash for verification plus an
                encrypted copy for recovery. The raw key
                is never written to logs.
              </p>

            </div>


            <div className="modal-footer">

              <Button
                variant="secondary"
                onClick={closeReveal}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={
                  revealLoading ||
                  !revealPassword
                }
              >
                {revealLoading
                  ? "Verifying…"
                  : "Reveal key"}
              </Button>

            </div>

          </form>
        </Modal>
      )}


      {/* ROTATE MODAL */}
      {rotateModalKey && (
        <Modal
          title="Rotate API key"
          onClose={() => setRotateModalKey(null)}
        >
          <div className="confirmation-content">

            <div className="confirmation-icon">
              <Icon name="rotate" size={21} />
            </div>

            <h3>
              Rotate "{rotateModalKey.name}"?
            </h3>

            <p>
              The current key will stop working and a new
              credential will be generated. Existing metadata
              such as the name, environment, and permissions
              will remain associated with the key.
            </p>

            <div className="modal-footer">

              <Button
                variant="secondary"
                onClick={() => setRotateModalKey(null)}
              >
                Cancel
              </Button>

              <Button
                onClick={handleRotateKey}
                disabled={rotateLoading}
              >
                {rotateLoading
                  ? "Rotating…"
                  : "Rotate key"}
              </Button>

            </div>

          </div>
        </Modal>
      )}


      {/* REVOKE MODAL */}
      {revokeModalKey && (
        <Modal
          title="Revoke API key"
          onClose={() => setRevokeModalKey(null)}
        >
          <div className="confirmation-content">

            <div className="confirmation-icon danger">
              <Icon name="revoke" size={21} />
            </div>

            <h3>
              Revoke "{revokeModalKey.name}"?
            </h3>

            <p>
              This action disables the credential. Requests
              authenticated with this key will no longer be
              accepted.
            </p>

            <div className="modal-footer">

              <Button
                variant="secondary"
                onClick={() => setRevokeModalKey(null)}
              >
                Cancel
              </Button>

              <Button
                variant="danger"
                onClick={handleRevokeKey}
                disabled={revokeLoading}
              >
                {revokeLoading
                  ? "Revoking…"
                  : "Revoke key"}
              </Button>

            </div>

          </div>
        </Modal>
      )}


      {/* REVEALED SECRET */}
      {revealedSecret && (
        <Modal
          title={revealedSecret.title}
          onClose={() => setRevealedSecret(null)}
        >
          <div className="revealed-content">

            <div className="verified-label">
              <Icon name="check" size={15} />
              Verified
            </div>

            <p className="revealed-description">
              This key is temporarily visible. It will
              automatically hide after 30 seconds.
            </p>

            <SecretDisplay
              secret={revealedSecret.secret}
              onClose={() => setRevealedSecret(null)}
            />

            <div className="revealed-footer-note">
              The key is held only in memory and is not
              stored in browser storage.
            </div>

          </div>
        </Modal>
      )}


      <Toast toast={toast} />

    </div>
  )
}


/* -------------------------------------------------------
   DASHBOARD
------------------------------------------------------- */

function Dashboard({
  keys,
  auditLogs,
  usageLogs,
  stats,
  loading,
  getKeyStatus,
  statusLabel,
  statusType,
  formatExpiration,
  onCreate,
  onReveal,
  onNavigate
}) {
  const recentKeys = [...keys]
    .sort(
      (a, b) =>
        new Date(b.created_at || 0) -
        new Date(a.created_at || 0)
    )
    .slice(0, 5)

  const recentLogs = auditLogs.slice(0, 5)

  const usageByDay = useMemo(() => {
    const days = []

    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setHours(0, 0, 0, 0)
      date.setDate(date.getDate() - i)

      const next = new Date(date)
      next.setDate(next.getDate() + 1)

      const count = usageLogs.filter((item) => {
        const time = new Date(item.used_at)
        return time >= date && time < next
      }).length

      days.push({
        label: date.toLocaleDateString(undefined, {
          weekday: "short"
        }),
        count
      })
    }

    return days
  }, [usageLogs])

  const maxUsage = Math.max(
    ...usageByDay.map((day) => day.count),
    1
  )

  return (
    <div className="page">

      <PageHeader
        eyebrow="Overview"
        title="Dashboard"
        description="A current view of your credentials and security activity."
        action={
          <Button
            icon="plus"
            onClick={onCreate}
          >
            Create API key
          </Button>
        }
      />


      {/* STATS */}
      <section className="stat-grid">

        <Stat
          label="Total keys"
          value={stats.total}
        />

        <Stat
          label="Active"
          value={stats.active}
          type="success"
        />

        <Stat
          label="Expiring soon"
          value={stats.expiring}
          type="warning"
        />

        <Stat
          label="Expired"
          value={stats.expired}
          type="danger"
        />

        <Stat
          label="Revoked"
          value={stats.revoked}
        />

      </section>


      <div className="dashboard-grid">

        {/* USAGE CHART */}
        <Panel
          title="API requests"
          description="Recorded requests over the last 7 days."
          action={
            <button
              className="text-button"
              onClick={() => onNavigate("usage")}
            >
              View usage
            </button>
          }
        >

          {usageLogs.length === 0 ? (
            <EmptyState
              title="No requests recorded"
              description="API requests authenticated through KeyVault will appear here."
            />
          ) : (
            <div className="usage-chart">

              <div className="chart-y-label">
                {maxUsage}
              </div>

              <div className="chart-bars">

                {usageByDay.map((day) => (
                  <div
                    className="chart-column"
                    key={day.label}
                  >

                    <div className="chart-value">
                      {day.count}
                    </div>

                    <div className="chart-bar-track">
                      <div
                        className="chart-bar"
                        style={{
                          height: `${Math.max(
                            (day.count / maxUsage) * 100,
                            day.count > 0 ? 8 : 2
                          )}%`
                        }}
                      />
                    </div>

                    <span>{day.label}</span>

                  </div>
                ))}

              </div>

            </div>
          )}

        </Panel>


        {/* RECENT SECURITY */}
        <Panel
          title="Recent security"
          description="Latest security-relevant actions."
          action={
            <button
              className="text-button"
              onClick={() => onNavigate("audit")}
            >
              View audit log
            </button>
          }
        >

          {recentLogs.length === 0 ? (
            <EmptyState
              title="No security activity"
              description="Actions such as creation, rotation, reveal, and revocation will appear here."
            />
          ) : (
            <div className="activity-list">

              {recentLogs.map((log) => (
                <div
                  className="activity-item"
                  key={log.id}
                >

                  <div className="activity-icon">
                    <Icon name="shield" size={15} />
                  </div>

                  <div className="activity-main">

                    <strong>
                      {log.action}
                    </strong>

                    <span>
                      {log.details || "Security action recorded"}
                    </span>

                  </div>

                  <time>
                    {formatDateTime(log.created_at)}
                  </time>

                </div>
              ))}

            </div>
          )}

        </Panel>

      </div>


      {/* RECENT KEYS */}
      <Panel
        title="Recent keys"
        description="The credentials most recently added to KeyVault."
        action={
          <button
            className="text-button"
            onClick={() => onNavigate("keys")}
          >
            View all keys
          </button>
        }
      >

        {loading ? (
          <div className="skeleton-list">
            <div />
            <div />
            <div />
          </div>
        ) : recentKeys.length === 0 ? (
          <EmptyState
            title="No API keys yet"
            description="Create your first credential to start using KeyVault."
            action={
              <Button
                size="small"
                onClick={onCreate}
              >
                Create API key
              </Button>
            }
          />
        ) : (
          <div className="recent-key-list">

            {recentKeys.map((key) => {
              const status = getKeyStatus(key)

              return (
                <div
                  className="recent-key-row"
                  key={key.id}
                >

                  <div className="recent-key-name">
                    <strong>{key.name}</strong>
                    <code>kv_••••••••••••••••</code>
                  </div>

                  <Badge
                    type={statusType(status)}
                  >
                    {statusLabel(status)}
                  </Badge>

                  <span className="recent-key-env">
                    {key.environment === "production"
                      ? "Production"
                      : key.environment === "development"
                        ? "Development"
                        : key.environment}
                  </span>

                  <span className="recent-key-expiry">
                    {formatExpiration(key.expires_at)}
                  </span>

                  <Button
                    variant="ghost"
                    size="small"
                    icon="eye"
                    onClick={() => onReveal(key)}
                  >
                    Reveal
                  </Button>

                </div>
              )
            })}

          </div>
        )}

      </Panel>

    </div>
  )
}


/* -------------------------------------------------------
   API KEYS
------------------------------------------------------- */

function ApiKeysPage({
  keys,
  filteredKeys,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  environmentFilter,
  setEnvironmentFilter,
  sortBy,
  setSortBy,
  loading,
  getKeyStatus,
  statusLabel,
  statusType,
  formatExpiration,
  maskedKey,
  onCreate,
  onReveal,
  onRotate,
  onRevoke
}) {
  return (
    <div className="page">

      <PageHeader
        eyebrow="Manage"
        title="API Keys"
        description={
          <>
            Credentials for authenticating requests with the{" "}
            <code>X-API-Key</code> header.
          </>
        }
        action={
          <Button
            icon="plus"
            onClick={onCreate}
          >
            Create API key
          </Button>
        }
      />


      <Panel className="keys-panel">

        <div className="filter-bar">

          <div className="search-box">

            <Icon name="search" size={16} />

            <input
              type="search"
              placeholder="Filter by name"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

            <kbd>/</kbd>

          </div>


          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="expiring">Expiring soon</option>
            <option value="expired">Expired</option>
            <option value="revoked">Revoked</option>
          </select>


          <select
            value={environmentFilter}
            onChange={(event) =>
              setEnvironmentFilter(event.target.value)
            }
          >
            <option value="all">All environments</option>
            <option value="development">
              Development
            </option>
            <option value="production">
              Production
            </option>
          </select>


          <select
            value={sortBy}
            onChange={(event) =>
              setSortBy(event.target.value)
            }
            aria-label="Sort API keys"
          >
            <option value="recent">Most recent</option>
            <option value="oldest">Oldest</option>
            <option value="name-asc">Name A–Z</option>
            <option value="name-desc">Name Z–A</option>
            <option value="expiring">Expiring soon</option>
          </select>


          <span className="result-count">
            {filteredKeys.length} of {keys.length} keys
          </span>

        </div>


        {loading ? (
          <div className="table-loading">
            <div />
            <div />
            <div />
            <div />
          </div>
        ) : filteredKeys.length === 0 ? (
          <EmptyState
            title={
              keys.length === 0
                ? "No API keys yet"
                : "No matching keys"
            }
            description={
              keys.length === 0
                ? "Create an API key to begin managing credentials."
                : "Try changing your search or filters."
            }
            action={
              keys.length === 0 ? (
                <Button
                  size="small"
                  onClick={onCreate}
                >
                  Create API key
                </Button>
              ) : null
            }
          />
        ) : (
          <div className="table-wrapper">

            <table className="keys-table">

              <thead>
                <tr>
                  <th>Name</th>
                  <th>Environment</th>
                  <th>Status</th>
                  <th>Scopes</th>
                  <th>Expires</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {filteredKeys.map((key) => {

                  const status = getKeyStatus(key)

                  return (
                    <tr key={key.id}>

                      <td>

                        <div className="key-name-cell">

                          <strong>
                            {key.name}
                          </strong>

                          <div className="key-meta">

                            <code>
                              {maskedKey}
                            </code>

                            <span>
                              ID {key.id}
                            </span>

                          </div>

                        </div>

                      </td>


                      <td>
                        <Badge
                          type={
                            key.environment === "production"
                              ? "production"
                              : "neutral"
                          }
                        >
                          {key.environment === "production"
                            ? "Production"
                            : key.environment === "development"
                            ? "Development"
                            : key.environment}
                        </Badge>
                      </td>


                      <td>
                        <Badge
                          type={statusType(status)}
                        >
                          {statusLabel(status)}
                        </Badge>
                      </td>


                      <td>

                        <div className="scope-list">

                          {(key.scopes || []).map(
                            (scope) => (
                              <span
                                className={`scope-chip ${
                                  scope === "delete"
                                    ? "scope-danger"
                                    : ""
                                }`}
                                key={scope}
                              >
                                {scope.charAt(0).toUpperCase() + scope.slice(1)}
                              </span>
                            )
                          )}

                        </div>

                      </td>


                      <td>
                        <span
                          className={
                            status === "expired"
                              ? "expiry-danger"
                              : status === "expiring"
                              ? "expiry-warning"
                              : ""
                          }
                        >
                          {formatExpiration(
                            key.expires_at
                          )}
                        </span>
                      </td>


                      <td>

                        <div className="row-actions">

                          <Button
                            variant="ghost"
                            size="small"
                            icon="eye"
                            onClick={() =>
                              onReveal(key)
                            }
                          >
                            Reveal
                          </Button>

                          <div className="action-menu">

                            <button
                              className="icon-button"
                              aria-label={`Actions for ${key.name}`}
                              title="More actions"
                              onClick={(event) => {

                                const menu =
                                  event.currentTarget
                                    .nextElementSibling

                                document
                                  .querySelectorAll(
                                    ".action-dropdown.open"
                                  )
                                  .forEach((item) => {
                                    if (item !== menu) {
                                      item.classList.remove(
                                        "open"
                                      )
                                    }
                                  })

                                menu.classList.toggle(
                                  "open"
                                )
                              }}
                            >
                              <Icon
                                name="more"
                                size={17}
                              />
                            </button>

                            <div className="action-dropdown">

                              <button
                                disabled={
                                  status !== "active" &&
                                  status !== "expiring"
                                }
                                onClick={() => {
                                  onRotate(key)
                                }}
                              >
                                <Icon
                                  name="rotate"
                                  size={15}
                                />
                                Rotate
                              </button>

                              <button
                                disabled={
                                  status === "revoked"
                                }
                                onClick={() => {
                                  onRevoke(key)
                                }}
                              >
                                <Icon
                                  name="revoke"
                                  size={15}
                                />
                                Revoke
                              </button>

                            </div>

                          </div>

                        </div>

                      </td>

                    </tr>
                  )
                })}

              </tbody>

            </table>

          </div>
        )}

      </Panel>

    </div>
  )
}


/* -------------------------------------------------------
   USAGE
------------------------------------------------------- */

function UsagePage({ usageLogs, keys }) {
  const keyMap = useMemo(() => {
    const map = {}

    keys.forEach((key) => {
      map[key.id] = key.name
    })

    return map
  }, [keys])


  return (
    <div className="page">

      <PageHeader
        eyebrow="Operations"
        title="Usage"
        description="Requests recorded through API key authentication."
      />


      <Panel
        title="Recent requests"
        description={`${usageLogs.length} recorded requests available.`}
      >

        {usageLogs.length === 0 ? (
          <EmptyState
            title="No API usage yet"
            description="Requests authenticated with an API key will appear here."
          />
        ) : (
          <div className="usage-table-wrapper">

            <table className="usage-table">

              <thead>
                <tr>
                  <th>Time</th>
                  <th>API key</th>
                  <th>Endpoint</th>
                </tr>
              </thead>

              <tbody>

                {usageLogs.map((usage) => (
                  <tr key={usage.id}>

                    <td>
                      {formatDateTime(
                        usage.used_at
                      )}
                    </td>

                    <td>
                      <span className="mono-muted">
                        {keyMap[usage.api_key_id] ||
                          `Key #${usage.api_key_id}`}
                      </span>
                    </td>

                    <td>
                      <code>
                        {usage.endpoint || "—"}
                      </code>
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        )}

      </Panel>

    </div>
  )
}


/* -------------------------------------------------------
   AUDIT
------------------------------------------------------- */

function AuditPage({ auditLogs }) {
  return (
    <div className="page">

      <PageHeader
        eyebrow="Security"
        title="Audit Logs"
        description="Security-relevant actions performed on your account and credentials."
      />


      <Panel>

        {auditLogs.length === 0 ? (
          <EmptyState
            title="No audit events"
            description="Security actions will appear here as they occur."
          />
        ) : (
          <div className="audit-list">

            {auditLogs.map((log) => (
              <div
                className="audit-item"
                key={log.id}
              >

                <div className="audit-line" />

                <div className="audit-marker">
                  <Icon
                    name="shield"
                    size={14}
                  />
                </div>

                <div className="audit-content">

                  <div className="audit-header">

                    <strong>
                      {log.action}
                    </strong>

                    <time>
                      {formatDateTime(
                        log.created_at
                      )}
                    </time>

                  </div>

                  <p>
                    {log.details ||
                      "Security action recorded."}
                  </p>

                  {log.api_key_id && (
                    <span className="audit-key">
                      API key #{log.api_key_id}
                    </span>
                  )}

                </div>

              </div>
            ))}

          </div>
        )}

      </Panel>

    </div>
  )
}


/* -------------------------------------------------------
   SHARED COMPONENTS
------------------------------------------------------- */

function PageHeader({
  eyebrow,
  title,
  description,
  action
}) {
  return (
    <header className="page-header">

      <div>

        {eyebrow && (
          <span className="page-eyebrow">
            {eyebrow}
          </span>
        )}

        <h1>{title}</h1>

        <p>{description}</p>

      </div>

      {action && (
        <div className="page-header-action">
          {action}
        </div>
      )}

    </header>
  )
}


function Panel({
  title,
  description,
  action,
  children,
  className = ""
}) {
  return (
    <section className={`panel ${className}`}>

      {(title || description || action) && (
        <div className="panel-header">

          <div>

            {title && (
              <h2>{title}</h2>
            )}

            {description && (
              <p>{description}</p>
            )}

          </div>

          {action && (
            <div>
              {action}
            </div>
          )}

        </div>
      )}

      <div className="panel-body">
        {children}
      </div>

    </section>
  )
}


function Stat({ label, value, type = "neutral" }) {
  return (
    <div className={`stat stat-${type}`}>

      <span className="stat-label">
        {label}
      </span>

      <strong>{value}</strong>

    </div>
  )
}


function EmptyState({
  title,
  description,
  action
}) {
  return (
    <div className="empty-state">

      <div className="empty-mark">
        <Icon name="grid" size={18} />
      </div>

      <h3>{title}</h3>

      <p>{description}</p>

      {action && (
        <div className="empty-action">
          {action}
        </div>
      )}

    </div>
  )
}


/* -------------------------------------------------------
   PUBLIC LANDING PAGE (logged-out visitors)
------------------------------------------------------- */

function LandingPage({
  authenticated,
  onHome,
  onDocs,
  onSignIn,
  onGetStarted,
  onDashboard
}) {
  const previewKeys = [
    {
      name: "Billing service",
      environment: "Production",
      scopes: ["Read", "Write"],
      status: "Active",
      tone: "active"
    },
    {
      name: "Analytics export",
      environment: "Development",
      scopes: ["Read"],
      status: "Expiring soon",
      tone: "expiring"
    },
    {
      name: "Legacy webhook",
      environment: "Production",
      scopes: ["Read", "Delete"],
      status: "Revoked",
      tone: "revoked"
    }
  ]

  return (
    <div className="landing" id="top">

      <PublicNav
        current="landing"
        authenticated={authenticated}
        onHome={onHome}
        onDocs={onDocs}
        onSignIn={onSignIn}
        onGetStarted={onGetStarted}
        onDashboard={onDashboard}
      />


      <main className="landing-hero">
        <div className="landing-hero-inner">

          <div className="landing-copy">

            <span className="landing-eyebrow">
              <Icon name="key" size={14} />
              API key management
            </span>

            <h1>
              Every API key,{" "}
              <mark>under control.</mark>
            </h1>

            <p className="landing-lede">
              Create scoped keys with expirations, rotate or revoke
              them when plans change and keep an audit trail of
              every sensitive action.
            </p>

            <div className="landing-cta">
              {authenticated ? (
                <>
                  <button
                    type="button"
                    className="landing-btn landing-btn-primary"
                    onClick={onDashboard}
                  >
                    Go to dashboard
                  </button>

                  <button
                    type="button"
                    className="landing-btn landing-btn-secondary"
                    onClick={onDocs}
                  >
                    Read the documentation
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="landing-btn landing-btn-primary"
                    onClick={onGetStarted}
                  >
                    Create your account
                  </button>

                  <button
                    type="button"
                    className="landing-btn landing-btn-secondary"
                    onClick={onSignIn}
                  >
                    Sign in
                  </button>
                </>
              )}
            </div>

            <p className="landing-assurance">
              <Icon name="shield" size={15} />
              Keys are stored encrypted and revealed only after you
              confirm your account password.
            </p>

          </div>


          <div className="landing-visual" aria-hidden="true">

            <div className="landing-vault">

              <div className="landing-vault-bar">
                <span className="landing-vault-title">
                  <Icon name="key" size={14} />
                  API Keys
                </span>

                <span className="landing-sample">
                  Sample preview
                </span>
              </div>

              <div className="landing-vault-list">
                {previewKeys.map((item) => (
                  <div
                    className="landing-vault-row"
                    key={item.name}
                  >
                    <div className="landing-vault-name">
                      <strong>{item.name}</strong>
                      <code>kv_••••••••••••••••</code>
                    </div>

                    <div className="landing-vault-meta">
                      <span className="landing-chip">
                        {item.environment}
                      </span>

                      {item.scopes.map((scope) => (
                        <span
                          className={`landing-chip landing-chip-scope ${
                            scope === "Delete"
                              ? "landing-chip-danger"
                              : ""
                          }`}
                          key={scope}
                        >
                          {scope}
                        </span>
                      ))}
                    </div>

                    <span
                      className={`landing-status landing-status-${item.tone}`}
                    >
                      <span className="landing-status-dot" />
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>

              <div className="landing-vault-foot">
                <Icon name="clock" size={14} />
                Rotate, revoke and review activity from one place.
              </div>

            </div>

            <div className="landing-reveal">
              <div className="landing-reveal-icon">
                <Icon name="shield" size={16} />
              </div>

              <div className="landing-reveal-text">
                <strong>Reveal key</strong>
                <span>Confirm your account password</span>
              </div>

              <span className="landing-reveal-dots">
                ••••••••
              </span>
            </div>

          </div>

        </div>
      </main>


      <footer className="landing-footer">
        <a
          className="landing-footer-link"
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
          </svg>

          GitHub
        </a>
      </footer>

    </div>
  )
}


/* -------------------------------------------------------
   PUBLIC NAVIGATION (shared by landing and documentation)
------------------------------------------------------- */

function PublicNav({
  current,
  authenticated,
  onHome,
  onDocs,
  onSignIn,
  onGetStarted,
  onDashboard
}) {
  return (
    <header className="landing-nav">
      <div className="landing-nav-inner">

        <button
          type="button"
          className="landing-brand"
          onClick={onHome}
          aria-label="KeyVault home"
        >
          <img
            src="/Keyvault.png"
            alt=""
            className="brand-logo"
          />

          <span>KeyVault</span>
        </button>

        <nav className="landing-nav-actions" aria-label="Public">
          <button
            type="button"
            className={`landing-link ${
              current === "docs" ? "landing-link-active" : ""
            }`}
            onClick={onDocs}
            aria-current={current === "docs" ? "page" : undefined}
          >
            <span className="landing-link-long">Documentation</span>
            <span className="landing-link-short">Docs</span>
          </button>

          {authenticated ? (
            <button
              type="button"
              className="landing-btn landing-btn-primary landing-btn-sm"
              onClick={onDashboard}
            >
              Dashboard
            </button>
          ) : (
            <>
              <button
                type="button"
                className="landing-link"
                onClick={onSignIn}
              >
                Sign in
              </button>

              <button
                type="button"
                className="landing-btn landing-btn-primary landing-btn-sm"
                onClick={onGetStarted}
              >
                Get started
              </button>
            </>
          )}
        </nav>

      </div>
    </header>
  )
}


/* -------------------------------------------------------
   DOCUMENTATION PAGE
------------------------------------------------------- */

const DOC_SECTIONS = [
  { id: "getting-started", label: "Getting started" },
  { id: "creating-keys", label: "Creating and managing keys" },
  { id: "environments-scopes", label: "Environments and scopes" },
  { id: "authenticating", label: "Authenticating requests" },
  { id: "lifecycle", label: "Expiration, rotation, revocation" },
  { id: "usage-audit", label: "Usage, rate limits and audit logs" },
  { id: "revealing", label: "Revealing a stored key" }
]


function DocSection({ id, title, children }) {
  return (
    <section className="docs-section" id={id}>
      <h2>{title}</h2>
      {children}
    </section>
  )
}


function DocsPage({
  authenticated,
  onHome,
  onDocs,
  onSignIn,
  onGetStarted,
  onDashboard
}) {
  const scrollToSection = (id) => {
    const element = document.getElementById(id)

    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  return (
    <div className="landing docs" id="top">

      <PublicNav
        current="docs"
        authenticated={authenticated}
        onHome={onHome}
        onDocs={onDocs}
        onSignIn={onSignIn}
        onGetStarted={onGetStarted}
        onDashboard={onDashboard}
      />

      <main className="docs-inner">

        <aside className="docs-toc" aria-label="On this page">
          <span className="docs-toc-label">On this page</span>

          <div className="docs-toc-list">
            {DOC_SECTIONS.map((section) => (
              <button
                type="button"
                key={section.id}
                onClick={() => scrollToSection(section.id)}
              >
                {section.label}
              </button>
            ))}
          </div>
        </aside>

        <article className="docs-content">

          <button
            type="button"
            className="docs-back"
            onClick={onHome}
          >
            ← Back to home
          </button>

          <header className="docs-header">
            <span className="landing-eyebrow">
              <Icon name="key" size={14} />
              Documentation
            </span>

            <h1>Using KeyVault</h1>

            <p>
              KeyVault is a dashboard for creating, scoping, rotating
              and auditing API keys. This guide covers setting up an
              account, managing keys and authenticating requests with
              the <code>X-API-Key</code> header.
            </p>
          </header>


          <DocSection
            id="getting-started"
            title="Getting started"
          >
            <ol>
              <li>
                Choose <strong>Get started</strong> to create an
                account. Usernames are 3–20 characters using letters,
                numbers and underscores, and KeyVault checks whether
                the name is available as you type.
              </li>

              <li>
                Pick a password. A strong one, with upper and lower
                case letters, numbers and special characters, is
                recommended.
              </li>

              <li>
                Sign in with your username and password. You land on
                the dashboard, which summarizes your keys, recent
                requests and recent security activity.
              </li>
            </ol>

            <p>
              Sign-in uses an HttpOnly session cookie, and reloading
              the page while signed in restores your session. Use the
              sign-out button at the bottom of the sidebar to end it.
            </p>
          </DocSection>


          <DocSection
            id="creating-keys"
            title="Creating and managing API keys"
          >
            <ol>
              <li>
                Open <strong>Dashboard</strong> or{" "}
                <strong>API Keys</strong> and select{" "}
                <strong>Create API key</strong>.
              </li>

              <li>
                Enter a key name that describes its purpose, for
                example "Billing service".
              </li>

              <li>
                Choose an environment, an expiration and the
                permissions the key needs.
              </li>

              <li>
                Select <strong>Create API key</strong>. The new key is
                shown in a dialog and hides itself after 30 seconds, so
                copy it straight away.
              </li>
            </ol>

            <p>
              The <strong>API Keys</strong> page lists every key with
              its environment, status, scopes and expiry. You can
              filter by name, status and environment, and sort by most
              recent, oldest, name or soonest to expire. Each row has{" "}
              <strong>Reveal</strong> and a menu with{" "}
              <strong>Rotate</strong> and <strong>Revoke</strong>.
            </p>

            <p>
              The name, environment, scopes and expiry are chosen when
              the key is created. To replace a revoked or expired key,
              create a new one.
            </p>
          </DocSection>


          <DocSection
            id="environments-scopes"
            title="Environments, scopes and permissions"
          >
            <p>
              Each key has one <strong>environment</strong>,{" "}
              <code>development</code> (the default) or{" "}
              <code>production</code>, shown as a badge on the key.
            </p>

            <p>
              Each key also has one or more <strong>scopes</strong>:{" "}
              <code>read</code>, <code>write</code> and{" "}
              <code>delete</code>. At least one is required and{" "}
              <code>read</code> is selected by default. The{" "}
              <code>delete</code> scope is highlighted in red. Start
              with the minimum permissions the key needs.
            </p>

            <p>
              The environment and scopes are saved with the key when it
              is created and displayed with it on the API Keys page.
            </p>
          </DocSection>


          <DocSection
            id="authenticating"
            title="Authenticating API requests"
          >
            <p>
              Send the key in the <code>X-API-Key</code> header of each
              request. For example, with curl:
            </p>

            <pre className="docs-code">
              <code>
                {`curl -H "X-API-Key: YOUR_API_KEY" "<your-protected-endpoint>"`}
              </code>
            </pre>

            <p>
              Replace <code>YOUR_API_KEY</code> with a key from the
              dashboard, and the URL with a protected endpoint on your
              KeyVault backend. Requests authenticated with a key are
              recorded and appear on the Usage page.
            </p>

            <p>
              Keep keys out of source control and client-side code. The
              dashboard itself signs in with a session cookie, not an
              API key.
            </p>
          </DocSection>


          <DocSection
            id="lifecycle"
            title="Expiration, rotation and revocation"
          >
            <p>
              <strong>Expiration.</strong> Choose 90 days (the
              default), 30 days, 7 days or no expiration. Keys with no
              expiration show a warning because they need more manual
              management. A key's status is{" "}
              <strong>Active</strong>,{" "}
              <strong>Expiring soon</strong> (7 days or fewer
              remaining), <strong>Expired</strong> or{" "}
              <strong>Revoked</strong>.
            </p>

            <p>
              <strong>Rotation.</strong> Open the row menu and choose{" "}
              <strong>Rotate</strong>. The current key stops working
              and a new key is generated and shown once. The name,
              environment and permissions stay with the key. Rotate is
              available for Active and Expiring soon keys.
            </p>

            <p>
              <strong>Revocation.</strong> Open the row menu and choose{" "}
              <strong>Revoke</strong>. This disables the credential, so
              requests using it are no longer accepted. A revoked key
              cannot be revoked again.
            </p>
          </DocSection>


          <DocSection
            id="usage-audit"
            title="Usage tracking, rate limits and audit logs"
          >
            <p>
              <strong>Usage</strong> lists recorded requests with the
              time, the name of the key used and the endpoint. The
              dashboard chart counts those records per day for the last
              7 days.
            </p>

            <p>
              <strong>Audit Logs</strong> lists security-relevant
              actions on your account and keys, with the action,
              details, time and the key ID when one applies. The
              dashboard shows the five most recent. Creating, rotating,
              revealing and revoking keys are the actions the dashboard
              describes.
            </p>

            <p>
              <strong>Rate limits.</strong> Any request limits are
              applied by your KeyVault backend. The dashboard does not
              display or configure them, so check your backend settings
              for the values in effect.
            </p>
          </DocSection>


          <DocSection
            id="revealing"
            title="Revealing a stored key"
          >
            <ol>
              <li>
                Select <strong>Reveal</strong> on a key, either on the
                API Keys page or under Recent keys on the dashboard.
              </li>

              <li>
                Enter your account password and select{" "}
                <strong>Reveal key</strong>.
              </li>

              <li>
                The key is shown for 30 seconds with{" "}
                <strong>Copy</strong> and <strong>Hide</strong>{" "}
                buttons.
              </li>
            </ol>

            <p>
              Each reveal is recorded in your audit log. Keys are
              stored as a hash for verification plus an encrypted copy
              for recovery, and a revealed key is held only in memory,
              not in browser storage.
            </p>

            <p>
              Treat every revealed key as sensitive: hiding the dialog
              does not recall a value you have already copied.
            </p>
          </DocSection>


          <div className="docs-end">
            {authenticated ? (
              <button
                type="button"
                className="landing-btn landing-btn-primary"
                onClick={onDashboard}
              >
                Go to dashboard
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="landing-btn landing-btn-primary"
                  onClick={onGetStarted}
                >
                  Create your account
                </button>

                <button
                  type="button"
                  className="landing-btn landing-btn-secondary"
                  onClick={onSignIn}
                >
                  Sign in
                </button>
              </>
            )}
          </div>

        </article>

      </main>

    </div>
  )
}


function formatDateTime(date) {
  if (!date) {
    return "—"
  }

  return new Date(date).toLocaleString(
    undefined,
    {
      dateStyle: "medium",
      timeStyle: "short"
    }
  )
}


export default App
