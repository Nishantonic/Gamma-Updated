"use client"

import { useState, useEffect } from "react"
import { Trash2, RefreshCw } from "lucide-react"
import Card from "./Gammas/Card"
import { useNavigate } from "react-router-dom"

function Trash() {
  const [trashedSlides, setTrashedSlides] = useState([])
  const navigate = useNavigate()
  useEffect(() => {
    const trash = JSON.parse(localStorage.getItem("trash") || "[]")
    setTrashedSlides(trash)
  }, [])

  const handleCardClick = (slides) => {
    if (!slides || slides.length === 0) return
    navigate("/page", {
      state: {
        slidesArray: slides.map((slide) => ({
          type: slide?.Slide?.props?.generateAi?.type,
          ...slide?.Slide?.props?.generateAi,
          id: slide?.id,
          Slide: slide?.Slide,
        })),
      },
    })
  }

  const handleRestoreSlide = (id) => {
    const slideToRestore = trashedSlides.find((slide) => slide.key === id)
    const updatedTrash = trashedSlides.filter((slide) => slide.key !== id)
    setTrashedSlides(updatedTrash)
    localStorage.setItem("trash", JSON.stringify(updatedTrash))

    // Restore the slide to the main slides array
    const slides = JSON.parse(localStorage.getItem("slides") || "[]")
    slides.push(slideToRestore)
    localStorage.setItem("slides", JSON.stringify(slides))
  }

  const handlePermanentDelete = (id) => {
    const updatedTrash = trashedSlides.filter((slide) => slide.key !== id)
    setTrashedSlides(updatedTrash)
    localStorage.setItem("trash", JSON.stringify(updatedTrash))
  }

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-4">Trash</h2>
      {trashedSlides.length === 0 ? (
        <p className="text-gray-500">No slides in trash</p>
      ) : (
        <div className="flex flex-wrap gap-4">
          {trashedSlides.map((slideGroup) => (
            <div key={slideGroup.key} className="relative">
              <Card
                slide={slideGroup.slides[0]?.Slide?.props?.generateAi}
                onClick={handleCardClick} // Disable navigation for trashed slides
              />
              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  onClick={() => handleRestoreSlide(slideGroup.key)}
                  className="p-1 bg-green-100 rounded-full hover:bg-green-200 transition-colors duration-200"
                  title="Restore"
                >
                  <RefreshCw className="w-4 h-4 text-green-600" />
                </button>
                <button
                  onClick={() => handlePermanentDelete(slideGroup.key)}
                  className="p-1 bg-red-100 rounded-full hover:bg-red-200 transition-colors duration-200"
                  title="Delete Permanently"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Trash

