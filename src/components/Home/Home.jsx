import React from "react";
import SideBarLeft from "../SidebarLeft/SideBarLeft";
import Help from "./Components/Help/Help";
const Home = () => {
  return (
    <div className="">
      {/* Left Sidebar */}
      <SideBarLeft></SideBarLeft>
      {/* Help Section */}
      <Help></Help>
    </div>
  );
};

export default Home;
