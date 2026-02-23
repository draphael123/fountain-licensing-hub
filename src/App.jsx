import { Routes, Route, NavLink } from "react-router-dom"
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
import ExpansionPriorities from "./pages/ExpansionPriorities"
import OnboardingChecklist from "./pages/OnboardingChecklist"
import ProviderComparison from "./pages/ProviderComparison"
import { PROVIDERS } from "./data/providers"
import { styles } from "./components/ui"

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
  { path: "/nlc", label: "Compacts", icon: "🤝" },
  { path: "/ref", label: "State Boards", icon: "🏛" },
  { path: "/expand", label: "Expansion", icon: "📈" },
  { path: "/onboard", label: "Onboarding", icon: "✅" },
  { path: "/compare", label: "Compare", icon: "⚖" },
]

const activeCount = PROVIDERS.filter((p) => !p.terminated).length

function Layout({ children }) {
  return (
    <div style={{ minHeight: "100vh", background: styles.bg0, fontFamily: "'DM Sans', sans-serif" }}>
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          gap: 24,
          padding: "12px 24px",
          background: styles.bg1,
          borderBottom: `1px solid ${styles.border1}`,
          overflowX: "auto",
        }}
      >
        <NavLink
          to="/"
          style={({ isActive }) => ({
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: styles.text,
            textDecoration: "none",
            fontWeight: 600,
            fontSize: 16,
            whiteSpace: "nowrap",
          })}
        >
          ⚖ Licensing Hub
        </NavLink>
        <span style={{ color: styles.muted, fontSize: 14 }}>Fountain · {activeCount} active</span>
        <div style={{ display: "flex", gap: 4, marginLeft: "auto" }}>
          {nav.map(({ path, label, icon }) => (
            <NavLink
              key={path}
              to={path}
              style={({ isActive }) => ({
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "10px 14px",
                color: isActive ? styles.accent : styles.text,
                textDecoration: "none",
                fontSize: 14,
                borderBottom: `2px solid ${isActive ? styles.accent : "transparent"}`,
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
        <Route path="/expand" element={<ExpansionPriorities />} />
        <Route path="/onboard" element={<OnboardingChecklist />} />
        <Route path="/compare" element={<ProviderComparison />} />
      </Routes>
    </Layout>
  )
}

export default App
