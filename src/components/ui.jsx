import { useState, useMemo } from "react"
import { STATE_NAMES, ALL_STATES, isOperatingState } from "../data/reference"

const styles = {
  bg0: "#07101a",
  bg1: "#0b1828",
  bg2: "#0a1220",
  border1: "#132035",
  border2: "#111c2e",
  text: "#e2e8f0",
  muted: "#3d5470",
  dim: "#2d4060",
  accent: "#38bdf8",
  credMD: "#818cf8",
  credDO: "#34d399",
  credNP: "#38bdf8",
}
export { styles }

export function Tag({ children, style = {} }) {
  return (
    <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 4, fontSize: 12, background: styles.bg2, color: styles.muted, border: `1px solid ${styles.border1}`, ...style }}>
      {children}
    </span>
  )
}

export function StatePill({ state, title }) {
  const operating = isOperatingState(state)
  const pop = STATE_POP[state] ?? 0
  const name = STATE_NAMES[state] || state
  const fullTitle = title ?? `${name}${operating ? " (Fountain operates)" : " (Coming soon)"}`
  const color = operating ? "#22c55e" : "#64748b"
  const icon = operating ? "✓" : "·"
  return (
    <span
      title={fullTitle}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "2px 6px",
        borderRadius: 4,
        fontSize: 12,
        background: operating ? "#14532d" : styles.bg2,
        color,
        border: `1px solid ${color}40`,
      }}
    >
      <span style={{ opacity: 0.9 }}>{icon}</span>
      <span>{state}</span>
    </span>
  )
}

export function ProgressBar({ value, max = 100, label }) {
  const pct = max ? Math.round((value / max) * 100) : 0
  let barColor = "#ef4444"
  if (pct >= 100) barColor = "#22c55e"
  else if (pct >= 60) barColor = "#eab308"
  else if (pct >= 30) barColor = "#f97316"
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 6, background: styles.bg2, borderRadius: 3, overflow: "hidden" }}>
        <div style={{ width: `${Math.min(100, pct)}%`, height: "100%", background: barColor, transition: "width 0.2s" }} />
      </div>
      {label !== undefined && <span style={{ fontSize: 12, color: styles.muted }}>{label}</span>}
      <span style={{ fontSize: 12, color: styles.muted, minWidth: 32 }}>{pct}%</span>
    </div>
  )
}

export function Card({ children, style = {} }) {
  return (
    <div style={{ background: styles.bg1, border: `1px solid ${styles.border1}`, borderRadius: 8, padding: 16, ...style }}>
      {children}
    </div>
  )
}

export function Row({ children, style = {} }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 12px", background: styles.bg2, borderBottom: `1px solid ${styles.border2}`, ...style }}>
      {children}
    </div>
  )
}

export function Label({ children, style = {} }) {
  return <span style={{ fontSize: 12, color: styles.muted, ...style }}>{children}</span>
}

export function PageHeader({ title, subtitle, style = {} }) {
  return (
    <div style={{ marginBottom: 24, ...style }}>
      <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600, color: styles.text }}>{title}</h1>
      {subtitle && <p style={{ margin: "8px 0 0", fontSize: 14, color: styles.muted }}>{subtitle}</p>}
    </div>
  )
}

export function Toggle({ on, onChange, label }) {
  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14, color: styles.text }}>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={() => onChange(!on)}
        style={{
          width: 40,
          height: 22,
          borderRadius: 11,
          border: "none",
          background: on ? styles.accent : styles.bg2,
          position: "relative",
        }}
      >
        <span style={{ position: "absolute", top: 2, left: on ? 20 : 2, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
      </button>
      {label && <span>{label}</span>}
    </label>
  )
}

export function CredBadge({ type }) {
  const color = type === "MD" ? styles.credMD : type === "DO" ? styles.credDO : styles.credNP
  return (
    <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 4, fontSize: 12, fontWeight: 600, background: `${color}30`, color, border: `1px solid ${color}60` }}>
      {type}
    </span>
  )
}

export function StateSelect({ selected, onChange, placeholder = "Select states...", operatingStates }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const filtered = useMemo(() => {
    const s = search.toUpperCase()
    return ALL_STATES.filter((st) => st.includes(s) || (STATE_NAMES[st] || "").toLowerCase().includes(search.toLowerCase()))
  }, [search])
  const toggle = (st) => {
    if (selected.includes(st)) onChange(selected.filter((x) => x !== st))
    else onChange([...selected, st].sort())
  }
  const fountainOperatesIn = operatingStates != null ? operatingStates : null
  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 6,
          minHeight: 40,
          padding: "8px 12px",
          background: styles.bg1,
          border: `1px solid ${styles.border1}`,
          borderRadius: 8,
          color: styles.text,
          fontSize: 14,
          cursor: "pointer",
          width: "100%",
          minWidth: 200,
          textAlign: "left",
        }}
      >
        {selected.length === 0 ? (
          <span style={{ color: styles.muted }}>{placeholder}</span>
        ) : (
          selected.map((st) => (
            <StatePill key={st} state={st} />
          ))
        )}
      </button>
      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 10 }} onClick={() => setOpen(false)} />
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              marginTop: 4,
              minWidth: 280,
              maxHeight: 320,
              background: styles.bg1,
              border: `1px solid ${styles.border1}`,
              borderRadius: 8,
              boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
              zIndex: 20,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search states..."
              style={{
                margin: 8,
                padding: "8px 12px",
                background: styles.bg2,
                border: `1px solid ${styles.border2}`,
                borderRadius: 6,
                color: styles.text,
                fontSize: 14,
              }}
            />
            <div style={{ overflow: "auto", flex: 1 }}>
              {filtered.map((st) => {
                const checked = selected.includes(st)
                const operating = fountainOperatesIn !== null ? fountainOperatesIn.has(st) : true
                return (
                  <label
                    key={st}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 12px",
                      cursor: "pointer",
                      background: operating ? (checked ? `${styles.accent}15` : "transparent") : "#1e293b",
                      color: operating ? undefined : "#94a3b8",
                    }}
                  >
                    <input type="checkbox" checked={checked} onChange={() => toggle(st)} style={{ accentColor: styles.accent }} />
                    <span style={{ color: operating ? "#22c55e" : "#64748b", fontSize: 12 }}>{operating ? "✓" : "·"}</span>
                    <span style={{ fontWeight: 500 }}>{st}</span>
                    <span style={{ color: operating ? styles.muted : "#94a3b8", fontSize: 12 }}>{STATE_NAMES[st]}</span>
                    {!operating && <span style={{ fontSize: 10, marginLeft: "auto", color: "#64748b" }}>Coming soon</span>}
                  </label>
                )
              })}
            </div>
            <div style={{ display: "flex", gap: 8, padding: 8, borderTop: `1px solid ${styles.border2}` }}>
              <button
                type="button"
                onClick={() => onChange([])}
                style={{ padding: "6px 12px", fontSize: 12, background: styles.bg2, border: `1px solid ${styles.border1}`, borderRadius: 6, color: styles.text, cursor: "pointer" }}
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => onChange([...ALL_STATES])}
                style={{ padding: "6px 12px", fontSize: 12, background: styles.bg2, border: `1px solid ${styles.border1}`, borderRadius: 6, color: styles.text, cursor: "pointer" }}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                style={{ padding: "6px 12px", fontSize: 12, background: styles.accent, border: "none", borderRadius: 6, color: styles.bg0, cursor: "pointer", marginLeft: "auto" }}
              >
                Done
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
