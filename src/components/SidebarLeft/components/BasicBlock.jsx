"use client";

import React, { useState, useRef, useEffect, useContext } from "react";
import { CaseSensitive, AlignJustify, Heading as HeadingIcon, Type, Grid2X2, Grid3X3, Grid } from "lucide-react";
import { DragContext } from "../DragContext";
import HeadingInput from "@/components/docView/GenerateAi/AiComponents/Heading";
import TitleAi from "@/components/docView/GenerateAi/AiComponents/TitleAi";
import ParagraphAi from "@/components/docView/GenerateAi/AiComponents/ParagraphAi";

const BasicBlock = () => {
  const [isCardVisible, setIsCardVisible] = useState(false);
  const [isNameVisible, setIsNameVisible] = useState(false);
  const { setDraggedElement } = useContext(DragContext);
  const layoutRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (layoutRef.current && !layoutRef.current.contains(event.target)) {
        setIsCardVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDragStart = (event, componentType, rows = null, cols = null) => {
    let draggedElement;

    switch (componentType) {
      case "title":
        draggedElement = {
          type: "title",
          data: {
            value: "Default Title",
            style: {},
          },
          component: TitleAi,
        };
        break;
      case "heading":
        draggedElement = {
          type: "heading",
          data: {
            value: "Default Heading",
            style: { header: 2 },
          },
          component: HeadingInput,
        };
        break;
      case "paragraph":
        draggedElement = {
          type: "paragraph",
          data: {
            value: "Default Paragraph",
            style: {},
          },
          component: ParagraphAi,
        };
        break;
      case "matrix":
        draggedElement = {
          type: "matrix",
          data: {
            rows,
            cols,
            // Initialize with empty cells; content will auto-size
            tableData: Array(rows).fill().map(() => Array(cols).fill("")),
            styles: { width: cols * 100, height: rows * 100 }, // Initial size, will auto-adjust
          },
          // We'll assume a Matrix component exists or use a library like react-data-grid
          component: "Matrix", // Placeholder; replace with actual component if needed
        };
        break;
      default:
        return;
    }

    setDraggedElement(draggedElement);

    const transferData = {
      type: draggedElement.type,
      data: draggedElement.data,
    };
    event.dataTransfer.setData("application/json", JSON.stringify(transferData));
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

            {/* 2x2 Matrix */}
            <div
              className="col-span-1 border-b pb-2 last:border-b-0 bg-gray-100 rounded transform transition-all duration-300 hover:scale-105 hover:shadow-xl p-2 flex flex-col items-center"
              draggable
              onDragStart={(e) => handleDragStart(e, "matrix", 2, 2)}
            >
              <Grid2X2 className="text-purple-500 w-5 h-5 mr-2" />
              <span className="text-black">2x2 Matrix</span>
            </div>

            {/* 3x3 Matrix */}
            <div
              className="col-span-1 border-b pb-2 last:border-b-0 bg-gray-100 rounded transform transition-all duration-300 hover:scale-105 hover:shadow-xl p-2 flex flex-col items-center"
              draggable
              onDragStart={(e) => handleDragStart(e, "matrix", 3, 3)}
            >
              <Grid3X3 className="text-orange-500 w-5 h-5 mr-2" />
              <span className="text-black">3x3 Matrix</span>
            </div>

            {/* 4x4 Matrix */}
            <div
              className="col-span-1 border-b pb-2 last:border-b-0 bg-gray-100 rounded transform transition-all duration-300 hover:scale-105 hover:shadow-xl p-2 flex flex-col items-center"
              draggable
              onDragStart={(e) => handleDragStart(e, "matrix", 4, 4)}
            >
              <Grid className="text-teal-500 w-5 h-5 mr-2" />
              <span className="text-black">4x4 Matrix</span>
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