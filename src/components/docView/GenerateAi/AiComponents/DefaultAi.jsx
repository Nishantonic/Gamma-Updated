"use client";

import React, { useState, useContext } from "react";
import TitleAi from "./TitleAi.jsx";
import ParagraphAi from "./ParagraphAi.jsx";
import { DragContext } from "@/components/SidebarLeft/DragContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card.jsx";
import { CardMenu } from "../../slidesView/Menu/CardMenu.jsx";

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
    <Card
          id={`slide-${generateAi.index}`}
          className="min-h-screen w-full md:min-h-[25vw] my-8 bg-[#342c4e] relative overflow-hidden max-w-4xl mx-auto outline-none border-none"
          onDragOver={handleDragOver} // Enable drag-over functionality
          onDrop={handleDrop} // Enable drop functionality
        >
          <CardContent className="p-6">
            <div className="absolute top-4 left-11">
                    <CardMenu
                      onEdit={() => console.log("Edit clicked")}
                      onDelete={() => console.log("Delete clicked")}
                      onDuplicate={() => console.log("Duplicate clicked")}
                      onShare={() => console.log("Share clicked")}
                      onDownload={() => console.log("Download clicked")}
                    />
                  </div>
      {/* Title and Description Sections */}
      <div className="flex flex-col gap-8 mt-10">
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
    </CardContent>
    </Card>
  );
}

export default DefaultAi;
