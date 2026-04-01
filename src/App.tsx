import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useUIStore } from '@/store/ui-store'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { LoginPage } from '@/components/auth/LoginPage'
import { Home } from '@/pages/Home'
import { Game } from '@/pages/Game'
import { Daily } from '@/pages/Daily'
import { Rankings } from '@/pages/Rankings'
import { Tournament } from '@/pages/Tournament'
import { Profile } from '@/pages/Profile'
import { ToastContainer } from '@/components/ui/Toast'

function ThemeInitializer() {
  const theme = useUIStore((s) => s.theme)
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeInitializer />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            <AuthGuard>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/juego/:difficulty" element={<Game />} />
                <Route path="/diario" element={<Daily />} />
                <Route path="/ranking" element={<Rankings />} />
                <Route path="/torneo" element={<Tournament />} />
                <Route path="/perfil" element={<Profile />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AuthGuard>
          }
        />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  )
}
