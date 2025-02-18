import { Share, Share2, Trash2 } from "lucide-react"

const Card = ({ slide, onClick, Share, onDelete }) => {
  console.log(slide);
  
  return (
    <div className="relative bg-white rounded-lg shadow-md p-4 w-64 cursor-pointer hover:shadow-lg transition-shadow duration-300" onClick={onClick}>
      <div>
        {slide.imageContainer?.image && (
          <img
            src={slide.imageContainer?.image || "/placeholder.svg"}
            alt={slide.titleContainer?.title.replace(/<[^>]*>/g, '') || "Slide"}
            className="w-full h-40 object-cover rounded-lg mb-2"
          />
        )}
        <h3 className="text-lg font-semibold mb-2">{slide.titleContainer.title.replace(/<[^>]*>/g, '') || "Untitled Slide"}</h3>
        <p className="text-sm text-gray-600 mb-4">
          {slide.descriptionContainer.description
            ? `${slide.descriptionContainer.description.replace(/<[^>]*>/g, '').substring(0, 100)}${slide.descriptionContainer.description.length > 100 ? "..." : ""}`
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
      <button 
        onClick={(e) => {
          e.stopPropagation()
          Share()
        }}
        className="absolute top-2 right-10 p-1  bg-green-100 rounded-full hover:bg-green-200 transition-colors duration-200"
      >
        <Share2 className="w-4 h-4 text-green-600"/>
      </button>
    </div>
  )
}

export default Card
