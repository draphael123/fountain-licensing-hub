import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { PROVIDERS } from "../data/providers"
import { getActiveStates } from "../data/providers"
import { ALL_STATES, STATE_NAMES, RENEWAL_CYCLE, NLC_STATES, IMLC_STATES, BOARD_INFO, isOperatingState } from "../data/reference"
import { Card, PageHeader, StatePill, CredBadge } from "../components/ui"
import { useTheme } from "../context/ThemeContext"

export default function StateView() {
  const { theme } = useTheme()
  const [search, setSearch] = useState("")
  const [onlyWithProviders, setOnlyWithProviders] = useState(false)

  const providersByState = useMemo(() => {
    const map = {}
    ALL_STATES.forEach((st) => (map[st] = []))
    PROVIDERS.filter((p) => !p.terminated).forEach((p) => {
      getActiveStates(p).forEach((st) => {
        if (map[st]) map[st].push(p)
      })
    })
    return map
  }, [])

  const filteredStates = useMemo(() => {
    let list = ALL_STATES
    if (onlyWithProviders) list = list.filter((st) => (providersByState[st]?.length ?? 0) > 0)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (st) =>
          st.toLowerCase().includes(q) ||
          (STATE_NAMES[st] || "").toLowerCase().includes(q)
      )
    }
    return list
  }, [search, onlyWithProviders, providersByState])

  return (
    <div style={{ padding: 24, background: theme.bg0, minHeight: "100vh", color: theme.text, fontFamily: "'DM Sans', sans-serif" }}>
      <PageHeader
        title="By State"
        subtitle="Renewal cycle, compacts, and providers licensed in each state"
      />
      <div className="no-print" style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", marginBottom: 24 }}>
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
          <input
            type="checkbox"
            checked={onlyWithProviders}
            onChange={(e) => setOnlyWithProviders(e.target.checked)}
            style={{ accentColor: theme.accent }}
          />
          <span>Only states with providers</span>
        </label>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filteredStates.map((st) => {
          const info = BOARD_INFO[st]
          const renewal = RENEWAL_CYCLE[st] || "Biennial"
          const nlc = NLC_STATES.includes(st)
          const imlc = IMLC_STATES.includes(st)
          const providers = providersByState[st] || []
          const operating = isOperatingState(st)
          return (
            <Card
              key={st}
              style={{
                padding: 16,
                borderLeft: `4px solid ${operating ? theme.success : theme.muted}`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
                <StatePill state={st} />
                <span style={{ fontWeight: 600 }}>{STATE_NAMES[st] || st}</span>
                {!operating && (
                  <span style={{ fontSize: 11, padding: "2px 6px", background: theme.bg2, color: theme.muted, borderRadius: 4 }}>
                    Coming soon
                  </span>
                )}
                <span style={{ color: theme.muted, fontSize: 13 }}>{renewal}</span>
                {nlc && <span style={{ fontSize: 11, padding: "2px 6px", background: theme.accent + "20", color: theme.accent, borderRadius: 4 }}>NLC</span>}
                {imlc && <span style={{ fontSize: 11, padding: "2px 6px", background: theme.accent + "20", color: theme.accent, borderRadius: 4 }}>IMLC</span>}
                <span style={{ marginLeft: "auto", color: theme.muted }}>{providers.length} provider{providers.length !== 1 ? "s" : ""}</span>
                {info && (
                  <a href={info.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: theme.accent }}>
                    Board / Renewal →
                  </a>
                )}
              </div>
              {providers.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                  {providers.map((p) => (
                    <Link
                      key={p.id}
                      to={`/provider/${p.id}`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "4px 10px",
                        background: theme.bg2,
                        borderRadius: 6,
                        color: theme.accent,
                        textDecoration: "none",
                        fontSize: 13,
                      }}
                    >
                      <CredBadge type={p.type} />
                      {p.name}
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
