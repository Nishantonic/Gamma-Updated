import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Page from "./components/docView/page"
import SignUp from "./components/docView/SignUp";
import Login from "./components/docView/Login";
import Dashboard from "./components/dashboard/Dashboard";
import { PresentationMode } from "./components/docView/PresentationMode";
import GenerateAiPage from "./components/docView/GenerateAiPage";
function App() {

  return (
   <Router>
       <Routes>
          <Route path="/page" element={<Page/>}/>
          <Route path="/generate-ai" element={<GenerateAiPage />} />
          <Route path="/" element={<SignUp/>}/>
          <Route path="/home" element={<Dashboard/>}/>
          <Route path="/login" element={<Login/>}/>
          <Route path="/presentation" element={<PresentationMode/>}/>
       </Routes>
   </Router>
  )
}

export default App


