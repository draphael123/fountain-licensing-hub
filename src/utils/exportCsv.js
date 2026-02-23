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
