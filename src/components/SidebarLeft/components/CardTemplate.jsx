import React, { useState, useRef, useEffect, useContext } from "react";
import { FolderOpen } from "lucide-react";
import { DragContext } from "../DragContext";
import { Card } from "@/components/ui/card";
import card1 from "../../docView/slidesView/assets/card1.png";
import card2 from "../../docView/slidesView/assets/card2.png";
import card3 from "../../docView/slidesView/assets/card3.png";
import card4 from "../../docView/slidesView/assets/card4.png";
// import CardTemplates from "@/components/docView/slidesView/CardTemplates copy";

import { Grid2X2, Sparkles } from "lucide-react";
import CardTemplateTwoColumn from "@/components/docView/slidesView/CardTempletTwoColumn";
import CardTemplateImgHeadingThree from "@/components/docView/slidesView/CardTemplateImgHeadingThree";
import ImageCardText from "@/components/docView/slidesView/ImageCardText";
import AccentImage from "@/components/docView/slidesView/AccentImage";

const CardTemplate = () => {
  const [isCardVisible, setIsCardVisible] = useState(false);
  const [isNameVisible, setIsNameVisible] = useState(false);
  const { setDraggedElement } = useContext(DragContext);

  const cardRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cardRef.current && !cardRef.current.contains(event.target)) {
        setIsCardVisible(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleDragStart = (event, templateType) => {
  const data = JSON.stringify({
    type: "template",
    templateType: templateType
  });
  event.dataTransfer.setData("application/json", data);
  setDraggedElement({ type: "template", templateType });
};

  return (
    <div className="relative group" ref={cardRef}>
      <div
        className={`text-lg text-purple-500 p-2 rounded transition-all duration-300 ${
          isCardVisible ? "bg-gray-200" : "hover:bg-gray-100"
        }`}
        onClick={() => setIsCardVisible((prev) => !prev)}
        onMouseEnter={() => setIsNameVisible(true)}
        onMouseLeave={() => setIsNameVisible(false)}
        aria-label="Card template toggle"
      >
        <FolderOpen />
      </div>

      {isCardVisible && (
        <div className="absolute right-11 top-0 bg-gray-200 text-black rounded-md p-4 shadow-md w-96 h-fit overflow-auto">
          <h3 className="text-gray-400 mb-4">Basic</h3>
          <div className="grid grid-cols-3 gap-4">
            <Card
              className="p-4 bg-[#2a2438] border-[#3a3347] hover:border-[#4a4357] cursor-pointer transition-colors relative group"
              draggable
              onDragStart={(e) => handleDragStart(e, "imageText")}
            >
              <img
                src={card1}
                alt="Image and Text"
                className="w-full h-24 object-contain rounded-lg"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end rounded-lg p-2">
                <p className="text-white text-sm font-medium">Image and Text</p>
              </div>
            </Card>

            <Card
              className="p-4 bg-[#2a2438] border-[#3a3347] hover:border-[#4a4357] cursor-pointer transition-colors relative group "
              draggable
              onDragStart={(e) => handleDragStart(e, "accentImage")}
            >
              <div className="h-24 flex items-center justify-center overflow-hidden">
                <img
                  src={card3}
                  alt="Accent right"
                  className="w-full h-full object-contain rounded-lg"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded-lg">
                  <p className="text-white text-sm font-medium">Accent right</p>
                </div>
              </div>
            </Card>

            <Card
              className="p-4 bg-[#2a2438] border-[#3a3347] hover:border-[#4a4357] cursor-pointer transition-colors relative group"
              // onClick={() => setShowTwoColumn(true)}
              draggable
              onDragStart={(e) => handleDragStart(e, "twoColumn")}
            >
              <img
                src={card2}
                alt="Two Columns"
                className="w-full h-24 object-contain rounded-lg"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end rounded-lg p-2">
                <p className="text-white text-sm font-medium">Two Columns</p>
              </div>
            </Card>

            <Card
              className="p-4 bg-[#2a2438] border-[#3a3347] hover:border-[#4a4357] cursor-pointer transition-colors relative group"
              // onClick={() => setShowThreeColumn(true)}
              draggable
              onDragStart={(e) => handleDragStart(e, "threeImgCard")}
            >
              <img
                src={card4}
                alt="Three Columns"
                className="w-full h-24 object-contain rounded-lg"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end rounded-lg p-2">
                <p className="text-white text-sm font-medium">Three Columns</p>
              </div>
            </Card>
          </div>
        </div>
      )}

      {isNameVisible && (
        <span className="absolute right-11 top-1/2 -translate-y-1/2 bg-black text-white text-xs font-bold rounded-md px-2 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          Card template
        </span>
      )}
    </div>
  );
};

export default CardTemplate;
