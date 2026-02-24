/**
 * Trigger download of a CSV file (client-side, no backend).
 */
export function downloadCsv(content, filename) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function escapeCsvCell(value) {
  if (value == null) return ""
  const s = String(value)
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

/**
 * Build CSV string from array of row arrays.
 */
export function toCsv(rows) {
  return rows.map((row) => row.map(escapeCsvCell).join(",")).join("\r\n")
}

/**
 * Build full provider export rows for CSV.
 */
export function buildFullProviderExportRows(providers, getActiveStates, getActiveDea, getCeuStatus) {
  const header = [
    "Name", "NPI", "Type", "Terminated", "Contract Start",
    "States", "State Count",
    "DEA (State: Number)", "DEA Expirations",
    "License Expirations",
    "CEU Cycle End", "CEU Required", "CEU Completed", "CEU Status",
  ]
  const rows = providers.map((p) => {
    const states = getActiveStates(p)
    const dea = getActiveDea(p)
    const deaExp = p.deaExpirations ? Object.entries(p.deaExpirations).filter(([, exp]) => exp).map(([st, d]) => `${st}:${d}`).join("; ") : ""
    const licExp = p.licenseExpirations ? Object.entries(p.licenseExpirations).filter(([, exp]) => exp).map(([st, d]) => `${st}:${d}`).join("; ") : ""
    const ceu = getCeuStatus(p)
    return [
      p.name,
      p.npi ?? "",
      p.type ?? "",
      p.terminated ? "Yes" : "No",
      p.contractStart ?? "",
      states.join("; "),
      states.length,
      dea.map(({ state, num }) => `${state}:${num}`).join("; "),
      deaExp,
      licExp,
      ceu?.cycleEnd ?? "",
      ceu?.required ?? "",
      ceu?.completed ?? "",
      ceu ? (ceu.isComplete ? "Complete" : "In progress") : "",
    ]
  })
  return [header, ...rows]
}
