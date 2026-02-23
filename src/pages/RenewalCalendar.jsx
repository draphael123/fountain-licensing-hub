import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { PROVIDERS } from "../data/providers"
import { STATE_NAMES } from "../data/reference"
import { Card, PageHeader, CredBadge } from "../components/ui"
import { useTheme } from "../context/ThemeContext"
import { getLicensesExpiringIn, getDeaExpiringIn } from "../data/providers"

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

function monthKey(dateStr) {
  const [y, m] = dateStr.split("-").map(Number)
  return `${y}-${String(m).padStart(2, "0")}`
}

function monthLabel(key) {
  const [y, m] = key.split("-").map(Number)
  return `${MONTHS[m - 1]} ${y}`
}

export default function RenewalCalendar() {
  const { theme } = useTheme()
  const [windowMonths, setWindowMonths] = useState(12) // next 12 months from today

  const activeProviders = useMemo(() => PROVIDERS.filter((p) => !p.terminated), [])

  const byMonth = useMemo(() => {
    const map = {}
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    for (let i = 0; i < windowMonths; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() + i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      map[key] = { licenses: [], dea: [] }
    }
    activeProviders.forEach((p) => {
      getLicensesExpiringIn(p, windowMonths * 31).forEach(({ state, expires }) => {
        const key = monthKey(expires)
        if (map[key]) map[key].licenses.push({ provider: p, state, expires })
      })
      getDeaExpiringIn(p, windowMonths * 31).forEach(({ state, num, expires }) => {
        const key = monthKey(expires)
        if (map[key]) map[key].dea.push({ provider: p, state, num, expires })
      })
    })
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b))
  }, [activeProviders, windowMonths])

  return (
    <div style={{ padding: 24, background: theme.bg0, minHeight: "100vh", color: theme.text, fontFamily: "'DM Sans', sans-serif" }}>
      <PageHeader title="Renewal Calendar" subtitle="Licenses and DEA registrations expiring by month" />
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: theme.muted }}>
          Show next
          <select
            value={windowMonths}
            onChange={(e) => setWindowMonths(Number(e.target.value))}
            style={{ padding: "6px 10px", borderRadius: 6, border: `1px solid ${theme.border1}`, background: theme.bg1, color: theme.text, fontSize: 14 }}
          >
            {[6, 12, 18, 24].map((n) => (
              <option key={n} value={n}>{n} months</option>
            ))}
          </select>
        </label>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {byMonth.map(([key, { licenses, dea }]) => {
          const total = licenses.length + dea.length
          if (total === 0) return null
          return (
            <Card key={key} style={{ padding: 20 }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 18 }}>{monthLabel(key)}</h3>
              {licenses.length > 0 && (
                <div style={{ marginBottom: licenses.length > 0 && dea.length > 0 ? 16 : 0 }}>
                  <div style={{ fontSize: 12, color: theme.muted, marginBottom: 8 }}>Licenses expiring</div>
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    {licenses.map((x, i) => (
                      <li key={i} style={{ marginBottom: 4 }}>
                        <Link to="/dir" style={{ color: theme.accent, textDecoration: "none" }}>{x.provider.name}</Link>
                        <span style={{ color: theme.muted }}> — </span>
                        <span>{STATE_NAMES[x.state] || x.state}</span>
                        <span style={{ color: theme.muted, fontSize: 12 }}> ({x.expires})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {dea.length > 0 && (
                <div>
                  <div style={{ fontSize: 12, color: theme.muted, marginBottom: 8 }}>DEA expiring</div>
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    {dea.map((x, i) => (
                      <li key={i} style={{ marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
                        <Link to="/dir" style={{ color: theme.accent, textDecoration: "none" }}>{x.provider.name}</Link>
                        <CredBadge type={x.provider.type} />
                        <span>{x.state} {x.num}</span>
                        <span style={{ color: theme.muted, fontSize: 12 }}>({x.expires})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          )
        })}
        {byMonth.every(([, data]) => data.licenses.length === 0 && data.dea.length === 0) && (
          <p style={{ color: theme.muted }}>No licenses or DEA expiring in the selected window.</p>
        )}
      </div>
    </div>
  )
}
