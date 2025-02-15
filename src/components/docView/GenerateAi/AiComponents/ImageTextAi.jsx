"use client";

import React, { useState, useEffect, useContext, useRef } from "react";
import { CardMenu } from "../../slidesView/Menu/CardMenu";
import TitleAi from "./TitleAi.jsx";
import ParagraphAi from "./ParagraphAi.jsx";
import Heading from "./Heading";
import { DragContext } from "@/components/SidebarLeft/DragContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Move } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { head } from "lodash";
import ResponsiveImage from "@/components/SidebarLeft/components/ToolBarElements/ResponsiveImage"
import ResponsiveVideo from "@/components/SidebarLeft/components/ToolBarElements/ResponsiveVideo"
import ResponsiveAudio from "@/components/SidebarLeft/components/ToolBarElements/ResponsiveAudio"


function ImageTextAi({ generateAi = {}, ...props }) {
  const [preview, setPreview] = useState(generateAi.imageContainer?.image);
  const [imageSize, setImageSize] = useState(() => ({
    width: generateAi.imageContainer?.styles?.width || 300,
    height: generateAi.imageContainer?.styles?.height || 210,
  }));
  const [isResizing, setIsResizing] = useState(false);
  const [initialMousePos, setInitialMousePos] = useState({ x: 0, y: 0 });
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0 });
  const [title, setTitle] = useState(
    generateAi.titleContainer?.title || "Untitled Card"
  );
  const [titleStyles, setTitleStyles] = useState(
    generateAi.titleContainer?.styles || {}
  );
  const [description, setDescription] = useState(
    generateAi.descriptionContainer?.description || "Start typing..."
  );
  const [descriptionStyles, setDescriptionStyles] = useState(
    generateAi.descriptionContainer?.styles || {}
  );
  const [isDeleted, setIsDeleted] = useState(false);
  const { draggedElement } = useContext(DragContext);
  const imageRef = useRef(null);
  const slideId = generateAi.id

   
  const COMPONENT_MAP = {
    title: TitleAi,
    paragraph: ParagraphAi,
    heading: Heading,
    image: ResponsiveImage,
    video: ResponsiveVideo, // Add this
  audio: ResponsiveAudio,
  }
  useEffect(() => {
    if (
      generateAi.imageContainer?.image &&
      isValidImageUrl(generateAi.imageContainer.image)
    ) {
      setPreview(generateAi.imageContainer.image);
    }
    if (generateAi.imageContainer?.styles) {
      setImageSize({
        width: generateAi.imageContainer.styles.width || 300,
        height: generateAi.imageContainer.styles.height || 210,
      });
    }
  }, [generateAi.imageContainer]);
  
    const isValidImageUrl = (url) => {
      return url.match(/\.(jpeg|jpg|gif|png)$/) != null
    }
  
    const handleImagePreview = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result);
        updateParent({
          imageContainer: {
            ...generateAi.imageContainer,
            image: reader.result,
            styles: {
              ...generateAi.imageContainer?.styles,
              width: imageSize.width,
              height: imageSize.height,
            },
          },
        });
      };
      reader.readAsDataURL(file);
    }
  };
  
  
    const handleMouseDown = (e) => {
      setIsResizing(true)
      setInitialMousePos({ x: e.clientX, y: e.clientY })
      setInitialSize({ width: imageSize.width, height: imageSize.height })
    }
  
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

    // Correctly update parent with imageContainer styles
    updateParent({
      imageContainer: {
        ...generateAi.imageContainer,
        styles: {
          ...generateAi.imageContainer?.styles,
          width: newWidth,
          height: newHeight,
        },
      },
    });
  }
};
  
    const handleMouseUp = () => {
      setIsResizing(false)
    }
  
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
      imageContainer: {
        ...generateAi.imageContainer,
        image: preview,
        styles: {
          ...generateAi.imageContainer?.styles,
          width: imageSize.width,
          height: imageSize.height,
        },
      },
      ...updates,
    };

    generateAi.onEdit?.(updatedData);
  };
  
  
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
  
  
  // Modify title and description updates to include slideId & inputId
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
  
  
  
    const handleDrop = (event) => {
    event.preventDefault()
    const data = JSON.parse(event.dataTransfer.getData("application/json"))

    if (data.type) {
      const newItem = {
        id: uuidv4(),
        type: data.type,
        content: "",
        styles: { width: 300, height: 210 },
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
  
    const handleDragOver = (event) => {
      event.preventDefault()
    }
  
  
    const handleDelete = () => {
      setIsDeleted(true)
      if (generateAi.onDelete) {
        generateAi.onDelete(generateAi.id)
      }
    }
  
    if (isDeleted) {
      return null
    }
    const handleDeleteDroppedItem = (itemId) => {
    const updatedItems = generateAi.dropContainer?.dropItems?.filter(item => item.id !== itemId) || []
    generateAi.onEdit?.({
      ...generateAi,
      dropContainer: { dropItems: updatedItems }
    })
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
  return (
    <Card
      className="min-h-screen w-full md:min-h-[25vw] my-8 bg-[#342c4e] relative overflow-visible max-w-4xl mx-auto px-3 py-3 outline-none border-none"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onDragOver={handleDragOver} // Enable drag-over
      onDrop={handleDrop} // Enable drop
    >
      {/* Card Menu with Delete Option */}
      <div className="absolute top-4 left-11">
        <CardMenu
          onEdit={() => console.log("Edit clicked")}
          onDelete={handleDelete} // Pass the onDelete function from parent
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
              <svg
                aria-hidden="true"
                focusable="false"
                className="w-12 h-12 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
              >
                <path
                  fill="currentColor"
                  d="M464 448H48c-26.5 0-48-21.5-48-48V112c0-26.5 21.5-48 48-48h416c26.5 0 48 21.5 48 48v288c0 26.5-21.5 48-48 48zm-288-48h208c8.8 0 16-7.2 16-16V128c0-8.8-7.2-16-16-16H176c-8.8 0-16 7.2-16 16v256c0 8.8 7.2 16 16 16z"
                />
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
            <div className=" overflow-visible z-50 w-full   ">
            <TitleAi
              initialData={title}
                initialStyles={titleStyles}
                onUpdate={handleTitleUpdate}
                slideId={generateAi.id}
                inputId={generateAi.titleContainer?.titleId}
              className="title text-3xl font-bold text-white mb-4 relative overflow-visible"
            />
            </div>
            <div className=" overflow-visible z-50 w-full   ">
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
        </div>
      </div>

      {/* Dropped Items Section */}
      <div className="mt-8">
          {renderDroppedItems()}
        </div>
    </Card>
  );
}

export default ImageTextAi;