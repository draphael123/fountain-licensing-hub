import { useParams, Link } from "react-router-dom"
import { useMemo } from "react"
import { PROVIDERS, getActiveStates, getExpiredStates, getActiveDea, getExpiredDea, getCeuStatus } from "../data/providers"
import { NLC_STATES, IMLC_STATES, STATE_NAMES, BOARD_INFO } from "../data/reference"
import { Card, PageHeader, StatePill, CredBadge, ProgressBar } from "../components/ui"
import { useTheme } from "../context/ThemeContext"

export default function ProviderDetail() {
  const { id } = useParams()
  const { theme } = useTheme()
  const provider = useMemo(() => PROVIDERS.find((p) => String(p.id) === id), [id])

  const activeStates = useMemo(() => (provider ? getActiveStates(provider) : []), [provider])
  const expiredStates = useMemo(() => (provider ? getExpiredStates(provider) : []), [provider])
  const activeDea = useMemo(() => (provider ? getActiveDea(provider) : []), [provider])
  const expiredDea = useMemo(() => (provider ? getExpiredDea(provider) : []), [provider])
  const ceu = useMemo(() => (provider ? getCeuStatus(provider) : null), [provider])
  const compactStates = provider && (provider.type === "NP" ? NLC_STATES : IMLC_STATES)
  const compactLicensed = activeStates.filter((s) => compactStates?.includes(s))

  if (!provider) {
    return (
      <div style={{ padding: 24, fontFamily: "'DM Sans', sans-serif", color: theme?.text || "#1e293b" }}>
        <p>Provider not found.</p>
        <Link to="/dir" style={{ color: theme?.accent || "#2563eb" }}>← Back to Provider Directory</Link>
      </div>
    )
  }

  return (
    <div className="print-page" style={{ padding: 24, background: theme.bg0, minHeight: "100vh", color: theme.text, fontFamily: "'DM Sans', sans-serif" }}>
      <div className="no-print" style={{ marginBottom: 16 }}>
        <Link to="/dir" style={{ color: theme.accent, textDecoration: "none", fontSize: 14 }}>← Back to Provider Directory</Link>
        <button
          type="button"
          onClick={() => window.print()}
          style={{
            marginLeft: 16,
            padding: "6px 12px",
            borderRadius: 6,
            border: `1px solid ${theme.border1}`,
            background: theme.bg2,
            color: theme.text,
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          Print
        </button>
      </div>
      <PageHeader
        title={provider.name}
        subtitle={
          <>
            <CredBadge type={provider.type} />
            {provider.terminated && <span style={{ marginLeft: 8, color: theme.danger, fontSize: 14 }}>Terminated</span>}
          </>
        }
      />
      <div style={{ display: "grid", gap: 24, maxWidth: 900 }}>
        <Card style={{ padding: 20 }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 14, color: theme.muted }}>Basic info</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
            <div><span style={{ color: theme.muted, fontSize: 12 }}>NPI</span><div style={{ fontFamily: "'DM Mono', monospace" }}>{provider.npi}</div></div>
            <div><span style={{ color: theme.muted, fontSize: 12 }}>Contract start</span><div>{provider.contractStart ?? "—"}</div></div>
          </div>
        </Card>

        <Card style={{ padding: 20 }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 14, color: theme.muted }}>DEA registrations</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {activeDea.map(({ state, num }) => (
              <span key={state + num} style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, padding: "6px 10px", background: theme.bg2, borderRadius: 6 }}>
                {state} {num}{provider.deaExpirations?.[state] ? ` (exp ${provider.deaExpirations[state]})` : ""}
              </span>
            ))}
            {expiredDea.map(({ state, num }) => (
              <span key={"e-" + state + num} style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, padding: "6px 10px", background: theme.danger + "20", color: theme.danger, borderRadius: 6 }}>
                {state} {num} (expired)
              </span>
            ))}
            {activeDea.length === 0 && expiredDea.length === 0 && <span style={{ color: theme.muted }}>None</span>}
          </div>
        </Card>

        <Card style={{ padding: 20 }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 14, color: theme.muted }}>Licensed states ({activeStates.length})</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {activeStates.map((s) => (
              <StatePill key={s} state={s} title={provider.licenseExpirations?.[s] ? `Expires ${provider.licenseExpirations[s]}` : undefined} />
            ))}
          </div>
          {expiredStates.length > 0 && (
            <>
              <div style={{ fontSize: 12, color: theme.danger, marginTop: 12, marginBottom: 6 }}>Expired</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {expiredStates.map((s) => (
                  <StatePill key={s} state={s} expired title={provider.licenseExpirations?.[s] ? `Expired ${provider.licenseExpirations[s]}` : undefined} />
                ))}
              </div>
            </>
          )}
        </Card>

        {ceu && (
          <Card style={{ padding: 20 }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 14, color: theme.muted }}>CEU (continuing education)</h3>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16, marginBottom: 12 }}>
              <span>Cycle end: <strong>{ceu.cycleEnd}</strong></span>
              <span>{ceu.completed} / {ceu.required} hrs</span>
              {ceu.isComplete ? <span style={{ color: theme.success, fontWeight: 600 }}>Complete</span> : <span style={{ color: theme.warning }}>{ceu.remaining} hrs remaining</span>}
            </div>
            <ProgressBar value={ceu.completed} max={ceu.required} />
          </Card>
        )}

        <Card style={{ padding: 20 }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 14, color: theme.muted }}>State board / renewal links</h3>
          <p style={{ margin: "0 0 12px", fontSize: 13, color: theme.muted }}>Use these links to renew licenses or check status.</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {[...activeStates].sort().map((st) => {
              const info = BOARD_INFO[st]
              if (!info) return null
              return (
                <a
                  key={st}
                  href={info.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="no-print"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 12px",
                    background: theme.bg2,
                    border: `1px solid ${theme.border1}`,
                    borderRadius: 8,
                    color: theme.accent,
                    textDecoration: "none",
                    fontSize: 13,
                  }}
                >
                  {st} — {STATE_NAMES[st] || st}
                </a>
              )
            })}
            {activeStates.length === 0 && <span style={{ color: theme.muted }}>No licensed states</span>}
          </div>
        </Card>
      </div>
    </div>
  )
}
