import { useState, useMemo } from "react"
import { PROVIDERS } from "../data/providers"
import { Card, PageHeader, CredBadge, styles } from "../components/ui"
import { downloadCsv, toCsv } from "../utils/exportCsv"

export default function NPIDirectory() {
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    const active = PROVIDERS.filter((p) => !p.terminated)
    if (!search.trim()) return active
    const q = search.toLowerCase()
    return active.filter((p) => p.name.toLowerCase().includes(q) || p.npi.includes(q) || p.type.toLowerCase().includes(q))
  }, [search])

  const handleExport = () => {
    const rows = [["Provider", "Type", "NPI", "Contract Start"], ...filtered.map((p) => [p.name, p.type, p.npi, p.contractStart ?? ""])]
    downloadCsv(toCsv(rows), `npi-directory-${new Date().toISOString().slice(0, 10)}.csv`)
  }

  return (
    <div style={{ padding: 24, background: styles.bg0, minHeight: "100vh", color: styles.text, fontFamily: "'DM Sans', sans-serif" }}>
      <PageHeader title="NPI Directory" subtitle="Provider, type, NPI, contract start" />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", marginBottom: 24 }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search provider, NPI, or type..."
          style={{
            minWidth: 320,
            padding: "10px 14px",
            background: styles.bg1,
            border: `1px solid ${styles.border1}`,
            borderRadius: 8,
            color: styles.text,
            fontSize: 14,
          }}
        />
        <button
          type="button"
          onClick={handleExport}
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            border: "none",
            background: styles.accent,
            color: styles.bg0,
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Export CSV
        </button>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${styles.border1}` }}>
              <th style={{ textAlign: "left", padding: 12, fontSize: 12, color: styles.muted }}>Provider</th>
              <th style={{ textAlign: "left", padding: 12, fontSize: 12, color: styles.muted }}>Type</th>
              <th style={{ textAlign: "left", padding: 12, fontSize: 12, color: styles.muted }}>NPI</th>
              <th style={{ textAlign: "left", padding: 12, fontSize: 12, color: styles.muted }}>Contract Start</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} style={{ borderBottom: `1px solid ${styles.border2}` }}>
                <td style={{ padding: 12 }}>
                  <span style={{ fontWeight: 500 }}>{p.name}</span>
                </td>
                <td style={{ padding: 12 }}>
                  <CredBadge type={p.type} />
                </td>
                <td style={{ padding: 12, fontFamily: "'DM Mono', monospace", fontSize: 14, userSelect: "all" }}>{p.npi}</td>
                <td style={{ padding: 12, color: styles.muted }}>{p.contractStart ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
