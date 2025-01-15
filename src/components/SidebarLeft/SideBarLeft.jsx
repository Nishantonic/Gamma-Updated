import React from "react";
// import ToolBar from "./components/Toolbar";
import CardTemplate from "./components/CardTemplate";
import SmartLayout from "./components/SmartLayout";
import BasicBlock from "./components/BasicBlock";
import Images from "./components/Images";
import VideoMedia from "./components/VideoMedia";
import EmbededApp from "./components/EmbededApp";
import ChartsDiagram from "./components/ChartsDiagram";
import FormButton from "./components/FormButton";
const SideBarLeft = () => {
  return (
    <div className="relative">
      {/* Toolbar */}
      <div className="flex flex-col bg-white text-black w-10 h-fit items-center py-2  fixed right-[15.7px] top-1/2 -translate-y-1/2 shadow-xl border border-gray-200 rounded-md">
        {/* ToolBar Components */}
        <CardTemplate />
        <SmartLayout />
        <BasicBlock />
        <Images />
        <VideoMedia />
        <EmbededApp />
        <ChartsDiagram />
        <FormButton />
      </div>
    </div>
  );
};

export default SideBarLeft;
