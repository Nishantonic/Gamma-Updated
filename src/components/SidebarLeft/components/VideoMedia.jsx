import React, { useState, useRef, useEffect, useContext } from "react";
import { Film, Video, Music } from "lucide-react";
import { DragContext } from "../DragContext";
import ResponsiveVideo from "./ToolBarElements/ResponsiveVideo";
import ResponsiveAudio from "./ToolBarElements/ResponsiveAudio";

const VideoMedia = () => {
  const [isCardVisible, setIsCardVisible] = useState(false);
  const [isNameVisible, setIsNameVisible] = useState(false);
  const { setDraggedElement } = useContext(DragContext);
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
  const handleDragStart = (event, cardData) => {
    setDraggedElement(cardData);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", "dragged-element");
  };


  return (
    <div className="relative group" ref={cardRef}>
      <div
        className={`text-lg text-purple-500 p-1 rounded transition-all duration-300 ${
          isCardVisible ? "bg-gray-200" : "hover:bg-gray-100"
        }`}
        onClick={() => setIsCardVisible((prev) => !prev)}
        onMouseEnter={() => setIsNameVisible(true)}
        onMouseLeave={() => setIsNameVisible(false)}
      >
        <Film />
      </div>

      {isCardVisible && (
        <div className="absolute whitespace-nowrap right-11 top-0 bg-white text-black rounded-lg p-4 shadow-lg w-80 h-auto overflow-auto">
          {/* Container for media templates */}
          <h3 className="text-gray-600 font-semibold text-sm mb-4">
            Videos and Media
          </h3>

          <div className="space-y-4 pb-2" 
             draggable
             onDragStart={(e) =>
               handleDragStart(e, { template: <ResponsiveVideo /> })
             }
          >
            {/* Upload Video */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 hover:shadow-md transform transition-all duration-300 hover:scale-105">
              <label
                htmlFor="upload-video"
                className="flex items-center space-x-3 w-full text-gray-800 font-medium cursor-pointer hover:text-gray-600"
              >
                <div className="w-8 h-8 bg-purple-100 text-purple-500 flex items-center justify-center rounded-md">
                  <Video className="w-5 h-5" />
                </div>
                <span>Upload Video</span>
              </label>
              
            </div>

           
          </div>

          <div className="space-y-4" 
             draggable
             onDragStart={(e) =>
               handleDragStart(e, { template: <ResponsiveAudio /> })
             }
          >
            {/* Upload Audio */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 hover:shadow-md transform transition-all duration-300 hover:scale-105">
              <label
                htmlFor="upload-video"
                className="flex items-center space-x-3 w-full text-gray-800 font-medium cursor-pointer hover:text-gray-600"
              >
                <div className="w-8 h-8 bg-purple-100 text-purple-500 flex items-center justify-center rounded-md">
                  <Music className="w-5 h-5" />
                </div>
                <span>Upload Audio</span>
              </label>
              
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
