// import React from "react";

// const Help = () => {
//   return (
//     <div className="fixed bottom-4 right-4 group">
//       <div className="text-black h-10 w-10 cursor-pointer hover:text-purple-500 transition border rounded-full shadow-lg flex items-center justify-center  text-2xl">
//         ?
//       </div>

//       <span className="absolute bottom-2 right-11 bg-black text-white text-xs rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap font-bold">
//         Help
//       </span>
//     </div>
//   );
// };

// export default Help;

import React, { useState, useRef, useEffect } from "react";
import {
  Globe,
  HelpCircle,
  Keyboard,
  Map,
  Search,
  MessageSquare,
  Mail,
} from "lucide-react";

const Help = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [language, setLanguage] = useState("English");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownOpen(false);
    }
  };

  useEffect(() => {
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleLanguageChange = () => {
    setModalOpen(true);
  };

  const handleSave = () => {
    setLanguage(selectedLanguage);
    setModalOpen(false);
  };

  const handleCancel = () => {
    setSelectedLanguage(language);
    setModalOpen(false);
  };

  return (
    <div className="fixed bottom-5 right-5">
      <button
        className="bg-white border-2 border-gray-300 rounded-full w-10 h-10 text-lg flex items-center justify-center text-purple-500 hover:bg-gray-100"
        onClick={toggleDropdown}
      >
        <HelpCircle className="w-6 h-6" />
      </button>
      {dropdownOpen && (
        <div
          className="flex flex-col absolute bottom-14 right-0 bg-white shadow-lg z-10 rounded p-4 border border-gray-300"
          ref={dropdownRef}
        >
          <div className="mb-2 border-b border-gray-300 whitespace-nowrap">
            <button className="text-black py-2 px-4 flex items-center w-full bg-transparent border-none cursor-pointer text-left hover:bg-gray-100">
              <Keyboard className="w-5 h-5 mr-2" />
              Keyboard shortcuts
            </button>
            <button className="text-black py-2 px-4 flex items-center w-full bg-transparent border-none cursor-pointer text-left hover:bg-gray-100">
              <Map className="w-5 h-5 mr-2" />
              Take the editor tour
            </button>
            <button className="text-black py-2 px-4 flex items-center w-full bg-transparent border-none cursor-pointer text-left hover:bg-gray-100">
              <HelpCircle className="w-5 h-5 mr-2" />
              What's new in Gamma
            </button>
          </div>
          <div className="mb-2 border-b border-gray-300 whitespace-nowrap">
            <button className="text-black py-2 px-4 flex items-center w-full bg-transparent border-none cursor-pointer text-left hover:bg-gray-100">
              <Search className="w-5 h-5 mr-2" />
              Help center
            </button>
            <button className="text-black py-2 px-4 flex items-center w-full bg-transparent border-none cursor-pointer text-left hover:bg-gray-100">
              <MessageSquare className="w-5 h-5 mr-2" />
              Contact support
            </button>
            <button className="text-black py-2 px-4 flex items-center w-full bg-transparent border-none cursor-pointer text-left hover:bg-gray-100">
              <Mail className="w-5 h-5 mr-2" />
              Share feedback
            </button>
          </div>
          <div className="mt-2 whitespace-nowrap">
            <button
              className="text-black py-2 px-4 flex items-center w-full bg-transparent border-none cursor-pointer text-left hover:bg-gray-100"
              onClick={handleLanguageChange}
            >
              <span className="flex items-center">
                <Globe className="w-5 h-5 mr-2" /> {language}
              </span>
            </button>
          </div>
        </div>
      )}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg w-96 border border-gray-300">
            <h2 className="text-xl font-semibold text-gray-800">
              Change language
            </h2>
            <p className="mt-4 mb-2 text-gray-800">Account language</p>
            <div className="mb-4">
              <select
                className="block w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
              >
                <option value="English">English</option>
                <option value="French">French</option>
                <option value="Spanish">Spanish</option>
                <option value="German">German</option>
                <option value="Chinese">Chinese</option>
                <option value="Japanese">Japanese</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                className="text-blue-500 hover:bg-blue-100 px-4 py-2 rounded"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                className="text-white bg-blue-500 hover:bg-blue-700 px-4 py-2 rounded"
                onClick={handleSave}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Help;
