import { useState, useMemo } from "react"
import { PROVIDERS } from "../data/providers"
import { getActiveStates, getExpiredStates, getActiveDea, getExpiredDea, getLicensesExpiringIn, getDeaExpiringIn } from "../data/providers"
import { NLC_STATES, IMLC_STATES, STATE_NAMES } from "../data/reference"
import { Card, PageHeader, StatePill, CredBadge } from "../components/ui"
import { useTheme } from "../context/ThemeContext"

export default function ProviderDirectory() {
  const { theme } = useTheme()
  const [search, setSearch] = useState("")
  const [credFilter, setCredFilter] = useState("All") // All | MD | DO | NP
  const [expiringFilter, setExpiringFilter] = useState("all") // all | 30 | 60 | 90
  const [expandedId, setExpandedId] = useState(null)

  const filtered = useMemo(() => {
    const active = PROVIDERS.filter((p) => !p.terminated)
    let list = credFilter === "All" ? active : active.filter((p) => p.type === credFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.npi.includes(q))
    }
    if (expiringFilter !== "all") {
      const days = Number(expiringFilter)
      list = list.filter((p) => getLicensesExpiringIn(p, days).length > 0 || getDeaExpiringIn(p, days).length > 0)
    }
    return list
  }, [search, credFilter, expiringFilter])

  const compactStatesFor = (p) => (p.type === "NP" ? NLC_STATES : IMLC_STATES)

  return (
    <div style={{ padding: 24, background: theme.bg0, minHeight: "100vh", color: theme.text, fontFamily: "'DM Sans', sans-serif" }}>
      <PageHeader title="Provider Directory" subtitle="Search and expand for DEA, compacts, and licenses" />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", marginBottom: 24 }}>
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
                <span style={{ fontWeight: 600 }}>{p.name}</span>
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
