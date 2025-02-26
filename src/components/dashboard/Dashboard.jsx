import React, { useEffect, useState } from "react";
import Content from "./components/Content";
import Settings from "./components/Settings";
import AiImages from "./components/AiImages";
import Navbar from "./components/Slidebar";
import Gammas from "./components/Gammas/Gammas";
import Trash from "./components/Trash";

const Dashboard = () => {
  const [activeComponent, setActiveComponent] = useState("Gammas");
  const [credits, setCradits] = useState(() => {
    const savedCredits = localStorage.getItem("credits");
    return savedCredits !== null ? parseInt(savedCredits) : 50;
  });

  useEffect(() => {
    localStorage.setItem("credits", credits);
  }, [credits]);

  const componentMap = {
    Gammas: <Gammas credits={credits} setCradits={setCradits} />,
    "Settings & Members": <Settings />,
    "Ai Images": <AiImages credits={credits} setCradits={setCradits} />,
    Trash: <Trash />,
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar (Fixed and Scrollable Internally) */}
      <div className="w-70 h-screen overflow-y-auto">
        <Navbar activeComponent={activeComponent} setActiveComponent={setActiveComponent} />
      </div>

      {/* Main Content (Scrollable Independently) */}
      <div className="flex-1 flex flex-col h-screen">
        <div className="flex-1 overflow-y-auto">
          <Content>{componentMap[activeComponent]}</Content>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
