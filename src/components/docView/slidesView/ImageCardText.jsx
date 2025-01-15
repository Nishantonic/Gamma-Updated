import React, { useState, useContext } from "react";
import { CardMenu } from "./Menu/CardMenu";
import TitleInput from "./CardComponents/TitleInput";
import ParagraphInput from "./CardComponents/ParagraphInput";
import { DragContext } from "@/components/SidebarLeft/DragContext";

function ImageCardText({ children, ...props }) {
  const [preview, setPreview] = useState(null);
  const [imageSize, setImageSize] = useState({ width: 300, height: 210 });
  const [isResizing, setIsResizing] = useState(false);
  const [initialMousePos, setInitialMousePos] = useState({ x: 0, y: 0 });
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0 });
  const [replacedTemplate, setReplacedTemplate] = useState(null);
    const [droppedItems, setDroppedItems] = useState([]);
  
  const { draggedElement } = useContext(DragContext);

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
  const handleDrop = (event) => {
    event.preventDefault();
    setDroppedItems([...droppedItems, draggedElement]);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  if (replacedTemplate) {
    return <div>{replacedTemplate}</div>;
  }

  return (
    <div
      className="flex flex-col items-center mt-2 mb-2"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div
        className="min-h-screen  w-full md:w-[60vw] md:min-h-[20vh] rounded-lg bg-[#342c4e] p-6 relative"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className="absolute top-4 left-11">
          <CardMenu />
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <div
            className="relative flex justify-center items-center w-full md:w-[32%] rounded-lg bg-[#2a2438] overflow-hidden group"
            style={{
              width: `${imageSize.width}px`,
              height: `${imageSize.height}px`,
            }}
          >
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <div className="flex items-center justify-center w-12 h-full text-[#9d8ba7]">
                {/* Placeholder Icon */}
              </div>
            )}

            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <span className="text-white text-sm font-medium">Click to Upload Image</span>
            </div>

            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleImagePreview}
            />

            <div
              className="absolute right-0 bottom-0 w-6 h-6 bg-white/90 cursor-se-resize hover:bg-white transition-colors duration-200"
              onMouseDown={handleMouseDown}
            />
          </div>

          <div className="flex flex-col w-full  md:w-[65%] gap-4">
            <div>
              <TitleInput placeholder="Title" />
              <ParagraphInput placeholder="Start typing..." />
            </div>
          </div>

         
        </div>
        {droppedItems.length > 0 && (
          <div>
            {droppedItems.map((item, index) => (
              <div key={index}>{item.template}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ImageCardText;
