import React, { useState, useRef, useEffect } from "react";
import { PanelsLeftBottom } from "lucide-react";

const SmartLayout = () => {
  const [isLayoutVisible, setIsLayoutVisible] = useState(false);
  const layoutRef = useRef(null);

  // Close layout menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (layoutRef.current && !layoutRef.current.contains(event.target)) {
        setIsLayoutVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const layouts = [
    {
      id: "two-column",
      name: "2 Columns",
      content: (
        <div className="grid grid-cols-2 gap-2 border p-2 rounded bg-gray-100 h-8 w-full">
          <div className="bg-white p-1 border rounded"></div>
          <div className="bg-white p-1 border rounded"></div>
        </div>
      ),
    },
    {
      id: "three-column",
      name: "3 Columns",
      content: (
        <div className="grid grid-cols-3 gap-2 border p-2 rounded bg-gray-100 h-8 w-full">
          <div className="bg-white p-1 border rounded"></div>
          <div className="bg-white p-1 border rounded"></div>
          <div className="bg-white p-1 border rounded"></div>
        </div>
      ),
    },
    {
      id: "four-column",
      name: "4 Columns",
      content: (
        <div className="grid grid-cols-4 gap-2 border p-2 rounded bg-gray-100 h-8 w-full">
          <div className="bg-white p-1 border rounded"></div>
          <div className="bg-white p-1 border rounded"></div>
          <div className="bg-white p-1 border rounded"></div>
          <div className="bg-white p-1 border rounded"></div>
        </div>
      ),
    },
  ];

  return (
    <div className="relative" ref={layoutRef}>
      {/* Toolbar with icon */}
      <div
        className={`relative group cursor-pointer p-2 rounded transition-all duration-300 ${
          isLayoutVisible ? "bg-gray-200" : "hover:bg-gray-100"
        }`}
        onClick={() => setIsLayoutVisible((prev) => !prev)}
      >
        <div className="text-lg text-purple-500">
          <PanelsLeftBottom />
        </div>
        <span className="absolute whitespace-nowrap right-11 top-1/2 -translate-y-1/2 bg-black text-white text-xs font-bold rounded-md px-2 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          Smart layouts
        </span>
      </div>

      {isLayoutVisible && (
        <div className="absolute whitespace-nowrap right-11 top-0 bg-gray-200 text-black rounded-md p-4 shadow-md w-96 h-auto">
          <h3 className="text-gray-400 mb-4">Layouts</h3>
          <div className="grid grid-cols-3 gap-4">
            {layouts.map((layout) => (
              <div
                key={layout.id}
                className="bg-white rounded shadow-md p-2 flex flex-col items-center transform transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer h-16 w-full"
                onClick={() => console.log(`${layout.name} clicked`)}
              >
                <div className="h-8 w-full">{layout.content}</div>
                <h3 className="text-gray-400">{layout.name}</h3>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartLayout;
