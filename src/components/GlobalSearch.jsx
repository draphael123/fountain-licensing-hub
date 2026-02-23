import { useState, useMemo, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { PROVIDERS } from "../data/providers"
import { getActiveStates } from "../data/providers"
import { STATE_NAMES } from "../data/reference"
import { useTheme } from "../context/ThemeContext"
import { CredBadge } from "./ui"

export function GlobalSearch() {
  const { theme } = useTheme()
  const navigate = useNavigate()
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [focused, setFocused] = useState(false)
  const containerRef = useRef(null)

  const activeProviders = useMemo(() => PROVIDERS.filter((p) => !p.terminated), [])
  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q || q.length < 2) return []
    const list = []
    activeProviders.forEach((p) => {
      const nameMatch = p.name.toLowerCase().includes(q)
      const npiMatch = p.npi.includes(q)
      const stateMatch = getActiveStates(p).some((st) => st === q.toUpperCase() || (STATE_NAMES[st] || "").toLowerCase().includes(q))
      if (nameMatch || npiMatch || stateMatch)
        list.push({ provider: p, match: nameMatch ? "name" : npiMatch ? "npi" : "state" })
    })
    return list.slice(0, 8)
  }, [query, activeProviders])

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const showDropdown = open && focused && results.length > 0

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <input
        type="text"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
        onFocus={() => { setOpen(true); setFocused(true) }}
        onBlur={() => setFocused(false)}
        placeholder="Search providers, NPI, or state..."
        style={{
          width: 200,
          padding: "8px 12px",
          background: theme.bg2,
          border: `1px solid ${theme.border1}`,
          borderRadius: 8,
          color: theme.text,
          fontSize: 14,
        }}
      />
      {showDropdown && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            marginTop: 4,
            minWidth: 320,
            maxHeight: 360,
            overflow: "auto",
            background: theme.bg1,
            border: `1px solid ${theme.border1}`,
            borderRadius: 8,
            boxShadow: theme.shadow,
            zIndex: 200,
          }}
        >
          {results.map(({ provider: p, match }) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                navigate("/dir")
                setQuery("")
                setOpen(false)
                setTimeout(() => document.getElementById(`provider-${p.id}`)?.scrollIntoView?.({ behavior: "smooth" }), 100)
              }}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                background: "none",
                border: "none",
                borderBottom: `1px solid ${theme.border2}`,
                color: theme.text,
                fontSize: 14,
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <CredBadge type={p.type} />
              <span style={{ fontWeight: 600 }}>{p.name}</span>
              <span style={{ color: theme.muted, fontSize: 12 }}>{p.npi}</span>
              {match === "state" && <span style={{ fontSize: 11, color: theme.accent }}>state</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
