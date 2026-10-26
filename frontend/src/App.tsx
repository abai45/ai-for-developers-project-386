import { Navigate, Route, Routes } from 'react-router-dom'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import LandingPage from '@/pages/LandingPage'
import StubPage from '@/pages/StubPage'

function App() {
  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/book"
            element={<StubPage title="Присоединиться ко встрече" />}
          />
          <Route path="/owner" element={<StubPage title="Создать встречу" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
