import { useState, useMemo } from "react"
import { PROVIDERS, DEFAULT_PATIENT_STATES, getActiveStates } from "../data/providers"
import { STATE_NAMES, STATE_POP, getTier, getTierColor, getTierIcon, ALL_STATES, OPERATING_STATES_SET, isOperatingState } from "../data/reference"
import { Card, PageHeader, StateSelect, StatePill, ProgressBar, CredBadge } from "../components/ui"
import { useTheme } from "../context/ThemeContext"

export default function GapAnalyzer() {
  const { theme } = useTheme()
  const [patientStates, setPatientStates] = useState(DEFAULT_PATIENT_STATES)
  const [selectedProviderIds, setSelectedProviderIds] = useState(() => PROVIDERS.filter((p) => !p.terminated).map((p) => p.id))
  const [subView, setSubView] = useState("grid") // grid | state | provider

  const providers = useMemo(() => PROVIDERS.filter((p) => !p.terminated), [])
  const activeProviders = useMemo(() => providers.filter((p) => selectedProviderIds.includes(p.id)), [providers, selectedProviderIds])

  const coveredStates = useMemo(() => {
    const set = new Set()
    activeProviders.forEach((p) => getActiveStates(p).forEach((s) => set.add(s)))
    return set
  }, [activeProviders])

  const gapStates = useMemo(() => patientStates.filter((s) => !coveredStates.has(s)), [patientStates, coveredStates])
  const highVolGaps = useMemo(() => gapStates.filter((s) => (STATE_POP[s] ?? 0) >= 10), [gapStates])
  const critical = highVolGaps.length

  const toggleProvider = (id) => {
    if (selectedProviderIds.includes(id)) setSelectedProviderIds(selectedProviderIds.filter((x) => x !== id))
    else setSelectedProviderIds([...selectedProviderIds, id].sort((a, b) => a - b))
  }

  const statCards = [
    { label: "Providers", value: activeProviders.length },
    { label: "States", value: patientStates.length },
    { label: "Gap States", value: gapStates.length },
    { label: "HV Gaps", value: highVolGaps.length },
    { label: "Critical", value: critical },
  ]

  return (
    <div style={{ padding: 24, background: theme.bg0, minHeight: "100vh", color: theme.text, fontFamily: "'DM Sans', sans-serif" }}>
      <PageHeader title="Gap Analyzer" subtitle="Coverage gaps for selected patient states and providers" />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-start", marginBottom: 24 }}>
        <div style={{ minWidth: 280 }}>
          <label style={{ display: "block", fontSize: 12, color: theme.muted, marginBottom: 6 }}>Patient states</label>
          <StateSelect selected={patientStates} onChange={setPatientStates} operatingStates={OPERATING_STATES_SET} />
        </div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontSize: 12, color: theme.muted, marginBottom: 8 }}>Providers</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {providers.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => toggleProvider(p.id)}
              style={{
                padding: "6px 12px",
                borderRadius: 20,
                border: `2px solid ${selectedProviderIds.includes(p.id) ? theme.accent : theme.border1}`,
                background: selectedProviderIds.includes(p.id) ? `${theme.accent}20` : theme.bg2,
                color: theme.text,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <CredBadge type={p.type} />
              <span>{p.name.split(" ")[0]}</span>
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        {statCards.map(({ label, value }) => (
          <Card key={label} style={{ minWidth: 100 }}>
            <div style={{ fontSize: 12, color: theme.muted }}>{label}</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{value}</div>
          </Card>
        ))}
      </div>
      {gapStates.length === patientStates.length && patientStates.length > 0 && (
        <div style={{ padding: 16, background: theme.danger + "20", border: `1px solid ${theme.danger}`, borderRadius: 8, marginBottom: 24 }}>
          <strong>Zero coverage</strong> — No selected providers cover any of the selected patient states.
        </div>
      )}
      {highVolGaps.length > 0 && (
        <div style={{ padding: 16, background: theme.warning + "20", border: `1px solid ${theme.warning}`, borderRadius: 8, marginBottom: 24 }}>
          <strong>High-volume gaps</strong> — States with ≥10M population and no coverage: {highVolGaps.map((s) => STATE_NAMES[s]).join(", ")}
        </div>
      )}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["grid", "By State", "By Provider"].map((v, i) => {
          const key = i === 0 ? "grid" : i === 1 ? "state" : "provider"
          return (
            <button
              key={key}
              type="button"
              onClick={() => setSubView(key)}
              style={{
                padding: "8px 16px",
                borderRadius: 6,
                border: "none",
                background: subView === key ? theme.accent : theme.bg2,
                color: subView === key ? theme.accentText : theme.text,
                cursor: "pointer",
              }}
            >
              {v}
            </button>
          )
        })}
      </div>
      {subView === "grid" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 8 }}>
          {ALL_STATES.map((st) => {
            const count = activeProviders.filter((p) => getActiveStates(p).includes(st)).length
            const inPatient = patientStates.includes(st)
            const operating = isOperatingState(st)
            const pop = STATE_POP[st] ?? 0
            const tier = getTier(pop)
            const color = getTierColor(tier)
            const icon = getTierIcon(tier)
            return (
              <Card
                key={st}
                style={{
                  padding: 8,
                  opacity: inPatient ? 1 : 0.6,
                  ...(operating ? {} : { background: theme.comingSoonBg, borderColor: theme.comingSoon }),
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
                  <span style={{ color: operating ? color : theme.comingSoon, fontSize: 10 }}>{icon}</span>
                  <span style={{ fontWeight: 600 }}>{st}</span>
                </div>
                <ProgressBar value={count} max={Math.max(1, activeProviders.length)} label="" />
                <div style={{ fontSize: 11, color: operating ? theme.muted : theme.comingSoon }}>
                  {operating ? `${count} coverage` : "Coming soon"}
                </div>
              </Card>
            )
          })}
        </div>
      )}
      {subView === "state" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {[...patientStates].sort().map((st) => {
            const covering = activeProviders.filter((p) => getActiveStates(p).includes(st))
            const isGap = covering.length === 0
            return (
              <div
                key={st}
                style={{
                  padding: 12,
                  background: isGap ? theme.comingSoonBg : theme.bg2,
                  borderBottom: `1px solid ${theme.border2}`,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <StatePill state={st} />
                <span style={{ flex: 1 }}>{STATE_NAMES[st]}</span>
                {isGap ? (
                  <span style={{ color: theme.danger }}>No coverage</span>
                ) : (
                  <span style={{ color: theme.muted }}>{covering.map((p) => p.name).join(", ")}</span>
                )}
              </div>
            )
          })}
        </div>
      )}
      {subView === "provider" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[...activeProviders]
            .sort((a, b) => {
              const pctA = patientStates.length ? (getActiveStates(a).filter((s) => patientStates.includes(s)).length / patientStates.length) * 100 : 0
              const pctB = patientStates.length ? (getActiveStates(b).filter((s) => patientStates.includes(s)).length / patientStates.length) * 100 : 0
              return pctB - pctA
            })
            .map((p) => {
              const covered = getActiveStates(p).filter((s) => patientStates.includes(s)).length
              const gaps = patientStates.filter((s) => !getActiveStates(p).includes(s))
              return (
                <Card key={p.id} style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <CredBadge type={p.type} />
                    <span style={{ fontWeight: 600 }}>{p.name}</span>
                  </div>
                  <ProgressBar value={covered} max={patientStates.length} />
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {gaps.map((s) => (
                      <StatePill key={s} state={s} />
                    ))}
                  </div>
                </Card>
              )
            })}
        </div>
      )}
    </div>
  )
}
