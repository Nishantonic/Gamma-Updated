import React, { useState } from "react";

const ResponsiveVideo = ({ initialVideo = null, onDelete }) => {
  const [preview, setPreview] = useState(initialVideo);
  const [videoSize, setVideoSize] = useState({ width: 400, height: 300 });
  const [isResizing, setIsResizing] = useState(false);
  const [initialMousePos, setInitialMousePos] = useState({ x: 0, y: 0 });
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0 });
  const [isUploading, setIsUploading] = useState(!initialVideo);
  const [showMenu, setShowMenu] = useState(false);

  // Handle video preview
  const handleVideoPreview = (e) => {
    const file = e.target.files[0]; 
    if (file && file.type.startsWith("video/")) {
      const videoURL = URL.createObjectURL(file);
      setPreview(videoURL);
      setIsUploading(false); // Switch to video playback mode after upload
    }
  };

  // Toggle the visibility of the menu
  const toggleMenu = () => setShowMenu((prev) => !prev);

  // Handle delete action
  const handleDelete = () => {
    if (onDelete) {
      onDelete(); // Call parent-provided delete function
    }
  };

  // Handle mouse drag for resizing
  const handleMouseDown = (e) => {
    setIsResizing(true);
    setInitialMousePos({ x: e.clientX, y: e.clientY });
    setInitialSize({ width: videoSize.width, height: videoSize.height });
  };

  // Handle resizing the video
  const handleMouseMove = (e) => {
    if (isResizing) {
      const dx = e.clientX - initialMousePos.x;
      const dy = e.clientY - initialMousePos.y;
      setVideoSize({
        width: Math.max(initialSize.width + dx, 200),
        height: Math.max(initialSize.height + dy, 150),
      });
    }
  };

  // Stop resizing on mouse up
  const handleMouseUp = () => {
    setIsResizing(false);
  };

  // Trigger upload on click if no video exists
  const handleUploadClick = () => {
    if (!preview) {
      setIsUploading(true); // Allow upload if no video is uploaded yet
    }
  };

  return (
    <span
      className="relative flex justify-center items-center w-full rounded-lg bg-[#2a2438] overflow-hidden group"
      style={{
        width: `${videoSize.width}px`,
        height: `${videoSize.height}px`,
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Three-dot menu */}
      <div className="absolute top-2 left-2">
        <button
          className="text-white bg-gray-600 rounded-full p-1 hover:bg-gray-700"
          onClick={toggleMenu}
        >
          ⋮
        </button>
        {showMenu && (
          <div className="absolute top-full mt-1 left-0 bg-white text-black rounded shadow-lg z-10">
            <button
              className="block px-4 py-2 text-left w-full hover:bg-gray-200"
              onClick={handleDelete}
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Video Player */}
      {preview ? (
        <video
          src={preview}
          controls
          className="w-full h-full p-4 object-cover rounded-lg"
          onClick={(e) => e.stopPropagation()} // Prevent click events on the video from triggering upload
        >
          Your browser does not support the video tag.
        </video>
      ) : (
        <div
          className="flex items-center justify-center w-12 h-full text-[#9d8ba7] cursor-pointer"
          onClick={handleUploadClick}
        >
          <span>Click to Upload</span>
        </div>
      )}

      {/* File input for video upload */}
      {isUploading && (
        <input
          type="file"
          accept="video/*"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleVideoPreview}
        />
      )}

      {/* Resizing handle */}
      <div
        className="absolute right-0 bottom-0 w-6 h-6 bg-white cursor-se-resize hover:bg-gray-200"
        onMouseDown={handleMouseDown}
      />
    </span>
  );
};

export default ResponsiveVideo;
