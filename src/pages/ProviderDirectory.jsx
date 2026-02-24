import { useState, useMemo } from "react"
import { Link } from "react-router-dom"
import { PROVIDERS } from "../data/providers"
import { getActiveStates, getExpiredStates, getActiveDea, getExpiredDea, getLicensesExpiringIn, getDeaExpiringIn, getCeuStatus } from "../data/providers"
import { NLC_STATES, IMLC_STATES, STATE_NAMES } from "../data/reference"
import { Card, PageHeader, StatePill, CredBadge, StateSelect } from "../components/ui"
import { useTheme } from "../context/ThemeContext"
import { downloadCsv, toCsv, buildFullProviderExportRows } from "../utils/exportCsv"

export default function ProviderDirectory() {
  const { theme } = useTheme()
  const [search, setSearch] = useState("")
  const [credFilter, setCredFilter] = useState("All") // All | MD | DO | NP
  const [expiringFilter, setExpiringFilter] = useState("all") // all | 30 | 60 | 90
  const [stateFilter, setStateFilter] = useState([]) // licensed in any of these states
  const [sortBy, setSortBy] = useState("name") // name | nameDesc | stateCount
  const [expandedId, setExpandedId] = useState(null)

  const filtered = useMemo(() => {
    const active = PROVIDERS.filter((p) => !p.terminated)
    let list = credFilter === "All" ? active : active.filter((p) => p.type === credFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.npi.includes(q))
    }
    if (stateFilter.length > 0) {
      list = list.filter((p) => stateFilter.some((st) => getActiveStates(p).includes(st)))
    }
    if (expiringFilter !== "all") {
      const days = Number(expiringFilter)
      list = list.filter((p) => getLicensesExpiringIn(p, days).length > 0 || getDeaExpiringIn(p, days).length > 0)
    }
    const sorted = [...list].sort((a, b) => {
      const aStates = getActiveStates(a).length
      const bStates = getActiveStates(b).length
      if (sortBy === "name") return a.name.localeCompare(b.name)
      if (sortBy === "nameDesc") return b.name.localeCompare(a.name)
      if (sortBy === "stateCount") return bStates - aStates || a.name.localeCompare(b.name)
      return 0
    })
    return sorted
  }, [search, credFilter, expiringFilter, stateFilter, sortBy])

  const compactStatesFor = (p) => (p.type === "NP" ? NLC_STATES : IMLC_STATES)

  const activeProviders = useMemo(() => PROVIDERS.filter((p) => !p.terminated), [])

  const handleExportAll = () => {
    const rows = buildFullProviderExportRows(activeProviders, getActiveStates, getActiveDea, getCeuStatus)
    downloadCsv(toCsv(rows), `providers-full-export-${new Date().toISOString().slice(0, 10)}.csv`)
  }

  return (
    <div className="print-page" style={{ padding: 24, background: theme.bg0, minHeight: "100vh", color: theme.text, fontFamily: "'DM Sans', sans-serif" }}>
      <PageHeader title="Provider Directory" subtitle="Search and expand for DEA, compacts, and licenses" />
      <div className="no-print" style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", marginBottom: 24 }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or NPI..."
          style={{
            minWidth: 260,
            padding: "10px 14px",
            background: theme.bg1,
            border: `1px solid ${theme.border1}`,
            borderRadius: 8,
            color: theme.text,
            fontSize: 14,
          }}
        />
        <div style={{ display: "flex", gap: 8 }}>
          {["All", "MD", "DO", "NP"].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCredFilter(c)}
              style={{
                padding: "8px 16px",
                borderRadius: 6,
                border: `1px solid ${credFilter === c ? theme.accent : theme.border1}`,
                background: credFilter === c ? `${theme.accent}20` : theme.bg2,
                color: theme.text,
                cursor: "pointer",
              }}
            >
              {c}
            </button>
          ))}
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: theme.muted }}>
          Expiring soon:
          <select
            value={expiringFilter}
            onChange={(e) => setExpiringFilter(e.target.value)}
            style={{ padding: "6px 10px", borderRadius: 6, border: `1px solid ${theme.border1}`, background: theme.bg1, color: theme.text, fontSize: 14 }}
          >
            <option value="all">All providers</option>
            <option value="30">Next 30 days</option>
            <option value="60">Next 60 days</option>
            <option value="90">Next 90 days</option>
          </select>
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: theme.muted }}>
          Licensed in state:
          <div style={{ minWidth: 200 }}>
            <StateSelect selected={stateFilter} onChange={setStateFilter} placeholder="Any" />
          </div>
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: theme.muted }}>
          Sort:
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ padding: "6px 10px", borderRadius: 6, border: `1px solid ${theme.border1}`, background: theme.bg1, color: theme.text, fontSize: 14 }}
          >
            <option value="name">Name A–Z</option>
            <option value="nameDesc">Name Z–A</option>
            <option value="stateCount">State count (high first)</option>
          </select>
        </label>
        <button
          type="button"
          onClick={handleExportAll}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            border: "none",
            background: theme.accent,
            color: theme.accentText,
            fontSize: 14,
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Export full list (CSV)
        </button>
        <button
          type="button"
          className="no-print"
          onClick={() => window.print()}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            border: `1px solid ${theme.border1}`,
            background: theme.bg2,
            color: theme.text,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Print
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.map((p) => {
          const open = expandedId === p.id
          const compactStates = compactStatesFor(p)
          const activeStates = getActiveStates(p)
          const expiredStates = getExpiredStates(p)
          const hasCompact = activeStates.some((s) => compactStates.includes(s))
          return (
            <Card key={p.id} id={`provider-${p.id}`} style={{ padding: 12 }}>
              <button
                type="button"
                onClick={() => setExpandedId(open ? null : p.id)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  background: "none",
                  border: "none",
                  color: theme.text,
                  cursor: "pointer",
                  textAlign: "left",
                  fontSize: 14,
                }}
              >
                <span style={{ opacity: 0.7 }}>{open ? "▼" : "▶"}</span>
                <CredBadge type={p.type} />
                <Link to={`/provider/${p.id}`} style={{ fontWeight: 600, color: theme.text, textDecoration: "none" }} onClick={(e) => e.stopPropagation()}>
                  {p.name}
                </Link>
                <span style={{ fontSize: 12, color: theme.muted }}>({activeStates.length} active license{activeStates.length !== 1 ? "s" : ""}{expiredStates.length ? `, ${expiredStates.length} expired` : ""})</span>
              </button>
              {open && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${theme.border2}`, display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 12, color: theme.muted, marginBottom: 6 }}>DEA registrations</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {getActiveDea(p).map(({ state, num }) => (
                        <span key={state + num} style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, padding: "4px 8px", background: theme.bg2, borderRadius: 4 }}>
                          {state}: {num}
                        </span>
                      ))}
                      {getExpiredDea(p).map(({ state, num }) => (
                        <span key={"exp-" + state + num} title={p.deaExpirations?.[state] ? `Expired ${p.deaExpirations[state]}` : "Expired"} style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, padding: "4px 8px", background: theme.danger + "20", color: theme.danger, border: `1px solid ${theme.danger}`, borderRadius: 4 }}>
                          {state}: {num} (expired)
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: theme.muted, marginBottom: 6 }}>Compact states ({p.type === "NP" ? "NLC" : "IMLC"})</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {activeStates.filter((s) => compactStates.includes(s)).map((s) => (
                        <StatePill key={s} state={s} />
                      ))}
                      {!hasCompact && <span style={{ color: theme.muted }}>None</span>}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: theme.muted, marginBottom: 6 }}>Full licensed states ({activeStates.length})</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {activeStates.map((s) => (
                        <StatePill key={s} state={s} />
                      ))}
                    </div>
                  </div>
                  {expiredStates.length > 0 && (
                    <div>
                      <div style={{ fontSize: 12, color: theme.danger, marginBottom: 6 }}>Expired licenses ({expiredStates.length}) — do not count toward coverage</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {expiredStates.map((s) => (
                          <StatePill key={s} state={s} expired title={p.licenseExpirations?.[s] ? `${STATE_NAMES[s] || s} (Expired ${p.licenseExpirations[s]})` : undefined} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
