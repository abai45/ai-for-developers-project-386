import { Navigate, Route, Routes } from 'react-router-dom'
import Header from '@/components/Header'
import LandingPage from '@/pages/LandingPage'
import StartPage from '@/pages/StartPage'
import StubPage from '@/pages/StubPage'

function App() {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <Header />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/start" element={<StartPage />} />
        <Route
          path="/owner"
          element={<StubPage title="Создать встречу" />}
        />
        <Route path="/book" element={<StubPage title="Присоединиться ко встрече" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
