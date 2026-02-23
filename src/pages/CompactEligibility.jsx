import { useMemo } from "react"
import { PROVIDERS } from "../data/providers"
import { NLC_STATES, IMLC_STATES } from "../data/reference"
import { StatePill, Card, PageHeader, CredBadge, styles } from "../components/ui"

export default function CompactEligibility() {
  const nlcCount = NLC_STATES.length
  const imlcCount = IMLC_STATES.length

  const providerCompactInfo = useMemo(() => {
    return PROVIDERS.filter((p) => !p.terminated).map((p) => {
      const compactStates = p.type === "NP" ? NLC_STATES : IMLC_STATES
      const inCompact = p.states.filter((s) => compactStates.includes(s))
      const missing = compactStates.filter((s) => !p.states.includes(s))
      return {
        ...p,
        compactName: p.type === "NP" ? "NLC" : "IMLC",
        inCompact,
        missing,
      }
    })
  }, [])

  return (
    <div style={{ padding: 24, background: styles.bg0, minHeight: "100vh", color: styles.text, fontFamily: "'DM Sans', sans-serif" }}>
      <PageHeader title="Compact Eligibility" subtitle="NLC (NPs) and IMLC (MDs/DOs) expansion opportunities" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
        <Card style={{ padding: 20 }}>
          <h3 style={{ margin: "0 0 8px", fontSize: 18 }}>Nurse Licensure Compact (NLC)</h3>
          <p style={{ margin: 0, color: styles.muted, fontSize: 14 }}>For NPs — {nlcCount} member states. One multistate license recognized across all.</p>
        </Card>
        <Card style={{ padding: 20 }}>
          <h3 style={{ margin: "0 0 8px", fontSize: 18 }}>Interstate Medical Licensure Compact (IMLC)</h3>
          <p style={{ margin: 0, color: styles.muted, fontSize: 14 }}>For MDs/DOs — {imlcCount} member states. Expedited licenses in compact states.</p>
        </Card>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {providerCompactInfo.map((p) => (
          <Card key={p.id} style={{ padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <CredBadge type={p.type} />
              <span style={{ fontWeight: 600 }}>{p.name}</span>
              <span style={{ fontSize: 12, color: styles.muted }}>{p.compactName}</span>
              <span style={{ marginLeft: "auto", color: styles.muted }}>{p.inCompact.length} / {p.compactName === "NLC" ? NLC_STATES.length : IMLC_STATES.length} compact states</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <span style={{ fontSize: 12, color: styles.muted }}>Missing (expansion):</span>
              {p.missing.slice(0, 24).map((s) => (
                <StatePill key={s} state={s} />
              ))}
              {p.missing.length > 24 && <span style={{ color: styles.muted }}>+{p.missing.length - 24} more</span>}
              {p.missing.length === 0 && <span style={{ color: styles.muted }}>None — full compact coverage</span>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
