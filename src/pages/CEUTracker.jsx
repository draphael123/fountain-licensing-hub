import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { PROVIDERS, getCeuStatus } from "../data/providers"
import { Card, PageHeader, CredBadge, ProgressBar } from "../components/ui"
import { useTheme } from "../context/ThemeContext"
import { downloadCsv, toCsv } from "../utils/exportCsv"

const FILTERS = [
  { value: "all", label: "All providers" },
  { value: "with-data", label: "With CEU data" },
  { value: "complete", label: "Complete" },
  { value: "behind", label: "Behind" },
  { value: "no-data", label: "No CEU data" },
]

export default function CEUTracker() {
  const { theme } = useTheme()
  const [filter, setFilter] = useState("with-data")

  const activeProviders = useMemo(() => PROVIDERS.filter((p) => !p.terminated), [])

  const rows = useMemo(() => {
    return activeProviders.map((p) => ({
      provider: p,
      ceu: getCeuStatus(p),
    }))
  }, [activeProviders])

  const filtered = useMemo(() => {
    if (filter === "all") return rows
    if (filter === "with-data") return rows.filter((r) => r.ceu != null)
    if (filter === "complete") return rows.filter((r) => r.ceu?.isComplete)
    if (filter === "behind") return rows.filter((r) => r.ceu != null && !r.ceu.isComplete)
    if (filter === "no-data") return rows.filter((r) => r.ceu == null)
    return rows
  }, [rows, filter])

  const stats = useMemo(() => {
    const withData = rows.filter((r) => r.ceu != null)
    return {
      total: rows.length,
      withData: withData.length,
      complete: withData.filter((r) => r.ceu.isComplete).length,
      behind: withData.filter((r) => !r.ceu.isComplete).length,
      noData: rows.filter((r) => r.ceu == null).length,
    }
  }, [rows])

  const handleExport = () => {
    const header = ["Provider", "Type", "Cycle end", "Required (hrs)", "Completed (hrs)", "Remaining", "Status"]
    const data = rows
      .filter((r) => r.ceu != null)
      .map((r) => [
        r.provider.name,
        r.provider.type,
        r.ceu.cycleEnd ?? "",
        r.ceu.required,
        r.ceu.completed,
        r.ceu.remaining,
        r.ceu.isComplete ? "Complete" : "In progress",
      ])
    downloadCsv(toCsv([header, ...data]), `ceu-tracker-${new Date().toISOString().slice(0, 10)}.csv`)
  }

  return (
    <div className="print-page" style={{ padding: 24, background: theme.bg0, minHeight: "100vh", color: theme.text, fontFamily: "'DM Sans', sans-serif" }}>
      <PageHeader
        title="CEU Tracker"
        subtitle="Continuing education units by provider — track required vs completed hours per cycle"
      />
      <div className="no-print" style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {FILTERS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              style={{
                padding: "8px 14px",
                borderRadius: 8,
                border: `1px solid ${filter === value ? theme.accent : theme.border1}`,
                background: filter === value ? theme.accent : theme.bg1,
                color: filter === value ? theme.accentText : theme.text,
                fontSize: 14,
                cursor: "pointer",
                fontWeight: filter === value ? 600 : 400,
              }}
            >
              {label}
            </button>
          ))}
        </div>
        {filter !== "no-data" && (
          <>
            <button
              type="button"
              onClick={handleExport}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: "none",
                background: theme.accent,
                color: theme.accentText,
                fontSize: 14,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Export CSV
            </button>
            <button
              type="button"
              className="no-print"
              onClick={() => window.print()}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: `1px solid ${theme.border1}`,
                background: theme.bg2,
                color: theme.text,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              Print
            </button>
          </>
        )}
      </div>
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <Card style={{ padding: "12px 16px" }}>
          <span style={{ fontSize: 12, color: theme.muted }}>With CEU data</span>
          <span style={{ fontSize: 20, fontWeight: 700, marginLeft: 8 }}>{stats.withData}</span>
        </Card>
        <Card style={{ padding: "12px 16px" }}>
          <span style={{ fontSize: 12, color: theme.muted }}>Complete</span>
          <span style={{ fontSize: 20, fontWeight: 700, marginLeft: 8, color: theme.success }}>{stats.complete}</span>
        </Card>
        <Card style={{ padding: "12px 16px" }}>
          <span style={{ fontSize: 12, color: theme.muted }}>Behind</span>
          <span style={{ fontSize: 20, fontWeight: 700, marginLeft: 8, color: theme.warning }}>{stats.behind}</span>
        </Card>
        <Card style={{ padding: "12px 16px" }}>
          <span style={{ fontSize: 12, color: theme.muted }}>No data</span>
          <span style={{ fontSize: 20, fontWeight: 700, marginLeft: 8, color: theme.muted }}>{stats.noData}</span>
        </Card>
      </div>
      <Card style={{ overflow: "hidden", padding: 0 }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}>
            <thead>
              <tr style={{ background: theme.bg2, borderBottom: `2px solid ${theme.border1}` }}>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, color: theme.muted, fontWeight: 600 }}>Provider</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, color: theme.muted, fontWeight: 600 }}>Type</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, color: theme.muted, fontWeight: 600 }}>Cycle end</th>
                <th style={{ padding: "12px 16px", textAlign: "right", fontSize: 12, color: theme.muted, fontWeight: 600 }}>Required</th>
                <th style={{ padding: "12px 16px", textAlign: "right", fontSize: 12, color: theme.muted, fontWeight: 600 }}>Completed</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, color: theme.muted, fontWeight: 600 }}>Progress</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, color: theme.muted, fontWeight: 600 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(({ provider, ceu }) => (
                <tr key={provider.id} style={{ borderBottom: `1px solid ${theme.border2}` }}>
                  <td style={{ padding: "12px 16px" }}>
                    <Link to={`/provider/${provider.id}`} style={{ color: theme.accent, textDecoration: "none", fontWeight: 500 }}>
                      {provider.name}
                    </Link>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <CredBadge type={provider.type} />
                  </td>
                  <td style={{ padding: "12px 16px", color: theme.text }}>
                    {ceu?.cycleEnd ?? "—"}
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                    {ceu != null ? `${ceu.required} hrs` : "—"}
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                    {ceu != null ? `${ceu.completed} hrs` : "—"}
                  </td>
                  <td style={{ padding: "12px 16px", minWidth: 140 }}>
                    {ceu != null ? (
                      <ProgressBar value={ceu.completed} max={ceu.required} />
                    ) : (
                      <span style={{ color: theme.muted, fontSize: 13 }}>No CEU data</span>
                    )}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {ceu == null ? (
                      <span style={{ color: theme.muted, fontSize: 12 }}>—</span>
                    ) : ceu.isComplete ? (
                      <span style={{ color: theme.success, fontSize: 12, fontWeight: 600 }}>Complete</span>
                    ) : (
                      <span style={{ color: theme.warning, fontSize: 12 }}>{ceu.remaining} hrs left</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <p style={{ padding: 24, margin: 0, color: theme.muted }}>
            No providers match the current filter. Add <code style={{ background: theme.bg2, padding: "2px 6px", borderRadius: 4 }}>ceu</code> on providers in <code style={{ background: theme.bg2, padding: "2px 6px", borderRadius: 4 }}>src/data/providers.js</code> (e.g. <code style={{ background: theme.bg2, padding: "2px 6px", borderRadius: 4 }}>ceu: &#123; cycleEnd: "YYYY-MM-DD", required: 50, completed: 25 &#125;</code>).
          </p>
        )}
      </Card>
    </div>
  )
}
