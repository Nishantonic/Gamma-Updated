import React, { useState, useEffect, useContext } from "react";
import { CardMenu } from "../../slidesView/Menu/CardMenu";
import { DragContext } from "@/components/SidebarLeft/DragContext";
import TitleAi from "./TitleAi.jsx";
import ParagraphAi from "./ParagraphAi.jsx";
import { Card } from "@/components/ui/card";

function CardTemplateTwoColumn({ generateAi = {}, ...props }) {
  const [title, setTitle] = useState(
      generateAi.titleContainer?.title || "Untitled Card"
    );
  const [columns, setColumns] = useState(generateAi.columns || [{ content: "" }, { content: "" }]);
  const { draggedElement } = useContext(DragContext);
  const [replacedTemplate, setReplacedTemplate] = useState(null);
  const [droppedItems, setDroppedItems] = useState([]); // To store dropped items

  useEffect(() => {
    if (generateAi.image && isValidImageUrl(generateAi.image)) {
      setPreview(generateAi.image);
    }
  }, [generateAi.image]);

  const isValidImageUrl = (url) => {
    return url && url.match(/\.(jpeg|jpg|gif|png)$/) != null;
  };

  const handleDrop = (event) => {
    event.preventDefault();
    if (draggedElement?.template && draggedElement.type === "CardTemplate") {
      setReplacedTemplate(draggedElement.template);
    } else if (draggedElement?.template) {
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

  if (replacedTemplate) {
    return <div>{replacedTemplate}</div>;
  }

  return (
    <Card
      className="min-h-screen w-full md:min-h-[25vw] my-8 bg-[#342c4e] relative overflow-visible max-w-4xl mx-auto px-3 py-3 outline-none border-none"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Card Menu with Delete Functionality */}
      <div className="absolute top-4 left-11">
        <CardMenu
          onEdit={() => console.log("Edit clicked")}
          onDelete={generateAi.onDelete} // Use the parent-provided delete function
          onDuplicate={() => console.log("Duplicate clicked")}
          onShare={() => console.log("Share clicked")}
          onDownload={() => console.log("Download clicked")}
        />
      </div>

      <div className="flex flex-col gap-8 mt-16">
        {/* Title Section */}
        <TitleAi
          initialData={title}
          onUpdate={(newTitle) => setTitle(newTitle)}
          slideId={generateAi.id}
        />

        {/* Two Column Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {columns.map((column, index) => (
            <ParagraphAi
              key={index}
              initialData={column.content}
              onUpdate={(newContent) => {
                const newColumns = [...columns];
                newColumns[index] = { ...newColumns[index], content: newContent };
                setColumns(newColumns);
              }}
            />
          ))}
        </div>
      </div>

      {/* Dropped Items Section */}
      {droppedItems.length > 0 && (
        <div className="mt-6 space-y-4">
          {droppedItems.map((item) => (
            <div key={item.id} className="relative bg-[#2a2438] p-4 rounded-lg shadow-md">
              {React.cloneElement(item.content, {
                onDelete: () => handleDeleteDroppedItem(item.id),
              })}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export default CardTemplateTwoColumn;
