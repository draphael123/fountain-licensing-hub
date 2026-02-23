import { useState, useMemo } from "react"
import { PROVIDERS } from "../data/providers"
import { STATE_NAMES, STATE_POP, OPERATING_STATES_SET } from "../data/reference"
import { Card, PageHeader, StateSelect, StatePill, CredBadge, styles } from "../components/ui"

function impactForLicenses(n) {
  if (n >= 20) return { level: "Critical", color: "#dc2626" }
  if (n >= 10) return { level: "High", color: "#ea580c" }
  if (n >= 5) return { level: "Medium", color: "#ca8a04" }
  if (n >= 1) return { level: "Low", color: "#22c55e" }
  return { level: null, color: styles.muted }
}

export default function ExitSimulator() {
  const [providerIds, setProviderIds] = useState([])
  const [patientStates, setPatientStates] = useState(["CA", "TX", "FL", "NY"])

  const activeProviders = useMemo(() => PROVIDERS.filter((p) => !p.terminated), [])
  const exitingList = useMemo(() => providerIds.map((id) => activeProviders.find((p) => p.id === id)).filter(Boolean), [providerIds, activeProviders])
  const remaining = useMemo(
    () => activeProviders.filter((p) => !providerIds.includes(p.id)),
    [activeProviders, providerIds]
  )

  const coveredBefore = useMemo(() => {
    const set = new Set()
    activeProviders.forEach((p) => p.states.forEach((s) => set.add(s)))
    return set
  }, [activeProviders])

  const coveredAfter = useMemo(() => {
    const set = new Set()
    remaining.forEach((p) => p.states.forEach((s) => set.add(s)))
    return set
  }, [remaining])

  const newCritical = useMemo(() => patientStates.filter((s) => coveredBefore.has(s) && !coveredAfter.has(s)), [patientStates, coveredBefore, coveredAfter])
  const thinned = useMemo(
    () =>
      patientStates.filter((s) => {
        const before = activeProviders.filter((p) => p.states.includes(s)).length
        const after = remaining.filter((p) => p.states.includes(s)).length
        return after > 0 && after < before
      }),
    [patientStates, activeProviders, remaining]
  )
  const hvNewZero = useMemo(() => newCritical.filter((s) => (STATE_POP[s] ?? 0) >= 10), [newCritical])

  const licensesLost = useMemo(() => exitingList.reduce((n, p) => n + p.states.length, 0), [exitingList])
  const { level: impactLevel, color: impactColor } = impactForLicenses(licensesLost)

  const riskRanking = useMemo(
    () => [...activeProviders].sort((a, b) => b.states.length - a.states.length),
    [activeProviders]
  )

  const toggleProvider = (id) => {
    if (providerIds.includes(id)) setProviderIds(providerIds.filter((x) => x !== id))
    else setProviderIds([...providerIds, id].sort((a, b) => a - b))
  }
  const selectForSimulation = (id) => setProviderIds((prev) => (prev.includes(id) ? prev : [...prev, id].sort((a, b) => a - b)))

  return (
    <div style={{ padding: 24, background: styles.bg0, minHeight: "100vh", color: styles.text, fontFamily: "'DM Sans', sans-serif" }}>
      <PageHeader title="Exit Simulator" subtitle="Impact of one or more providers exiting" />

      <section style={{ marginBottom: 32 }}>
        <h3 style={{ margin: "0 0 12px", fontSize: 16 }}>Provider risk ranking (by licenses held)</h3>
        <p style={{ margin: "0 0 12px", fontSize: 14, color: styles.muted }}>Click &quot;Simulate&quot; to add a provider to the exit scenario.</p>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${styles.border1}` }}>
                <th style={{ textAlign: "left", padding: 10, color: styles.muted }}>Provider</th>
                <th style={{ textAlign: "right", padding: 10, color: styles.muted }}>Licenses</th>
                <th style={{ textAlign: "left", padding: 10, color: styles.muted }}>Impact</th>
                <th style={{ textAlign: "left", padding: 10 }} />
              </tr>
            </thead>
            <tbody>
              {riskRanking.map((p) => {
                const { level, color } = impactForLicenses(p.states.length)
                return (
                  <tr key={p.id} style={{ borderBottom: `1px solid ${styles.border2}` }}>
                    <td style={{ padding: 10 }}>
                      <CredBadge type={p.type} /> {p.name}
                    </td>
                    <td style={{ padding: 10, textAlign: "right" }}>{p.states.length}</td>
                    <td style={{ padding: 10, color }}>{level ?? "—"}</td>
                    <td style={{ padding: 10 }}>
                      <button
                        type="button"
                        onClick={() => selectForSimulation(p.id)}
                        style={{
                          padding: "4px 10px",
                          fontSize: 12,
                          borderRadius: 6,
                          border: "none",
                          background: styles.accent,
                          color: styles.bg0,
                          cursor: "pointer",
                        }}
                      >
                        Simulate
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 24, marginBottom: 24 }}>
        <div>
          <label style={{ display: "block", fontSize: 12, color: styles.muted, marginBottom: 6 }}>Exiting providers (multi-select)</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {activeProviders.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => toggleProvider(p.id)}
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: `2px solid ${providerIds.includes(p.id) ? "#dc2626" : styles.border1}`,
                  background: providerIds.includes(p.id) ? "#451a1a" : styles.bg2,
                  color: styles.text,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <CredBadge type={p.type} />
                {p.name}
                {providerIds.includes(p.id) && " ✓"}
              </button>
            ))}
          </div>
        </div>
        <div style={{ minWidth: 280 }}>
          <label style={{ display: "block", fontSize: 12, color: styles.muted, marginBottom: 6 }}>Patient states</label>
          <StateSelect selected={patientStates} onChange={setPatientStates} operatingStates={OPERATING_STATES_SET} />
        </div>
      </div>

      {exitingList.length === 0 && (
        <p style={{ color: styles.muted, fontSize: 14 }}>Select one or more providers above (or use Simulate in the risk table) to see exit impact.</p>
      )}

      {exitingList.length > 0 && (
        <>
          <div style={{ marginBottom: 16, padding: 12, background: styles.bg2, borderRadius: 8, borderLeft: `4px solid ${styles.accent}` }}>
            <strong>Simulating exit:</strong> {exitingList.map((p) => `${p.name} (${p.type})`).join(", ")}
          </div>
          <div style={{ marginBottom: 24, padding: 16, background: styles.bg2, borderRadius: 8, border: `2px solid ${impactColor}` }}>
            <div style={{ fontSize: 12, color: styles.muted, marginBottom: 4 }}>Total licenses lost (gap impact)</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: 28, fontWeight: 700 }}>{licensesLost}</span>
              {impactLevel && (
                <span style={{ fontSize: 16, fontWeight: 600, color: impactColor }}>{impactLevel} impact</span>
              )}
            </div>
            <div style={{ fontSize: 12, color: styles.muted, marginTop: 6 }}>
              {impactLevel === "Critical" && "20+ licenses — critical gap."}
              {impactLevel === "High" && "10–19 licenses — high impact."}
              {impactLevel === "Medium" && "5–9 licenses — medium impact."}
              {impactLevel === "Low" && "1–4 licenses — low impact."}
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
            <Card>
              <div style={{ fontSize: 12, color: styles.muted }}>New critical gaps</div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{newCritical.length}</div>
            </Card>
            <Card>
              <div style={{ fontSize: 12, color: styles.muted }}>States thinned</div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{thinned.length}</div>
            </Card>
            <Card>
              <div style={{ fontSize: 12, color: styles.muted }}>HV states newly at zero</div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{hvNewZero.length}</div>
            </Card>
          </div>
          {newCritical.length > 0 && (
            <div style={{ padding: 16, background: "#7f1d1d", border: "1px solid #991b1b", borderRadius: 8, marginBottom: 16 }}>
              <strong>New critical gaps (drop to zero)</strong>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                {newCritical.map((s) => (
                  <StatePill key={s} state={s} />
                ))}
              </div>
            </div>
          )}
          {thinned.length > 0 && (
            <div style={{ padding: 16, background: "#78350f", border: "1px solid #92400e", borderRadius: 8, marginBottom: 16 }}>
              <strong>States thinned (reduced but not zero)</strong>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                {thinned.map((s) => (
                  <StatePill key={s} state={s} />
                ))}
              </div>
            </div>
          )}
          {hvNewZero.length > 0 && (
            <div style={{ padding: 16, background: "#78350f", border: "1px solid #92400e", borderRadius: 8 }}>
              <strong>High-volume states newly at zero</strong>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                {hvNewZero.map((s) => (
                  <StatePill key={s} state={s} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
