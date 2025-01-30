import React, { useState } from "react";
import Slidebar from "./components/Slidebar";
import Content from "./components/Content";
// import Share from "./components/Share";
import Settings from "./components/Settings";
import Gammas from "./components/Gammas";
// import Contact from "./components/Contact";
// import Feedback from "./components/Feedback";

const Dashboard = () => {
  const [activeComponent, setActiveComponent] = useState("Gammas");

  // Mapping component names to actual components
  const componentMap = {
    Gammas: <Gammas />,
    // Share: <Share />,
    Settings: <Settings />,
    // Contact: <Contact />,
    // Feedback: <Feedback />,
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Slidebar activeComponent={activeComponent} setActiveComponent={setActiveComponent} />

      {/* Content Area */}
      <div className="flex-1  bg-gray-100">
        <Content>{componentMap[activeComponent]}</Content>
      </div>
    </div>
  );
};

export default Dashboard;
