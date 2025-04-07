import React, { useState, useRef, useEffect, useContext } from "react";
import { BarChart2, PieChart as PieChartIcon, ChartNoAxesColumn, TrendingUp } from "lucide-react";
import { Bar, Pie, Line } from "react-chartjs-2";
import { DragContext } from "../DragContext";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement } from "chart.js";

// Register all necessary components
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement);

// Shared default chart data with custom colors
const sharedDefaultChartData = {
  labels: ["Red", "Blue", "Yellow", "Green"],
  datasets: [
    {
      label: "Sample Data",
      data: [12, 19, 3, 5],
      backgroundColor: [
        "rgba(255, 99, 132, 0.6)",  // Red
        "rgba(54, 162, 235, 0.6)",  // Blue
        "rgba(255, 206, 86, 0.6)",  // Yellow
        "rgba(75, 192, 192, 0.6)",  // Green
      ],
      borderColor: [
        "rgba(255, 99, 132, 1)",
        "rgba(54, 162, 235, 1)",
        "rgba(255, 206, 86, 1)",
        "rgba(75, 192, 192, 1)",
      ],
      borderWidth: 1,
    },
  ],
};

const defaultColumnChartData = sharedDefaultChartData;
const defaultBarChartData = sharedDefaultChartData;
const defaultPieChartData = sharedDefaultChartData;
const defaultLineChartData = {
  labels: sharedDefaultChartData.labels,
  datasets: [
    {
      ...sharedDefaultChartData.datasets[0],
      fill: false,
      borderColor: "rgba(75, 192, 192, 1)",
      backgroundColor: "rgba(75, 192, 192, 0.2)", // For points
      tension: 0.1,
    },
  ],
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      labels: {
        font: {
          size: 12,
          family: "'Inter', sans-serif",
        },
      },
    },
  },
};

const ChartsDiagram = () => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isNameVisible, setIsNameVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chartType, setChartType] = useState(null);
  const [labels, setLabels] = useState("");
  const [dataValues, setDataValues] = useState("");
  const [updatedChartData, setUpdatedChartData] = useState(null);
  const cardRef = useRef(null);
  const modalRef = useRef(null);
  const { setDraggedElement } = useContext(DragContext);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const isOutsideCard = cardRef.current && !cardRef.current.contains(event.target);
      const isOutsideModal = modalRef.current && !modalRef.current.contains(event.target);
      if (isOutsideCard && (!isModalOpen || (isModalOpen && isOutsideModal))) {
        setIsDropdownVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isModalOpen]);

  const handleOpenModal = (componentType) => {
    setChartType(componentType);
    setIsModalOpen(true);
  };

  const handleSubmitValues = (event) => {
    event.preventDefault();
    const labelArray = labels.split(",").map((label) => label.trim());
    const dataArray = dataValues.split(",").map((value) => Number(value.trim()));

    if (labelArray.length !== dataArray.length || dataArray.some(isNaN)) {
      alert("Please ensure the number of labels matches the number of data values and all data values are numbers.");
      return;
    }

    const newChartData = {
      labels: labelArray,
      datasets: [
        {
          label: `${chartType} Data`,
          data: dataArray,
          backgroundColor: [
            "rgba(255, 99, 132, 0.6)",
            "rgba(54, 162, 235, 0.6)",
            "rgba(255, 206, 86, 0.6)",
            "rgba(75, 192, 192, 0.6)",
            "rgba(153, 102, 255, 0.6)", // Purple (extra color for larger datasets)
          ].slice(0, dataArray.length),
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)",
          ].slice(0, dataArray.length),
          borderWidth: 1,
          ...(chartType === "Line Chart" && {
            fill: false,
            borderColor: "rgba(75, 192, 192, 1)",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            tension: 0.1,
          }),
        },
      ],
    };

    setUpdatedChartData(newChartData);
    setIsModalOpen(false);
    setLabels("");
    setDataValues("");
    console.log("Chart Data Prepared:", { chartType, newChartData });
  };

  const handleDragStart = (event, componentType) => {
    let draggedElement;
    const chartDataToUse =
      updatedChartData && chartType === componentType
        ? updatedChartData
        : componentType === "Column Chart"
        ? defaultColumnChartData
        : componentType === "Bar Chart"
        ? defaultBarChartData
        : componentType === "Pie Chart"
        ? defaultPieChartData
        : defaultLineChartData;

    switch (componentType) {
      case "Column Chart":
        draggedElement = {
          type: "column-chart",
          data: {
            value: "Column Chart",
            chartData: chartDataToUse,
            options: chartOptions,
            style: { width: "300px", height: "300px" },
          },
          component: Bar,
        };
        break;
      case "Bar Chart":
        draggedElement = {
          type: "bar-chart",
          data: {
            value: "Bar Chart",
            chartData: chartDataToUse,
            options: { ...chartOptions, indexAxis: "y" },
            style: { width: "300px", height: "300px" },
          },
          component: Bar,
        };
        break;
      case "Pie Chart":
        draggedElement = {
          type: "pie-chart",
          data: {
            value: "Pie Chart",
            chartData: chartDataToUse,
            options: chartOptions,
            style: { width: "300px", height: "300px" },
          },
          component: Pie,
        };
        break;
      case "Line Chart":
        draggedElement = {
          type: "line-chart",
          data: {
            value: "Line Chart",
            chartData: chartDataToUse,
            options: chartOptions,
            style: { width: "300px", height: "300px" },
          },
          component: Line,
        };
        break;
      default:
        return;
    }

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
          className={`text-lg text-purple-600 p-3 rounded-full transition-all duration-300 cursor-pointer ${
            isDropdownVisible ? "bg-purple-100 shadow-md" : "hover:bg-purple-50"
          }`}
          onClick={() => setIsDropdownVisible((prev) => !prev)}
          onMouseEnter={() => setIsNameVisible(true)}
          onMouseLeave={() => setIsNameVisible(false)}
        >
          <ChartNoAxesColumn className="w-6 h-6" />
        </div>

        {isDropdownVisible && (
          <div className="absolute right-14 -top-44 bg-white text-gray-800 rounded-xl p-5 shadow-xl z-10 flex w-[320px] gap-5 flex-wrap border border-gray-100">
            {/* Column Chart */}
            <div
              className="bg-gray-50 rounded-lg p-3 flex flex-col items-center transform transition-all duration-200 hover:shadow-lg hover:scale-105 cursor-pointer"
              draggable={updatedChartData && chartType === "Column Chart"}
              onDragStart={(e) => handleDragStart(e, "Column Chart")}
              onClick={() => handleOpenModal("Column Chart")}
            >
              <div className="w-24 h-16 overflow-hidden rounded">
                {updatedChartData && chartType === "Column Chart" ? (
                  <Bar data={updatedChartData} options={{ ...chartOptions, maintainAspectRatio: false }} />
                ) : (
                  <Bar data={defaultColumnChartData} options={{ ...chartOptions, maintainAspectRatio: false }} />
                )}
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mt-2">Column</h3>
              {!updatedChartData || chartType !== "Column Chart" ? (
                <span className="text-xs text-gray-500">Click to set values</span>
              ) : (
                <span className="text-xs text-blue-600">Drag to use</span>
              )}
            </div>

            {/* Bar Chart */}
            <div
              className="bg-gray-50 rounded-lg p-3 flex flex-col items-center transform transition-all duration-200 hover:shadow-lg hover:scale-105 cursor-pointer"
              draggable={updatedChartData && chartType === "Bar Chart"}
              onDragStart={(e) => handleDragStart(e, "Bar Chart")}
              onClick={() => handleOpenModal("Bar Chart")}
            >
              <div className="w-24 h-16 overflow-hidden rounded">
                {updatedChartData && chartType === "Bar Chart" ? (
                  <Bar data={updatedChartData} options={{ ...chartOptions, maintainAspectRatio: false, indexAxis: "y" }} />
                ) : (
                  <Bar data={defaultBarChartData} options={{ ...chartOptions, maintainAspectRatio: false, indexAxis: "y" }} />
                )}
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mt-2">Bar</h3>
              {!updatedChartData || chartType !== "Bar Chart" ? (
                <span className="text-xs text-gray-500">Click to set values</span>
              ) : (
                <span className="text-xs text-green-600">Drag to use</span>
              )}
            </div>

            {/* Pie Chart */}
            <div
              className="bg-gray-50 rounded-lg p-3 flex flex-col items-center transform transition-all duration-200 hover:shadow-lg hover:scale-105 cursor-pointer"
              draggable={updatedChartData && chartType === "Pie Chart"}
              onDragStart={(e) => handleDragStart(e, "Pie Chart")}
              onClick={() => handleOpenModal("Pie Chart")}
            >
              <div className="w-24 h-16 overflow-hidden rounded">
                {updatedChartData && chartType === "Pie Chart" ? (
                  <Pie data={updatedChartData} options={{ ...chartOptions, maintainAspectRatio: false }} />
                ) : (
                  <Pie data={defaultPieChartData} options={{ ...chartOptions, maintainAspectRatio: false }} />
                )}
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mt-2">Pie</h3>
              {!updatedChartData || chartType !== "Pie Chart" ? (
                <span className="text-xs text-gray-500">Click to set values</span>
              ) : (
<span className="text-sm font-bold text-green-600 tracking-wide uppercase">
  Drag to Use
</span>
              )}
            </div>

            {/* Line Chart */}
            <div
              className="bg-gray-50 rounded-lg p-3 flex flex-col items-center transform transition-all duration-200 hover:shadow-lg hover:scale-105 cursor-pointer"
              draggable={updatedChartData && chartType === "Line Chart"}
              onDragStart={(e) => handleDragStart(e, "Line Chart")}
              onClick={() => handleOpenModal("Line Chart")}
            >
              <div className="w-24 h-16 overflow-hidden rounded">
                {updatedChartData && chartType === "Line Chart" ? (
                  <Line data={updatedChartData} options={{ ...chartOptions, maintainAspectRatio: true }} />
                ) : (
                  <Line data={defaultLineChartData} options={{ ...chartOptions, maintainAspectRatio: true }} />
                )}
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mt-2">Line</h3>
              {!updatedChartData || chartType !== "Line Chart" ? (
                <span className="text-xs text-gray-500">Click to set values</span>
              ) : (
                <span className="text-xs text-purple-600">Drag to use</span>
              )}
            </div>
          </div>
        )}

        {isNameVisible && (
          <span className="absolute right-14 top-2 bg-gray-800 text-white text-xs font-semibold rounded-md px-2 py-1 shadow">
            Chart & Diagram
          </span>
        )}
      </div>

      {/* Modal for entering chart values */}
      {isModalOpen && (
        <div className="fixed -left-96 inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity duration-300">
          <div ref={modalRef} className="bg-white p-8 rounded-xl shadow-2xl w-[420px] transform transition-all duration-300 scale-100">
            <h2 className="text-xl font-bold mb-6 text-gray-900">Enter {chartType} Values</h2>
            <form onSubmit={handleSubmitValues}>
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="labels">
                  Labels (comma-separated, e.g., "A, B, C")
                </label>
                <input
                  type="text"
                  id="labels"
                  value={labels}
                  onChange={(e) => setLabels(e.target.value)}
                  className="block w-full border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="dataValues">
                  Data Values (comma-separated, e.g., "10, 20, 30")
                </label>
                <input
                  type="text"
                  id="dataValues"
                  value={dataValues}
                  onChange={(e) => setDataValues(e.target.value)}
                  className="block w-full border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartsDiagram;