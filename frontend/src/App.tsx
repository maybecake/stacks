import React from 'react'
import './App.css'
import { Samples } from './components/ui/samples'
import { Header } from './components/Header'

function App() {
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <Samples />
      </main>
    </div>
  )
}

export default App
