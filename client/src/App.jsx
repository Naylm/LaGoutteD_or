import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Home from './pages/Home'
import Editor from './pages/Editor'

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-lgo-bg text-lgo-gold-light">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/editeur" element={<Editor />} />
        </Routes>
      </div>
    </AuthProvider>
  )
}

export default App
