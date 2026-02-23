import { getActiveDea, getExpiredDea } from "../data/providers"
import { STATE_NAMES, ALL_STATES } from "../data/reference"
import { Card, PageHeader, CredBadge } from "../components/ui"
import { useTheme } from "../context/ThemeContext"
import { downloadCsv, toCsv } from "../utils/exportCsv"

export default function DEATracker() {
  const { theme } = useTheme()
  const activeProviders = useMemo(() => PROVIDERS.filter((p) => !p.terminated), [])

  const byProvider = useMemo(
    () =>
      activeProviders.map((p) => ({
        ...p,
        activeDea: getActiveDea(p),
        expiredDea: getExpiredDea(p),
      })),
    [activeProviders]
  )

  const byState = useMemo(() => {
    const map = {}
    ALL_STATES.forEach((st) => (map[st] = []))
    activeProviders.forEach((p) => {
      getActiveDea(p).forEach(({ state, num }) => {
        if (map[state]) map[state].push({ name: p.name, type: p.type, num })
      })
    })
    return Object.entries(map)
      .filter(([, list]) => list.length > 0)
      .sort((a, b) => b[1].length - a[1].length)
  }, [activeProviders])

  const handleExport = () => {
    const rows = [["Provider", "Type", "State", "DEA Number"]]
    activeProviders.forEach((p) => {
      getActiveDea(p).forEach(({ state, num }) => rows.push([p.name, p.type, state, num]))
    })
    downloadCsv(toCsv(rows), `dea-registrations-${new Date().toISOString().slice(0, 10)}.csv`)
  }

  return (
    <div style={{ padding: 24, background: theme.bg0, minHeight: "100vh", color: theme.text, fontFamily: "'DM Sans', sans-serif" }}>
      <PageHeader title="DEA Tracker" subtitle="Registrations by provider and by state" />
      <div style={{ marginBottom: 16 }}>
        <button
          type="button"
          onClick={handleExport}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
        <div>
          <h3 style={{ marginBottom: 12, fontSize: 16 }}>By Provider</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {byProvider.map((p) => (
              <div
                key={p.id}
                style={{
                  padding: 12,
                  background: theme.bg2,
                  borderBottom: `1px solid ${theme.border2}`,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <CredBadge type={p.type} />
                <span style={{ fontWeight: 600, minWidth: 160 }}>{p.name}</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {p.activeDea.map(({ state, num }) => (
                    <span key={state + num} style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, padding: "4px 8px", background: theme.bg1, borderRadius: 4 }}>
                      {state}: {num}
                    </span>
                  ))}
                  {p.expiredDea.map(({ state, num }) => (
                    <span key={"exp-" + state + num} title={`Expired${p.deaExpirations?.[state] ? ` ${p.deaExpirations[state]}` : ""}`} style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, padding: "4px 8px", background: theme.danger + "20", color: theme.danger, border: `1px solid ${theme.danger}`, borderRadius: 4 }}>
                      {state}: {num} (expired)
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 style={{ marginBottom: 12, fontSize: 16 }}>By State</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {byState.map(([st, list]) => (
              <div
                key={st}
                style={{
                  padding: 12,
                  background: theme.bg2,
                  borderBottom: `1px solid ${theme.border2}`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontWeight: 600 }}>{st}</span>
                  <span style={{ color: theme.muted, fontSize: 12 }}>{STATE_NAMES[st]} — {list.length} registration{list.length !== 1 ? "s" : ""}</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {list.map(({ name, type, num }) => (
                    <span key={name + num} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                      <CredBadge type={type} />
                      <span>{name}</span>
                      <span style={{ fontFamily: "'DM Mono', monospace", color: theme.muted }}>{num}</span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
