import React, { useState } from "react";

const ResponsiveImage = () => {
  const [preview, setPreview] = useState(null);
  const [imageSize, setImageSize] = useState({ width: 300, height: 210 });
  const [isResizing, setIsResizing] = useState(false);
  const [initialMousePos, setInitialMousePos] = useState({ x: 0, y: 0 });
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0 });

  const handleImagePreview = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
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
      {preview ? (
        <img
          src={preview}
          alt="Preview"
          className="w-full h-full object-cover rounded-lg"
        />
      ) : (
        <div className="flex items-center justify-center w-12 h-full text-[#9d8ba7]">
          <span>Drag or Click to Upload</span>
        </div>
      )}

      <input
        type="file"
        accept="image/*"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={handleImagePreview}
      />

      <div
        className="absolute right-0 bottom-0 w-6 h-6 bg-white cursor-se-resize hover:bg-gray-200"
        onMouseDown={handleMouseDown}
      />
    </span>
  );
};

export default ResponsiveImage;
