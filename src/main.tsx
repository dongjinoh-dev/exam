import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import QuizComponent from './QuizComponent.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QuizComponent />
    <App />
  </React.StrictMode>,
)
