import { createContext, useContext, useState, useMemo, useEffect } from "react"

const STORAGE_KEY = "licensing-hub-dark-mode"

const lightTheme = {
  name: "light",
  bg0: "#f0f9ff",
  bg1: "#ffffff",
  bg2: "#e0f2fe",
  border1: "#bae6fd",
  border2: "#7dd3fc",
  text: "#0c4a6e",
  muted: "#0369a1",
  dim: "#0284c7",
  accent: "#0284c7",
  accentText: "#ffffff",
  credMD: "#6366f1",
  credDO: "#059669",
  credNP: "#0284c7",
  success: "#15803d",
  successBg: "#dcfce7",
  comingSoon: "#64748b",
  comingSoonBg: "#f1f5f9",
  danger: "#dc2626",
  warning: "#ca8a04",
  shadow: "0 4px 12px rgba(2, 132, 199, 0.12)",
}

const darkTheme = {
  name: "dark",
  bg0: "#07101a",
  bg1: "#0b1828",
  bg2: "#0a1220",
  border1: "#132035",
  border2: "#111c2e",
  text: "#e2e8f0",
  muted: "#3d5470",
  dim: "#2d4060",
  accent: "#38bdf8",
  accentText: "#07101a",
  credMD: "#818cf8",
  credDO: "#34d399",
  credNP: "#38bdf8",
  success: "#22c55e",
  successBg: "#14532d",
  comingSoon: "#64748b",
  comingSoonBg: "#1e293b",
  danger: "#dc2626",
  warning: "#eab308",
  shadow: "0 4px 12px rgba(0,0,0,0.4)",
}

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [darkMode, setDarkModeState] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored === "true"
    } catch {
      return false
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(darkMode))
    } catch (_) {}
  }, [darkMode])

  const value = useMemo(
    () => ({
      darkMode,
      setDarkMode: setDarkModeState,
      theme: darkMode ? darkTheme : lightTheme,
    }),
    [darkMode]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) return { darkMode: false, setDarkMode: () => {}, theme: lightTheme }
  return ctx
}

export { lightTheme, darkTheme }
