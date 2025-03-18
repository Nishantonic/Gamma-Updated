import React, { useState, useRef, useEffect, useContext } from "react";
import { CaseSensitive, AlignJustify, Heading as HeadingIcon, Type } from "lucide-react";
import { DragContext } from "../DragContext";
import HeadingInput from "@/components/docView/GenerateAi/AiComponents/Heading"; // Your Heading component
import TitleAi from "@/components/docView/GenerateAi/AiComponents/TitleAi"; // Your Title component
import ParagraphAi from "@/components/docView/GenerateAi/AiComponents/ParagraphAi";

const BasicBlock = () => {
  const [isCardVisible, setIsCardVisible] = useState(false);
  const [isNameVisible, setIsNameVisible] = useState(false);
  const { setDraggedElement } = useContext(DragContext);
  const layoutRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (layoutRef.current && !layoutRef.current.contains(event.target)) {
        setIsCardVisible(false); // Close the dropdown when clicking outside
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDragStart = (event, componentType) => {
    let draggedElement;

    // Define the dragged element based on componentType
    switch (componentType) {
      case "title":
        draggedElement = {
          type: "title",
          data: {
            value: "Default Title",
            style: {},
          },
          component: TitleAi, // Pass the TitleAi component directly
        };
        break;
      case "heading":
        draggedElement = {
          type: "heading",
          data: {
            value: "Default Heading",
            style: { header: 2 }, // Default style for HeadingInput
          },
          component: HeadingInput, // Pass the HeadingInput component directly
        };
        break;
      case "paragraph":
        draggedElement = {
          type: "paragraph",
          data: {
            value: "Default Paragraph",
            style: {},
          },
          component: ParagraphAi, // Pass the ParagraphAi component
        };
        break;
      default:
        return;
    }

    // Set the dragged element in the DragContext
    setDraggedElement(draggedElement);

    // Serialize only the type and data for dataTransfer (component can't be serialized)
    const transferData = {
      type: draggedElement.type,
      data: draggedElement.data,
    };
    event.dataTransfer.setData("application/json", JSON.stringify(transferData));

    // Optional: Set a simple string for drag feedback (if needed)
    event.dataTransfer.setData("text/plain", draggedElement.type);
  };

  return (
    <div className="relative group" ref={layoutRef}>
      <div
        className={`relative group cursor-pointer p-2 rounded transition-all duration-300 ${
          isCardVisible ? "bg-gray-200" : "hover:bg-gray-100"
        }`}
        onClick={() => setIsCardVisible((prev) => !prev)}
        onMouseEnter={() => setIsNameVisible(true)}
        onMouseLeave={() => setIsNameVisible(false)}
      >
        <div className="text-lg text-purple-500">
          <CaseSensitive />
        </div>
      </div>

      {isCardVisible && (
        <div className="absolute whitespace-nowrap right-11 top-0 bg-gray-200 text-black rounded-md p-4 shadow-md w-96 h-auto">
          <h3 className="text-gray-400 mb-4">Basic Blocks</h3>
          {/* Container for text templates */}
          <div className="grid grid-cols-3 gap-4">
            <div
              className="col-span-1 border-b pb-2 last:border-b-0 bg-gray-100 rounded transform transition-all duration-300 hover:scale-105 hover:shadow-xl p-2 flex flex-col items-center"
              draggable
              onDragStart={(e) => handleDragStart(e, "title")}
            >
              <Type className="text-red-500 w-5 h-5 mr-2" />
              <h1 className="text-black">Add Title</h1>
            </div>

            <div
              className="col-span-1 border-b pb-2 last:border-b-0 bg-gray-100 rounded transform transition-all duration-300 hover:scale-105 hover:shadow-xl p-2 flex flex-col items-center"
              draggable
              onDragStart={(e) => handleDragStart(e, "heading")}
            >
              <HeadingIcon className="text-blue-500 w-5 h-5 mr-2" />
              <h1 className="text-black">Add Heading</h1>
            </div>

            <div
              className="col-span-1 border-b pb-2 last:border-b-0 bg-gray-100 rounded transform transition-all duration-300 hover:scale-105 hover:shadow-xl p-2 flex flex-col items-center"
              draggable
              onDragStart={(e) => handleDragStart(e, "paragraph")}
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