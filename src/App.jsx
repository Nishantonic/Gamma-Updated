import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Page from "./components/docView/page"
import CardTemplates from "./components/docView/slidesView/CardTemplates"
import GenerateAi from "./components/docView/GenerateAi/GenerateAi"
import Home from "./components/Home/Home";
// imort Home
function App() {

  return (
   <Router>
       <Routes>
          <Route path="/" element={<Page/> }/>
          <Route path="/generate-ai" element={<GenerateAi />} />
          {/* <Route path="/" element={<Home/>}/> */}
       </Routes>
   </Router>
  )
}

export default App

