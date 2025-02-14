"use client"

import { useState, useEffect, useRef, useContext } from "react"
import { CardMenu } from "../../slidesView/Menu/CardMenu"
import ParagraphAi from "./ParagraphAi.jsx"
import { DragContext } from "@/components/SidebarLeft/DragContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Image, Move } from "lucide-react"
import { useDroppedItems } from "../../DroppedItemsContext"
import TitleInput from "../../slidesView/CardComponents/TitleInput"
import Heading from "../../slidesView/CardComponents/Heading"
import ParagraphInput from "../../slidesView/CardComponents/ParagraphInput"
import { v4 as uuidv4 } from "uuid"
import TitleAi from './TitleAi'

function AccentImageAi({ generateAi = {}, ...props }) {
  const [preview, setPreview] = useState(generateAi.imageContainer?.image)
  const [imageSize, setImageSize] = useState({ width: 300, height: 210 })
  const [isResizing, setIsResizing] = useState(false)
  const [initialMousePos, setInitialMousePos] = useState({ x: 0, y: 0 })
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0 })
  const [title, setTitle] = useState(generateAi.titleContainer?.title || "Untitled Card")
  const [titleStyles, setTitleStyles] = useState(generateAi.titleContainer?.styles || {})
  const [description, setDescription] = useState(generateAi.descriptionContainer?.description || "Start typing...")
  const [descriptionStyles, setDescriptionStyles] = useState(generateAi.descriptionContainer?.styles || {})
  const [isDeleted, setIsDeleted] = useState(false)
  const { draggedElement } = useContext(DragContext)
  // const { droppedItems} = useDroppedItems()
  const slideId = generateAi.id
  const imageRef = useRef(null)
  const COMPONENT_MAP = {
    title: TitleAi,
    heading: Heading,
    paragraph: ParagraphInput,
  }

  useEffect(() => {
    if (generateAi.image && isValidImageUrl(generateAi.image)) {
      setPreview(generateAi.image)
    }
  }, [generateAi.image])

  const isValidImageUrl = (url) => {
    return url.match(/\.(jpeg|jpg|gif|png)$/) != null
  }

  const handleImagePreview = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setPreview(reader.result)
        updateParent({
          imageContainer: { image: reader.result },
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleMouseDown = (e) => {
    setIsResizing(true)
    setInitialMousePos({ x: e.clientX, y: e.clientY })
    setInitialSize({ width: imageSize.width, height: imageSize.height })
  }

  const handleMouseMove = (e) => {
    if (isResizing) {
      const dx = e.clientX - initialMousePos.x
      const dy = e.clientY - initialMousePos.y

      const newWidth = Math.max(initialSize.width + dx, 100)
      const newHeight = Math.max(initialSize.height + dy, 100)

      setImageSize({
        width: newWidth,
        height: newHeight,
      })

      updateParent({ imageSize: { width: newWidth, height: newHeight } })
    }
  }

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
        styles: { width: imageSize.width, height: imageSize.height },
      },
      dropContainer: {
        dropItems: droppedItems[slideId] || [],
      },
      ...updates,
    }

    if (generateAi.onEdit) {
      generateAi.onEdit(updatedData)
    }
  }

  // useEffect(() => {
  //   updateParent({
  //     titleContainer: { styles: titleStyles },
  //     descriptionContainer: { styles: descriptionStyles },
  //     imageContainer: { styles: { width: imageSize.width, height: imageSize.height } },
  //     dropContainer: { dropItems: droppedItems[slideId] || [] },
  //   })
  // }, [titleStyles, descriptionStyles, imageSize, droppedItems, droppedItems[slideId]])

  const updateGenerateAiJson = (generateAi, slideId, inputId, newData) => {
    if (!slideId || !inputId) {
      console.error("slideId and inputId are required to update JSON.")
      return
    }

    const updatedJson = { ...generateAi }
    const currentSlideId = String(slideId)
    const currentInputId = String(inputId)

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
    setTitle(newTitle)
    setTitleStyles(styles)
    const titleId = generateAi.titleContainer?.titleId
    updateGenerateAiJson(generateAi, generateAi.id, titleId, {
      title: newTitle,
      styles: styles,
    })
  }

  const handleDescriptionUpdate = (newDescription, styles) => {
    setDescription(newDescription)
    setDescriptionStyles(styles)
    const descriptionId = generateAi.descriptionContainer?.descriptionId
    updateGenerateAiJson(generateAi, generateAi.id, descriptionId, {
      description: newDescription,
      styles: styles,
    })
  }

  const handleDrop = (event) => {
  event.preventDefault();
  const data = JSON.parse(event.dataTransfer.getData("application/json"));

  if (data.type) {
    const newItem = {
      id: uuidv4(),
      type: data.type,
      content: "",
      styles: {},
    };

    // Update the slide's dropContainer via onEdit
    const updatedData = {
      ...generateAi,
      dropContainer: {
        dropItems: [...(generateAi.dropContainer?.dropItems || []), newItem]
      }
    };
    generateAi.onEdit(updatedData);
  }
};

  const handleDragOver = (event) => {
    event.preventDefault()
  }

  const handleUpdateDroppedItem = (itemId, updates) => {
  const updatedItems = generateAi.dropContainer?.dropItems?.map(item => 
    item.id === itemId ? { ...item, ...updates } : item
  ) || [];

  generateAi.onEdit({
    ...generateAi,
    dropContainer: { dropItems: updatedItems }
  });
};
  useEffect(() => {
  console.log('AccentImageAi generateAi:', generateAi.dropContainer?.dropItems);
}, [generateAi.dropContainer?.dropItems]);

  const handleDeleteDroppedItem = (itemId) => {
  const updatedItems = generateAi.dropContainer?.dropItems?.filter(item => item.id !== itemId) || [];
  generateAi.onEdit({
    ...generateAi,
    dropContainer: { dropItems: updatedItems }
  });
};

  const renderDroppedItems = () => {
  return (generateAi.dropContainer?.dropItems || []).map((item) => {
    const Component = COMPONENT_MAP[item.type];
    if (!Component) return null;
    console.log('render dopItem',[item.content.replace(/<[^>]*>/g, '')]);
    
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
            });
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
    );
  });
};

  const handleDelete = () => {
    setIsDeleted(true)
    if (generateAi.onDelete) {
      generateAi.onDelete(generateAi.id)
    }
  }

  if (isDeleted) {
    return null
  }

  return (
    <Card
      id={`slide-${generateAi.index}`}
      className="min-h-screen w-full md:min-h-[25vw] my-8 bg-[#342c4e] relative overflow-visible max-w-4xl mx-auto outline-none border-none"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <CardContent className="p-6">
        <div className="absolute top-4 left-11">
          <CardMenu
            onEdit={() => console.log("Edit clicked")}
            onDelete={handleDelete}
            onDuplicate={() => console.log("Duplicate clicked")}
            onShare={() => console.log("Share clicked")}
            onDownload={() => console.log("Download clicked")}
          />
        </div>

        <div className="flex flex-col md:flex-row gap-8 mt-16">
          <div className="flex-1">
            <div className="relative overflow-visible z-50 w-full">
              <TitleAi
                initialData={title}
                initialStyles={titleStyles}
                onUpdate={handleTitleUpdate}
                slideId={generateAi.id}
                inputId={generateAi.titleContainer?.titleId}
                className="title text-3xl font-bold text-white mb-4 relative overflow-visible"
              />
            </div>
            <div className="relative overflow-visible z-50 w-full">
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

        {renderDroppedItems()}
      </CardContent>
    </Card>
  )
}

export default AccentImageAi

