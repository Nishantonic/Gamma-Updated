"use client";

import React, { useState, useContext } from "react";
import TitleAi from "./TitleAi.jsx";
import ParagraphAi from "./ParagraphAi.jsx";
import { DragContext } from "@/components/SidebarLeft/DragContext";
import { Button } from "@/components/ui/button";

function DefaultAi({ generateAi = {}, index }) {
  const [title, setTitle] = useState(generateAi.title || "Untitled Card");
  const [description, setDescription] = useState(generateAi.description || "Start typing...");
  const [droppedItems, setDroppedItems] = useState([]); // Store dropped items
  const [replacedTemplate, setReplacedTemplate] = useState(null);

  const { draggedElement } = useContext(DragContext); // Access drag context

  // Handle title and description updates
  const handleUpdate = (type, newContent, newStyles) => {
    if (type === "title") {
      setTitle(newContent);
    } else if (type === "description") {
      setDescription(newContent);
    }
    if (generateAi.onEdit) {
      generateAi.onEdit({
        ...generateAi,
        [type]: newContent,
        [`${type}Styles`]: newStyles,
      });
    }
  };

  // Handle drag-and-drop functionality
  const handleDrop = (event) => {
    event.preventDefault();
    if (draggedElement?.template && draggedElement.type === "CardTemplate") {
      setReplacedTemplate(draggedElement.template); // Replace template
    } else if (draggedElement?.template) {
      const newElement = {
        id: Date.now(),
        content: draggedElement.template,
      };
      setDroppedItems((prev) => [...prev, newElement]);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  // Handle deletion of dropped items
  const handleDeleteDroppedItem = (id) => {
    setDroppedItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Replace the template if a new one is dropped
  if (replacedTemplate) {
    return <div>{replacedTemplate}</div>;
  }

  return (
    <div
      id={`slide-${index}`}
      className="w-full md:mt-[3vh] md:mb-[3vh] rounded-lg px-6 py-4 bg-[#342c4e] text-white max-w-4xl mx-auto"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Title and Description Sections */}
      <div className="flex flex-col gap-8">
        {/* Editable Title */}
        <TitleAi
          initialData={title}
          onUpdate={(newContent, newStyles) => handleUpdate("title", newContent, newStyles)}
          index={index}
        />

        {/* Editable Description */}
        <ParagraphAi
          initialData={description}
          onUpdate={(newContent, newStyles) => handleUpdate("description", newContent, newStyles)}
          index={index}
        />
      </div>

      {/* Render Dropped Items */}
      {droppedItems.length > 0 && (
        <div className="mt-6 space-y-4">
          {droppedItems.map((item) => (
            <div key={item.id} className="relative p-4 bg-[#2a2438] rounded-lg shadow-md">
              {/* Render the dropped item */}
              {React.cloneElement(item.content, {
                onDelete: () => handleDeleteDroppedItem(item.id),
              })}
              {/* Delete Button */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DefaultAi;
