import React, { useState } from "react";

import Content from "./components/Content";
// import Share from "./components/Share";
import Settings from "./components/Settings";
import Gammas from "./components/Gammas";
import AiImages from "./components/AiImages";
import Navbar from "./components/Slidebar";
// import Contact from "./components/Contact";
// import Feedback from "./components/Feedback";

const Dashboard = () => {
  const [activeComponent, setActiveComponent] = useState("Gammas");
  const [credits,setCradits] = useState(50)
  // Mapping component names to actual components
  const componentMap = {
    "Gammas": <Gammas />,
    "Settings & Members": <Settings />,
    "Ai Images" : <AiImages credits={credits} setCradit={setCradits} />,
    // "Contact Support": <Contact /> ,
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Navbar activeComponent={activeComponent} setActiveComponent={setActiveComponent} />

      {/* Content Area */}
      <div className="flex-1  bg-gray-100">
        <Content>{componentMap[activeComponent]}</Content>
      </div>
    </div>
  );
};

export default Dashboard;
