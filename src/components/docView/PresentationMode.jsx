import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronRight, ChevronLeft, X } from "lucide-react"

export function PresentationMode({ slides, slideImages, startIndex = 0, onClose }) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(startIndex)

  const goToNextSlide = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex((prev) => prev + 1)
    }
  }

  const goToPreviousSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex((prev) => prev - 1)
    }
  }

  return (
    <div className="min-h-screen fixed inset-0 z-50 bg-white flex flex-col">
      <div className="flex-1 flex items-center justify-center">
        {slideImages[currentSlideIndex] ? (
          <img
            src={slideImages[currentSlideIndex] || "/placeholder.svg"}
            alt={`Slide ${currentSlideIndex + 1}`}
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          slides[currentSlideIndex].Slide
        )}
      </div>

      <div className="absolute top-4 right-4">
        <Button variant="ghost" size="icon" className="text-black hover:bg-white/20" onClick={onClose}>
          <X className="h-6 w-6" />
        </Button>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-between items-center">
        <Button
          variant="ghost"
          size="icon"
          className="text-black hover:bg-white/20"
          onClick={goToPreviousSlide}
          disabled={currentSlideIndex === 0}
        >
          <ChevronLeft className="h-8 w-8" />
        </Button>

        <div className="text-black">
          Slide {currentSlideIndex + 1} of {slides.length}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="text-black hover:bg-white/20"
          onClick={goToNextSlide}
          disabled={currentSlideIndex === slides.length - 1}
        >
          <ChevronRight className="h-8 w-8" />
        </Button>
      </div>
    </div>
  )
}

