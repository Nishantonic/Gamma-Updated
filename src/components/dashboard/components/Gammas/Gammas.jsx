import React  from "react";
import { useState } from "react";
import { Folders, Coins , Bell} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import GammaFunction from "./GammaFunction";
import Card from "./Card";


const Gammas = ({credits,setCradits}) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleAIGenerate = (e) => {
    e.preventDefault();
    if (credits >= 40) {
      navigate('/generate-ai');
    }
  };
  return (
    <div className="w-full ">
      <div className="flex items-center justify-between">
        {/* Icon + Title */}
        <div className="flex items-center gap-1">
          <div className="p-1 ">
            <Folders className="w-6 h-6 text-gray-700" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Gammas</h3>
        </div>
        
        <div className="flex items-center gap-4 text-gray-600">
          <div className="flex items-center gap-1 cursor-pointer hover:text-blue-600 transition">
          <Coins className="w-6 h-6 text-gray-700" /> 
          <span>{credits} Credits</span>
          </div>
            
          <div className="relative">
            {/* Bell Icon - Click to Toggle */}
            <div 
                className="p-2 cursor-pointer rounded-full hover:bg-gray-200 transition" 
                onClick={() => setIsOpen(!isOpen)}
            >
                <Bell className="w-6 h-6 text-gray-700" />
            </div>

            {/* Notification Popup */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
                    <p className="text-gray-500 text-sm text-center">No notifications</p>
                </div>
            )}
        </div>
          

        {/* Image Placeholder */}
        <div className="w-12 h-12 bg-gray-300 rounded-full overflow-hidden">
          


          <img 
            src="https://via.placeholder.com/48" 
            alt="Gamma" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      </div>

      <div className="p-4 bg-gray-100 rounded-md">
        <Link
          to="/page"
          className="border border-gray-300 bg-white text-gray-700 px-4 py-2 rounded-md shadow-sm hover:bg-gray-200 transition-all duration-200 mr-3"
        >
          + New Gamma Blank
        </Link>
        
        {credits >= 40 ? (
          <button
            onClick={handleAIGenerate}
            className="border border-gray-300 bg-white text-gray-700 px-4 py-2 rounded-md shadow-sm hover:bg-gray-200 transition-all duration-200"
          >
            + Generate With AI
          </button>
        ) : (
          <div className="group relative inline-block">
          <button
            disabled
            className="border border-gray-300 bg-gray-100 text-gray-400 px-4 py-2 rounded-md shadow-sm cursor-not-allowed"
          >
            + Generate With AI
          </button>
          {/* Tooltip with transition */}
          <div className="absolute  z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg shadow-sm">
            Insufficient credits (40 required)
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-3 h-2 bg-red-50 border-b border-r border-red-100 rotate-45"></div>
          </div>
        </div>
        )}
      </div>


      <GammaFunction/>
      <Card 
    image="https://via.placeholder.com/150" 
    name="Generated Card" 
    time="Generated 2 mins ago" 
/>

    </div>
  );
};

export default Gammas;
