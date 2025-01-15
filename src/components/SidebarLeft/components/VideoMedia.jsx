import React, { useState, useRef, useEffect } from "react";
import { Film, Video, Music } from "lucide-react";

const VideoMedia = () => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isNameVisible, setIsNameVisible] = useState(false);
  const cardRef = useRef(null);

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
        <Film />
      </div>

      {isDropdownVisible && (
        <div className="absolute whitespace-nowrap right-11 top-0 bg-gray-500 text-black rounded-md p-2 shadow-md w-80 h-38 overflow-auto">
          {/* Container for media templates */}
          <div className="space-y-4">
            <div className="border-b pb-2 last:border-b-0 bg-gray-100 rounded transform transition-all duration-300 hover:scale-105 hover:shadow-2xl p-2">
              <button className="flex items-center space-x-2 text-black p-2 hover:bg-gray-200 rounded">
                <Video className="w-5 h-5" />
                <span>Upload Video</span>
              </button>
            </div>
            <div className="border-b pb-2 last:border-b-0 bg-gray-100 rounded transform transition-all duration-300 hover:scale-105 hover:shadow-2xl p-2">
              <button className="flex items-center space-x-2 text-black p-2 hover:bg-gray-200 rounded">
                <Music className="w-5 h-5" />
                <span>Upload Audio</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {isNameVisible && (
        <span className="absolute whitespace-nowrap right-11 top-1/2 -translate-y-1/2 bg-black text-white text-xs font-bold rounded-md px-2 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          Video & Media
        </span>
      )}
    </div>
  );
};

export default VideoMedia;
