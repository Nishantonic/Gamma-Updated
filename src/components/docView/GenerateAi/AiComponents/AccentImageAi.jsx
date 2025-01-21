"use client";

import React, { useState, useEffect, useRef, useContext } from "react";
import { CardMenu } from "../../slidesView/Menu/CardMenu";
import TitleAi from "./TitleAi.jsx";
import ParagraphAi from "./ParagraphAi.jsx";
import { DragContext } from "@/components/SidebarLeft/DragContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Image, Move } from "lucide-react";

function AccentImageAi({ generateAi = {}, ...props }) {
  const [preview, setPreview] = useState(generateAi.image);
  const [imageSize, setImageSize] = useState({ width: 300, height: 210 });
  const [isResizing, setIsResizing] = useState(false);
  const [initialMousePos, setInitialMousePos] = useState({ x: 0, y: 0 });
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0 });
  const [title, setTitle] = useState(generateAi.title || "Untitled Card");
  const [description, setDescription] = useState(generateAi.description || "Start typing...");
  const [droppedItems, setDroppedItems] = useState([]); // To store dropped items
  const { draggedElement } = useContext(DragContext); // Access the dragged element context
  const imageRef = useRef(null);

  useEffect(() => {
    if (generateAi.image && isValidImageUrl(generateAi.image)) {
      setPreview(generateAi.image);
    }
  }, [generateAi.image]);

  const isValidImageUrl = (url) => {
    return url.match(/\.(jpeg|jpg|gif|png)$/) != null;
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
    generateAi.onEdit({
      ...generateAi,
      ...updates,
      title,
      description,
      image: preview,
      imageSize,
    });
  };

  const handleDrop = (event) => {
    event.preventDefault();
    if (draggedElement?.template) {
      const newItem = {
        id: Date.now(), // Unique ID for each dropped item
        content: draggedElement.template,
      };
      setDroppedItems((prev) => [...prev, newItem]);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDeleteDroppedItem = (id) => {
    setDroppedItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <Card
      id={`slide-${generateAi.index}`}
      className="min-h-screen w-full md:min-h-[25vw] my-8 bg-[#342c4e] relative overflow-hidden max-w-4xl mx-auto outline-none border-none"
      onDragOver={handleDragOver} // Enable drag-over functionality
      onDrop={handleDrop} // Enable drop functionality
    >
      <CardContent className="p-6">
        <div className="absolute top-4 right-4 z-10">
          <CardMenu
            onEdit={() => console.log("Edit clicked")}
            onDelete={() => console.log("Delete clicked")}
            onDuplicate={() => console.log("Duplicate clicked")}
            onShare={() => console.log("Share clicked")}
            onDownload={() => console.log("Download clicked")}
          />
        </div>

        <div className="flex flex-col md:flex-row gap-8 mt-16">
          <div className="flex-1">
            <TitleAi
              initialData={title}
              onUpdate={(newTitle) => {
                setTitle(newTitle);
                updateParent({ title: newTitle });
              }}
              className="title text-3xl font-bold text-white mb-4"
            />
            <ParagraphAi
              initialData={description}
              onUpdate={(newDescription) => {
                setDescription(newDescription);
                updateParent({ description: newDescription });
              }}
              className="description text-lg text-gray-300"
            />
          </div>

          <div
            className="relative flex justify-center items-center rounded-lg bg-[#2a2438] overflow-hidden group"
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
                ref={imageRef}
                src={preview || "/placeholder.svg"}
                alt="Preview"
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-[#9d8ba7]">
                <Image className="w-12 h-12" />
              </div>
            )}

            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Label htmlFor={`image-upload-${generateAi.index}`} className="cursor-pointer">
                <span className="text-white text-sm font-medium">Click to Upload Image</span>
              </Label>
            </div>

            <Input
              id={`image-upload-${generateAi.index}`}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImagePreview}
            />

            <Button
              size="icon"
              variant="ghost"
              className="absolute left-0 bottom-0 bg-white/90 hover:bg-white transition-colors duration-200"
              onMouseDown={handleMouseDown}
            >
              <Move className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {droppedItems.length > 0 && (
          <div className="mt-6 space-y-4">
            {droppedItems.map((item) => (
              <div key={item.id} className="relative">
                {/* Render the dropped item */}
                {React.cloneElement(item.content, {
                  onDelete: () => handleDeleteDroppedItem(item.id),
                })}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AccentImageAi;
