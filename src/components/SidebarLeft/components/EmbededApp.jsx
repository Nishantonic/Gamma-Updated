import React, { useState, useRef, useEffect } from "react";
import {
  AppWindow,
  FileText,
  Globe,
  Figma,
  Twitter,
  BarChart2,
  Folder,
} from "lucide-react";

const PdfMenu = () => {
  const [isCardVisible, setIsCardVisible] = useState(false);
  const [isNameVisible, setIsNameVisible] = useState(false);
  const cardRef = useRef(null);

  // Array of apps for dynamic rendering
  const apps = [
    {
      id: 1,
      name: "Instagram",
      icon: <Globe className="w-6 h-6 text-pink-500" />,
    },
    {
      id: 2,
      name: "Figma",
      icon: <Figma className="w-6 h-6 text-purple-600" />,
    },
    { id: 3, name: "Gamma", icon: <Globe className="w-6 h-6 text-blue-500" /> },
    {
      id: 4,
      name: "Twitter",
      icon: <Twitter className="w-6 h-6 text-blue-400" />,
    },
    {
      id: 5,
      name: "Power BI",
      icon: <BarChart2 className="w-6 h-6 text-yellow-500" />,
    },
    {
      id: 6,
      name: "Google Drive",
      icon: <Folder className="w-6 h-6 text-green-500" />,
    },
  ];

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

  return (
    <div className="relative inline-block" ref={cardRef}>
      <div
        className={`text-lg text-purple-500 p-2 rounded transition-all duration-300 ${
          isCardVisible ? "bg-gray-200" : "hover:bg-gray-100"
        }`}
        onClick={() => setIsCardVisible((prev) => !prev)}
        onMouseEnter={() => setIsNameVisible(true)}
        onMouseLeave={() => setIsNameVisible(false)}
      >
        <AppWindow />
      </div>

      {isCardVisible && (
        <div className="absolute right-12 -top-32 bg-white text-gray-800 rounded-lg p-4 shadow-lg w-72 z-10">
          {/* Container for app templates */}
          <div className="space-y-3">
            {apps.map((app) => (
              <div
                key={app.id}
                className="bg-gray-200 hover:bg-purple-50 rounded-lg p-3 transition-all duration-300 hover:shadow-md cursor-pointer"
              >
                <button className="flex items-center space-x-3 w-full text-gray-800 font-medium hover:text-purple-600">
                  {app.icon}
                  <span>{app.name}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {isNameVisible && (
        <span className="absolute whitespace-nowrap right-12 top-2 bg-black text-white text-xs font-bold rounded-md px-3 py-1 opacity-100 transition-opacity duration-300">
          Embedded Apps & Webpages
        </span>
      )}
    </div>
  );
};

export default PdfMenu;
