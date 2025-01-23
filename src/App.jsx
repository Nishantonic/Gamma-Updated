import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Page from "./components/docView/page"
import CardTemplates from "./components/docView/slidesView/CardTemplates"
import GenerateAi from "./components/docView/GenerateAi/GenerateAi"
import Home from "./components/Home/Home";
import SignUp from "./components/docView/SignUp";
import Login from "./components/docView/Login";

// imort Home
function App() {

  return (
   <Router>
       <Routes>
          <Route path="/page" element={<Page/>}/>
          {/* <Route path="/generate-ai" element={<GenerateAi />} /> */}
          <Route path="/" element={<SignUp/>}/>
          <Route path="/login" element={<Login/>}/>
       </Routes>
   </Router>
  )
}

export default App

