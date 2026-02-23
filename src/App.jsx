import { Routes, Route, NavLink } from "react-router-dom"
import { ErrorBoundary } from "./components/ErrorBoundary"
import { GlobalSearch } from "./components/GlobalSearch"
import { useTheme } from "./context/ThemeContext"
import Dashboard from "./pages/Dashboard"
import GapAnalyzer from "./pages/GapAnalyzer"
import PatientLookup from "./pages/PatientLookup"
import RedundancyMap from "./pages/RedundancyMap"
import ExitSimulator from "./pages/ExitSimulator"
import CoverageMatrix from "./pages/CoverageMatrix"
import ProviderDirectory from "./pages/ProviderDirectory"
import DEATracker from "./pages/DEATracker"
import NPIDirectory from "./pages/NPIDirectory"
import CompactEligibility from "./pages/CompactEligibility"
import StateReference from "./pages/StateReference"
import OnboardingChecklist from "./pages/OnboardingChecklist"
import ProviderComparison from "./pages/ProviderComparison"
import RenewalCalendar from "./pages/RenewalCalendar"
import { PROVIDERS } from "./data/providers"

const nav = [
  { path: "/", label: "Dashboard", icon: "🏠" },
  { path: "/gap", label: "Gap Analyzer", icon: "⚖" },
  { path: "/lookup", label: "Patient Lookup", icon: "🔍" },
  { path: "/map", label: "Redundancy Map", icon: "🗺" },
  { path: "/sim", label: "Exit Simulator", icon: "🔮" },
  { path: "/matrix", label: "Matrix", icon: "📊" },
  { path: "/dir", label: "Providers", icon: "👤" },
  { path: "/dea", label: "DEA", icon: "💊" },
  { path: "/npi", label: "NPI", icon: "🪪" },
  { path: "/calendar", label: "Calendar", icon: "📅" },
  { path: "/nlc", label: "Compacts", icon: "🤝" },
  { path: "/ref", label: "State Boards", icon: "🏛" },
  { path: "/onboard", label: "Onboarding", icon: "✅" },
  { path: "/compare", label: "Compare", icon: "⚖" },
]

const activeCount = PROVIDERS.filter((p) => !p.terminated).length

function Layout({ children }) {
  const { theme, darkMode, setDarkMode } = useTheme()
  return (
    <div style={{ minHeight: "100vh", background: theme.bg0, fontFamily: "'DM Sans', sans-serif" }}>
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          gap: 24,
          padding: "12px 24px",
          background: theme.bg1,
          borderBottom: `1px solid ${theme.border1}`,
          overflowX: "auto",
          boxShadow: theme.shadow,
        }}
      >
        <NavLink
          to="/"
          style={({ isActive }) => ({
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: theme.text,
            textDecoration: "none",
            fontWeight: 600,
            fontSize: 16,
            whiteSpace: "nowrap",
          })}
        >
          ⚖ Licensing Hub
        </NavLink>
        <span style={{ color: theme.muted, fontSize: 14 }}>Fountain · {activeCount} active</span>
        <GlobalSearch />
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginLeft: "auto" }}>
          <button
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 12px",
              background: theme.bg2,
              border: `1px solid ${theme.border1}`,
              borderRadius: 8,
              color: theme.text,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>
          {nav.map(({ path, label, icon }) => (
            <NavLink
              key={path}
              to={path}
              style={({ isActive }) => ({
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "10px 14px",
                color: isActive ? theme.accent : theme.text,
                textDecoration: "none",
                fontSize: 14,
                borderBottom: `2px solid ${isActive ? theme.accent : "transparent"}`,
                marginBottom: -1,
                whiteSpace: "nowrap",
              })}
            >
              <span>{icon}</span>
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
      {children}
    </div>
  )
}

function App() {
  return (
    <Layout>
      <ErrorBoundary>
        <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/gap" element={<GapAnalyzer />} />
        <Route path="/lookup" element={<PatientLookup />} />
        <Route path="/map" element={<RedundancyMap />} />
        <Route path="/sim" element={<ExitSimulator />} />
        <Route path="/matrix" element={<CoverageMatrix />} />
        <Route path="/dir" element={<ProviderDirectory />} />
        <Route path="/dea" element={<DEATracker />} />
        <Route path="/npi" element={<NPIDirectory />} />
        <Route path="/nlc" element={<CompactEligibility />} />
        <Route path="/ref" element={<StateReference />} />
        <Route path="/onboard" element={<OnboardingChecklist />} />
        <Route path="/compare" element={<ProviderComparison />} />
        <Route path="/calendar" element={<RenewalCalendar />} />
      </Routes>
      </ErrorBoundary>
    </Layout>
  )
}

export default App
