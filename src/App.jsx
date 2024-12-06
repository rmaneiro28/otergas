import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import { Home } from './components/Home'
import { SpeedInsights } from '@vercel/speed-insights/react'

function App() {

  return (
    <>
      <BrowserRouter>
        <SpeedInsights />
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
