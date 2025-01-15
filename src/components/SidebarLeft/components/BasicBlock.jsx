import React, { useState, useRef, useEffect, useContext } from "react";
import { CaseSensitive, AlignJustify, Heading, Type } from "lucide-react";
import { DragContext } from "../DragContext";
import Headings from "@/components/docView/slidesView/CardComponents/Heading";
import TitleInput from "@/components/docView/slidesView/CardComponents/TitleInput";
import ParagraphInput from "@/components/docView/slidesView/CardComponents/ParagraphInput";

const BasicBlock = () => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isNameVisible, setIsNameVisible] = useState(false);
  const { setDraggedElement } = useContext(DragContext);

  const cardRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cardRef.current && !cardRef.current.contains(event.target)) {
        setIsDropdownVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDragStart = (event, cardData) => {
    setDraggedElement(cardData);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", "dragged-element");
  };

  return (
    <div className="relative group" ref={cardRef}>
      <div
        className={`relative group cursor-pointer p-2 rounded transition-all duration-300 ${
          isDropdownVisible ? "bg-gray-200" : "hover:bg-gray-100"
        }`}
        onClick={() => setIsDropdownVisible((prev) => !prev)}
        onMouseEnter={() => setIsNameVisible(true)}
        onMouseLeave={() => setIsNameVisible(false)}
      >
        <div className="text-lg text-purple-500">
          <CaseSensitive />
        </div>
      </div>

      {isDropdownVisible && (
        <div className="absolute whitespace-nowrap right-11 top-0 bg-gray-200 text-black rounded-md p-4 shadow-md w-96 h-auto">
          <h3 className="text-gray-400 mb-4">Basic Blocks</h3>
          {/* Container for text templates */}
          <div className="grid grid-cols-3 gap-4">
            <div
              className="col-span-1 border-b pb-2 last:border-b-0 bg-gray-100 rounded transform transition-all duration-300 hover:scale-105 hover:shadow-xl p-2 flex flex-col items-center"
              draggable
              onDragStart={(e) =>
                handleDragStart(
                  e,
                  {template : <TitleInput/>}
                )
              }
            >
              
              <Type className="text-red-500 w-5 h-5 mr-2" />
              <h1 className="text-black">Add Title</h1>
            </div>

            <div
              className="col-span-1 border-b pb-2 last:border-b-0 bg-gray-100 rounded transform transition-all duration-300 hover:scale-105 hover:shadow-xl p-2 flex flex-col items-center"
              draggable
              onDragStart={(e) =>
                handleDragStart(
                  e,
                  {template : <Headings/>}
                )
              }
            >
              <Heading className="text-blue-500 w-5 h-5 mr-2" />
              <h1 className="text-black">Add Heading</h1>
            </div>

            <div
              className="col-span-1 border-b pb-2 last:border-b-0 bg-gray-100 rounded transform transition-all duration-300 hover:scale-105 hover:shadow-xl p-2 flex flex-col items-center"
              draggable
              onDragStart={(e) =>
                handleDragStart(
                  e,
                  {template : <ParagraphInput/>}
                )
              }
            >
              <AlignJustify className="text-green-500 w-5 h-5 mr-2" />
              <blockquote className="text-black">BlockQuote</blockquote>
            </div>
          </div>
        </div>
      )}

      {isNameVisible && (
        <span className="absolute whitespace-nowrap right-11 top-1/2 -translate-y-1/2 bg-black text-white text-xs font-bold rounded-md px-2 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          Text templates
        </span>
      )}
    </div>
  );
};

export default BasicBlock;
