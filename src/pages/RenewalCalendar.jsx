import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { PROVIDERS } from "../data/providers"
import { STATE_NAMES } from "../data/reference"
import { Card, PageHeader, CredBadge } from "../components/ui"
import { useTheme } from "../context/ThemeContext"
import { getLicensesExpiringIn, getDeaExpiringIn } from "../data/providers"
import { downloadCsv, toCsv } from "../utils/exportCsv"

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

  const exportExpiringReport = (days) => {
    const rows = [["Type", "Provider", "Credential", "State", "DEA Number", "Expiration"]]
    activeProviders.forEach((p) => {
      getLicensesExpiringIn(p, days).forEach(({ state, expires }) => {
        rows.push(["License", p.name, p.type, state, "", expires])
      })
      getDeaExpiringIn(p, days).forEach(({ state, num, expires }) => {
        rows.push(["DEA", p.name, p.type, state, num, expires])
      })
    })
    const sorted = rows.slice(1).sort((a, b) => a[5].localeCompare(b[5]))
    downloadCsv(toCsv([rows[0], ...sorted]), `expiring-report-${days}-days-${new Date().toISOString().slice(0, 10)}.csv`)
  }

  return (
    <div className="print-page" style={{ padding: 24, background: theme.bg0, minHeight: "100vh", color: theme.text, fontFamily: "'DM Sans', sans-serif" }}>
      <PageHeader title="Renewal Calendar" subtitle="Licenses and DEA registrations expiring by month" />
      <div className="no-print" style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
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
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 14, color: theme.muted }}>Export expiring report:</span>
          {[30, 60, 90].map((days) => (
            <button
              key={days}
              type="button"
              onClick={() => exportExpiringReport(days)}
              style={{
                padding: "8px 14px",
                borderRadius: 6,
                border: "none",
                background: theme.accent,
                color: theme.accentText,
                fontSize: 14,
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              Next {days} days (CSV)
            </button>
          ))}
        </div>
        <button
          type="button"
          className="no-print"
          onClick={() => window.print()}
          style={{
            padding: "8px 16px",
            borderRadius: 6,
            border: `1px solid ${theme.border1}`,
            background: theme.bg2,
            color: theme.text,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Print
        </button>
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
                        <Link to={`/provider/${x.provider.id}`} style={{ color: theme.accent, textDecoration: "none" }}>{x.provider.name}</Link>
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
                        <Link to={`/provider/${x.provider.id}`} style={{ color: theme.accent, textDecoration: "none" }}>{x.provider.name}</Link>
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
          <p style={{ color: theme.muted }}>
            No licenses or DEA expiring in the selected window. Add <code style={{ background: theme.bg1, padding: "2px 6px", borderRadius: 4 }}>licenseExpirations</code> and <code style={{ background: theme.bg1, padding: "2px 6px", borderRadius: 4 }}>deaExpirations</code> in provider data to see renewals here.
          </p>
        )}
      </div>
    </div>
  )
}
