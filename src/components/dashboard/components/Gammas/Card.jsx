import { Trash2 } from "lucide-react"

const Card = ({ slide, onClick, onDelete }) => {
  return (
    <div className="relative bg-white rounded-lg shadow-md p-4 w-64 cursor-pointer hover:shadow-lg transition-shadow duration-300">
      <div onClick={onClick}>
        {slide.imageContainer.image && (
          <img
            src={slide.imageContainer.image || "/placeholder.svg"}
            alt={slide.titleContainer.title || "Slide"}
            className="w-full h-40 object-cover rounded-lg mb-2"
          />
        )}
        <h3 className="text-lg font-semibold mb-2">{slide.titleContainer.title || "Untitled Slide"}</h3>
        <p className="text-sm text-gray-600 mb-4">
          {slide.descriptionContainer.description
            ? `${slide.descriptionContainer.description.substring(0, 100)}${slide.descriptionContainer.description.length > 100 ? "..." : ""}`
            : "No description available"}
        </p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation()
          onDelete()
        }}
        className="absolute top-2 right-2 p-1 bg-red-100 rounded-full hover:bg-red-200 transition-colors duration-200"
      >
        <Trash2 className="w-4 h-4 text-red-600" />
      </button>
    </div>
  )
}

export default Card

