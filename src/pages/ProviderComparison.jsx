import { useState, useMemo } from "react"
import { PROVIDERS } from "../data/providers"
import { ALL_STATES, STATE_NAMES, isOperatingState } from "../data/reference"
import { Card, PageHeader, StatePill, CredBadge, styles } from "../components/ui"

const MAX_COMPARE = 3

export default function ProviderComparison() {
  const [selectedIds, setSelectedIds] = useState([])

  const activeProviders = useMemo(() => PROVIDERS.filter((p) => !p.terminated), [])

  const toggle = (id) => {
    if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter((x) => x !== id))
    else if (selectedIds.length < MAX_COMPARE) setSelectedIds([...selectedIds, id].sort((a, b) => a - b))
  }

  const selected = useMemo(() => selectedIds.map((id) => activeProviders.find((p) => p.id === id)).filter(Boolean), [selectedIds, activeProviders])

  const allStatesInComparison = useMemo(() => {
    const set = new Set()
    selected.forEach((p) => p.states.forEach((s) => set.add(s)))
    return [...set].sort()
  }, [selected])

  const overlap = useMemo(() => {
    if (selected.length < 2) return new Set()
    let set = new Set(selected[0].states)
    selected.slice(1).forEach((p) => {
      set = new Set([...set].filter((s) => p.states.includes(s)))
    })
    return set
  }, [selected])

  return (
    <div style={{ padding: 24, background: styles.bg0, minHeight: "100vh", color: styles.text, fontFamily: "'DM Sans', sans-serif" }}>
      <PageHeader title="Provider Comparison" subtitle="Select 2–3 providers to compare state coverage" />
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: "block", fontSize: 12, color: styles.muted, marginBottom: 8 }}>Select providers ({selected.length}/{MAX_COMPARE})</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {activeProviders.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => toggle(p.id)}
              style={{
                padding: "8px 14px",
                borderRadius: 8,
                border: `2px solid ${selectedIds.includes(p.id) ? styles.accent : styles.border1}`,
                background: selectedIds.includes(p.id) ? `${styles.accent}20` : styles.bg2,
                color: styles.text,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <CredBadge type={p.type} />
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {selected.length >= 2 && (
        <>
          {selected.length >= 2 && overlap.size > 0 && (
            <Card style={{ marginBottom: 24, borderLeft: "4px solid #22c55e" }}>
              <div style={{ fontSize: 12, color: styles.muted }}>States covered by all selected</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                {[...overlap].map((st) => (
                  <StatePill key={st} state={st} />
                ))}
              </div>
            </Card>
          )}
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${selected.length}, 1fr)`, gap: 16 }}>
            {selected.map((p) => (
              <Card key={p.id} style={{ padding: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <CredBadge type={p.type} />
                  <span style={{ fontWeight: 600 }}>{p.name}</span>
                </div>
                <div style={{ fontSize: 12, color: styles.muted, marginBottom: 8 }}>{p.states.length} states</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {p.states.map((st) => (
                    <StatePill key={st} state={st} />
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {selected.length === 1 && (
        <Card>
          <div style={{ color: styles.muted }}>Select at least one more provider to compare.</div>
        </Card>
      )}
    </div>
  )
}
