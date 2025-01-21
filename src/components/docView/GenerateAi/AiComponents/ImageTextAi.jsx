"use client";

import React, { useState, useEffect, useContext } from "react";
import { CardMenu } from "../../slidesView/Menu/CardMenu";
import TitleAi from "./TitleAi.jsx";
import ParagraphAi from "./ParagraphAi.jsx";
import { DragContext } from "@/components/SidebarLeft/DragContext";
import { Button } from "@/components/ui/button";

function ImageTextAi({ generateAi = {}, ...props }) {
  const [preview, setPreview] = useState(generateAi.image || null);
  const [imageSize, setImageSize] = useState(generateAi.imageSize || { width: 300, height: 210 });
  const [isResizing, setIsResizing] = useState(false);
  const [initialMousePos, setInitialMousePos] = useState({ x: 0, y: 0 });
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0 });
  const [droppedItems, setDroppedItems] = useState([]); // Store dropped items
  const [replacedTemplate, setReplacedTemplate] = useState(null);
  const { draggedElement } = useContext(DragContext);

  const [title, setTitle] = useState(generateAi.title || "Untitled Card");
  const [description, setDescription] = useState(generateAi.description || "Start typing...");

  useEffect(() => {
    if (generateAi.image && isValidImageUrl(generateAi.image)) {
      setPreview(generateAi.image);
    }
  }, [generateAi.image]);

  const isValidImageUrl = (url) => {
    return url && url.match(/\.(jpeg|jpg|gif|png)$/) != null;
  };

  const handleImagePreview = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result);
        updateParent({ image: reader.result });
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

      const newWidth = Math.max(initialSize.width + dx, 100);
      const newHeight = Math.max(initialSize.height + dy, 100);

      setImageSize({
        width: newWidth,
        height: newHeight,
      });

      updateParent({ imageSize: { width: newWidth, height: newHeight } });
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  const updateParent = (updates) => {
    if (generateAi.onEdit) {
      generateAi.onEdit({
        ...generateAi,
        ...updates,
        title,
        description,
        image: preview,
        imageSize,
      });
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    if (draggedElement?.template && draggedElement.type === "CardTemplate") {
      setReplacedTemplate(draggedElement.template);
    } else if (draggedElement?.template) {
      const newElement = {
        id: Date.now(), // Unique ID for each dropped item
        content: draggedElement.template,
      };
      setDroppedItems((prev) => [...prev, newElement]);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDeleteDroppedItem = (id) => {
    setDroppedItems((prev) => prev.filter((item) => item.id !== id));
  };

  if (replacedTemplate) {
    return <div>{replacedTemplate}</div>;
  }

  return (
    <div
      className="min-h-screen w-full md:min-h-[25vw] md:mt-[3vh] md:mb-[3vh] rounded-lg px-1 bg-[#342c4e] p-6 relative max-w-4xl mx-auto"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onDragOver={handleDragOver} // Enable drag-over
      onDrop={handleDrop} // Enable drop
    >
      <div className="absolute top-4 left-11">
        <CardMenu
          onEdit={() => console.log("Edit clicked")}
          onDelete={() => console.log("Delete clicked")}
          onDuplicate={() => console.log("Duplicate clicked")}
          onShare={() => console.log("Share clicked")}
          onDownload={() => console.log("Download clicked")}
        />
      </div>

      <div className="flex flex-col md:flex-row gap-8 ml-3 mt-16">
        {/* Image Section */}
        <div
          className="relative flex justify-center items-center w-full md:w-[32%] rounded-lg bg-[#2a2438] overflow-hidden group"
          style={{
            width: `${imageSize.width}px`,
            height: `${imageSize.height}px`,
          }}
        >
          {preview ? (
            <img
              src={preview || "/placeholder.svg"}
              alt="Preview"
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <div className="flex items-center justify-center w-12 h-full text-[#9d8ba7]">
              {/* Placeholder Icon */}
              <svg
                aria-hidden="true"
                focusable="false"
                data-prefix="fad"
                data-icon="image"
                className="svg-inline--fa fa-image fa-fw"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
              >
                <g>
                  <path
                    className="fa-secondary"
                    fill="currentColor"
                    d="M0 96C0 60.7 28.7 32 64 32H448c35.3 0 64 28.7 64 64V416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96zM323.8 202.5c-4.5-6.6-11.9-10.5-19.8-10.5s-15.4 3.9-19.8 10.5l-87 127.6L170.7 297c-4.6-5.7-11.5-9-18.7-9s-14.2 3.3-18.7 9l-64 80c-5.8 7.2-6.9 17.1-2.9 25.4s12.4 13.6 21.6 13.6h96 32H424c8.9 0 17.1-4.9 21.2-12.8s3.6-17.4-1.4-24.7l-120-176zM112 192a48 48 0 1 0 0-96 48 48 0 1 0 0 96z"
                  />
                </g>
              </svg>
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

        {/* Title and Description Section */}
        <div
          className="flex flex-col gap-4"
          style={{
            width: `calc(100% - ${imageSize.width}px)`,
          }}
        >
          <div>
            <TitleAi
              initialData={title}
              onUpdate={(newTitle) => {
                setTitle(newTitle);
                updateParent({ title: newTitle });
              }}
            />
            <ParagraphAi
              initialData={description}
              onUpdate={(newDescription) => {
                setDescription(newDescription);
                updateParent({ description: newDescription });
              }}
            />
          </div>
        </div>
      </div>

      {/* Dropped Items Section */}
      {droppedItems.length > 0 && (
        <div className="mt-6 space-y-4">
          {droppedItems.map((item) => (
            <div key={item.id} className="relative">
              {React.cloneElement(item.content, {
                onDelete: () => handleDeleteDroppedItem(item.id),
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ImageTextAi;
