import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import { Home } from './components/Home'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { Analytics } from '@vercel/analytics/react'

function App() {

  return (
    <>
      <BrowserRouter>
        <Analytics>
          <SpeedInsights />
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </Analytics>
      </BrowserRouter>
    </>
  )
}

export default App;