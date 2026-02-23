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
import { Card, PageHeader, CredBadge, styles } from "../components/ui"

export default function Dashboard() {
  const [quickState, setQuickState] = useState("")

  const activeProviders = useMemo(() => PROVIDERS.filter((p) => !p.terminated), [])
  const coveredStates = useMemo(() => {
    const set = new Set()
    activeProviders.forEach((p) => p.states.forEach((s) => set.add(s)))
    return set
  }, [activeProviders])
  const totalDea = useMemo(() => activeProviders.reduce((n, p) => n + p.dea.length, 0), [activeProviders])

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
    () => (quickStateMatch ? activeProviders.filter((p) => p.states.includes(quickStateMatch)) : []),
    [quickStateMatch, activeProviders]
  )

  const linkCards = [
    { path: "/gap", label: "Gap Analyzer", desc: "Coverage gaps by state & provider", icon: "⚖" },
    { path: "/lookup", label: "Patient Lookup", desc: "Who can see patients where", icon: "🔍" },
    { path: "/map", label: "Redundancy Map", desc: "Provider count by state", icon: "🗺" },
    { path: "/sim", label: "Exit Simulator", desc: "Impact of provider exit", icon: "🔮" },
    { path: "/matrix", label: "Coverage Matrix", desc: "Providers × states grid", icon: "📊" },
    { path: "/dir", label: "Provider Directory", desc: "DEA, compacts, licenses", icon: "👤" },
    { path: "/dea", label: "DEA Tracker", desc: "Registrations by provider/state", icon: "💊" },
    { path: "/npi", label: "NPI Directory", desc: "NPI & contract start", icon: "🪪" },
    { path: "/nlc", label: "Compacts", desc: "NLC/IMLC eligibility", icon: "🤝" },
    { path: "/ref", label: "State Boards", desc: "Board info & renewal", icon: "🏛" },
    { path: "/expand", label: "Expansion Priorities", desc: "Coming-soon states to pursue", icon: "📈" },
    { path: "/onboard", label: "Onboarding Checklist", desc: "Licenses to close gaps", icon: "✅" },
    { path: "/compare", label: "Provider Comparison", desc: "Compare 2–3 providers", icon: "⚖" },
  ]

  return (
    <div style={{ padding: 24, background: styles.bg0, minHeight: "100vh", color: styles.text, fontFamily: "'DM Sans', sans-serif" }}>
      <PageHeader title="Dashboard" subtitle="Fountain Licensing Hub — overview and quick links" />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12, marginBottom: 32 }}>
        <Card>
          <div style={{ fontSize: 12, color: styles.muted }}>Active providers</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{activeProviders.length}</div>
        </Card>
        <Card>
          <div style={{ fontSize: 12, color: styles.muted }}>States with coverage</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{coveredStates.size}</div>
        </Card>
        <Card>
          <div style={{ fontSize: 12, color: styles.muted }}>Operating states covered</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{operatingCovered} / {OPERATING_STATES.length}</div>
        </Card>
        <Card>
          <div style={{ fontSize: 12, color: styles.muted }}>Coming soon</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{comingSoonCount}</div>
        </Card>
        <Card>
          <div style={{ fontSize: 12, color: styles.muted }}>Total DEA registrations</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{totalDea}</div>
        </Card>
      </div>

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
              background: styles.bg2,
              border: `1px solid ${styles.border1}`,
              borderRadius: 8,
              color: styles.text,
              fontSize: 14,
              textTransform: "uppercase",
            }}
          />
          {quickStateMatch && (
            <>
              <span style={{ fontWeight: 600 }}>{STATE_NAMES[quickStateMatch]}</span>
              {canSeePatientsIn ? (
                <span style={{ color: "#22c55e" }}>Yes — {providersInQuickState.length} provider(s)</span>
              ) : (
                <span style={{ color: "#f87171" }}>No coverage</span>
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
              <span style={{ color: styles.muted }}>{cycle}</span>
              <span style={{ fontWeight: 700 }}>{count}</span>
              <span style={{ fontSize: 12, color: styles.muted }}>states</span>
            </Card>
          ))}
        </div>
        <p style={{ fontSize: 12, color: styles.muted, marginTop: 8 }}>Use State Boards for board details and renewal cycles.</p>
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
              background: styles.bg1,
              border: `1px solid ${styles.border1}`,
              borderRadius: 8,
              color: styles.text,
              textDecoration: "none",
            }}
          >
            <span style={{ fontSize: 20, marginRight: 8 }}>{icon}</span>
            <div style={{ fontWeight: 600 }}>{label}</div>
            <div style={{ fontSize: 12, color: styles.muted, marginTop: 4 }}>{desc}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
