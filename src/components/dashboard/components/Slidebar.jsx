import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileLines,
  faUserGroup,
  faGlobe,
  faStar,
  faCirclePlus,
  faWandMagicSparkles,
  faBookOpen,
  faPalette,
  faFont,
  faTrash,
  faGear,
  faMessage,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import { faIdBadge } from "@fortawesome/free-regular-svg-icons";

function Navbar({setActiveComponent,activeComponent}) {
  
  const [searchTerm, setSearchTerm] = useState("");
  const handleInputChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      console.log("Search term:", searchTerm);
    }
  };

  return (
    <div className="h-screen w-80 p-5 overflow-y-auto border-r border-gray-300">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-purple-600 text-white text-lg">
            S
          </div>
          <span className="text-gray-800 font-semibold">Sau Workspace</span>
        </div>
        <div className="flex items-center border border-gray-300 rounded px-2 py-1">
          <FontAwesomeIcon icon={faMagnifyingGlass} className="text-gray-500" />
          <input
            type="text"
            placeholder="Jump to"
            value={searchTerm}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            className="flex-grow outline-none px-2 text-gray-700"
          />
        </div>
      </div>
      <nav className="mt-4 space-y-2 text-gray-700">
        {[  
          { icon: faFileLines, label: "Gammas" },
          { icon: faUserGroup, label: "Shared with you" },
          { icon: faGlobe, label: "Sites" },
          { icon: faStar, label: "Ai Images" },
        ].map((item, index) => (
          <div
            key={index}
            className={`flex items-center gap-2 px-2 py-2 rounded-md cursor-pointer 
              ${
                activeComponent === item.label
                  ? "bg-blue-600 text-white"
                  : "hover:bg-gray-100 hover:text-violet-600"
              }`}
            onClick={() => setActiveComponent(item.label)}
          >
            <FontAwesomeIcon icon={item.icon} />
            {item.label}
          </div>
        ))}
      </nav>
      <div className="mt-6">
        <div className="flex justify-between items-center font-semibold text-gray-800">
          Folder <FontAwesomeIcon icon={faCirclePlus} />
        </div>
        <div className="mt-2 p-3 bg-gray-100 text-sm text-gray-600 rounded-md">
          Organize your gammas by topic and share them with your team
          <br />
          <a href="#" className="text-blue-500">Create or join a folder</a>
        </div>
      </div>
      <div className="mt-6 border-y border-gray-300 py-2">
        {[  
          { icon: faWandMagicSparkles, label: "Templates" },
          { icon: faBookOpen, label: "Inspiration" },
          { icon: faPalette, label: "Themes" },
          { icon: faFont, label: "Custom Font" },
          { icon: faTrash, label: "Trash" },
        ].map((item, index) => (
          <div
            key={index}
            className={`flex items-center gap-2 px-2 py-2 rounded-md cursor-pointer 
              ${
                activeComponent === item.label
                  ? "bg-blue-600 text-white"
                  : "hover:bg-gray-100 hover:text-violet-600"
              }`}
            onClick={() => setActiveComponent(item.label)}
          >
            <FontAwesomeIcon icon={item.icon} />
            {item.label}
          </div>
        ))}
      </div>
      <div className="mt-6">
        {[  
          { icon: faGear, label: "Settings & Members" },
          { icon: faIdBadge, label: "Contact Support" },
          { icon: faMessage, label: "Share Feedback" },
        ].map((item, index) => (
          <div
            key={index}
            className={`flex items-center gap-2 px-2 py-2 rounded-md cursor-pointer 
              ${
                activeComponent === item.label
                  ? "bg-blue-600 text-white"
                  : "hover:bg-gray-100 hover:text-violet-600"
              }`}
            onClick={() => setActiveComponent(item.label)}
          >
            <FontAwesomeIcon icon={item.icon} />
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Navbar;
