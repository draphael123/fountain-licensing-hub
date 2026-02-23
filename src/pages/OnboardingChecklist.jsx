import { useMemo } from "react"
import { PROVIDERS, DEFAULT_PATIENT_STATES } from "../data/providers"
import { STATE_NAMES, OPERATING_STATES } from "../data/reference"
import { Card, PageHeader, StatePill, styles } from "../components/ui"

export default function OnboardingChecklist() {
  const activeProviders = useMemo(() => PROVIDERS.filter((p) => !p.terminated), [])
  const coveredStates = useMemo(() => {
    const set = new Set()
    activeProviders.forEach((p) => p.states.forEach((s) => set.add(s)))
    return set
  }, [activeProviders])

  const gapStates = useMemo(
    () => DEFAULT_PATIENT_STATES.filter((s) => !coveredStates.has(s)),
    [coveredStates]
  )
  const operatingGaps = useMemo(() => gapStates.filter((s) => OPERATING_STATES.includes(s)), [gapStates])
  const comingSoonGaps = useMemo(() => gapStates.filter((s) => !OPERATING_STATES.includes(s)), [gapStates])

  return (
    <div style={{ padding: 24, background: styles.bg0, minHeight: "100vh", color: styles.text, fontFamily: "'DM Sans', sans-serif" }}>
      <PageHeader
        title="Onboarding Checklist"
        subtitle="States a new provider should get licensed in to close coverage gaps (based on default patient states)"
      />
      <Card style={{ marginBottom: 24, padding: 16 }}>
        <div style={{ fontSize: 14, color: styles.muted }}>
          Default patient states are used to define gaps. To change which states count as gaps, use Gap Analyzer.
        </div>
      </Card>
      {operatingGaps.length > 0 && (
        <section style={{ marginBottom: 24 }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 16 }}>Operating states with no coverage — high priority</h3>
          <p style={{ margin: "0 0 12px", fontSize: 14, color: styles.muted }}>Get licensed in these to serve patients in states where Fountain operates but has no providers.</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {operatingGaps.map((st) => (
              <StatePill key={st} state={st} />
            ))}
          </div>
        </section>
      )}
      {comingSoonGaps.length > 0 && (
        <section style={{ marginBottom: 24 }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 16 }}>Coming-soon states in default list</h3>
          <p style={{ margin: "0 0 12px", fontSize: 14, color: styles.muted }}>These are in the default patient state list but Fountain does not yet operate here.</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {comingSoonGaps.map((st) => (
              <StatePill key={st} state={st} />
            ))}
          </div>
        </section>
      )}
      {gapStates.length === 0 && (
        <Card style={{ padding: 20 }}>
          <strong>No gaps</strong> — All default patient states have at least one provider. New providers can still add redundancy or expand into coming-soon states (see Expansion Priorities).
        </Card>
      )}
    </div>
  )
}
