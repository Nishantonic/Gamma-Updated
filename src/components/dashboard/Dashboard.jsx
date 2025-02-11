import React, { useEffect, useState } from "react";

import Content from "./components/Content";
// import Share from "./components/Share";
import Settings from "./components/Settings";
// import Gammas from "./components/Gammas";
import AiImages from "./components/AiImages";
import Navbar from "./components/Slidebar";
// import Contact from "./components/Contact";
// import Feedback from "./components/Feedback";
import Gammas from "./components/Gammas/Gammas";
import Trash from "./components/Trash";

const Dashboard = () => {
  const [activeComponent, setActiveComponent] = useState("Gammas");
  const [credits, setCradits] = useState(() => {
  // Initialize from localStorage or default to 50
  const savedCredits = localStorage.getItem('credits');
  return savedCredits !== null ? parseInt(savedCredits) : 50;
});

// Add this effect to save to localStorage whenever credits change
  useEffect(() => {
    localStorage.setItem('credits', credits);
  }, [credits]);

  // Mapping component names to actual components
  const componentMap = {
    "Gammas": <Gammas credits={credits} setCradits={setCradits} />,
    "Settings & Members": <Settings />,
    "Ai Images" : <AiImages credits={credits} setCradits={setCradits} />,
    "Trash" : <Trash />,
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
