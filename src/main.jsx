import React from 'react'
import { DragProvider } from './components/SidebarLeft/DragContext'
import './index.css'
import App from './App.jsx'
import ReactDOM from "react-dom"


ReactDOM.render(
  <DragProvider>
    <App />
  </DragProvider>,
  document.getElementById("root")
)
