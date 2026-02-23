import { useState, useMemo } from "react"
import { STATE_NAMES, ALL_STATES, isOperatingState } from "../data/reference"
import { useTheme } from "../context/ThemeContext"

export function Tag({ children, style = {} }) {
  const { theme } = useTheme()
  return (
    <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 4, fontSize: 12, background: theme.bg2, color: theme.muted, border: `1px solid ${theme.border1}`, ...style }}>
      {children}
    </span>
  )
}

export function StatePill({ state, title, expired }) {
  const { theme } = useTheme()
  if (state == null || typeof state !== "string") return null
  const name = STATE_NAMES[state] || state
  if (expired) {
    const fullTitle = title ?? `${name} (Expired)`
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
          background: theme.danger + "20",
          color: theme.danger,
          border: `1px solid ${theme.danger}`,
        }}
      >
        <span style={{ opacity: 0.9 }}>✕</span>
        <span>{state}</span>
      </span>
    )
  }
  const operating = isOperatingState(state)
  const fullTitle = title ?? `${name}${operating ? " (Fountain operates)" : " (Coming soon)"}`
  const color = operating ? theme.success : theme.comingSoon
  const bg = operating ? theme.successBg : theme.comingSoonBg
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
        background: bg,
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
  const { theme } = useTheme()
  const pct = max ? Math.round((value / max) * 100) : 0
  let barColor = "#ef4444"
  if (pct >= 100) barColor = theme.success
  else if (pct >= 60) barColor = theme.warning
  else if (pct >= 30) barColor = "#f97316"
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 6, background: theme.bg2, borderRadius: 3, overflow: "hidden" }}>
        <div style={{ width: `${Math.min(100, pct)}%`, height: "100%", background: barColor, transition: "width 0.2s" }} />
      </div>
      {label !== undefined && <span style={{ fontSize: 12, color: theme.muted }}>{label}</span>}
      <span style={{ fontSize: 12, color: theme.muted, minWidth: 32 }}>{pct}%</span>
    </div>
  )
}

export function Card({ children, style = {} }) {
  const { theme } = useTheme()
  return (
    <div style={{ background: theme.bg1, border: `1px solid ${theme.border1}`, borderRadius: 8, padding: 16, boxShadow: theme.shadow, ...style }}>
      {children}
    </div>
  )
}

export function Row({ children, style = {} }) {
  const { theme } = useTheme()
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 12px", background: theme.bg2, borderBottom: `1px solid ${theme.border2}`, ...style }}>
      {children}
    </div>
  )
}

export function Label({ children, style = {} }) {
  const { theme } = useTheme()
  return <span style={{ fontSize: 12, color: theme.muted, ...style }}>{children}</span>
}

export function PageHeader({ title, subtitle, style = {} }) {
  const { theme } = useTheme()
  return (
    <div style={{ marginBottom: 24, ...style }}>
      <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600, color: theme.text }}>{title}</h1>
      {subtitle && <p style={{ margin: "8px 0 0", fontSize: 14, color: theme.muted }}>{subtitle}</p>}
    </div>
  )
}

export function Toggle({ on, onChange, label }) {
  const { theme } = useTheme()
  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14, color: theme.text }}>
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
          background: on ? theme.accent : theme.bg2,
          position: "relative",
        }}
      >
        <span style={{ position: "absolute", top: 2, left: on ? 20 : 2, width: 18, height: 18, borderRadius: "50%", background: theme.accentText, transition: "left 0.2s" }} />
      </button>
      {label && <span>{label}</span>}
    </label>
  )
}

export function CredBadge({ type }) {
  const { theme } = useTheme()
  const color = type === "MD" ? theme.credMD : type === "DO" ? theme.credDO : theme.credNP
  return (
    <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 4, fontSize: 12, fontWeight: 600, background: `${color}30`, color, border: `1px solid ${color}60` }}>
      {type}
    </span>
  )
}

export function StateSelect({ selected, onChange, placeholder = "Select states...", operatingStates }) {
  const { theme } = useTheme()
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
          background: theme.bg1,
          border: `1px solid ${theme.border1}`,
          borderRadius: 8,
          color: theme.text,
          fontSize: 14,
          cursor: "pointer",
          width: "100%",
          minWidth: 200,
          textAlign: "left",
        }}
      >
        {selected.length === 0 ? (
          <span style={{ color: theme.muted }}>{placeholder}</span>
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
              background: theme.bg1,
              border: `1px solid ${theme.border1}`,
              borderRadius: 8,
              boxShadow: theme.shadow,
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
                background: theme.bg2,
                border: `1px solid ${theme.border2}`,
                borderRadius: 6,
                color: theme.text,
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
                      background: operating ? (checked ? `${theme.accent}15` : "transparent") : theme.comingSoonBg,
                      color: operating ? undefined : theme.comingSoon,
                    }}
                  >
                    <input type="checkbox" checked={checked} onChange={() => toggle(st)} style={{ accentColor: theme.accent }} />
                    <span style={{ color: operating ? theme.success : theme.comingSoon, fontSize: 12 }}>{operating ? "✓" : "·"}</span>
                    <span style={{ fontWeight: 500 }}>{st}</span>
                    <span style={{ color: operating ? theme.muted : theme.comingSoon, fontSize: 12 }}>{STATE_NAMES[st]}</span>
                    {!operating && <span style={{ fontSize: 10, marginLeft: "auto", color: theme.comingSoon }}>Coming soon</span>}
                  </label>
                )
              })}
            </div>
            <div style={{ display: "flex", gap: 8, padding: 8, borderTop: `1px solid ${theme.border2}` }}>
              <button
                type="button"
                onClick={() => onChange([])}
                style={{ padding: "6px 12px", fontSize: 12, background: theme.bg2, border: `1px solid ${theme.border1}`, borderRadius: 6, color: theme.text, cursor: "pointer" }}
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => onChange([...ALL_STATES])}
                style={{ padding: "6px 12px", fontSize: 12, background: theme.bg2, border: `1px solid ${theme.border1}`, borderRadius: 6, color: theme.text, cursor: "pointer" }}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                style={{ padding: "6px 12px", fontSize: 12, background: theme.accent, border: "none", borderRadius: 6, color: theme.accentText, cursor: "pointer", marginLeft: "auto" }}
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
