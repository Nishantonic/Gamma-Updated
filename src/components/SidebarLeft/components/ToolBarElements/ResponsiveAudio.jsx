import React, { useState } from "react";

const ResponsiveAudio = ({ initialAudio = null, onDelete }) => {
  const [preview, setPreview] = useState(initialAudio);
  const [audioSize, setAudioSize] = useState({ width: 400, height: 100 });
  const [isResizing, setIsResizing] = useState(false);
  const [initialMousePos, setInitialMousePos] = useState({ x: 0, y: 0 });
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0 });
  const [isUploading, setIsUploading] = useState(!initialAudio);
  const [showMenu, setShowMenu] = useState(false);

  const handleAudioPreview = (e) => { 
    const file = e.target.files[0];
    if (file && file.type.startsWith("audio/")) {
      const audioURL = URL.createObjectURL(file);
      setPreview(audioURL);
      setIsUploading(false);
    }
  };

  const toggleMenu = () => setShowMenu((prev) => !prev);

  const handleDelete = () => {
    if (onDelete) {
      onDelete(); // Call parent-provided delete function
    }
  };

  const handleMouseDown = (e) => {
    setIsResizing(true);
    setInitialMousePos({ x: e.clientX, y: e.clientY });
    setInitialSize({ width: audioSize.width, height: audioSize.height });
  };

  const handleMouseMove = (e) => {
    if (isResizing) {
      const dx = e.clientX - initialMousePos.x;
      const dy = e.clientY - initialMousePos.y;
      setAudioSize({
        width: Math.max(initialSize.width + dx, 100),
        height: Math.max(initialSize.height + dy, 100),
      });
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  return (
    <span
      className="relative flex justify-center items-center w-full rounded-lg bg-[#2a2438] overflow-hidden group"
      style={{ 
        width: `${audioSize.width}px`, 
        height: `${audioSize.height}px` 
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

      {preview ? (
        <audio 
          src={preview} 
          controls 
          className="w-full object-cover rounded-lg"
        >
          Your browser does not support the audio tag.
        </audio>
      ) : (
        <div
          className="flex items-center justify-center w-full h-full text-[#9d8ba7] cursor-pointer"
          onClick={() => setIsUploading(true)}
        >
          <span>Click to Upload</span>
        </div>
      )}

      {isUploading && (
        <input
          type="file"
          accept="audio/*"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleAudioPreview}
        />
      )}
      
      <div 
        className="absolute right-0 bottom-0 w-6 h-6 bg-white cursor-se-resize hover:bg-gray-200"
        onMouseDown={handleMouseDown}
      />
    </span>
  );
};

export default ResponsiveAudio;
