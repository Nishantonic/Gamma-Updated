import React, { useState } from "react";

const ResponsiveImage = ({ initialImage = null, onDelete }) => {
  const [preview, setPreview] = useState(initialImage);
  const [imageSize, setImageSize] = useState({ width: 300, height: 210 });
  const [isResizing, setIsResizing] = useState(false);
  const [initialMousePos, setInitialMousePos] = useState({ x: 0, y: 0 });
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0 });
  const [isUploading, setIsUploading] = useState(!initialImage);
  const [showMenu, setShowMenu] = useState(false);

  const handleImagePreview = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const imageURL = URL.createObjectURL(file);
      setPreview(imageURL);
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
    setInitialSize({ width: imageSize.width, height: imageSize.height });
  };

  const handleMouseMove = (e) => {
    if (isResizing) {
      const dx = e.clientX - initialMousePos.x;
      const dy = e.clientY - initialMousePos.y;
      setImageSize({
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
        width: `${imageSize.width}px`,
        height: `${imageSize.height}px`,
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
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
        <img
          src={preview}
          alt="Preview"
          className="w-full h-full object-cover rounded-lg"
        />
      ) : (
        <div className="flex items-center justify-center w-12 h-full text-[#9d8ba7]"
          onClick={() => setIsUploading(true)}
        >
          <span>Click to Upload</span>
        </div>
      )}

      {isUploading && (
        <input
          type="file"
          accept="image/*"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleImagePreview}
        />
      )}

      <div
        className="absolute right-0 bottom-0 w-6 h-6 bg-white cursor-se-resize hover:bg-gray-200"
        onMouseDown={handleMouseDown}
      />
    </span>
  );
};

export default ResponsiveImage;
