import React from 'react'
import { Folders } from "lucide-react";
import { CircleUserRound } from 'lucide-react';
import { Star } from 'lucide-react';

const GammaFunction = () => {
  return (
    <div className="flex justify-between items-center p-4  bg-transparent shadow-sm ml-2">
    {/* Left Section */}
    <div className="flex gap-6 text-gray-700 font-medium">
        <div className="flex items-center gap-2 cursor-pointer hover:text-blue-600 transition">
            <Folders className="w-5 h-5" /> <span>All</span>
        </div>
        <div className="flex items-center gap-2 cursor-pointer hover:text-blue-600 transition">
            <CircleUserRound className="w-5 h-5" /> <span>Created by you</span>
        </div>
        <div className="flex items-center gap-2 cursor-pointer hover:text-blue-600 transition">
            <Star className="w-5 h-5" /> <span>Favorites</span>
        </div>
    </div>

    {/* Right Section */}
    <div className="flex gap-4 text-gray-600">
        <div className="cursor-pointer px-3 py-1 rounded-md hover:bg-gray-200 transition">Grid</div>
        <div className="cursor-pointer px-3 py-1 rounded-md hover:bg-gray-200 transition">List</div>
    </div>
</div>

  )
}

export default GammaFunction