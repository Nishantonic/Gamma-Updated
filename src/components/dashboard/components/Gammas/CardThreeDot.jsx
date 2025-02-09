import { Trash2, MoreVertical, Edit3, Share, Download } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useState } from "react";

const CardThreeDot = ({ slide, onClick, onDelete, user }) => {
  const [isShareOpen, setIsShareOpen] = useState(false);

  const handleShareClick = (e) => {
    e.stopPropagation();
    setIsShareOpen(true);
  };

  const handleCloseClick = (e) => {
    e.stopPropagation();
    setIsShareOpen(false);
  };

  return (
    <>

      

      {/* Dropdown Menu */}
      <div className="absolute bottom-2 right-2">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button onClick={(e) => e.stopPropagation()} className="p-2 rounded-full hover:bg-gray-200 transition">
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content
            align="end"
            sideOffset={5}
            className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg"
          >
            <DropdownMenu.Item
              className="px-4 py-2 flex items-center space-x-3 hover:bg-gray-100 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                alert("Editing...");
              }}
            >
              <Edit3 className="w-4 h-4 text-gray-600" />
              <span>Edit</span>
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className="px-4 py-2 flex items-center space-x-3 hover:bg-gray-100 cursor-pointer"
              onClick={handleShareClick}
            >
              <Share className="w-4 h-4 text-gray-600" />
              <span>Share</span>
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className="px-4 py-2 flex items-center space-x-3 hover:bg-gray-100 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                alert("Exporting...");
              }}
            >
              <Download className="w-4 h-4 text-gray-600" />
              <span>Export</span>
            </DropdownMenu.Item>

            <DropdownMenu.Item
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="px-4 py-2 flex items-center space-x-3 hover:bg-gray-100 cursor-pointer"
            >
              <Trash2 className="w-4 h-4 text-gray-600" />
              <span>Delete</span>
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </div>

      {/* Share Modal */}
      {isShareOpen && (
        <div
          className="absolute top-0 left-full ml-4 bg-white rounded-lg shadow-lg w-96 z-10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            className="absolute top-2 right-2 p-1 text-gray-600 hover:text-gray-800"
            onClick={handleCloseClick}
          >
            ✖
          </button>
          {/* Modal Content */}
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">Share this content</h3>
            <hr className="mb-4" />
            {/* Share Options */}
            <div className="flex flex-wrap gap-4 text-gray-800 mb-4">
              <button className="flex items-center space-x-2 hover:bg-gray-100 p-2 rounded">
                <span>Collaboration</span>
              </button>
              <button className="flex items-center space-x-2 hover:bg-gray-100 p-2 rounded">
                <span>Share</span>
              </button>
              <button className="flex items-center space-x-2 hover:bg-gray-100 p-2 rounded">
                <span>Export</span>
              </button>
              <button className="flex items-center space-x-2 hover:bg-gray-100 p-2 rounded">
                <span>Embed</span>
              </button>
            </div>
            {/* Input Field */}
            <input
              type="text"
              placeholder="Add emails or people"
              className="mb-4 p-2 border rounded-lg w-full"
            />
            {/* Workspace Members */}
            <div className="flex items-center justify-between mb-4">
              <p>Workspace members</p>
              <p>No access</p>
            </div>
            {/* User Info */}
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center">
                {user?.email[0]}
              </div>
              <p className="ml-2">{user?.name}</p>
              <p className="ml-auto">Full Access</p>
            </div>
            {/* Done Button */}
            <button
              type="button"
              className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition"
              onClick={handleCloseClick}
            >
              Done
            </button>
          </div>
        </div>
      )}
    
    </>
  );
};

export default CardThreeDot;