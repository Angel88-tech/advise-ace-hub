import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Auth from './pages/Auth'
import { AuthProvider } from './contexts/AuthContext'
import { Toaster } from 'sonner'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster richColors position="top-center" />
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="/auth" element={<Auth />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}