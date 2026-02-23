import { useState, useMemo } from "react"
import { PROVIDERS } from "../data/providers"
import { STATE_NAMES, OPERATING_STATES_SET } from "../data/reference"
import { Card, PageHeader, StateSelect, StatePill, CredBadge, styles } from "../components/ui"

export default function PatientLookup() {
  const [selectedStates, setSelectedStates] = useState([])

  const providers = useMemo(() => PROVIDERS.filter((p) => !p.terminated), [])

  const available = useMemo(() => {
    if (selectedStates.length === 0) return []
    return providers.filter((p) => selectedStates.some((st) => p.states.includes(st)))
  }, [selectedStates, providers])

  const unlicensed = useMemo(() => {
    if (selectedStates.length === 0) return []
    return providers.filter((p) => !selectedStates.some((st) => p.states.includes(st)))
  }, [selectedStates, providers])

  const zeroCoverageStates = useMemo(
    () => selectedStates.filter((st) => !providers.some((p) => p.states.includes(st))),
    [selectedStates, providers]
  )
  const hasCriticalGap = zeroCoverageStates.length > 0

  return (
    <div style={{ padding: 24, background: styles.bg0, minHeight: "100vh", color: styles.text, fontFamily: "'DM Sans', sans-serif" }}>
      <PageHeader title="Patient Lookup" subtitle="Check provider availability by state(s)" />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-start", marginBottom: 24 }}>
        <div style={{ minWidth: 280 }}>
          <label style={{ display: "block", fontSize: 12, color: styles.muted, marginBottom: 6 }}>States</label>
          <StateSelect
            selected={selectedStates}
            onChange={setSelectedStates}
            placeholder="Select one or more states..."
            operatingStates={OPERATING_STATES_SET}
          />
        </div>
      </div>
      {hasCriticalGap && (
        <div style={{ padding: 16, background: "#7f1d1d", border: "1px solid #991b1b", borderRadius: 8, marginBottom: 24 }}>
          <strong>Critical gap</strong> — No providers licensed in: {zeroCoverageStates.map((st) => STATE_NAMES[st]).join(", ")}.
        </div>
      )}
      {selectedStates.length > 0 && (
        <>
          <h3 style={{ marginBottom: 12, fontSize: 16 }}>
            Available in at least one selected state ({available.length})
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
            {available.map((p) => {
              const coveredStates = selectedStates.filter((st) => p.states.includes(st))
              return (
                <Card key={p.id} style={{ borderLeft: "4px solid #22c55e", maxWidth: 320 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <CredBadge type={p.type} />
                    <span style={{ fontWeight: 600 }}>{p.name}</span>
                  </div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: styles.muted, marginBottom: 8 }}>NPI: {p.npi}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {coveredStates.map((st) => (
                      <StatePill key={st} state={st} />
                    ))}
                  </div>
                </Card>
              )
            })}
          </div>
          <h3 style={{ marginBottom: 12, fontSize: 16 }}>
            Unlicensed in all selected states ({unlicensed.length})
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {unlicensed.map((p) => (
              <span
                key={p.id}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  borderRadius: 6,
                  background: "#451a1a",
                  color: "#fca5a5",
                  border: "1px solid #991b1b",
                  fontSize: 14,
                }}
              >
                <CredBadge type={p.type} />
                {p.name}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
