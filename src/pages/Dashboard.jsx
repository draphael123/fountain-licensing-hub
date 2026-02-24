import { useMemo, useState } from "react"
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
import { downloadCsv, toCsv, buildFullProviderExportRows } from "../utils/exportCsv"

export default function Dashboard() {
  const { theme } = useTheme()
  const [quickState, setQuickState] = useState("")

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
    { path: "/compare", label: "Provider Comparison", desc: "Compare 2–3 providers", icon: "⚖" },
  ]

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
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12, marginBottom: 32 }}>
        <Card>
          <div style={{ fontSize: 12, color: theme.muted }}>Active providers</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{activeProviders.length}</div>
        </Card>
        <Card>
          <div style={{ fontSize: 12, color: theme.muted }}>States with coverage</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{coveredStates.size}</div>
        </Card>
        <Card>
          <div style={{ fontSize: 12, color: theme.muted }}>Operating states covered</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{operatingCovered} / {OPERATING_STATES.length}</div>
        </Card>
        <Card>
          <div style={{ fontSize: 12, color: theme.muted }}>Coming soon</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{comingSoonCount}</div>
        </Card>
        <Card>
          <div style={{ fontSize: 12, color: theme.muted }}>Total DEA registrations</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{totalDea}</div>
        </Card>
        <Card style={expiring30 > 0 ? { borderLeft: `4px solid ${theme.warning}` } : undefined}>
          <div style={{ fontSize: 12, color: theme.muted }}>Expiring in 90 days</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{expiringSoonLicenses.length}</div>
          {expiring30 > 0 && <div style={{ fontSize: 12, color: theme.warning, marginTop: 4 }}>{expiring30} in next 30 days</div>}
        </Card>
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
