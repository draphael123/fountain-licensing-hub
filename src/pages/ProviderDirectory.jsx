import { useState, useMemo } from "react"
import { PROVIDERS } from "../data/providers"
import { NLC_STATES, IMLC_STATES, STATE_NAMES, STATE_POP, getTier } from "../data/reference"
import { Card, PageHeader, StatePill, CredBadge, styles } from "../components/ui"

export default function ProviderDirectory() {
  const [search, setSearch] = useState("")
  const [credFilter, setCredFilter] = useState("All") // All | MD | DO | NP
  const [expandedId, setExpandedId] = useState(null)

  const filtered = useMemo(() => {
    const active = PROVIDERS.filter((p) => !p.terminated)
    let list = credFilter === "All" ? active : active.filter((p) => p.type === credFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.npi.includes(q))
    }
    return list
  }, [search, credFilter])

  const compactStatesFor = (p) => (p.type === "NP" ? NLC_STATES : IMLC_STATES)

  return (
    <div style={{ padding: 24, background: styles.bg0, minHeight: "100vh", color: styles.text, fontFamily: "'DM Sans', sans-serif" }}>
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
            background: styles.bg1,
            border: `1px solid ${styles.border1}`,
            borderRadius: 8,
            color: styles.text,
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
                border: `1px solid ${credFilter === c ? styles.accent : styles.border1}`,
                background: credFilter === c ? `${styles.accent}20` : styles.bg2,
                color: styles.text,
                cursor: "pointer",
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.map((p) => {
          const open = expandedId === p.id
          const compactStates = compactStatesFor(p)
          const hasCompact = p.states.some((s) => compactStates.includes(s))
          return (
            <Card key={p.id} style={{ padding: 12 }}>
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
                  color: styles.text,
                  cursor: "pointer",
                  textAlign: "left",
                  fontSize: 14,
                }}
              >
                <span style={{ opacity: 0.7 }}>{open ? "▼" : "▶"}</span>
                <CredBadge type={p.type} />
                <span style={{ fontWeight: 600 }}>{p.name}</span>
              </button>
              {open && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${styles.border2}`, display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 12, color: styles.muted, marginBottom: 6 }}>DEA registrations</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {p.dea.map(({ state, num }) => (
                        <span key={state + num} style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, padding: "4px 8px", background: styles.bg2, borderRadius: 4 }}>
                          {state}: {num}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: styles.muted, marginBottom: 6 }}>Compact states ({p.type === "NP" ? "NLC" : "IMLC"})</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {p.states.filter((s) => compactStates.includes(s)).map((s) => (
                        <StatePill key={s} state={s} />
                      ))}
                      {!hasCompact && <span style={{ color: styles.muted }}>None</span>}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: styles.muted, marginBottom: 6 }}>Full licensed states</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {p.states.map((s) => (
                        <StatePill key={s} state={s} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
