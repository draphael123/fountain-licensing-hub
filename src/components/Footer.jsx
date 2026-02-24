import { useTheme } from "../context/ThemeContext"

const APP_VERSION = "1.0"
const DATA_AS_OF = "2025-02-23" // Update when provider data is refreshed

export default function Footer() {
  const { theme } = useTheme()
  return (
    <footer
      className="no-print"
      style={{
        marginTop: "auto",
        padding: "16px 24px",
        borderTop: `1px solid ${theme.border1}`,
        background: theme.bg1,
        fontSize: 12,
        color: theme.muted,
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      Data as of {DATA_AS_OF} · Licensing Hub v{APP_VERSION} · Fountain
    </footer>
  )
}
