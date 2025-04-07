import { fileToBase64 } from "@/components/utils/fileToBase64";
import React, { useEffect, useState } from "react";

const ResponsiveImage = ({ initialData = null, initialStyles = { width: 300, height: 210 }, onUpdate, onDelete }) => {
  const [preview, setPreview] = useState(initialData);
  const [imageSize, setImageSize] = useState(initialStyles);
  const [isResizing, setIsResizing] = useState(false);
  const [initialMousePos, setInitialMousePos] = useState({ x: 0, y: 0 });
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0 });
  const [isUploading, setIsUploading] = useState(!initialData); // Show upload if no initial data

  const handleImagePreview = async (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      try {
        const base64Data = await fileToBase64(file);
        setPreview(base64Data);
        setIsUploading(false); // Hide upload input after successful upload
        onUpdate?.(base64Data, imageSize);
      } catch (error) {
        console.error("Error converting image to base64:", error);
      }
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
      const newSize = {
        width: Math.max(initialSize.width + dx, 100),
        height: Math.max(initialSize.height + dy, 100),
      };
      setImageSize(newSize);
      onUpdate?.(preview, newSize);
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  // Reset preview and upload state when initialData changes
  useEffect(() => {
    setPreview(initialData);
    setImageSize(initialStyles);
    setIsUploading(!initialData); // Show "Click to Upload" if no initialData
  }, [initialData, initialStyles]);

  // Function to handle deletion (only available when no image is uploaded)
  const handleDelete = () => {
    if (!preview && onDelete) {
      onDelete(); // Call onDelete prop to remove the component
    }
  };

  // Function to clear image and show upload again
  const handleClearImage = () => {
    setPreview(null);
    setIsUploading(true);
    onUpdate?.(null, imageSize); // Notify parent of cleared image
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
        <>
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover rounded-lg"
          />
          {/* Clear button (available only when image is present) */}
          <button
            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleClearImage}
          >
            X
          </button>
        </>
      ) : (
        <div
          className="flex flex-col items-center justify-center w-full h-full text-[#9d8ba7] cursor-pointer"
          onClick={() => setIsUploading(true)}
        >
          <span>Click to Upload</span>
          {/* Delete button (visible only when no image is uploaded) */}
          {onDelete && (
            <button
            className="mt-2 bg-red-500 text-white px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity 
            hover:bg-red-600 active:bg-red-700 shadow-md transform hover:scale-105 transition-all duration-200"
            onClick={handleDelete}
          >
            🗑 Delete
          </button>
          
          )}
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