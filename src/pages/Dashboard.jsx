import { useMemo, useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { PROVIDERS } from "../data/providers"
import {
  STATE_NAMES,
  ALL_STATES,
  OPERATING_STATES,
  COMING_SOON_STATES,
  RENEWAL_CYCLE,
} from "../data/reference"
import { getActiveStates, getActiveDea, getLicensesExpiringIn, getDeaExpiringIn, getCeuStatus } from "../data/providers"
import { Card, PageHeader, CredBadge } from "../components/ui"
import { useTheme } from "../context/ThemeContext"
import { downloadCsv, toCsv, buildFullProviderExportRows, buildDueSoonExportRows } from "../utils/exportCsv"

const DASHBOARD_STORAGE_KEY = "licensing-hub-dashboard"
const DEFAULT_STAT_ORDER = ["active", "covered", "operating", "coming", "dea", "expiring"]

function loadDashboardConfig() {
  try {
    const raw = localStorage.getItem(DASHBOARD_STORAGE_KEY)
    if (raw) {
      const p = JSON.parse(raw)
      if (Array.isArray(p.statOrder)) return { statOrder: p.statOrder, visibleStats: p.visibleStats || p.statOrder }
    }
  } catch (_) {}
  return { statOrder: DEFAULT_STAT_ORDER, visibleStats: DEFAULT_STAT_ORDER }
}

export default function Dashboard() {
  const { theme } = useTheme()
  const [quickState, setQuickState] = useState("")
  const [dashboardConfig, setDashboardConfig] = useState(() => loadDashboardConfig())
  const [customizeOpen, setCustomizeOpen] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(DASHBOARD_STORAGE_KEY, JSON.stringify({
        statOrder: dashboardConfig.statOrder,
        visibleStats: dashboardConfig.visibleStats,
      }))
    } catch (_) {}
  }, [dashboardConfig])

  const activeProviders = useMemo(() => PROVIDERS.filter((p) => !p.terminated), [])
  const coveredStates = useMemo(() => {
    const set = new Set()
    activeProviders.forEach((p) => getActiveStates(p).forEach((s) => set.add(s)))
    return set
  }, [activeProviders])
  const totalDea = useMemo(() => activeProviders.reduce((n, p) => n + getActiveDea(p).length, 0), [activeProviders])

  const expiringSoonLicenses = useMemo(() => {
    const list = []
    activeProviders.forEach((p) => {
      getLicensesExpiringIn(p, 90).forEach(({ state, expires }) => list.push({ provider: p, state, expires, type: "license" }))
      getDeaExpiringIn(p, 90).forEach(({ state, num, expires }) => list.push({ provider: p, state, num, expires, type: "dea" }))
    })
    return list.sort((a, b) => a.expires.localeCompare(b.expires))
  }, [activeProviders])
  const expiring30 = useMemo(() => {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() + 30)
    cutoff.setHours(23, 59, 59, 999)
    return expiringSoonLicenses.filter((x) => new Date(x.expires) <= cutoff).length
  }, [expiringSoonLicenses])

  const dueSoon30 = useMemo(() => {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() + 30)
    cutoff.setHours(23, 59, 59, 999)
    const items = []
    activeProviders.forEach((p) => {
      getLicensesExpiringIn(p, 30).forEach(({ state, expires }) => items.push({ provider: p, type: "license", state, expires }))
      getDeaExpiringIn(p, 30).forEach(({ state, num, expires }) => items.push({ provider: p, type: "dea", state, num, expires }))
      const ceu = getCeuStatus(p)
      if (ceu?.cycleEnd) {
        const end = new Date(ceu.cycleEnd)
        if (end <= cutoff && !ceu.isComplete) items.push({ provider: p, type: "ceu", expires: ceu.cycleEnd })
      }
    })
    return items.sort((a, b) => (a.expires || "").localeCompare(b.expires || ""))
  }, [activeProviders])

  const operatingCovered = useMemo(() => OPERATING_STATES.filter((s) => coveredStates.has(s)).length, [coveredStates])
  const comingSoonCount = COMING_SOON_STATES.length

  const renewalByCycle = useMemo(() => {
    const map = {}
    ALL_STATES.forEach((st) => {
      const cycle = RENEWAL_CYCLE[st] || "Biennial"
      map[cycle] = (map[cycle] || 0) + 1
    })
    return map
  }, [])

  const quickStateUpper = quickState.trim().toUpperCase().slice(0, 2)
  const quickStateMatch = quickStateUpper.length === 2 && ALL_STATES.includes(quickStateUpper) ? quickStateUpper : null
  const canSeePatientsIn = quickStateMatch ? coveredStates.has(quickStateMatch) : null
  const providersInQuickState = useMemo(
    () => (quickStateMatch ? activeProviders.filter((p) => getActiveStates(p).includes(quickStateMatch)) : []),
    [quickStateMatch, activeProviders]
  )

  const handleExportAll = () => {
    const rows = buildFullProviderExportRows(activeProviders, getActiveStates, getActiveDea, getCeuStatus)
    downloadCsv(toCsv(rows), `providers-full-export-${new Date().toISOString().slice(0, 10)}.csv`)
  }
  const handleExportDueSoon30 = () => {
    const rows = buildDueSoonExportRows(dueSoon30, [])
    downloadCsv(toCsv(rows), `due-soon-30d-${new Date().toISOString().slice(0, 10)}.csv`)
  }
  const handleExportExpiring90 = () => {
    const rows = buildDueSoonExportRows([], expiringSoonLicenses)
    downloadCsv(toCsv(rows), `expiring-90d-${new Date().toISOString().slice(0, 10)}.csv`)
  }

  const linkCards = [
    { path: "/gap", label: "Gap Analyzer", desc: "Coverage gaps by state & provider", icon: "⚖" },
    { path: "/lookup", label: "Patient Lookup", desc: "Who can see patients where", icon: "🔍" },
    { path: "/map", label: "Redundancy Map", desc: "Provider count by state", icon: "🗺" },
    { path: "/sim", label: "Exit Simulator", desc: "Impact of provider exit", icon: "🔮" },
    { path: "/matrix", label: "Coverage Matrix", desc: "Providers × states grid", icon: "📊" },
    { path: "/dir", label: "Provider Directory", desc: "DEA, compacts, licenses", icon: "👤" },
    { path: "/dea", label: "DEA Tracker", desc: "Registrations by provider/state", icon: "💊" },
    { path: "/npi", label: "NPI Directory", desc: "NPI & contract start", icon: "🪪" },
    { path: "/calendar", label: "Renewal Calendar", desc: "Licenses & DEA by month", icon: "📅" },
    { path: "/ceu", label: "CEU Tracker", desc: "Continuing education hours by provider", icon: "📚" },
    { path: "/nlc", label: "Compacts", desc: "NLC/IMLC eligibility", icon: "🤝" },
    { path: "/ref", label: "State Boards", desc: "Board info & renewal", icon: "🏛" },
    { path: "/states", label: "By State", desc: "Providers by state", icon: "🗺" },
    { path: "/compare", label: "Provider Comparison", desc: "Compare 2–3 providers", icon: "⚖" },
  ]

  const statCardDefs = {
    active: { label: "Active providers", value: activeProviders.length },
    covered: { label: "States with coverage", value: coveredStates.size },
    operating: { label: "Operating states covered", value: `${operatingCovered} / ${OPERATING_STATES.length}` },
    coming: { label: "Coming soon", value: comingSoonCount },
    dea: { label: "Total DEA registrations", value: totalDea },
    expiring: {
      label: "Expiring in 90 days",
      value: expiringSoonLicenses.length,
      extra: expiring30 > 0 ? `${expiring30} in next 30 days` : null,
      warn: expiring30 > 0,
    },
  }
  const visibleOrder = dashboardConfig.statOrder.filter((id) => dashboardConfig.visibleStats.includes(id))

  return (
    <div style={{ padding: 24, background: theme.bg0, minHeight: "100vh", color: theme.text, fontFamily: "'DM Sans', sans-serif" }}>
      <PageHeader title="Dashboard" subtitle="Fountain Licensing Hub — overview and quick links" />
      <div className="no-print" style={{ marginBottom: 24 }}>
        <button
          type="button"
          onClick={handleExportAll}
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
          Export full provider list (CSV)
        </button>
        <button
          type="button"
          onClick={handleExportDueSoon30}
          style={{
            marginLeft: 8,
            padding: "8px 16px",
            borderRadius: 8,
            border: `1px solid ${theme.border1}`,
            background: theme.bg2,
            color: theme.text,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Export due soon (30d CSV)
        </button>
        <button
          type="button"
          onClick={handleExportExpiring90}
          style={{
            marginLeft: 8,
            padding: "8px 16px",
            borderRadius: 8,
            border: `1px solid ${theme.border1}`,
            background: theme.bg2,
            color: theme.text,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Export expiring (90d CSV)
        </button>
      </div>

      <div className="no-print" style={{ marginBottom: 16 }}>
        <button
          type="button"
          onClick={() => setCustomizeOpen((o) => !o)}
          style={{
            padding: "6px 12px",
            borderRadius: 6,
            border: `1px solid ${theme.border1}`,
            background: theme.bg2,
            color: theme.text,
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          {customizeOpen ? "Done customizing" : "Customize dashboard"}
        </button>
      </div>

      {customizeOpen && (
        <Card className="no-print" style={{ marginBottom: 24, padding: 16 }}>
          <h4 style={{ margin: "0 0 12px", fontSize: 14 }}>Stat cards: show and reorder</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {dashboardConfig.statOrder.map((id, i) => {
              const def = statCardDefs[id]
              if (!def) return null
              const visible = dashboardConfig.visibleStats.includes(id)
              return (
                <div key={id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", minWidth: 200 }}>
                    <input type="checkbox" checked={visible} onChange={() => {
                      setDashboardConfig((c) => ({
                        ...c,
                        visibleStats: visible ? c.visibleStats.filter((x) => x !== id) : [...c.visibleStats, id],
                      }))
                    }} style={{ accentColor: theme.accent }} />
                    <span>{def.label}</span>
                  </label>
                  <button type="button" aria-label="Move up" disabled={i === 0} onClick={() => {
                    if (i === 0) return
                    const next = [...dashboardConfig.statOrder]
                    ;[next[i - 1], next[i]] = [next[i], next[i - 1]]
                    setDashboardConfig((c) => ({ ...c, statOrder: next }))
                  }} style={{ padding: "4px 8px", fontSize: 12 }}>↑</button>
                  <button type="button" aria-label="Move down" disabled={i === dashboardConfig.statOrder.length - 1} onClick={() => {
                    if (i >= dashboardConfig.statOrder.length - 1) return
                    const next = [...dashboardConfig.statOrder]
                    ;[next[i], next[i + 1]] = [next[i + 1], next[i]]
                    setDashboardConfig((c) => ({ ...c, statOrder: next }))
                  }} style={{ padding: "4px 8px", fontSize: 12 }}>↓</button>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12, marginBottom: 32 }}>
        {visibleOrder.map((id) => {
          const def = statCardDefs[id]
          if (!def) return null
          return (
            <Card key={id} style={def.warn ? { borderLeft: `4px solid ${theme.warning}` } : undefined}>
              <div style={{ fontSize: 12, color: theme.muted }}>{def.label}</div>
              <div style={{ fontSize: 28, fontWeight: 700 }}>{def.value}</div>
              {def.extra && <div style={{ fontSize: 12, color: theme.warning, marginTop: 4 }}>{def.extra}</div>}
            </Card>
          )
        })}
      </div>

      {dueSoon30.length > 0 && (
        <Card style={{ marginBottom: 24, padding: 20, borderLeft: `4px solid ${theme.warning}` }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 16 }}>Due in 30 days</h3>
          <p style={{ margin: "0 0 12px", fontSize: 14, color: theme.muted }}>
            Licenses, DEA registrations, or CEU cycles due in the next 30 days.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
            <Link to="/calendar" style={{ color: theme.accent, fontWeight: 600 }}>Renewal calendar →</Link>
            <Link to="/ceu" style={{ color: theme.accent, fontWeight: 600 }}>CEU tracker →</Link>
          </div>
          <ul style={{ margin: "12px 0 0", paddingLeft: 20, fontSize: 14 }}>
            {dueSoon30.map((x, i) => (
              <li key={i}>
                <Link to={`/provider/${x.provider.id}`} style={{ color: theme.accent, textDecoration: "none" }}>{x.provider.name}</Link>
                {" — "}
                {x.type === "license" && `License ${x.state} expires ${x.expires}`}
                {x.type === "dea" && `DEA ${x.state} ${x.num} expires ${x.expires}`}
                {x.type === "ceu" && `CEU cycle ends ${x.expires}`}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {expiringSoonLicenses.length > 0 && (
        <Card style={{ marginBottom: 24, padding: 20, borderLeft: `4px solid ${theme.warning}` }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 16 }}>Expiring soon (next 90 days)</h3>
          <p style={{ margin: "0 0 12px", fontSize: 14, color: theme.muted }}>{expiringSoonLicenses.length} license(s) or DEA registration(s) expire in the next 90 days.</p>
          <Link to="/calendar" style={{ color: theme.accent, fontWeight: 600 }}>View renewal calendar →</Link>
          <ul style={{ margin: "12px 0 0", paddingLeft: 20, fontSize: 14 }}>
            {expiringSoonLicenses.slice(0, 10).map((x, i) => (
              <li key={i}>
                <Link to={`/provider/${x.provider.id}`} style={{ color: theme.accent, textDecoration: "none" }}>{x.provider.name}</Link>
                {" — "}{x.type === "license" ? `License ${x.state}` : `DEA ${x.state} ${x.num}`} expires {x.expires}
              </li>
            ))}
            {expiringSoonLicenses.length > 10 && <li style={{ color: theme.muted }}>+{expiringSoonLicenses.length - 10} more</li>}
          </ul>
        </Card>
      )}

      <Card style={{ marginBottom: 32, padding: 20 }}>
        <h3 style={{ margin: "0 0 12px", fontSize: 16 }}>Can we see patients in this state?</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <input
            type="text"
            value={quickState}
            onChange={(e) => setQuickState(e.target.value)}
            placeholder="Type state (e.g. CA)"
            maxLength={2}
            style={{
              width: 80,
              padding: "10px 12px",
              background: theme.bg2,
              border: `1px solid ${theme.border1}`,
              borderRadius: 8,
              color: theme.text,
              fontSize: 14,
              textTransform: "uppercase",
            }}
          />
          {quickStateMatch && (
            <>
              <span style={{ fontWeight: 600 }}>{STATE_NAMES[quickStateMatch]}</span>
              {canSeePatientsIn ? (
                <span style={{ color: theme.success }}>Yes — {providersInQuickState.length} provider(s)</span>
              ) : (
                <span style={{ color: theme.danger }}>No coverage</span>
              )}
              {canSeePatientsIn && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, width: "100%" }}>
                  {providersInQuickState.map((p) => (
                    <span key={p.id} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <CredBadge type={p.type} />
                      {p.name}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </Card>

      <div style={{ marginBottom: 24 }}>
        <h3 style={{ margin: "0 0 12px", fontSize: 16 }}>Renewal snapshot</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {Object.entries(renewalByCycle).map(([cycle, count]) => (
            <Card key={cycle} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: theme.muted }}>{cycle}</span>
              <span style={{ fontWeight: 700 }}>{count}</span>
              <span style={{ fontSize: 12, color: theme.muted }}>states</span>
            </Card>
          ))}
        </div>
        <p style={{ fontSize: 12, color: theme.muted, marginTop: 8 }}>Use State Boards for board details and renewal cycles.</p>
      </div>

      <h3 style={{ margin: "0 0 12px", fontSize: 16 }}>Tools</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
        {linkCards.map(({ path, label, desc, icon }) => (
          <Link
            key={path}
            to={path}
            style={{
              display: "block",
              padding: 16,
              background: theme.bg1,
              border: `1px solid ${theme.border1}`,
              borderRadius: 8,
              color: theme.text,
              textDecoration: "none",
              boxShadow: theme.shadow,
            }}
          >
            <span style={{ fontSize: 20, marginRight: 8 }}>{icon}</span>
            <div style={{ fontWeight: 600 }}>{label}</div>
            <div style={{ fontSize: 12, color: theme.muted, marginTop: 4 }}>{desc}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
