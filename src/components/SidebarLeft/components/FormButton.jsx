import React, { useState, useRef, useEffect } from "react";
import { SquarePen, PlusCircle } from "lucide-react";

const Button = () => {
  const [isCardVisible, setIsCardVisible] = useState(false);
  const [isNameVisible, setIsNameVisible] = useState(false);
  const [url, setUrl] = useState("");
  const [buttonName, setButtonName] = useState("");
  const [isClicked, setIsClicked] = useState(false); // State for click animation
  const cardRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cardRef.current && !cardRef.current.contains(event.target)) {
        setIsCardVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDragStart = (e) => {
    if (!url) {
      alert("Please enter a URL first!");
      e.preventDefault();
      return;
    }
    if (!buttonName) {
      alert("Please enter a button name first!");
      e.preventDefault();
      return;
    }
    const dragData = {
      type: "custom-button",
      url: url,
      name: buttonName,
      styles: { width: 150, height: 40 },
    };
    e.dataTransfer.setData("application/json", JSON.stringify(dragData));
    console.log("Dragging button with URL:", url, "and Name:", buttonName);
  };

  const handleClickAnimation = () => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 300); // Reset animation after 300ms
  };

  return (
    <div className="relative group" ref={cardRef}>
      <div
        className={`text-lg text-purple-500 p-2 rounded-full transition-all duration-300 ${
          isCardVisible ? "bg-gray-200" : "hover:bg-gray-100"
        }`}
        onClick={() => setIsCardVisible((prev) => !prev)}
        onMouseEnter={() => setIsNameVisible(true)}
        onMouseLeave={() => setIsNameVisible(false)}
      >
        <SquarePen className="w-6 h-6" />
      </div>

      {isCardVisible && (
        <div className="absolute right-11 top-0 bg-white rounded-lg p-4 shadow-lg w-80 h-auto overflow-auto border border-gray-200 z-10">
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-3 transition-all duration-300 hover:shadow-md">
              <div className="flex flex-col space-y-3">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Enter URL (e.g., https://example.com)"
                  className="w-full p-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <input
                  type="text"
                  value={buttonName}
                  onChange={(e) => setButtonName(e.target.value)}
                  placeholder="Enter Button Name (e.g., Visit Site)"
                  className="w-full p-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <button
                  className={`flex items-center justify-center space-x-2 p-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 ${
                    isClicked ? "animate-pulse scale-95" : ""
                  }`}
                  draggable
                  onDragStart={handleDragStart}
                  onClick={handleClickAnimation}
                >
                  <PlusCircle className="w-5 h-5" />
                  <span className="font-medium">Add Button</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isNameVisible && (
        <span className="absolute whitespace-nowrap right-11 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs font-bold rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-sm">
          Form & Button
        </span>
      )}

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        .animate-pulse {
          animation: pulse 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Button;