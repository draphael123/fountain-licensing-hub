import { useMemo } from "react"
import { COMING_SOON_STATES, STATE_NAMES, STATE_POP } from "../data/reference"
import { Card, PageHeader, StatePill, styles } from "../components/ui"

export default function ExpansionPriorities() {
  const sorted = useMemo(
    () =>
      [...COMING_SOON_STATES].sort((a, b) => (STATE_POP[b] ?? 0) - (STATE_POP[a] ?? 0)),
    []
  )

  const byTier = useMemo(() => {
    const high = sorted.filter((st) => (STATE_POP[st] ?? 0) >= 10)
    const medium = sorted.filter((st) => {
      const p = STATE_POP[st] ?? 0
      return p >= 3 && p < 10
    })
    const low = sorted.filter((st) => (STATE_POP[st] ?? 0) < 3)
    return { high, medium, low }
  }, [sorted])

  return (
    <div style={{ padding: 24, background: styles.bg0, minHeight: "100vh", color: styles.text, fontFamily: "'DM Sans', sans-serif" }}>
      <PageHeader
        title="Expansion Priorities"
        subtitle="Coming-soon states ranked by population — prioritize high-volume states first"
      />
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {byTier.high.length > 0 && (
          <section>
            <h3 style={{ margin: "0 0 12px", fontSize: 16, color: "#f59e0b" }}>High population (≥10M) — top priority</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {byTier.high.map((st) => (
                <Card key={st} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <StatePill state={st} />
                  <span>{STATE_NAMES[st]}</span>
                  <span style={{ color: styles.muted }}>{(STATE_POP[st] ?? 0).toFixed(1)}M</span>
                </Card>
              ))}
            </div>
          </section>
        )}
        {byTier.medium.length > 0 && (
          <section>
            <h3 style={{ margin: "0 0 12px", fontSize: 16, color: "#60a5fa" }}>Medium population (3–10M)</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {byTier.medium.map((st) => (
                <Card key={st} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <StatePill state={st} />
                  <span>{STATE_NAMES[st]}</span>
                  <span style={{ color: styles.muted }}>{(STATE_POP[st] ?? 0).toFixed(1)}M</span>
                </Card>
              ))}
            </div>
          </section>
        )}
        {byTier.low.length > 0 && (
          <section>
            <h3 style={{ margin: "0 0 12px", fontSize: 16, color: "#475569" }}>Lower population (&lt;3M)</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {byTier.low.map((st) => (
                <Card key={st} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <StatePill state={st} />
                  <span>{STATE_NAMES[st]}</span>
                  <span style={{ color: styles.muted }}>{(STATE_POP[st] ?? 0).toFixed(1)}M</span>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
