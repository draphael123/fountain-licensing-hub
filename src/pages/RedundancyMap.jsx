import { useMemo } from "react"
import { PROVIDERS } from "../data/providers"
import { getActiveStates } from "../data/providers"
import { STATE_NAMES, ALL_STATES, isOperatingState } from "../data/reference"
import { Card, PageHeader } from "../components/ui"
import { useTheme } from "../context/ThemeContext"

const ZONE_COLORS = {
  none: "#7f1d1d",
  thin: "#c2410c",
  moderate: "#a16207",
  strong: "#15803d",
  deep: "#1e40af",
}

function getZone(count) {
  if (count === 0) return "none"
  if (count <= 2) return "thin"
  if (count <= 5) return "moderate"
  if (count <= 10) return "strong"
  return "deep"
}

export default function RedundancyMap() {
  const { theme } = useTheme()
  const activeProviders = useMemo(() => PROVIDERS.filter((p) => !p.terminated), [])

  const stateCounts = useMemo(() => {
    const map = {}
    ALL_STATES.forEach((st) => (map[st] = { count: 0, names: [] }))
    activeProviders.forEach((p) => {
      getActiveStates(p).forEach((st) => {
        if (map[st]) {
          map[st].count++
          map[st].names.push(p.name)
        }
      })
    })
    return map
  }, [activeProviders])

  const sorted = useMemo(() => ALL_STATES.map((st) => ({ state: st, ...stateCounts[st] })).sort((a, b) => b.count - a.count), [stateCounts])

  const zoneCounts = useMemo(() => {
    const z = { none: 0, thin: 0, moderate: 0, strong: 0, deep: 0 }
    Object.values(stateCounts).forEach(({ count }) => (z[getZone(count)]++))
    return z
  }, [stateCounts])

  return (
    <div style={{ padding: 24, background: theme.bg0, minHeight: "100vh", color: theme.text, fontFamily: "'DM Sans', sans-serif" }}>
      <PageHeader title="Redundancy Map" subtitle="Provider count by state (heat zones)" />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
        {[
          { key: "none", label: "Coming soon / No coverage", color: ZONE_COLORS.none },
          { key: "thin", label: "Thin (1–2)", color: ZONE_COLORS.thin },
          { key: "moderate", label: "Moderate (3–5)", color: ZONE_COLORS.moderate },
          { key: "strong", label: "Strong (6–10)", color: ZONE_COLORS.strong },
          { key: "deep", label: "Deep (11+)", color: ZONE_COLORS.deep },
        ].map(({ key, label, color }) => (
          <Card key={key} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 16, height: 16, borderRadius: 4, background: color }} />
            <span>{label}</span>
            <span style={{ color: theme.muted }}>{zoneCounts[key]}</span>
          </Card>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
        {sorted.map(({ state: st, count, names }) => {
          const zone = getZone(count)
          const color = ZONE_COLORS[zone]
          return (
            <Card
              key={st}
              style={{
                background: color,
                color: "#fff",
                padding: 12,
                position: "relative",
                cursor: "default",
              }}
              title={names.length ? names.join(", ") : (isOperatingState(st) ? "No coverage" : "Coming soon")}
            >
              <div style={{ fontWeight: 700, fontSize: 18 }}>{st}</div>
              <div style={{ fontSize: 12, opacity: 0.9 }}>{STATE_NAMES[st]}</div>
              <div style={{ marginTop: 8, fontSize: 14 }}>
                {count === 0 ? (isOperatingState(st) ? "No coverage" : "Coming soon") : `${count} provider${count !== 1 ? "s" : ""}`}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
