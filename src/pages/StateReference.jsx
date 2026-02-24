import { useState, useMemo } from "react"
import { PROVIDERS } from "../data/providers"
import { BOARD_INFO, RENEWAL_CYCLE, NLC_STATES, IMLC_STATES, ALL_STATES, STATE_NAMES, isOperatingState } from "../data/reference"
import { Card, PageHeader, StatePill } from "../components/ui"
import { useTheme } from "../context/ThemeContext"
import { getActiveStates } from "../data/providers"

export default function StateReference() {
  const { theme } = useTheme()
  const [search, setSearch] = useState("")
  const [onlyWithProviders, setOnlyWithProviders] = useState(false)

  const activeCountByState = useMemo(() => {
    const map = {}
    ALL_STATES.forEach((st) => (map[st] = 0))
    PROVIDERS.filter((p) => !p.terminated).forEach((p) =>
      getActiveStates(p).forEach((st) => {
        if (map[st] !== undefined) map[st]++
      })
    )
    return map
  }, [])

  const filtered = useMemo(() => {
    let list = ALL_STATES
    if (onlyWithProviders) list = list.filter((st) => activeCountByState[st] > 0)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((st) => st.toLowerCase().includes(q) || (STATE_NAMES[st] || "").toLowerCase().includes(q))
    }
    return list
  }, [search, onlyWithProviders, activeCountByState])

  return (
    <div style={{ padding: 24, background: theme.bg0, minHeight: "100vh", color: theme.text, fontFamily: "'DM Sans', sans-serif" }}>
      <PageHeader title="State Boards" subtitle="Board info, renewal cycle, compacts, provider count" />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", marginBottom: 24 }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search state..."
          style={{
            minWidth: 200,
            padding: "10px 14px",
            background: theme.bg1,
            border: `1px solid ${theme.border1}`,
            borderRadius: 8,
            color: theme.text,
            fontSize: 14,
          }}
        />
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <input type="checkbox" checked={onlyWithProviders} onChange={(e) => setOnlyWithProviders(e.target.checked)} style={{ accentColor: theme.accent }} />
          <span>Only states with active providers</span>
        </label>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.map((st) => {
          const info = BOARD_INFO[st]
          const renewal = RENEWAL_CYCLE[st]
          const nlc = NLC_STATES.includes(st)
          const imlc = IMLC_STATES.includes(st)
          const count = activeCountByState[st] ?? 0
          const operating = isOperatingState(st)
          if (!info) return null
          return (
            <Card
              key={st}
              style={{
                padding: 16,
                borderLeft: `4px solid ${operating ? "#22c55e" : "#64748b"}`,
                background: operating ? undefined : "#1e293b",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
                <StatePill state={st} />
                <span style={{ fontWeight: 600 }}>{info.name}</span>
                {!operating && (
                  <span style={{ fontSize: 11, padding: "2px 6px", background: "#475569", color: "#94a3b8", borderRadius: 4 }}>Coming soon</span>
                )}
                {count === 0 && operating && (
                  <span style={{ fontSize: 11, padding: "2px 6px", background: "#7f1d1d", color: "#fca5a5", borderRadius: 4 }}>No providers</span>
                )}
                {nlc && <span style={{ fontSize: 11, padding: "2px 6px", background: "#1e3a5f", color: theme.accent, borderRadius: 4 }}>NLC</span>}
                {imlc && <span style={{ fontSize: 11, padding: "2px 6px", background: "#1e3a5f", color: theme.accent, borderRadius: 4 }}>IMLC</span>}
                <span style={{ marginLeft: "auto", color: theme.muted }}>{renewal}</span>
                <span style={{ color: theme.muted }}>{count} provider{count !== 1 ? "s" : ""}</span>
              </div>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 14 }}>
                <a href={info.url} target="_blank" rel="noopener noreferrer" style={{ color: theme.accent }} title={info.url}>
                  Board / Renewal →
                </a>
                <span style={{ color: theme.muted }}>{info.phone}</span>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
