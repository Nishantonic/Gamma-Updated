// ChartDiagram.js
import React, { useState, useRef, useEffect, useContext } from "react";
import { BarChart2, PieChart as PieChartIcon, ChartNoAxesColumn } from "lucide-react";
import { Bar, Pie } from "react-chartjs-2";
import { DragContext } from "../DragContext"; // Adjust path as needed

// Sample chart data
const barChartData = {
  labels: ["Red", "Blue", "Yellow", "Green"],
  datasets: [
    {
      label: "Sample Bar Data",
      data: [12, 19, 3, 5],
      
    },
  ],
};

const pieChartData = {
  labels: ["Red", "Blue", "Yellow"],
  datasets: [
    {
      label: "Sample Bar Data",
      data: [30, 50, 20],
     
    },
  ],
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
};

const ChartDiagram = () => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isNameVisible, setIsNameVisible] = useState(false);
  const cardRef = useRef(null);
  const { setDraggedElement } = useContext(DragContext);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cardRef.current && !cardRef.current.contains(event.target)) {
        setIsDropdownVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDragStart = (event, componentType) => {
    let draggedElement;

    switch (componentType) {
      case "Bar Chart":
        draggedElement = {
          type: "bar-chart",
          data: {
            value: "Bar Chart",
            chartData: barChartData,
            options: chartOptions,
            style: { width: "300px", height: "200px" },
          },
          component: Bar,
        };
        break;
      case "Pie Chart":
        draggedElement = {
          type: "pie-chart",
          data: {
            value: "Pie Chart",
            chartData: pieChartData,
            options: chartOptions,
            style: { width: "300px", height: "200px" },
          },
          component: Pie,
        };
        break;
      default:
        return;
    }

    // Pass the chart data to DragContext
    setDraggedElement(draggedElement);
    const transferData = { type: draggedElement.type, data: draggedElement.data };
    event.dataTransfer.setData("application/json", JSON.stringify(transferData));
    event.dataTransfer.setData("text/plain", draggedElement.type);
    console.log("Drag Started:", { componentType, draggedElement });
  };

  return (
    <div className="flex flex-col items-center">
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
          <div className="absolute right-12 -top-32 bg-white text-gray-800 rounded-lg p-4 shadow-lg z-10 flex gap-4 w-80">
            <div
              className="bg-gray-100 rounded p-2 flex flex-col items-center transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
              draggable
              onDragStart={(e) => handleDragStart(e, "Bar Chart")}
            >
              <BarChart2 className="text-blue-500 w-5 h-5 mr-2" />
              <Bar data={{
                 labels: ["Red", "Blue", "Yellow", "Green"],
                 datasets: [
                   {
                     label: "Sample Bar Data",
                     data: [12, 19, 3, 5],
                    
                   },
                 ],
              }}/>
              <h1 className="text-black">Bar Chart</h1>
            </div>
            <div
              className="bg-gray-100 rounded p-2 flex flex-col items-center transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
              draggable
              onDragStart={(e) => handleDragStart(e, "Pie Chart")}
            >
              <PieChartIcon className="text-red-500 w-5 h-5 mr-2" />
              <h1 className="text-black">Pie Chart</h1>
            </div>
          </div>
        )}

        {isNameVisible && (
          <span className="absolute right-12 top-2 bg-black text-white text-xs font-bold rounded-md px-3 py-1">
            Chart & Diagram
          </span>
        )}
      </div>
    </div>
  );
};

export default ChartDiagram;