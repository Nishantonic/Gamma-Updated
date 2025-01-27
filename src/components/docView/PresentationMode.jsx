"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Monitor, ChevronRight, ChevronLeft, X, ZoomIn, ZoomOut, Loader2 } from "lucide-react"
import html2canvas from "html2canvas"

export function PresentationMode({ slides, startIndex = 0, onClose }) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(startIndex)
  const [slideImages, setSlideImages] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isChangingSlide, setIsChangingSlide] = useState(false)
  const [transitionDirection, setTransitionDirection] = useState("next") // track slide direction
  const [zoomLevel, setZoomLevel] = useState(1) // Initial zoom level
  const [isClosing, setIsClosing] = useState(false) // Track closing animation state

  // Capture slide images when entering presentation mode
  useEffect(() => {
    const captureSlides = async () => {
      setIsLoading(true)
      const images = await Promise.all(
        slides.map(async (slide) => {
          const element = document.getElementById(`at-${slide.id}`)
          if (element) {
            const canvas = await html2canvas(element, {
              scale: 2, // Increase the scale for higher resolution
              useCORS: true, // Ensure cross-origin images are handled
            })
            return canvas.toDataURL("image/png")
          }
          return ""
        }),
      )
      setSlideImages(images)
      setIsLoading(false)
    }

    captureSlides()
  }, [slides])

  const goToNextSlide = () => {
    if (currentSlideIndex < slides.length - 1) {
      setTransitionDirection("next") // moving forward
      setIsChangingSlide(true)
      setTimeout(() => {
        setCurrentSlideIndex((prev) => prev + 1)
        setIsChangingSlide(false)
      }, 500) // Increased timeout for smooth transition
    }
  }

  const goToPreviousSlide = () => {
    if (currentSlideIndex > 0) {
      setTransitionDirection("previous") // moving backward
      setIsChangingSlide(true)
      setTimeout(() => {
        setCurrentSlideIndex((prev) => prev - 1)
        setIsChangingSlide(false)
      }, 500) // Increased timeout for smooth transition
    }
  }

  const zoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.1, 2)); // Limit zoom level to 2 (200%)
  }

  const zoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.1, 0.5)); // Limit zoom level to 0.5 (50%)
  }

  const handleClose = () => {
    setIsClosing(true) // Start closing animation
    setTimeout(() => {
      onClose() // Call onClose after animation is done
    }, 1500) // Increased to 1500ms for a more gradual and smooth transition
  }

  return (
    <div
      className={`min-h-screen fixed inset-0 z-50 bg-white flex flex-col transition-all duration-1500 ease-in-out ${
        isClosing
          ? "opacity-0 translate-y-10 scale-90" // Fade, slide down, and shrink when closing
          : "opacity-100 translate-y-0 scale-100"
      }`}
    >
      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center text-black">
          <Loader2 className="h-6 w-6 animate-spin text-black" />
          <p>Loading slides...</p>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center overflow-hidden">
          <div
            className={`w-full h-full flex items-center justify-center transition-all duration-500 ease-in-out transform ${
              isChangingSlide
                ? transitionDirection === "next"
                  ? "opacity-0 translate-x-10" // slide out to the right when going next
                  : "opacity-0 -translate-x-10" // slide out to the left when going previous
                : "opacity-100 translate-x-0"
            }`}
          >
            {slideImages[currentSlideIndex] ? (
              <img
                src={slideImages[currentSlideIndex] || "/placeholder.svg"}
                alt={`Slide ${currentSlideIndex + 1}`}
                className="max-w-full max-h-full object-contain transition-all duration-500 ease-in-out transform"
                style={{ transform: `scale(${zoomLevel})` }} // Apply zoom level here
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">{slides[currentSlideIndex].Slide}</div>
            )}
          </div>
        </div>
      )}

      <div className="absolute top-4 right-4">
        <Button variant="ghost" size="icon" className="text-black hover:bg-white/20" onClick={handleClose}>
          <X className="h-6 w-6" />
        </Button>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-between items-center bg-black/20">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          onClick={goToPreviousSlide}
          disabled={currentSlideIndex === 0 || isChangingSlide}
        >
          <ChevronLeft className="h-8 w-8" />
        </Button>

        <div className="text-white">
          Slide {currentSlideIndex + 1} of {slides.length}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          onClick={goToNextSlide}
          disabled={currentSlideIndex === slides.length - 1 || isChangingSlide}
        >
          <ChevronRight className="h-8 w-8" />
        </Button>
      </div>

      {/* Zoom Buttons */}
      <div className="absolute top-4 left-4 flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="text-black hover:bg-white/20"
          onClick={zoomIn}
        >
          <ZoomIn className="h-6 w-6" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-black hover:bg-white/20"
          onClick={zoomOut}
        >
          <ZoomOut className="h-6 w-6" />
        </Button>
      </div>
    </div>
  )
}
