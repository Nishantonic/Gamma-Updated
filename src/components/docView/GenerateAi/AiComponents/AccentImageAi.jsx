"use client"

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

function AccentImageAi({ generateAi = {}, ...props }) {
  const [preview, setPreview] = useState(generateAi.imageContainer?.image)
  const [imageSize, setImageSize] = useState(() => ({
    width: generateAi.imageContainer?.styles?.width || 300,
    height: generateAi.imageContainer?.styles?.height || 210
  }))
  const [isResizing, setIsResizing] = useState(false)
  const [resizeDirection, setResizeDirection] = useState('right')
  const [initialMousePos, setInitialMousePos] = useState({ x: 0, y: 0 })
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0 })
  const [title, setTitle] = useState(generateAi.titleContainer?.title || "Untitled Card")
  const [titleStyles, setTitleStyles] = useState(generateAi.titleContainer?.styles || {})
  const [description, setDescription] = useState(generateAi.descriptionContainer?.description || "Start typing...")
  const [descriptionStyles, setDescriptionStyles] = useState(generateAi.descriptionContainer?.styles || {})
  const [isDeleted, setIsDeleted] = useState(false)
  //const { draggedElement } = useContext(DragContext)
  const slideId = generateAi.id

  const COMPONENT_MAP = {
    title: TitleAi,
    paragraph: ParagraphAi,
    heading: Heading,
  }

  const imageRef = useRef(null)
  

  useEffect(() => {
    if (generateAi.imageContainer?.image && isValidImageUrl(generateAi.imageContainer.image)) {
      setPreview(generateAi.imageContainer.image)
    }
    if (generateAi.imageContainer?.styles) {
      setImageSize({
        width: generateAi.imageContainer.styles.width || 300,
        height: generateAi.imageContainer.styles.height || 210
      })
    }
  }, [generateAi.imageContainer])

  const isValidImageUrl = (url) => {
    return url?.match(/\.(jpeg|jpg|gif|png|svg)$/) != null
  }

  const handleImagePreview = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setPreview(reader.result)
        updateParent({
          imageContainer: { 
            ...generateAi.imageContainer,
            image: reader.result,
            styles: {
              ...generateAi.imageContainer?.styles,
              width: imageSize.width,
              height: imageSize.height
            }
          },
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleMouseDown = (e, direction) => {
    e.stopPropagation()
    setIsResizing(true)
    setResizeDirection(direction)
    setInitialMousePos({ x: e.clientX, y: e.clientY })
    setInitialSize({ width: imageSize.width, height: imageSize.height })
  }

  const handleMouseMove = (e) => {
    if (isResizing) {
      const dx = e.clientX - initialMousePos.x
      const dy = e.clientY - initialMousePos.y

      let newWidth = initialSize.width
      if (resizeDirection === 'right') {
        newWidth = Math.max(initialSize.width + dx, 100)
      } else if (resizeDirection === 'left') {
        newWidth = Math.max(initialSize.width - dx, 100)
      }

      const newHeight = Math.max(initialSize.height + dy, 100)

      setImageSize({ width: newWidth, height: newHeight })
      updateParent({
        imageContainer: {
          ...generateAi.imageContainer,
          styles: { 
            ...generateAi.imageContainer?.styles,
            width: newWidth, 
            height: newHeight 
          }
        }
      })
    }
  }

  const handleMouseUp = () => {
    setIsResizing(false)
    setResizeDirection('right')
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
          height: imageSize.height 
        },
      },
      ...updates,
    }

    generateAi.onEdit?.(updatedData)
  }

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

  if (isDeleted) return null

  return (
    <Card
      id={`slide-${generateAi.index}`}
      className="min-h-screen w-full md:min-h-[25vw] my-8 bg-[#342c4e] relative overflow-visible max-w-4xl mx-auto outline-none border-none"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <CardContent className="p-6">
        <div className="absolute top-4 left-11">
          <CardMenu
            onDelete={() => {
              setIsDeleted(true)
              generateAi.onDelete?.(generateAi.id)
            }}
            onDuplicate={() => console.log("Duplicate clicked")}
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
            <img
              ref={imageRef}
              src={preview || '/placeholder.svg'}
              alt={title.replace(/<[^>]*>/g, '') || "Slide content"}
              className="w-full h-full object-cover rounded-lg"
            />

            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Label htmlFor={`image-upload-${generateAi.index}`} className="cursor-pointer">
                <span className="text-white text-sm font-medium">
                  {preview ? "Replace Image" : "Upload Image"}
                </span>
              </Label>
            </div>

            <Input
              id={`image-upload-${generateAi.index}`}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImagePreview}
            />

            {preview && (
              <>
                

                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute left-0 bottom-0 w-6 h-6 bg-white/90 cursor-sw-resize hover:bg-white"
                  onMouseDown={(e) => handleMouseDown(e, 'left')}
                >
                  <Move className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="mt-8">
          {renderDroppedItems()}
        </div>
      </CardContent>
    </Card>
  )
}

export default AccentImageAi