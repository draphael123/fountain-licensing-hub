import { useMemo, useState } from "react"
import { PROVIDERS } from "../data/providers"
import { ALL_STATES, STATE_NAMES, isOperatingState } from "../data/reference"
import { Card, PageHeader, styles } from "../components/ui"
import { downloadCsv, toCsv } from "../utils/exportCsv"

export default function CoverageMatrix() {
  const [orientation, setOrientation] = useState("providersAsRows") // providersAsRows | statesAsRows

  const activeProviders = useMemo(() => PROVIDERS.filter((p) => !p.terminated), [])

  const csvRows = useMemo(() => {
    if (orientation === "providersAsRows") {
      const header = ["Provider", "Type", "NPI", ...ALL_STATES]
      const rows = activeProviders.map((p) => [
        p.name,
        p.type,
        p.npi,
        ...ALL_STATES.map((st) => (p.states.includes(st) ? "Y" : "")),
      ])
      return [header, ...rows]
    }
    const header = ["State", "Name", ...activeProviders.map((p) => p.name)]
    const rows = ALL_STATES.map((st) => [
      st,
      STATE_NAMES[st] || st,
      ...activeProviders.map((p) => (p.states.includes(st) ? "Y" : "")),
    ])
    return [header, ...rows]
  }, [activeProviders, orientation])

  const handleExport = () => {
    downloadCsv(toCsv(csvRows), `coverage-matrix-${orientation}-${new Date().toISOString().slice(0, 10)}.csv`)
  }

  return (
    <div style={{ padding: 24, background: styles.bg0, minHeight: "100vh", color: styles.text, fontFamily: "'DM Sans', sans-serif" }}>
      <PageHeader title="Coverage Matrix" subtitle="Providers × states — who is licensed where" />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", marginBottom: 24 }}>
        <button
          type="button"
          onClick={() => setOrientation("providersAsRows")}
          style={{
            padding: "8px 16px",
            borderRadius: 6,
            border: `1px solid ${orientation === "providersAsRows" ? styles.accent : styles.border1}`,
            background: orientation === "providersAsRows" ? `${styles.accent}20` : styles.bg2,
            color: styles.text,
            cursor: "pointer",
          }}
        >
          Providers as rows
        </button>
        <button
          type="button"
          onClick={() => setOrientation("statesAsRows")}
          style={{
            padding: "8px 16px",
            borderRadius: 6,
            border: `1px solid ${orientation === "statesAsRows" ? styles.accent : styles.border1}`,
            background: orientation === "statesAsRows" ? `${styles.accent}20` : styles.bg2,
            color: styles.text,
            cursor: "pointer",
          }}
        >
          States as rows
        </button>
        <button
          type="button"
          onClick={handleExport}
          style={{
            padding: "8px 16px",
            borderRadius: 6,
            border: "none",
            background: styles.accent,
            color: styles.bg0,
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Export CSV
        </button>
      </div>

      <div style={{ overflowX: "auto", marginBottom: 24 }}>
        <table style={{ borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr>
              {orientation === "providersAsRows" && (
                <>
                  <th style={{ ...thStyle, minWidth: 140 }}>Provider</th>
                  <th style={thStyle}>Type</th>
                  <th style={thStyle}>NPI</th>
                </>
              )}
              {orientation === "statesAsRows" && (
                <>
                  <th style={{ ...thStyle, minWidth: 50 }}>State</th>
                  <th style={{ ...thStyle, minWidth: 120 }}>Name</th>
                </>
              )}
              {orientation === "providersAsRows" && ALL_STATES.map((st) => (
                <th key={st} style={{ ...thStyle, width: 32, textAlign: "center" }} title={STATE_NAMES[st]}>
                  {st}
                </th>
              ))}
              {orientation === "statesAsRows" && activeProviders.map((p) => (
                <th key={p.id} style={{ ...thStyle, width: 32, textAlign: "center" }} title={`${p.name} (${p.type})`}>
                  {p.name.split(" ")[0]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orientation === "providersAsRows" &&
              activeProviders.map((p) => (
                <tr key={p.id} style={{ borderBottom: `1px solid ${styles.border2}` }}>
                  <td style={tdStyle}>{p.name}</td>
                  <td style={tdStyle}>{p.type}</td>
                  <td style={{ ...tdStyle, fontFamily: "'DM Mono', monospace" }}>{p.npi}</td>
                  {ALL_STATES.map((st) => (
                    <td key={st} style={{ ...tdStyle, textAlign: "center", background: p.states.includes(st) ? (isOperatingState(st) ? "#14532d" : "#1e293b") : "transparent" }}>
                      {p.states.includes(st) ? "✓" : ""}
                    </td>
                  ))}
                </tr>
              ))}
            {orientation === "statesAsRows" &&
              ALL_STATES.map((st) => (
                <tr key={st} style={{ borderBottom: `1px solid ${styles.border2}` }}>
                  <td style={tdStyle}>{st}</td>
                  <td style={tdStyle}>{STATE_NAMES[st]}</td>
                  {activeProviders.map((p) => (
                    <td key={p.id} style={{ ...tdStyle, textAlign: "center", background: p.states.includes(st) ? (isOperatingState(st) ? "#14532d" : "#1e293b") : "transparent" }}>
                      {p.states.includes(st) ? "✓" : ""}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const thStyle = { padding: "8px 10px", textAlign: "left", background: styles.bg2, color: styles.muted, borderBottom: `2px solid ${styles.border1}` }
const tdStyle = { padding: "6px 10px", borderBottom: `1px solid ${styles.border2}` }
