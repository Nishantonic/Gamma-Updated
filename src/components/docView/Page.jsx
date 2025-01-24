import React, { useState, useEffect } from "react"
import { Header } from "@/components/docView/Header"
import { ResizableSidebar } from "@/components/docView/ResizableSidebar"
import CardTemplates from "./slidesView/CardTemplates"
import { closestCorners, DndContext } from "@dnd-kit/core"
import { arrayMove } from "@dnd-kit/sortable"
import AddButton from "./slidesView/AddButton"
import Home from "../Home/Home"
import GenerateAi from "./GenerateAi/GenerateAi"
import { Loader2, Send } from "lucide-react"
import { Button } from "../ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "../ui/dialog"
import { Input } from "../ui/input"
import { PresentationMode } from "./PresentationMode"
import AddButtonAi from "./GenerateAi/AiComponents/AddButtonAi"

export default function Page() {
  const [currentSlide, setCurrentSlide] = useState(1)
  const [slidesPreview, setSlidesPreview] = useState([])
  const [slides, setSlides] = useState([])
  const [generateAi, setGenerateAi] = useState(false)
  const [isPresentationMode, setIsPresentationMode] = useState(false)
  const [presentationStartIndex, setPresentationStartIndex] = useState(0)

  const [isLoadingCopy, setIsLoadingCopy] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [aiInputData, setAiInputData] = useState("")

  useEffect(() => {
    const slideElement = document.getElementById(`at-${currentSlide}`)
    if (slideElement) {
      slideElement.scrollIntoView({ behavior: "smooth" })
    }
  }, [currentSlide])

  useEffect(() => {
    const initialSlides = [
      {
        number: 1,
        id: 1,
        title: "Customer Targeting Strategy",
        content: (
          <div className="flex justify-center">
            <CardTemplates
              slidesPreview={slidesPreview}
              id={1}
              setSlides={setSlides}
              setCurrentSlide={setCurrentSlide}
              setSlidesPreview={setSlidesPreview}
            />
          </div>
        ),
        onClick: () => setCurrentSlide(1),
      },
    ]
    setSlidesPreview(initialSlides)
    setSlides(
      initialSlides.map((slide) => ({
        Slide: slide.content,
        id: slide.id,
      })),
    )
  }, [])

  const handleDragEnd = (e) => {
    const { active, over } = e
    if (!over || active.id === over.id) return

    setSlidesPreview((prev) => {
      const originalPos = prev.findIndex((item) => item.id === active.id)
      const currentPos = prev.findIndex((item) => item.id === over.id)
      const updatedPreview = arrayMove(prev, originalPos, currentPos)

      // Sync main slides
      setSlides(
        updatedPreview.map((item) => ({
          Slide: item.content,
          id: item.id,
        })),
      )

      return updatedPreview.map((item, index) => ({
        ...item,
        number: index + 1,
      }))
    })
  }

  const handleAiPopupSubmit = () => {
    setGenerateAi(true)
    setIsLoadingCopy(true)
    setAiInputData(aiInputData)
  }

  const startPresentation = (fromBeginning = true) => {
    setPresentationStartIndex(fromBeginning ? 0 : currentSlide - 1)
    setIsPresentationMode(true)
  }

  const addNewSlide = (index) => {
    const newSlide = {
      number: index + 1,
      id: Date.now(),
      title: "New Slide",
      content: (
        <div className="flex justify-center">
          <CardTemplates
            slidesPreview={slidesPreview}
            id={Date.now()}
            setSlides={setSlides}
            setCurrentSlide={setCurrentSlide}
            setSlidesPreview={setSlidesPreview}
          />
        </div>
      ),
      onClick: () => setCurrentSlide(index + 1),
    }

    setSlidesPreview((prevSlides) => {
      const updatedSlides = [
        ...prevSlides.slice(0, index),
        newSlide,
        ...prevSlides.slice(index).map((slide) => ({ ...slide, number: slide.number + 1 })),
      ]
      return updatedSlides
    })

    setSlides((prevSlides) => [
      ...prevSlides.slice(0, index),
      { Slide: newSlide.content, id: newSlide.id },
      ...prevSlides.slice(index),
    ])
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <Header setGenerateAi={() => setShowPopup(true)} startPresentation={startPresentation} />
      {isPresentationMode && (
        <PresentationMode
          slides={slides}
          startIndex={presentationStartIndex}
          onClose={() => setIsPresentationMode(false)}
        />
      )}
      <div className="flex flex-1 overflow-hidden">
        <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
          {slidesPreview.length > 0 && (
            <ResizableSidebar
              setCurrentSlide={setCurrentSlide}
              slidesPreview={slidesPreview}
              setSlidesPreview={setSlidesPreview}
            />
          )}
        </DndContext>
        <main className="flex-1 overflow-y-auto">
          {generateAi ? (
            <GenerateAi
              key={`ai-${Date.now()}`}
              inputData={aiInputData}
              setShowPopup={setShowPopup}
              setIsLoadingCopy={setIsLoadingCopy}
              setSlidesPreview={setSlidesPreview}
              setSlides={setSlides}
              setGenerateAi={setGenerateAi}
            />
          ) : (
            <div>
              {slides.map(({ Slide, id }, index) => (
                <React.Fragment key={id}>
                  <div id={`at-${id}`}>{Slide}</div>
                  <div className='flex justify-center align-middle justify-self-center '>
                      <AddButtonAi index={index} addNewSlide={addNewSlide} />
                  </div>
                </React.Fragment>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* AI Input Dialog */}
      <Dialog open={showPopup} onOpenChange={(open) => setShowPopup(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate with Gemini AI</DialogTitle>
            <DialogDescription>Enter the prompt for AI generation:</DialogDescription>
          </DialogHeader>

          <Input
            type="text"
            placeholder="Enter your prompt..."
            value={aiInputData}
            onChange={(e) => setAiInputData(e.target.value)}
          />

          <DialogFooter>
            <Button
              onClick={() => {
                handleAiPopupSubmit()
                setShowPopup(false)
              }}
              disabled={!aiInputData || isLoadingCopy}
            >
              {isLoadingCopy ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Generate
                </>
              )}
            </Button>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Home />
    </div>
  )
}

