import React, { useState, useRef, useEffect, useContext } from "react";
import { DragContext } from "../DragContext";
import { Grid } from "lucide-react";
const SmartLayout = () => {
  const [isLayoutVisible, setIsLayoutVisible] = useState(false);
  const layoutRef = useRef(null);
  const { setDraggedElement } = useContext(DragContext);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (layoutRef.current && !layoutRef.current.contains(event.target)) {
        setIsLayoutVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const layouts = [
    {
      id: "two-by-two",
      name: "2x2 Matrix",
      columns: 2,
      rows: 2,
      content: (
        <div className="grid grid-cols-2 gap-1 border-2 border-gray-300 p-1 rounded-md bg-gray-50 h-10 w-full shadow-sm">
          <div className="bg-white border border-gray-200 rounded-sm"></div>
          <div className="bg-white border border-gray-200 rounded-sm"></div>
          <div className="bg-white border border-gray-200 rounded-sm"></div>
          <div className="bg-white border border-gray-200 rounded-sm"></div>
        </div>
      ),
    },
    {
      id: "three-by-three",
      name: "3x3 Matrix",
      columns: 3,
      rows: 3,
      content: (
        <div className="grid grid-cols-3 gap-1 border-2 border-gray-300 p-1 rounded-md bg-gray-50 h-10 w-full shadow-sm">
          <div className="bg-white border border-gray-200 rounded-sm"></div>
          <div className="bg-white border border-gray-200 rounded-sm"></div>
          <div className="bg-white border border-gray-200 rounded-sm"></div>
          <div className="bg-white border border-gray-200 rounded-sm"></div>
          <div className="bg-white border border-gray-200 rounded-sm"></div>
          <div className="bg-white border border-gray-200 rounded-sm"></div>
          <div className="bg-white border border-gray-200 rounded-sm"></div>
          <div className="bg-white border border-gray-200 rounded-sm"></div>
          <div className="bg-white border border-gray-200 rounded-sm"></div>
        </div>
      ),
    },
    {
      id: "four-by-four",
      name: "4x4 Matrix",
      columns: 4,
      rows: 4,
      content: (
        <div className="grid grid-cols-4 gap-1 border-2 border-gray-300 p-1 rounded-md bg-gray-50 h-10 w-full shadow-sm">
          <div className="bg-white border border-gray-200 rounded-sm"></div>
          <div className="bg-white border border-gray-200 rounded-sm"></div>
          <div className="bg-white border border-gray-200 rounded-sm"></div>
          <div className="bg-white border border-gray-200 rounded-sm"></div>
          <div className="bg-white border border-gray-200 rounded-sm"></div>
          <div className="bg-white border border-gray-200 rounded-sm"></div>
          <div className="bg-white border border-gray-200 rounded-sm"></div>
          <div className="bg-white border border-gray-200 rounded-sm"></div>
          <div className="bg-white border border-gray-200 rounded-sm"></div>
          <div className="bg-white border border-gray-200 rounded-sm"></div>
          <div className="bg-white border border-gray-200 rounded-sm"></div>
          <div className="bg-white border border-gray-200 rounded-sm"></div>
          <div className="bg-white border border-gray-200 rounded-sm"></div>
          <div className="bg-white border border-gray-200 rounded-sm"></div>
          <div className="bg-white border border-gray-200 rounded-sm"></div>
          <div className="bg-white border border-gray-200 rounded-sm"></div>
        </div>
      ),
    },
  ];

  const handleDragStart = (layout) => {
    setDraggedElement({
      id: layout.id,
      columns: layout.columns,
      rows: layout.rows,
    });
  };

  return (
    <div className="relative" ref={layoutRef}>
      <div
        className={`relative group cursor-pointer p-3  rounded-lg transition-all duration-300 shadow-md ${
          isLayoutVisible ? "bg-purple-100" : "bg-gray-50 hover:bg-gray-100"
        }`}
        onClick={() => setIsLayoutVisible((prev) => !prev)}
      >
        {/* <div className="text-lg font-semibold text-purple-600">Layouts</div> */}
        <Grid className="text-xl w-5 font-semibold text-purple-600"/>
        <span className="absolute whitespace-nowrap right-12 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs font-bold rounded-md px-3 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          Smart Layouts
        </span>
      </div>

      {isLayoutVisible && (
        <div className="absolute right-12 top-0 bg-white text-black rounded-lg p-5 shadow-lg w-96 h-auto border border-gray-200 z-10">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Choose a Layout</h3>
          <div className="grid grid-cols-3 gap-4">
            {layouts.map((layout) => (
              <div
                key={layout.id}
                draggable
                onDragStart={() => handleDragStart(layout)}
                onDragEnd={() => setDraggedElement(null)}
                className="bg-gray-50 rounded-lg p-3 m-3 flex flex-col items-center transform transition-all duration-300 hover:scale-105 hover:shadow-md cursor-pointer h-20 w-full border border-gray-300"
              >
                <div className="h-10 w-full">{layout.content}</div>
                <h3 className="text-sm text-gray-600 mt-1">{layout.name}</h3>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartLayout;