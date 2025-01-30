import React  from "react";
import { Folders } from "lucide-react";
import { Link } from "react-router-dom";
const Gammas = () => {
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

        {/* Image Placeholder */}
        <div className="w-12 h-12 bg-gray-300 rounded-full overflow-hidden">
          <img 
            src="https://via.placeholder.com/48" 
            alt="Gamma" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="p-3">
        <Link to="/page" className="border p-2 bg-white mr-2">+ New Gamma Blank</Link>
        <Link to="/generate-ai" className="border p-2 bg-white mr-2">+ New Gamma Blank</Link>

      </div>
    </div>
  );
};

export default Gammas;
