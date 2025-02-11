"use client";

import React, { useState, useContext, useEffect } from "react";
import TitleAi from "./TitleAi.jsx";
import ParagraphAi from "./ParagraphAi.jsx";
import { DragContext } from "@/components/SidebarLeft/DragContext";
import { Card, CardContent } from "@/components/ui/card.jsx";
import { CardMenu } from "../../slidesView/Menu/CardMenu.jsx";

function DefaultAi({ generateAi = {}, index }) {
  const [title, setTitle] = useState(generateAi.titleContainer?.title || "Untitled Card");
  const [titleStyles, setTitleStyles] = useState(generateAi.titleContainer?.styles || {})
  const [description, setDescription] = useState(generateAi.descriptionContainer?.description || "Start typing...");
  const [descriptionStyles, setDescriptionStyles] = useState(generateAi.descriptionContainer?.styles || {})
  const [droppedItems, setDroppedItems] = useState([]); // Store dropped items
  const [replacedTemplate, setReplacedTemplate] = useState(null);
  const [isDeleted, setIsDeleted] = useState(false) // Added state for deletion
  const { draggedElement } = useContext(DragContext); // Access drag context

  // Handle title and description updates
  const updateParent = (updates) => {
    const updatedData = {
      ...generateAi,
      titleContainer: {
        ...generateAi.titleContainer,
        title: title,
        styles: titleStyles,
      },
      descriptionContainer: {
        ...generateAi.descriptionContainer,
        description: description,
        styles: descriptionStyles,
      },
      ...updates,
    };
  
    // if (generateAi.onEdit) {
    //   generateAi.onEdit(generateAi.id, updatedData);
    // }
  };
  
  useEffect(() => {
    updateParent({
      titleContainer: { styles: titleStyles },
      descriptionContainer: { styles: descriptionStyles }
    });
  }, [titleStyles, descriptionStyles]);
  
  
  const updateGenerateAiJson = (generateAi, slideId, inputId, newData) => {
      if (!slideId || !inputId) {
        console.error("slideId and inputId are required to update JSON.")
        return
      }
  
      const updatedJson = { ...generateAi }
      const currentSlideId = String(slideId)
      const currentInputId = String(inputId)
  
      // Don't sanitize newData, preserve HTML content
      if (String(updatedJson.id) === currentSlideId) {
        if (String(updatedJson.titleContainer?.titleId) === currentInputId) {
          updatedJson.titleContainer = {
            ...updatedJson.titleContainer,
            ...newData,
          }
        } else if (String(updatedJson.descriptionContainer?.descriptionId) === currentInputId) {
          updatedJson.descriptionContainer = {
            ...updatedJson.descriptionContainer,
            ...newData,
          }
        } else {
          console.warn(`No matching inputId found: ${currentInputId}`)
        }
      }
      if (generateAi.onEdit) {
        generateAi.onEdit(updatedJson)
      }
    }

  const handleTitleUpdate = (newTitle, styles) => {
  
  setTitle(newTitle);
  setTitleStyles(styles);
  const titleId = generateAi.titleContainer?.titleId;
  // console.log('Updating title with ID:', titleId); // Debug log
  updateGenerateAiJson(generateAi, generateAi.id, titleId, {
    title: newTitle,
    styles: styles
  });
};

const handleDescriptionUpdate = (newDescription, styles) => {

  setDescription(newDescription);
  setDescriptionStyles(styles);
  const descriptionId = generateAi.descriptionContainer?.descriptionId;
  // console.log('Updating description with ID:', descriptionId); // Debug log
  updateGenerateAiJson(generateAi, generateAi.id, descriptionId, {
    description: newDescription,
    styles: styles
  });
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

  const handleDelete = () => {
    setIsDeleted(true)
    if (generateAi.onDelete) {
      generateAi.onDelete(generateAi.id)
    }
  }

  // Replace the template if a new one is dropped
  if (replacedTemplate) {
    return <div>{replacedTemplate}</div>;
  }

  return (
    <Card
      id={`slide-${generateAi.index}`}
      className="min-h-screen w-full md:min-h-[25vw] my-8 bg-[#342c4e] relative overflow-visible max-w-4xl mx-auto outline-none border-none"
      onDragOver={handleDragOver} // Enable drag-over functionality
      onDrop={handleDrop} // Enable drop functionality
      
    >
      <CardContent className="p-6">
        {/* Card Menu with Delete Functionality */}
        <div className="absolute top-4 left-11">
          <CardMenu
            onEdit={() => console.log("Edit clicked")}
            onDelete={handleDelete} // Pass the onDelete prop to delete the slide
            onDuplicate={() => console.log("Duplicate clicked")}
            onShare={() => console.log("Share clicked")}
            onDownload={() => console.log("Download clicked")}
          />
        </div>

        {/* Title and Description Sections */}
        <div className="flex flex-col gap-8 mt-10">
          {/* Editable Title */}
          <div className="relative overflow-visible z-50 w-full   ">
            <TitleAi
              initialData={title}
                initialStyles={titleStyles}
                onUpdate={handleTitleUpdate}
                slideId={generateAi.id}
                inputId={generateAi.titleContainer?.titleId}
              className="title text-3xl font-bold text-white mb-4 relative overflow-visible"
            />
            </div>
            <div className="relative overflow-visible z-50 w-full   ">
            <ParagraphAi
              initialData={description}
              initialStyles={descriptionStyles}
              onUpdate={handleDescriptionUpdate}
              slideId={generateAi.id}
              inputId={generateAi.descriptionContainer?.descriptionId}
              className="description text-lg text-gray-300"
            />
            </div>
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
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default DefaultAi;
