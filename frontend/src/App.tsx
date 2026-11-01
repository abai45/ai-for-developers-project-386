import { Navigate, Route, Routes } from 'react-router-dom'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import { Toaster } from '@/components/ui/sonner'
import LandingPage from '@/pages/LandingPage'
import OwnerPage from '@/pages/OwnerPage'
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
          <Route path="/owner" element={<OwnerPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
      <Toaster position="top-center" />
    </div>
  )
}

export default App
