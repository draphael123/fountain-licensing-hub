import { useMemo, useState } from "react"
import { PROVIDERS } from "../data/providers"
import { getActiveStates } from "../data/providers"
import { ALL_STATES, STATE_NAMES, isOperatingState } from "../data/reference"
import { Card, PageHeader } from "../components/ui"
import { useTheme } from "../context/ThemeContext"
import { downloadCsv, toCsv } from "../utils/exportCsv"

export default function CoverageMatrix() {
  const { theme } = useTheme()
  const [orientation, setOrientation] = useState("providersAsRows") // providersAsRows | statesAsRows

  const activeProviders = useMemo(() => PROVIDERS.filter((p) => !p.terminated), [])

  const csvRows = useMemo(() => {
    if (orientation === "providersAsRows") {
      const header = ["Provider", "Type", "NPI", ...ALL_STATES]
      const rows = activeProviders.map((p) => [
        p.name,
        p.type,
        p.npi,
        ...ALL_STATES.map((st) => (getActiveStates(p).includes(st) ? "Y" : "")),
      ])
      return [header, ...rows]
    }
    const header = ["State", "Name", ...activeProviders.map((p) => p.name)]
    const rows = ALL_STATES.map((st) => [
      st,
      STATE_NAMES[st] || st,
      ...activeProviders.map((p) => (getActiveStates(p).includes(st) ? "Y" : "")),
    ])
    return [header, ...rows]
  }, [activeProviders, orientation])

  const handleExport = () => {
    downloadCsv(toCsv(csvRows), `coverage-matrix-${orientation}-${new Date().toISOString().slice(0, 10)}.csv`)
  }

  return (
    <div style={{ padding: 24, background: theme.bg0, minHeight: "100vh", color: theme.text, fontFamily: "'DM Sans', sans-serif" }}>
      <PageHeader title="Coverage Matrix" subtitle="Providers × states — who is licensed where" />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", marginBottom: 24 }}>
        <button
          type="button"
          onClick={() => setOrientation("providersAsRows")}
          style={{
            padding: "8px 16px",
            borderRadius: 6,
            border: `1px solid ${orientation === "providersAsRows" ? theme.accent : theme.border1}`,
            background: orientation === "providersAsRows" ? `${theme.accent}20` : theme.bg2,
            color: theme.text,
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
            border: `1px solid ${orientation === "statesAsRows" ? theme.accent : theme.border1}`,
            background: orientation === "statesAsRows" ? `${theme.accent}20` : theme.bg2,
            color: theme.text,
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
            background: theme.accent,
            color: theme.accentText,
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Export CSV
        </button>
      </div>

      <div style={{ overflowX: "auto", marginBottom: 24, WebkitOverflowScrolling: "touch", maxWidth: "100%" }}>
        <table style={{ borderCollapse: "collapse", fontSize: 12, minWidth: 400 }}>
          <thead>
            <tr>
              {orientation === "providersAsRows" && (
                <>
                  <th style={{ ...thStyle(theme), minWidth: 140, position: "sticky", left: 0, zIndex: 2, boxShadow: "2px 0 4px rgba(0,0,0,0.06)" }}>Provider</th>
                  <th style={thStyle(theme)}>Type</th>
                  <th style={thStyle(theme)}>NPI</th>
                </>
              )}
              {orientation === "statesAsRows" && (
                <>
                  <th style={{ ...thStyle(theme), minWidth: 50, position: "sticky", left: 0, zIndex: 2, boxShadow: "2px 0 4px rgba(0,0,0,0.06)" }}>State</th>
                  <th style={{ ...thStyle(theme), minWidth: 120 }}>Name</th>
                </>
              )}
              {orientation === "providersAsRows" && ALL_STATES.map((st) => (
                <th key={st} style={{ ...thStyle(theme), width: 32, textAlign: "center" }} title={STATE_NAMES[st]}>
                  {st}
                </th>
              ))}
              {orientation === "statesAsRows" && activeProviders.map((p) => (
                <th key={p.id} style={{ ...thStyle(theme), width: 32, textAlign: "center" }} title={`${p.name} (${p.type})`}>
                  {p.name.split(" ")[0]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orientation === "providersAsRows" &&
              activeProviders.map((p) => (
                <tr key={p.id} style={{ borderBottom: `1px solid ${theme.border2}` }}>
                  <td style={{ ...tdStyle(theme), position: "sticky", left: 0, zIndex: 1, background: theme.bg0 }}>{p.name}</td>
                  <td style={tdStyle(theme)}>{p.type}</td>
                  <td style={{ ...tdStyle(theme), fontFamily: "'DM Mono', monospace" }}>{p.npi}</td>
                  {ALL_STATES.map((st) => (
                    <td key={st} style={{ ...tdStyle(theme), textAlign: "center", background: getActiveStates(p).includes(st) ? (isOperatingState(st) ? theme.successBg : theme.comingSoonBg) : "transparent" }}>
                      {getActiveStates(p).includes(st) ? "✓" : ""}
                    </td>
                  ))}
                </tr>
              ))}
            {orientation === "statesAsRows" &&
              ALL_STATES.map((st) => (
                <tr key={st} style={{ borderBottom: `1px solid ${theme.border2}` }}>
                  <td style={{ ...tdStyle(theme), position: "sticky", left: 0, zIndex: 1, background: theme.bg0 }}>{st}</td>
                  <td style={tdStyle(theme)}>{STATE_NAMES[st]}</td>
                  {activeProviders.map((p) => (
                    <td key={p.id} style={{ ...tdStyle(theme), textAlign: "center", background: getActiveStates(p).includes(st) ? (isOperatingState(st) ? theme.successBg : theme.comingSoonBg) : "transparent" }}>
                      {getActiveStates(p).includes(st) ? "✓" : ""}
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

function thStyle(theme) {
  return { padding: "8px 10px", textAlign: "left", background: theme.bg2, color: theme.muted, borderBottom: `2px solid ${theme.border1}` }
}
function tdStyle(theme) {
  return { padding: "6px 10px", borderBottom: `1px solid ${theme.border2}` }
}
