import React, { useState, useRef, useEffect } from "react";
import {
  BarChart2,
  PieChart,
  LineChart,
  ChartNoAxesColumn,
  Donut,
  Grid,
} from "lucide-react";

const ChartDiagram = () => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isNameVisible, setIsNameVisible] = useState(false);
  const cardRef = useRef(null);

  // Array of chart types for dynamic rendering
  const charts = [
    {
      id: 1,
      name: "Column Chart",
      icon: <BarChart2 className="w-6 h-6 flex text-blue-500" />,
    },
    {
      id: 2,
      name: "Line Chart",
      icon: <LineChart className="w-6 h-6 text-green-500" />,
    },
    {
      id: 3,
      name: "Bar Chart",
      icon: <ChartNoAxesColumn className="w-6 h-6 text-orange-500" />,
    },
    {
      id: 4,
      name: "Matrix",
      icon: <Grid className="w-6 h-6 text-purple-500" />,
    },
    {
      id: 5,
      name: "Pie Chart",
      icon: <PieChart className="w-6 h-6 text-red-500" />,
    },
    {
      id: 6,
      name: "Donut Chart",
      icon: <Donut className="w-6 h-6 text-pink-500" />,
    },
  ];

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

  return (
    <div className="relative group" ref={cardRef}>
      <div
        className={`text-lg text-purple-500 p-2 rounded transition-all duration-300 ${
          isDropdownVisible ? "bg-gray-200" : "hover:bg-gray-100"
        }`}
        onClick={() => setIsDropdownVisible((prev) => !prev)}
        onMouseEnter={() => setIsNameVisible(true)}
        onMouseLeave={() => setIsNameVisible(false)}
      >
        <ChartNoAxesColumn />
      </div>

      {isDropdownVisible && (
        <div className="absolute right-12 -top-32  flex-wrap bg-white text-gray-800 rounded-lg p-4 shadow-lg z-10 flex gap-4 w-80">
          {/* Dynamic Chart Options */}
          {charts.map((chart) => (
            <div
              key={chart.id}
              className="flex items-center space-x-3 bg-gray-200 hover:bg-purple-50 p-3 rounded-lg cursor-pointer transition-all duration-300 hover:shadow-md w-32"
            >
              {chart.icon}
              <span className="text-gray-800 font-medium">{chart.name}</span>
            </div>
          ))}
        </div>
      )}

      {isNameVisible && (
        <span className="absolute whitespace-nowrap right-12 top-2 bg-black text-white text-xs font-bold rounded-md px-3 py-1 opacity-100 transition-opacity duration-300">
          Chart & Diagram
        </span>
      )}
    </div>
  );
};

export default ChartDiagram;
