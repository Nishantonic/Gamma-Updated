import { useState, useEffect } from "react"
import { Folders, Coins, Bell } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import GammaFunction from "./GammaFunction"
import Card from "./Card"

const Gammas = ({ credits, setCredits }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [ArraySlides, setArraySlides] = useState([])
  const navigate = useNavigate()

  // Load slides from localStorage on component mount
  useEffect(() => {
    const savedSlides = localStorage.getItem("slides")
    if (savedSlides) {
      setArraySlides(JSON.parse(savedSlides))
    }
  }, [])

  // Handle clicking a card to navigate with slide data
  const handleCardClick = (slides, key) => {
    console.log(slides);
    
    if (!slides || slides.length === 0) return
    navigate("/page", {
      state: {
        slidesArray: slides.map((slide) => ({
          type: slide?.type,
          ...slide,
          id: slide?.id,
        })),
        key:key,
      },
    })
  }

  // Handle deleting a slide
  const handleDeleteSlide = (id) => {
    const slideToDelete = ArraySlides.find((slide) => slide.key === id)
    const updatedSlides = ArraySlides.filter((slide) => slide.key !== id)
    setArraySlides(updatedSlides)
    localStorage.setItem("slides", JSON.stringify(updatedSlides))

    // Add the deleted slide to trash
    const trash = JSON.parse(localStorage.getItem("trash") || "[]")
    trash.push(slideToDelete)
    localStorage.setItem("trash", JSON.stringify(trash))
  }

  // Handle AI Generation navigation
  const handleAIGenerate = (e) => {
    e.preventDefault()
    if (credits >= 40) {
      navigate("/generate-ai")
    }
  }

  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        {/* Icon + Title */}
        <div className="flex items-center gap-1">
          <div className="p-1">
            <Folders className="w-6 h-6 text-gray-700" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Gammas</h3>
        </div>

        {/* Credits, Notifications, and User Profile */}
        <div className="flex items-center gap-4 text-gray-600">
          {/* Credits Display */}
          <div className="flex items-center gap-1 cursor-pointer hover:text-blue-600 transition">
            <Coins className="w-6 h-6 text-gray-700" />
            <span>{credits} Credits</span>
          </div>

          {/* Notifications */}
          <div className="relative">
            <div
              className="p-2 cursor-pointer rounded-full hover:bg-gray-200 transition"
              onClick={() => setIsOpen(!isOpen)}
            >
              <Bell className="w-6 h-6 text-gray-700" />
            </div>

            {isOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
                <p className="text-gray-500 text-sm text-center">No notifications</p>
              </div>
            )}
          </div>

          {/* User Profile Image */}
          <div className="w-12 h-12 bg-gray-300 rounded-full overflow-hidden">
            <img
              src="https://avatarfiles.alphacoders.com/375/375542.png"
              alt="User"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Buttons Section */}
      <div className="p-4 bg-gray-100 rounded-md">
        <Link
          to="/page"
          className="border border-gray-300 bg-white text-gray-700 px-4 py-2 rounded-md shadow-sm hover:bg-gray-200 transition-all duration-200 mr-3"
        >
          + New Gamma Blank
        </Link>

        {credits >= 40 ? (
          <button
            onClick={handleAIGenerate}
            className="border border-gray-300 bg-white text-gray-700 px-4 py-2 rounded-md shadow-sm hover:bg-gray-200 transition-all duration-200"
          >
            + Generate With AI
          </button>
        ) : (
          <div className="group relative inline-block">
            <button
              disabled
              className="border border-gray-300 bg-gray-100 text-gray-400 px-4 py-2 rounded-md shadow-sm cursor-not-allowed"
            >
              + Generate With AI
            </button>
            {/* Tooltip */}
            <div className="absolute z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 top-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg shadow-sm w-max">
              Insufficient credits. You need at least 40 credits.
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-3 h-2 bg-red-50 border-b border-r border-red-100 rotate-45"></div>
            </div>
          </div>
        )}
      </div>

      {/* GammaFunction Component */}
      <GammaFunction />

      {/* Display Cards */}
      <div className="flex flex-wrap gap-4 mt-4">
        {ArraySlides.length === 0 ? (
          <p className="text-gray-500">No slides available</p>
        ) : (
          ArraySlides.map((slideGroup) =>
            slideGroup.slides && slideGroup.slides.length > 0 ? (
              <Card
                key={slideGroup.key}
                slide={slideGroup?.slides[0]}
                onClick={() => handleCardClick(slideGroup.slides,ArraySlides.key)}
                onDelete={() => handleDeleteSlide(slideGroup.key)}
              />
            ) : null,
          )
        )}
      </div>
    </div>
  )
}

export default Gammas
