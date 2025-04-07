import React, { useState, useRef, useEffect, useContext } from "react";
import {
  AppWindow,
  Globe,
  Figma,
  Twitter,
  BarChart2,
  Folder,
} from "lucide-react";
import { DragContext } from "../DragContext";
import { motion } from "framer-motion";

const PdfMenu = () => {
  const [isCardVisible, setIsCardVisible] = useState(false);
  const [isNameVisible, setIsNameVisible] = useState(false);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [url, setUrl] = useState("");
  const cardRef = useRef(null);
  const popupRef = useRef(null);
  const { setDraggedElement } = useContext(DragContext);

  const apps = [
    { id: 1, name: "Instagram", icon: <Globe className="w-6 h-6 text-pink-500" /> },
    { id: 2, name: "Figma", icon: <Figma className="w-6 h-6 text-purple-600" /> },
    { id: 3, name: "Gamma", icon: <Globe className="w-6 h-6 text-blue-500" /> },
    { id: 4, name: "Twitter", icon: <Twitter className="w-6 h-6 text-blue-400" /> },
    { id: 5, name: "Power BI", icon: <BarChart2 className="w-6 h-6 text-yellow-500" /> },
    { id: 6, name: "Google Drive", icon: <Folder className="w-6 h-6 text-green-500" /> },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cardRef.current && !cardRef.current.contains(event.target)) {
        setIsCardVisible(false);
      }
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setIsPopupVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAppClick = (app) => {
    setSelectedApp(app);
    setIsPopupVisible(true);
    setUrl("");
  };

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    if (url) {
      const draggedData = {
        id: `${selectedApp.name.toLowerCase()}-${Date.now()}`,
        type: "embedded-url",
        url: url,
        name: selectedApp.name,
        styles: { width: 500, height: 500 },
      };
      setDraggedElement(draggedData);
      setTimeout(() => {
        setIsPopupVisible(false);
      }, 100);
    }
  };

  const handleDragStart = (e) => {
    const draggedData = {
      id: `${selectedApp.name.toLowerCase()}-${Date.now()}`,
      type: "embedded-url",
      url: url,
      name: selectedApp.name,
      styles: { width: 500, height: 500 },
    };
    e.dataTransfer.setData("application/json", JSON.stringify(draggedData));
    setDraggedElement(draggedData);
  };

  // Animation variants
  const menuVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, x: 20, transition: { duration: 0.2 } },
  };

  const popupVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.2, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } },
  };

  const iconVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    pulse: { scale: [1, 1.1, 1], transition: { duration: 1, repeat: Infinity } },
  };

  return (
    <div className="relative inline-block" ref={cardRef}>
      <motion.div
        className={`text-lg text-purple-500 p-2 rounded transition-all duration-300 cursor-pointer ${
          isCardVisible ? "bg-gray-200" : "hover:bg-gray-100"
        }`}
        onClick={() => setIsCardVisible((prev) => !prev)}
        onMouseEnter={() => setIsNameVisible(true)}
        onMouseLeave={() => setIsNameVisible(false)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <AppWindow />
      </motion.div>

      {isCardVisible && (
        <motion.div
          className="absolute right-12 -top-32 bg-white text-gray-800 rounded-lg p-4 shadow-lg w-72 z-10 border border-gray-200"
          variants={menuVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div className="space-y-3">
            {apps.map((app) => (
              <motion.div
                key={app.id}
                className="bg-gray-200 hover:bg-purple-50 rounded-lg p-3 transition-all duration-300 cursor-pointer"
                whileHover={{ scale: 1.03, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAppClick(app)}
              >
                <div className="flex items-center space-x-3 w-full text-gray-800 font-medium hover:text-purple-600">
                  {app.icon}
                  <span>{app.name}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {isNameVisible && (
        <motion.span
          className="absolute whitespace-nowrap right-12 top-2 bg-black text-white text-xs font-bold rounded-md px-3 py-1"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          Embedded Apps & Webpages
        </motion.span>
      )}

      {isPopupVisible && (
        <motion.div
          className="absolute right-12 top-0 bg-white text-gray-800 rounded-lg p-4 shadow-lg w-72 z-20 border border-gray-200"
          variants={popupVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          ref={popupRef}
        >
          <h3 className="text-lg font-medium text-gray-700 mb-3">
            Enter {selectedApp?.name} URL
          </h3>
          <form onSubmit={handleUrlSubmit}>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={`Paste ${selectedApp?.name} URL here`}
              className="w-full p-2 border border-gray-300 rounded-md mb-3 focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all duration-200"
              required
            />
            {url && (
              <motion.div
                className="mb-3 p-2 bg-gray-100 rounded-md flex justify-center items-center cursor-move"
                draggable
                onDragStart={handleDragStart}
                variants={iconVariants}
                initial="hidden"
                animate="visible"
                whileHover="pulse"
              >
                {selectedApp?.icon}
              </motion.div>
            )}
            <div className="flex justify-end space-x-2">
              <motion.button
                type="button"
                onClick={() => setIsPopupVisible(false)}
                className="px-3 py-1 bg-gray-200 text-gray-800 rounded-md"
                whileHover={{ scale: 1.05, backgroundColor: "#e5e7eb" }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                className="px-3 py-1 bg-purple-600 text-white rounded-md"
                whileHover={{ scale: 1.05, backgroundColor: "#7c3aed" }}
                whileTap={{ scale: 0.95 }}
              >
                Submit
              </motion.button>
            </div>
          </form>
        </motion.div>
      )}
    </div>
  );
};

export default PdfMenu;