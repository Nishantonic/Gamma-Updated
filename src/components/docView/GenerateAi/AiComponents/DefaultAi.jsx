"use client";

import { useState, useEffect, useRef, useContext } from "react"
import { CardMenu } from "../../slidesView/Menu/CardMenu"
import ParagraphAi from "./ParagraphAi.jsx"
import { DragContext } from "@/components/SidebarLeft/DragContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Move } from "lucide-react"
import { v4 as uuidv4 } from "uuid"
import TitleAi from './TitleAi'
import Heading from "./Heading"

function DefaultAi({ generateAi = {}, index }) {
  const [title, setTitle] = useState(generateAi.titleContainer?.title || "Untitled Card");
  const [titleStyles, setTitleStyles] = useState(generateAi.titleContainer?.styles || {})
  const [description, setDescription] = useState(generateAi.descriptionContainer?.description || "Start typing...");
  const [descriptionStyles, setDescriptionStyles] = useState(generateAi.descriptionContainer?.styles || {})
  const [droppedItems, setDroppedItems] = useState([]); // Store dropped items
  const [replacedTemplate, setReplacedTemplate] = useState(null);
  const [isDeleted, setIsDeleted] = useState(false) // Added state for deletion
  //const { draggedElement } = useContext(DragContext); // Access drag context
  const slideId = generateAi.id
  const COMPONENT_MAP = {
    title: TitleAi,
    heading: Heading,
    paragraph: ParagraphAi,
  }
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
  
    generateAi.onEdit?.(updatedData)
    // if (generateAi.onEdit) {
    //   generateAi.onEdit(generateAi.id, updatedData);
    // }
  };
  
  const handleDrop = (event) => {
    event.preventDefault()
    const data = JSON.parse(event.dataTransfer.getData("application/json"))

    if (data.type) {
      const newItem = {
        id: uuidv4(),
        type: data.type,
        content: "",
        styles: {},
      }

      const updatedData = {
        ...generateAi,
        dropContainer: {
          dropItems: [...(generateAi.dropContainer?.dropItems || []), newItem]
        }
      }
      generateAi.onEdit?.(updatedData)
    }
  }

  const handleUpdateDroppedItem = (itemId, updates) => {
    const updatedItems = generateAi.dropContainer?.dropItems?.map(item => 
      item.id === itemId ? { ...item, ...updates } : item
    ) || []

    generateAi.onEdit?.({
      ...generateAi,
      dropContainer: { dropItems: updatedItems }
    })
  }

  const handleDeleteDroppedItem = (itemId) => {
    const updatedItems = generateAi.dropContainer?.dropItems?.filter(item => item.id !== itemId) || []
    generateAi.onEdit?.({
      ...generateAi,
      dropContainer: { dropItems: updatedItems }
    })
  }

  const handleTitleUpdate = (newTitle, styles) => {
    setTitle(newTitle)
    setTitleStyles(styles)
    updateParent({
      titleContainer: {
        title: newTitle,
        styles: styles
      }
    })
  }

  const handleDescriptionUpdate = (newDescription, styles) => {
    setDescription(newDescription)
    setDescriptionStyles(styles)
    updateParent({
      descriptionContainer: {
        description: newDescription,
        styles: styles
      }
    })
  }

    const renderDroppedItems = () => {
      return (generateAi.dropContainer?.dropItems || []).map((item) => {
        const Component = COMPONENT_MAP[item.type]
        if (!Component) return null
  
        return (
          <div key={item.id} className="mb-4 relative group">
            <Component
              slideId={slideId}
              inputId={item.id}
              initialData={item.content}
              initialStyles={item.styles}
              onUpdate={(value, styles) => {
                handleUpdateDroppedItem(item.id, { 
                  content: value,
                  styles: styles 
                })
              }}
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute -top-3 -right-3 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleDeleteDroppedItem(item.id)}
            >
              ×
            </Button>
          </div>
        )
      })
    }

  // Replace the template if a new one is dropped
  if (replacedTemplate) {
    return <div>{replacedTemplate}</div>;
  }

  return (
    <Card
      id={`slide-${generateAi.index}`}
      className="min-h-screen w-full md:min-h-[25vw] my-8 bg-[#342c4e] relative overflow-visible max-w-4xl mx-auto outline-none border-none"
      onDragOver={(e) => e.preventDefault()} // Enable drag-over functionality
      onDrop={handleDrop} // Enable drop functionality
      
    >
      <CardContent className="p-6">
        {/* Card Menu with Delete Functionality */}
        <div className="absolute top-4 left-11">
          <CardMenu
            onEdit={() => console.log("Edit clicked")}
            onDelete={() => {
              setIsDeleted(true)
              generateAi.onDelete?.(generateAi.id)
            }} // Pass the onDelete prop to delete the slide
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
        <div className="mt-8">
          {renderDroppedItems()}
        </div>
      </CardContent>
    </Card>
  );
}

export default DefaultAi;
